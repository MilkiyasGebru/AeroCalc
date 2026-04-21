import React, {createContext, useState} from "react";

interface InputBuildingContextInterface {
    width: number | undefined;
    height: number | undefined;
    depth: number | undefined;
    meanSpeed: number | undefined;
    userMeanSpeed: number | undefined;
    isAnalyticalEnabled: boolean;
    setIsAnalyticalEnabled: (val: boolean) => void;
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
    selectedBuilding: string | null;
    setSelectedBuilding: (val: string | null) => void;

}
interface IUploadData {
    MX: number;
    MY: number;
    MZ: number;
}

export const InputBuildingContext = createContext<InputBuildingContextInterface | undefined>(undefined);

export const InputBuildingContextProvider = ({children}: {children: React.ReactNode}) => {
    const [width, setWidth] = useState<number | undefined>(117);
    const [height, setHeight] = useState<number | undefined>(187);
    const [depth, setDepth] = useState<number | undefined>(28);
    const [meanSpeed, setMeanSpeed] = useState<number | undefined>(10);
    const [buildingDensity, setBuildingDensity] = useState<number | undefined>(200);
    const [totalFloors, setTotalFloors] = useState<number | undefined>(65);
    const [damping, setDamping] = useState<number | undefined>(0.01);
    const [Tone, setTone] = useState<number | undefined>(4);
    const [Tacross, setTacross] = useState<number | undefined>(4);
    const [Talong, setTalong] = useState<number | undefined>(4);
    const [Ttorsion, setTtorsion] = useState<number | undefined>(4);
    const [terrain, setTerrain] = useState<string>("open");
    const [csvData, setCSVData] = useState<IUploadData[]>([]);
    const [mxData, setMxData] = useState<number[]>([]);
    const [myData, setMyData] = useState<number[]>([]);
    const [mzData, setMzData] = useState<number[]>([]);
    const [experimentalMeanSpeed, setExperimentalMeanSpeed] = useState<number>(1);
    const [experimentalFrequency, setExperimentalFrequency] = useState<number>(0.183);
    const [normalizedExperimentalFrequencies, setNormalizedExperimentalFrequencies] = useState<number[]>([]);
    const [userMeanSpeed, setUserMeanSpeed] = useState<number | undefined>(undefined);
    const [isAnalyticalEnabled, setIsAnalyticalEnabled] = useState<boolean>(true);
    const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
    return (
        <InputBuildingContext.Provider value={{
            width, height, depth, meanSpeed, buildingDensity, totalFloors, damping, Tone, terrain,csvData,experimentalMeanSpeed,experimentalFrequency,
            normalizedExperimentalFrequencies, setNormalizedExperimentalFrequencies,
            mxData,myData,mzData,setMxData,setMyData,setMzData,
            Ttorsion, Tacross, Talong, setTalong, setTtorsion, setTacross,
            userMeanSpeed, setUserMeanSpeed,
            isAnalyticalEnabled, setIsAnalyticalEnabled,
            selectedBuilding, setSelectedBuilding,
            setExperimentalFrequency,setExperimentalMeanSpeed,setWidth, setHeight, setDepth,setMeanSpeed, setBuildingDensity,setTotalFloors,setDamping,setTerrain,setTone, setCSVData}} >
            {children}
        </InputBuildingContext.Provider>
    );
}

