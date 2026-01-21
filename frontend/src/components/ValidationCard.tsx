import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card"
import {CircleAlert} from "lucide-react";
import { Badge } from "@/components/ui/badge"

interface FooterProps {
    width: number;
    depth: number;
}

export default function ValidationCard(props: FooterProps) {
    return (
        <div className="w-full ">
            <Card className="w-11/12 md:w-4/6 mx-auto bg-white border-transparent">
                <CardHeader className="font-bold text-left pb-3 ">
                    <CardTitle className="flex items-center gap-3 text-lg">
                        <CircleAlert className="text-red-600" />
                        <p>Width/Height Ratio Validation</p>
                    </CardTitle>
                    <CardDescription className="font-semibold text-lg">
                        This formula is valid for buildings with width/depth ratio greater than 1
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/*<p > This formula is valid for buildings with width/height ratio between 0.2 and 5</p>*/}
                    <div className="flex mt-4 ">
                        <div className="flex flex-row items-center gap-4 ">
                            <p className="text-lg">Current Ratio:</p>
                            <Badge className="rounded-full px-6 py-3 text-md">{(props.width/props.depth).toFixed(2)} </Badge>
                            <span className="text-sm">
                                Valid Range: {">= 1"}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}