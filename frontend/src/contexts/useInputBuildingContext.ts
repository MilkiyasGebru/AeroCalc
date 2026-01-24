import {useContext} from "react";
import {InputBuildingContext} from "@/providers/InputBuildingContextProvider.tsx";

export const useInputBuildingContext = () => {
    const context = useContext(InputBuildingContext);
    if (!context) throw new Error("useBuildingParams must be used within a BuildingProvider");
    return context;
};