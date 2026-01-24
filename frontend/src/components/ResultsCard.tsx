import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {TrendingUp} from "lucide-react";
import {useOutputBuildingContext} from "@/contexts/useOutputBuildingContext.ts";



export default function ResultsCard() {
    const {ar, vr, experimentalAr, experimentalVr} = useOutputBuildingContext()
    return (
        <Card className="bg-white border-transparent h-fit">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg ">
                    <TrendingUp className="w-5 h-5 text-blue-300"/>
                    Calculation Results
                </CardTitle>
                <CardDescription>
                    Enter parameters and click Calculate
                </CardDescription>

            </CardHeader>
            <CardContent className="grid grid-cols sm:grid-cols-2 gap-2">
                <div
                    className="flex flex-col border p-3 rounded-md items-center bg-[hsl(210,20%,98%)] border-transparent">
                    <span className="font-bold">Analytical AR</span>
                    <span>{ar.toFixed(3)}</span>
                </div>
                <div
                    className="flex flex-col border p-3 rounded-md items-center bg-[hsl(210,20%,98%)] border-transparent">
                    <span className="font-bold">Analytical VR</span>
                    <span>{vr.toFixed(3)}</span>
                </div>
                <div
                    className="flex flex-col border p-3 rounded-md items-center bg-[hsl(210,20%,98%)] border-transparent">
                    <span className="font-bold">Analytical AR</span>
                    <span>{experimentalAr.toFixed(3)}</span>
                </div>
                <div
                    className="flex flex-col border p-3 rounded-md items-center bg-[hsl(210,20%,98%)] border-transparent">
                    <span className="font-bold">Analytical VR</span>
                    <span>{experimentalVr.toFixed(3)}</span>
                </div>
            </CardContent>
        </Card>
    )
}