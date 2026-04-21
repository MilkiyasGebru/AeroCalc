import React, {createContext, useCallback, useState} from "react";
import {useInputBuildingContext} from "@/contexts/useInputBuildingContext.ts";
import {frequencies} from "../../CONSTANTS.ts";
import {
    CalculateAcrossPsdResponse, CalculateFD,
    CalculateTorsionPsdResponse, CalculateAlong,
} from "@/hooks/useCalculateBuildingResponse.ts";
import {calculate_experimental_psd_normalized} from "@/hooks/digital_processor.ts";

declare global {
    interface Window {
        pywebview: {
            api: {
                compute(M: number[],width: number,height: number,experimentalMeanSpeed: number,experimentalFrequency: number): Promise<{ psd: number[], pwelch_frequencies: number[] }>;
            };
        };
    }
}


interface OutputBuildingContextInterface {
    torsionPsds: number[];
    acrossPsds: number[];
    ar: number | null;
    vr: number | null;
    accelartionYDirection: number | null;
    experimentalTorsionPsds: number[];
    experimentalAcrossPsds: number[];
    experimentalAlongPsds: number[];
    experimentalAr: number | null;
    experimentalVr: number | null;
    experimentalAccelartionYDirection: number | null;
    setTorsionPsds: (val: number[])=> void;
    setAcrossPsds: (val: number[])=>void;
    setAr: (val: number)=> void;
    setVr: (val: number)=> void;
    setAccelartionYDirection: (val: number)=> void;
    setExperimentalAccelartionYDirection: (val: number)=> void;
    setExperimentalTorsionPsds: (val: number[])=> void;
    setExperimentalAcrossPsds: (val: number[])=> void;
    setExperimentalAlongPsds: (val: number[])=> void;
    setExperimentalAr: (val: number)=> void;
    setExperimentalVr: (val: number)=> void;
    handleAnalyticalCalculation : () => void;
    handleExperimentalCalculation : (Mx: number[], My: number[], Mz: number[]) => void;
    clearExperimentalResults: () => void;
    exportResults: () => void;
}


export const OutputBuildingContext = createContext<OutputBuildingContextInterface | undefined>(undefined);

