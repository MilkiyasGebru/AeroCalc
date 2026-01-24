import React, {createContext, useCallback, useState} from "react";
import {useInputBuildingContext} from "@/contexts/useInputBuildingContext.ts";
import {frequencies} from "../../CONSTANTS.ts";
import {
    CalculateAcrossPsdResponse, CalculateFD,
    CalculateTorsionPsdResponse,
} from "@/hooks/useCalculateBuildingResponse.ts";

interface OutputBuildingContextInterface {
    torsionPsds: number[];
    acrossPsds: number[];
    ar: number;
    vr: number;
    experimentalTorsionPsds: number[];
    experimentalAcrossPsds: number[];
    experimentalAr: number;
    experimentalVr: number;
    setTorsionPsds: (val: number[])=> void;
    setAcrossPsds: (val: number[])=>void;
    setAr: (val: number)=> void;
    setVr: (val: number)=> void;
    setExperimentalTorsionPsds: (val: number[])=> void;
    setExperimentalAcrossPsds: (val: number[])=> void;
    setExperimentalAr: (val: number)=> void;
    setExperimentalVr: (val: number)=> void;
    handleAnalyticalCalculation : () => void;
}

export const OutputBuildingContext = createContext<OutputBuildingContextInterface | undefined>(undefined);

export const OutputBuildingContextProvider = ({children}: {children: React.ReactNode})=>{

    const {width,height,depth,meanSpeed,damping,totalFloors,terrain,Tone} = useInputBuildingContext();

    const [torsionPsds, setTorsionPsds] = useState<number[]>([]);
    const [acrossPsds, setAcrossPsds] = useState<number[]>([]);
    const [ar, setAr] = useState<number>(0)
    const [vr, setVr] = useState<number>(0.01)

    const [experimentalTorsionPsds, setExperimentalTorsionPsds] = useState<number[]>([]);
    const [experimentalAcrossPsds, setExperimentalAcrossPsds] = useState<number[]>([]);
    const [experimentalAr, setExperimentalAr] = useState<number>(0)
    const [experimentalVr, setExperimentalVr] = useState<number>(0.01)
    const handleAnalyticalCalculation = useCallback(()=>{

        let across_psds: number[] = CalculateAcrossPsdResponse(width,height,depth,frequencies)
        let torsion_psds: number[] = CalculateTorsionPsdResponse(width,height,depth,meanSpeed,frequencies)

        const [x,y]:number[] = CalculateFD(width, height, depth, meanSpeed, totalFloors, damping, frequencies, across_psds, torsion_psds)

        setVr(x)
        setAr(y)
        setAcrossPsds(across_psds)
        setTorsionPsds(torsion_psds)
    }, [width, depth, height, meanSpeed, totalFloors, damping])



    return (
        <OutputBuildingContext.Provider value={{
            torsionPsds, acrossPsds, ar,vr, setTorsionPsds, setAcrossPsds, setAr, setVr,
            experimentalTorsionPsds,experimentalAcrossPsds,experimentalAr,experimentalVr,
            setExperimentalTorsionPsds,setExperimentalAcrossPsds,setExperimentalAr,setExperimentalVr, handleAnalyticalCalculation
        }}>
            {children}
        </OutputBuildingContext.Provider>
    )
}
