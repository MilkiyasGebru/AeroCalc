import {Card, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {TrendingUp} from "lucide-react";

interface ResultsCardProps {
    rms_a_r_Proposed: number;
    rms_vr_proposed: number;

}

export default function ResultsCard(props : ResultsCardProps) {
    return (
        <Card className="bg-white border-transparent h-fit">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg ">
                    <TrendingUp className="w-5 h-5 text-blue-300"/>
                    Calculation Results
                </CardTitle>
                <p> The proposed rms ar value is {props.rms_a_r_Proposed}</p>
                <p>The proposed rms vr value is {props.rms_vr_proposed}</p>
            </CardHeader>
        </Card>
    )
}