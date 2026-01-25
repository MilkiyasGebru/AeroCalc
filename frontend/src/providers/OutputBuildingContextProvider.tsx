import React, {createContext, useCallback, useState} from "react";
import {useInputBuildingContext} from "@/contexts/useInputBuildingContext.ts";
import {frequencies} from "../../CONSTANTS.ts";
import {
    CalculateAcrossPsdResponse, CalculateFD,
    CalculateTorsionPsdResponse,
} from "@/hooks/useCalculateBuildingResponse.ts";
import {calculate_experimental_psd_normalized} from "@/hooks/digital_processor.ts";

interface IUploadData {
    M1: number;
    M2: number;
    M3: number;
}
interface OutputBuildingContextInterface {
    torsionPsds: number[];
    acrossPsds: number[];
    ar: number | null;
    vr: number | null;
    experimentalTorsionPsds: number[];
    experimentalAcrossPsds: number[];
    experimentalAr: number | null;
    experimentalVr: number | null;
    setTorsionPsds: (val: number[])=> void;
    setAcrossPsds: (val: number[])=>void;
    setAr: (val: number)=> void;
    setVr: (val: number)=> void;
    setExperimentalTorsionPsds: (val: number[])=> void;
    setExperimentalAcrossPsds: (val: number[])=> void;
    setExperimentalAr: (val: number)=> void;
    setExperimentalVr: (val: number)=> void;
    handleAnalyticalCalculation : () => void;
    handleExperimentalCalculation : (csvData: IUploadData[] ) => void;
}


export const OutputBuildingContext = createContext<OutputBuildingContextInterface | undefined>(undefined);

export const OutputBuildingContextProvider = ({children}: {children: React.ReactNode})=>{

    const {width,height,depth,meanSpeed,damping,totalFloors,terrain,Tone,csvData, setCSVData} = useInputBuildingContext();

    const [torsionPsds, setTorsionPsds] = useState<number[]>([]);
    const [acrossPsds, setAcrossPsds] = useState<number[]>([]);
    const [ar, setAr] = useState<number | null>(null)
    const [vr, setVr] = useState<number | null>(null)

    const [experimentalTorsionPsds, setExperimentalTorsionPsds] = useState<number[]>([]);
    const [experimentalAcrossPsds, setExperimentalAcrossPsds] = useState<number[]>([]);
    const [experimentalAr, setExperimentalAr] = useState<number | null>(null)
    const [experimentalVr, setExperimentalVr] = useState<number | null>(null)
    const handleAnalyticalCalculation = useCallback(()=>{

        let across_psds: number[] = CalculateAcrossPsdResponse(width,height,depth,frequencies)
        let torsion_psds: number[] = CalculateTorsionPsdResponse(width,height,depth,meanSpeed,frequencies)

        const [x,y]:number[] = CalculateFD(width, height, depth, meanSpeed, totalFloors, damping, frequencies, across_psds, torsion_psds)
        console.log(Tone, terrain)
        setVr(x)
        setAr(y)
        setAcrossPsds(across_psds)
        setTorsionPsds(torsion_psds)
    }, [width, depth, height, meanSpeed, totalFloors, damping])

    const handleExperimentalCalculation = useCallback((csvData: IUploadData[])=>{
        const Mx : number[] = [];
        // const My : number[] = [];
        const Mz : number[] = [];
        csvData.map(val => {
            Mx.push(val.M1)
            // My.push(val.M2)
            Mz.push(val.M3)
        })
        const experi_across_psds : number[] = calculate_experimental_psd_normalized(Mx,width,height,1,1.83)
        setExperimentalAcrossPsds(experi_across_psds)

        const experi_torsion_psds : number[] = calculate_experimental_psd_normalized(Mz,depth,height,1, 1.83)
        setExperimentalTorsionPsds(experi_torsion_psds)

        // setCSVData(csvData)
        console.log(experi_torsion_psds.length, frequencies.length)
        // let across_psds: number[] = CalculateAcrossPsdResponse(width,height,depth,frequencies)
        // let torsion_psds: number[] = CalculateTorsionPsdResponse(width,height,depth,meanSpeed,frequencies)

        const [x,y]:number[] = CalculateFD(width, height, depth, meanSpeed, totalFloors, damping, frequencies, experi_across_psds, experi_torsion_psds)
        // console.log(Tone, terrain)
        // setVr(x)
        // setAr(y)
        setExperimentalVr(x)
        setExperimentalAr(y)



    },[width,height])

    return (
        <OutputBuildingContext.Provider value={{
            torsionPsds, acrossPsds, ar,vr, setTorsionPsds, setAcrossPsds, setAr, setVr,
            experimentalTorsionPsds,experimentalAcrossPsds,experimentalAr,experimentalVr,
            setExperimentalTorsionPsds,setExperimentalAcrossPsds,setExperimentalAr,setExperimentalVr, handleAnalyticalCalculation,handleExperimentalCalculation
        }}>
            {children}
        </OutputBuildingContext.Provider>
    )
}
