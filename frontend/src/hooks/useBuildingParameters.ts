import {useEffect, useState} from "react";
import {
    CalculateAcrossPsdResponse, CalculateFD,
    CalculateTorsionPsdResponse,
    GenerateFrequencies
} from "@/hooks/useCalculateBuildingResponse.ts";

export const useBuildingParameters = () => {
    const [width, setWidth] = useState<number>(40);
    const [height, setHeight] = useState<number>(300);
    const [depth, setDepth] = useState<number>(30);
    const [meanSpeed, setMeanSpeed] = useState<number>(30);
    const [initialFrequency, setInitialFrequency] = useState<number>(0.1);
    const [finalFrequency, setFinalFrequency] = useState<number>(1);
    const [deltaFrequency, setDeltaFrequency] = useState<number>(0.01);
    const [torsionPsds, setTorsionPsds] = useState<number[]>([]);
    const [acrossPsds, setAcrossPsds] = useState<number[]>([]);
    const [buildingDensity, setBuildingDensity] = useState<number>(150);
    const [totalFloors, setTotalFloors] = useState<number>(100);
    const [damping, setDamping] = useState<number>(0.15)
    const [Tone, setTone] = useState<number>(6.127169106)
    const [ar, setAr] = useState<number>(0)
    const [vr, setVr] = useState<number>(0.01)

    let handleClick = ()=>{
        const frequencies: number[] = GenerateFrequencies(initialFrequency, finalFrequency, deltaFrequency);

        let across_psds: number[] = CalculateAcrossPsdResponse(width,height,depth,frequencies)
        let torsion_psds: number[] = CalculateTorsionPsdResponse(width,height,depth,meanSpeed,frequencies)

        const [x,y]:number[] = CalculateFD(width, height, depth, meanSpeed, Tone, totalFloors, damping, GenerateFrequencies(initialFrequency, finalFrequency, deltaFrequency), across_psds, torsion_psds, buildingDensity)

        setVr(x)
        setAr(y)
        setAcrossPsds(across_psds)
        setTorsionPsds(torsion_psds)

    }

    useEffect(() => {

        handleClick = ()=>{
            const frequencies: number[] = GenerateFrequencies(initialFrequency, finalFrequency, deltaFrequency);

            setAcrossPsds(CalculateAcrossPsdResponse(width,height,depth,frequencies))
            setTorsionPsds(CalculateTorsionPsdResponse(width,height,depth,meanSpeed,frequencies))
        }


        }, [width, height, depth, meanSpeed, initialFrequency, finalFrequency, deltaFrequency])


    return {
        width,
        height,
        depth,
        meanSpeed,
        torsionPsds,
        acrossPsds,
        initialFrequency,
        finalFrequency,
        deltaFrequency,
        buildingDensity,
        totalFloors,
        damping,
        Tone,
        ar,
        vr,
        setTone,
        setDamping,
        setWidth,
        setHeight,
        setDepth,
        setMeanSpeed,
        setInitialFrequency,
        setFinalFrequency,
        setDeltaFrequency,
        setBuildingDensity,
        setTotalFloors,
        handleClick
    }

}