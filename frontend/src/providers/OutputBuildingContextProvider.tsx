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
                compute(M: number[],width: number,height: number,experimentalMeanSpeed: number,experimentalFrequency: number): Promise<{ psd: number[], normalizedFrequency: number[] }>;
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
    handleExperimentalCalculation : () => void;
}


export const OutputBuildingContext = createContext<OutputBuildingContextInterface | undefined>(undefined);

export const OutputBuildingContextProvider = ({children}: {children: React.ReactNode})=>{

    const {width,height,depth,meanSpeed,damping,totalFloors,terrain,Tone,experimentalMeanSpeed, experimentalFrequency, setNormalizedExperimentalFrequencies, buildingDensity, mxData,mzData,myData} = useInputBuildingContext();

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
    const handleAnalyticalCalculation = useCallback(()=>{

        const c = (terrain == "open")? (height/10)**0.28: 0.5*((height/12.7)**0.5);
        let across_psds: number[] = CalculateAcrossPsdResponse(Math.max(width,depth),height,Math.min(width,depth),frequencies)
        let torsion_psds: number[] = CalculateTorsionPsdResponse(Math.max(width,depth),height,Math.min(width,depth),meanSpeed*c**0.5,frequencies)
        setAccelartionYDirection(CalculateAlong(Math.max(width, depth), height, Math.min(width,depth), meanSpeed*c**0.5,Tone,damping,frequencies,buildingDensity))
        const [x,y]:number[] = CalculateFD(Math.max(width,depth), height, Math.min(width,depth), meanSpeed*c**0.5,Tone, totalFloors, damping, frequencies, across_psds, torsion_psds, buildingDensity)
        setVr(x)
        setAr(y)
        setAcrossPsds(across_psds)
        setTorsionPsds(torsion_psds)
    }, [width, depth, height, meanSpeed, totalFloors, damping])

    const handleExperimentalCalculation = useCallback(async ()=>{
        const Mx : number[] = mxData;
        const My : number[] = myData;
        const Mz: number[] = mzData;


        if (window.pywebview?.api?.compute) {
            // DESKTOP MODE: Call Python
            console.log("Using Python for calculation...");
            const acrossResult = await window.pywebview.api.compute(Mx,width, height, experimentalMeanSpeed, experimentalFrequency);
            const torsionResult = await window.pywebview.api.compute(Mz,width, depth, experimentalMeanSpeed, experimentalFrequency);
            console.log(acrossResult.normalizedFrequency)
            setExperimentalAcrossPsds(acrossResult.psd)
            setNormalizedExperimentalFrequencies(acrossResult.normalizedFrequency)
            setExperimentalTorsionPsds(torsionResult.psd)
        } else {
            // WEB MODE: Fallback to Local JavaScript
            const experi_across_psds : number[] = calculate_experimental_psd_normalized(Mx,width,height,experimentalMeanSpeed,experimentalFrequency).psd
            setExperimentalAcrossPsds(experi_across_psds)

            const {psd, normalizedFrequency} = calculate_experimental_psd_normalized(Mz,width,depth,experimentalMeanSpeed, experimentalFrequency)
            console.log("Normalized Frequency is ", normalizedFrequency)
            // const  : number[] = calculate_experimental_psd_normalized(Mz,width,depth,experimentalMeanSpeed, experimentalFrequency)
            setExperimentalTorsionPsds(psd)
            const along_psds : number[] = calculate_experimental_psd_normalized(My,width,height,experimentalMeanSpeed,experimentalFrequency).psd
            setExperimentalAlongPsds(along_psds)
            // console.log("Normalized ",normalizedFrequency)
            setNormalizedExperimentalFrequencies(normalizedFrequency)
            console.log("new",calculate_experimental_psd_normalized(Mz,width,depth,experimentalMeanSpeed, experimentalFrequency))
            // setCSVData(csvData)
            const [x,y]:number[] = CalculateFD(width, height, depth, meanSpeed,Tone, totalFloors, damping, frequencies, experi_across_psds, psd, buildingDensity)
            //
            setExperimentalVr(x)
            setExperimentalAr(y)
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



    },[width,height,experimentalMeanSpeed,experimentalFrequency,mxData,myData,mzData])

    return (
        <OutputBuildingContext.Provider value={{
            torsionPsds, acrossPsds, ar,vr, setTorsionPsds, setAcrossPsds, setAr, setVr,
            experimentalTorsionPsds,experimentalAcrossPsds,experimentalAr,experimentalVr,
            accelartionYDirection, setAccelartionYDirection,
            experimentalAlongPsds, setExperimentalAlongPsds,
            experimentalAccelartionYDirection, setExperimentalAccelartionYDirection,
            setExperimentalTorsionPsds,setExperimentalAcrossPsds,setExperimentalAr,setExperimentalVr, handleAnalyticalCalculation,handleExperimentalCalculation
        }}>
            {children}
        </OutputBuildingContext.Provider>
    )
}
