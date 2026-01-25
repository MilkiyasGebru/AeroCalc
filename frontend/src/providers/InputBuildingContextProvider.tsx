import React, {createContext, useState} from "react";

interface InputBuildingContextInterface {
    width: number;
    height: number;
    depth: number;
    meanSpeed: number;
    buildingDensity: number;
    totalFloors: number;
    damping: number;
    Tone: number;
    terrain: string;
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
}
interface IUploadData {
    MX: number;
    MY: number;
    MZ: number;
}

export const InputBuildingContext = createContext<InputBuildingContextInterface | undefined>(undefined);

export const InputBuildingContextProvider = ({children}: {children: React.ReactNode}) => {
    const [width, setWidth] = useState<number>(40);
    const [height, setHeight] = useState<number>(300);
    const [depth, setDepth] = useState<number>(30);
    const [meanSpeed, setMeanSpeed] = useState<number>(30);
    const [buildingDensity, setBuildingDensity] = useState<number>(150);
    const [totalFloors, setTotalFloors] = useState<number>(100);
    const [damping, setDamping] = useState<number>(0.15);
    const [Tone, setTone] = useState<number>(6.127169106);
    const [terrain, setTerrain] = useState<string>("open");
    const [csvData, setCSVData] = useState<IUploadData[]>([]);
    return (
        <InputBuildingContext.Provider value={{
            width, height, depth, meanSpeed, buildingDensity, totalFloors, damping, Tone, terrain,csvData,
                setWidth, setHeight, setDepth,setMeanSpeed, setBuildingDensity,setTotalFloors,setDamping,setTerrain,setTone, setCSVData}} >
            {children}
        </InputBuildingContext.Provider>
    );
}

