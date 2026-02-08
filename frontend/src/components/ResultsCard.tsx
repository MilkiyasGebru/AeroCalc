import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {TrendingUp} from "lucide-react";
import {useOutputBuildingContext} from "@/contexts/useOutputBuildingContext.ts";



export default function ResultsCard() {
    const {ar, vr, experimentalAr, experimentalVr, accelartionYDirection} = useOutputBuildingContext()
    return (
        <>
        { (ar != null || vr != null || experimentalAr != null || experimentalVr != null) && <Card className="bg-white border-transparent h-fit">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg ">
                    <TrendingUp className="w-5 h-5 text-blue-300"/>
                    Calculation Results
                </CardTitle>
                <CardDescription>
                    Enter parameters and click Calculate
                </CardDescription>

            </CardHeader>
            <CardContent className="grid grid-cols sm:grid-cols-3 gap-2">
                <div
                    className="flex flex-col border p-3 rounded-md items-center bg-[hsl(210,20%,98%)] border-transparent">
                    <span className="font-bold">Analytical AR</span>
                    <span>{ar ? ar.toFixed(3) : "?"}</span>
                </div>
                <div
                    className="flex flex-col border p-3 rounded-md items-center bg-[hsl(210,20%,98%)] border-transparent">
                    <span className="font-bold">Analytical VR</span>
                    <span>{vr ? vr.toFixed(3) : "?"}</span>
                </div>
                <div
                    className="flex flex-col border p-3 rounded-md items-center bg-[hsl(210,20%,98%)] border-transparent">
                    <span className="font-semibold">Analytical Accelartion in Y-direction</span>
                    <span>{accelartionYDirection ? accelartionYDirection.toFixed(3) : "?"}</span>
                </div>
                <div
                    className="flex flex-col border p-3 rounded-md items-center bg-[hsl(210,20%,98%)] border-transparent">
                    <span className="font-bold">Experimental AR</span>
                    <span>{experimentalAr ? experimentalAr.toFixed(3) : "?"}</span>
                </div>
                <div
                    className="flex flex-col border p-3 rounded-md items-center bg-[hsl(210,20%,98%)] border-transparent">
                    <span className="font-bold">Experimental VR</span>
                    <span>{experimentalVr ? experimentalVr.toFixed(3) : "?"}</span>
                </div>
            </CardContent>
        </Card>
        }
        </>
    )
}