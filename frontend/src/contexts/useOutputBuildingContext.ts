import {useContext} from "react";
import {OutputBuildingContext} from "@/providers/OutputBuildingContextProvider.tsx";

export const useOutputBuildingContext = ()=>{
    const context = useContext(OutputBuildingContext);
    if (!context) throw new Error("useBuildingParams must be used within a BuildingProvider");
    return context;
}