export const OutputBuildingContextProvider = ({children}: {children: React.ReactNode})=>{

    const {
        width, height, depth, meanSpeed, damping, totalFloors, terrain, Talong, Ttorsion, Tacross,
        experimentalMeanSpeed, experimentalFrequency, setNormalizedExperimentalFrequencies, 
        buildingDensity, userMeanSpeed, isAnalyticalEnabled, mxData, myData, mzData
    } = useInputBuildingContext();

    const [torsionPsds, setTorsionPsds] = useState<number[]>([]);
    const [acrossPsds, setAcrossPsds] = useState<number[]>([]);
    const [ar, setAr] = useState<number | null>(null)
    const [vr, setVr] = useState<number | null>(null)

    const [experimentalTorsionPsds, setExperimentalTorsionPsds] = useState<number[]>([]);
    const [experimentalAcrossPsds, setExperimentalAcrossPsds] = useState<number[]>([]);
    const [experimentalAr, setExperimentalAr] = useState<number | null>(null)
    const [experimentalVr, setExperimentalVr] = useState<number | null>(null)
    const [accelartionYDirection, setAccelartionYDirection] = useState<number | null>(null)
    const [experimentalAccelartionYDirection, setExperimentalAccelartionYDirection] = useState<number | null>(null)
    const [experimentalAlongPsds, setExperimentalAlongPsds] = useState<number[]>([])

    const clearExperimentalResults = useCallback(() => {
        setExperimentalAr(null);
        setExperimentalVr(null);
        setExperimentalAccelartionYDirection(null);
        setExperimentalAcrossPsds([]);
        setExperimentalTorsionPsds([]);
        setExperimentalAlongPsds([]);
        setNormalizedExperimentalFrequencies([]);
    }, [setNormalizedExperimentalFrequencies]);

    const exportResults = useCallback(() => {
        const data = {
            metadata: {
                timestamp: new Date().toISOString(),
                project: "McGill Timber Structures Group - Wind Response Prediction"
            },
            inputs: {
                geometry: { width, height, depth, totalFloors },
                dynamicProperties: { buildingDensity, damping, Talong, Tacross, Ttorsion },
                windClimate: { terrain, meanSpeed, userMeanSpeed },
                experimentalConfig: { experimentalMeanSpeed, experimentalFrequency }
            },
            results: {
                analytical: isAnalyticalEnabled ? {
                    acrossWindAcceleration_milliG: ar,
                    torsionVelocity_milliRadS: vr,
                    alongWindAcceleration_milliG: accelartionYDirection,
                } : "Disabled",
                experimental: (mxData.length > 0) ? {
                    acrossWindAcceleration_milliG: experimentalAr,
                    torsionVelocity_milliRadS: experimentalVr,
                    alongWindAcceleration_milliG: experimentalAccelartionYDirection,
                } : "No experimental data"
            }
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `wind_analysis_results_${new Date().getTime()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [
        width, height, depth, totalFloors, buildingDensity, damping, Talong, Tacross, Ttorsion,
        terrain, meanSpeed, userMeanSpeed, experimentalMeanSpeed, experimentalFrequency,
        isAnalyticalEnabled, ar, vr, accelartionYDirection, experimentalAr, experimentalVr, 
        experimentalAccelartionYDirection, mxData
    ]);

    const handleAnalyticalCalculation = useCallback(()=>{
        if (!isAnalyticalEnabled) {
            setAr(null);
            setVr(null);
            setAccelartionYDirection(null);
            setAcrossPsds([]);
            setTorsionPsds([]);
            return;
        }

        if (height != null && width != null && depth != null && totalFloors != null && damping != null && meanSpeed != null && Talong != null && Ttorsion != null && Tacross != null && buildingDensity != null){
            const c = (terrain == "open")? (height/10)**0.28: 0.5*((height/12.7)**0.5);
            let speed : number =(userMeanSpeed != null && Number.isFinite(userMeanSpeed))? userMeanSpeed:meanSpeed*c**0.5
            let across_psds: number[] = CalculateAcrossPsdResponse(Math.max(width,depth),height,Math.min(width,depth),frequencies)
            console.log(across_psds)
            let torsion_psds: number[] = CalculateTorsionPsdResponse(Math.max(width,depth),height,Math.min(width,depth),speed,frequencies)
            setAccelartionYDirection(CalculateAlong(Math.max(width, depth), height, Math.min(width,depth),speed ,Talong,damping,frequencies,buildingDensity))
            const [x,__]:number[] = CalculateFD(Math.max(width,depth), height, Math.min(width,depth), speed,Ttorsion, totalFloors, damping, frequencies, across_psds, torsion_psds, buildingDensity)
            const [_,y]:number[] = CalculateFD(Math.max(width,depth), height, Math.min(width,depth), speed,Tacross, totalFloors, damping, frequencies, across_psds, torsion_psds, buildingDensity)
            setVr(x)
            setAr(y)
            setAcrossPsds(across_psds)
            setTorsionPsds(torsion_psds)
        }
    }, [width, depth, height, meanSpeed, totalFloors, damping, terrain, userMeanSpeed, isAnalyticalEnabled, Talong, Ttorsion, Tacross, buildingDensity])

    const handleExperimentalCalculation = useCallback(async (Mx:number[], My:number[], Mz:number[])=>{
        // const Mx : number[] = mxData;
        // const My : number[] = myData;
        // const Mz: number[] = mzData;
        if (height != null && width != null && depth != null && totalFloors != null && damping != null && meanSpeed != null && Talong != null && Ttorsion != null && Tacross != null && buildingDensity != null) {

            if (window.pywebview?.api?.compute) {
                // DESKTOP MODE: Call Python
                console.log("Using Python for calculation...");
                const c = (terrain == "open")? (height/10)**0.28: 0.5*((height/12.7)**0.5);
                let speed : number =(userMeanSpeed != null && Number.isFinite(userMeanSpeed))? userMeanSpeed:meanSpeed*c**0.5

                const acrossResult = await window.pywebview.api.compute(Mx, width, height, experimentalMeanSpeed, experimentalFrequency);
                const torsionResult = await window.pywebview.api.compute(Mz, width, depth, experimentalMeanSpeed, experimentalFrequency);
                // console.log(acrossResult.pwelch_frequencies)
                let pwelch_frequencies = acrossResult.pwelch_frequencies.slice(1)
                let across_psds = acrossResult.psd.slice(1)
                let torsion_psds = torsionResult.psd.slice(1)

                const f_normalized: number[] = pwelch_frequencies.map(f => {
                    return f*width/experimentalMeanSpeed
                });
                setExperimentalAcrossPsds(across_psds)
                setNormalizedExperimentalFrequencies(f_normalized)
                setExperimentalTorsionPsds(torsion_psds)

                const alongResult = await window.pywebview.api.compute(My, width, height, experimentalMeanSpeed, experimentalFrequency)
                let along_psds = alongResult.psd.slice(1)
                setExperimentalAlongPsds(along_psds)
                const [x, _]: number[] = CalculateFD(width, height, depth, speed, Ttorsion, totalFloors, damping, pwelch_frequencies, across_psds, torsion_psds, buildingDensity)
                const [__, y]: number[] = CalculateFD(width, height, depth, speed, Tacross, totalFloors, damping, pwelch_frequencies, across_psds, torsion_psds, buildingDensity)
                const [___, z]: number[] = CalculateFD(width, height, depth, speed, Talong, totalFloors, damping, pwelch_frequencies, along_psds, torsion_psds, buildingDensity)

                setExperimentalAccelartionYDirection(z)
                //
                setExperimentalVr(x)
                setExperimentalAr(y)
            } else {
                // WEB MODE: Fallback to Local JavaScript
                let experi_across_psds: number[] = calculate_experimental_psd_normalized(Mx, width, height, experimentalMeanSpeed, experimentalFrequency).psd
                experi_across_psds = experi_across_psds.slice(1)
                let {
                    psd,
                    pwelch_frequencies
                } = calculate_experimental_psd_normalized(Mz, width, depth, experimentalMeanSpeed, experimentalFrequency)


                // console.log("UnNormalized Frequency is ", pwelch_frequencies)
                // const  : number[] = calculate_experimental_psd_normalized(Mz,width,depth,experimentalMeanSpeed, experimentalFrequency)
                let along_psds: number[] = calculate_experimental_psd_normalized(My, width, height, experimentalMeanSpeed, experimentalFrequency).psd
                along_psds = along_psds.slice(1)
                setExperimentalAlongPsds(along_psds)
                // console.log("Normalized ",normalizedFrequency)
                pwelch_frequencies = pwelch_frequencies.slice(1)
                psd = psd.slice(1)
                setExperimentalTorsionPsds(psd)

                const f_normalized: number[] = pwelch_frequencies.map(f => {
                    return f*width/experimentalMeanSpeed
                });

                console.log("Experi Across PSDS is", experi_across_psds)
                console.log("Frequencies is ", pwelch_frequencies)
                setExperimentalAcrossPsds(experi_across_psds)

                setNormalizedExperimentalFrequencies(f_normalized)
                // console.log("new", calculate_experimental_psd_normalized(Mz, width, depth, experimentalMeanSpeed, experimentalFrequency))
                // setCSVData(csvData)
                const [x, _]: number[] = CalculateFD(width, height, depth, meanSpeed, Ttorsion, totalFloors, damping, pwelch_frequencies, experi_across_psds, psd, buildingDensity)
                const [__, y]: number[] = CalculateFD(width, height, depth, meanSpeed, Tacross, totalFloors, damping, pwelch_frequencies, experi_across_psds, psd, buildingDensity)
                const [___, z]: number[] = CalculateFD(width, height, depth, meanSpeed, Talong, totalFloors, damping, pwelch_frequencies, along_psds, psd, buildingDensity)

                setExperimentalAccelartionYDirection(z)
                //
                setExperimentalVr(x)
                setExperimentalAr(y)
            }
        }
        // const experi_across_psds : number[] = calculate_experimental_psd_normalized(Mx,width,height,experimentalMeanSpeed,experimentalFrequency).psd
        // setExperimentalAcrossPsds(experi_across_psds)
        //
        // const {psd, normalizedFrequency} = calculate_experimental_psd_normalized(Mz,width,depth,experimentalMeanSpeed, experimentalFrequency)
        // // const  : number[] = calculate_experimental_psd_normalized(Mz,width,depth,experimentalMeanSpeed, experimentalFrequency)
        // setExperimentalTorsionPsds(psd)
        // // console.log("Normalized ",normalizedFrequency)
        // setNormalizedExperimentalFrequencies(normalizedFrequency)
        // console.log("new",calculate_experimental_psd_normalized(Mz,width,depth,experimentalMeanSpeed, experimentalFrequency))
        // // setCSVData(csvData)
        //
        // const [x,y]:number[] = CalculateFD(width, height, depth, meanSpeed,Tone, totalFloors, damping, frequencies, experi_across_psds, psd)
        //
        // setExperimentalVr(x)
        // setExperimentalAr(y)



    },[width, depth, height, meanSpeed, totalFloors, damping, buildingDensity, terrain,Talong, Tacross, Ttorsion,experimentalMeanSpeed,experimentalFrequency])

    return (
        <OutputBuildingContext.Provider value={{
            torsionPsds, acrossPsds, ar,vr, setTorsionPsds, setAcrossPsds, setAr, setVr,
            experimentalTorsionPsds,experimentalAcrossPsds,experimentalAr,experimentalVr,
            accelartionYDirection, setAccelartionYDirection,
            experimentalAlongPsds, setExperimentalAlongPsds,
            experimentalAccelartionYDirection, setExperimentalAccelartionYDirection,
            setExperimentalTorsionPsds,setExperimentalAcrossPsds,setExperimentalAr,setExperimentalVr, handleAnalyticalCalculation,handleExperimentalCalculation,
            clearExperimentalResults, exportResults
        }}>
            {children}
        </OutputBuildingContext.Provider>
    )
}
