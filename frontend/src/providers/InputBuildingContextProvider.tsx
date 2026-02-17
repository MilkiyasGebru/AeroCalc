import React, {createContext, useState} from "react";

interface InputBuildingContextInterface {
    width: number | undefined;
    height: number | undefined;
    depth: number | undefined;
    meanSpeed: number | undefined;
    userMeanSpeed: number | undefined;
    experimentalMeanSpeed: number;
    buildingDensity: number | undefined;
    totalFloors: number | undefined;
    damping: number | undefined;
    Tone: number | undefined;
    Tacross: number | undefined;
    Talong: number | undefined;
    Ttorsion: number | undefined;
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
    const [width, setWidth] = useState<number | undefined>(undefined);
    const [height, setHeight] = useState<number | undefined>(undefined);
    const [depth, setDepth] = useState<number | undefined>(undefined);
    const [meanSpeed, setMeanSpeed] = useState<number | undefined>(undefined);
    const [buildingDensity, setBuildingDensity] = useState<number | undefined>(undefined);
    const [totalFloors, setTotalFloors] = useState<number | undefined>(undefined);
    const [damping, setDamping] = useState<number | undefined>(undefined);
    const [Tone, setTone] = useState<number | undefined>(undefined);
    const [Tacross, setTacross] = useState<number | undefined>(undefined);
    const [Talong, setTalong] = useState<number | undefined>(undefined);
    const [Ttorsion, setTtorsion] = useState<number | undefined>(undefined);
    const [terrain, setTerrain] = useState<string>("open");
    const [csvData, setCSVData] = useState<IUploadData[]>([]);
    const [mxData, setMxData] = useState<number[]>([]);
    const [myData, setMyData] = useState<number[]>([]);
    const [mzData, setMzData] = useState<number[]>([]);
    const [experimentalMeanSpeed, setExperimentalMeanSpeed] = useState<number>(1);
    const [experimentalFrequency, setExperimentalFrequency] = useState<number>(0.183);
    const [normalizedExperimentalFrequencies, setNormalizedExperimentalFrequencies] = useState<number[]>([]);
    const [userMeanSpeed, setUserMeanSpeed] = useState<number | undefined>(undefined)
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

