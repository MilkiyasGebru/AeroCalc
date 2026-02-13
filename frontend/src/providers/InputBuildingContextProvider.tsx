import React, {createContext, useState} from "react";

interface InputBuildingContextInterface {
    width: number;
    height: number;
    depth: number;
    meanSpeed: number;
    userMeanSpeed: number;
    experimentalMeanSpeed: number;
    buildingDensity: number;
    totalFloors: number;
    damping: number;
    Tone: number;
    Tacross: number;
    Talong: number;
    Ttorsion: number;
    experimentalFrequency: number;
    terrain: string;
    normalizedExperimentalFrequencies: number[];
    csvData: IUploadData[];
    setWidth: (val: number) => void;
    setHeight: (val: number) => void;
    setDepth: (val: number) => void;
    setMeanSpeed: (val: number) => void;
    setBuildingDensity: (val: number) => void;
    setTotalFloors: (val: number) => void;
    setDamping: (val: number) => void;
    setTone: (val: number) => void;
    setTerrain: (val: string) => void;
    setCSVData: (val: IUploadData[]) => void;
    setExperimentalFrequency: (val: number)=> void;
    setExperimentalMeanSpeed: (val: number)=> void;
    setNormalizedExperimentalFrequencies: (val: number[]) => void;
    mxData: number[];
    myData: number[];
    mzData: number[];
    setMxData: (val: number[]) => void;
    setMyData: (val: number[]) => void;
    setMzData: (val: number[]) => void;
    setTalong: (val :number) => void;
    setTtorsion: (val :number) => void;
    setTacross: (val: number)=>void;
    setUserMeanSpeed: (val: number) => void;

}
interface IUploadData {
    MX: number;
    MY: number;
    MZ: number;
}

export const InputBuildingContext = createContext<InputBuildingContextInterface | undefined>(undefined);

export const InputBuildingContextProvider = ({children}: {children: React.ReactNode}) => {
    const [width, setWidth] = useState<number>(42);
    const [height, setHeight] = useState<number>(33.7);
    const [depth, setDepth] = useState<number>(30);
    const [meanSpeed, setMeanSpeed] = useState<number>(30);
    const [buildingDensity, setBuildingDensity] = useState<number>(150);
    const [totalFloors, setTotalFloors] = useState<number>(100);
    const [damping, setDamping] = useState<number>(0.15);
    const [Tone, setTone] = useState<number>(6.127);
    const [Tacross, setTacross] = useState<number>(6.127);
    const [Talong, setTalong] = useState<number>(6.127);
    const [Ttorsion, setTtorsion] = useState<number>(6.127);
    const [terrain, setTerrain] = useState<string>("open");
    const [csvData, setCSVData] = useState<IUploadData[]>([]);
    const [mxData, setMxData] = useState<number[]>([]);
    const [myData, setMyData] = useState<number[]>([]);
    const [mzData, setMzData] = useState<number[]>([]);
    const [experimentalMeanSpeed, setExperimentalMeanSpeed] = useState<number>(1);
    const [experimentalFrequency, setExperimentalFrequency] = useState<number>(0.18312429715297);
    const [normalizedExperimentalFrequencies, setNormalizedExperimentalFrequencies] = useState<number[]>([]);
    const [userMeanSpeed, setUserMeanSpeed] = useState<number>(30)
    return (
        <InputBuildingContext.Provider value={{
            width, height, depth, meanSpeed, buildingDensity, totalFloors, damping, Tone, terrain,csvData,experimentalMeanSpeed,experimentalFrequency,
            normalizedExperimentalFrequencies, setNormalizedExperimentalFrequencies,
            mxData,myData,mzData,setMxData,setMyData,setMzData,
            Ttorsion, Tacross, Talong, setTalong, setTtorsion, setTacross,
            userMeanSpeed, setUserMeanSpeed,
            setExperimentalFrequency,setExperimentalMeanSpeed,setWidth, setHeight, setDepth,setMeanSpeed, setBuildingDensity,setTotalFloors,setDamping,setTerrain,setTone, setCSVData}} >
            {children}
        </InputBuildingContext.Provider>
    );
}

