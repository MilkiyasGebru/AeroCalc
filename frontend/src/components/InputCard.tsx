import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Calculator} from "lucide-react";
import {Input} from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {Button} from "@/components/ui/button.tsx";

interface InputCardProps {
    width: number;
    height: number;
    depth: number;
    meanSpeed: number;
    initialFrequency: number;
    finalFrequency: number;
    deltaFrequency: number;
    totalFloors: number;
    damping: number;
    Tone: number;
    buildingDensity: number;
    setWidth: (width: number) => void;
    setHeight: (height: number) => void;
    setDepth: (depth: number) => void;
    setMeanSpeed: (meanSpeed: number) => void;
    setInitialFrequency: (initialFrequency: number) => void;
    setFinalFrequency: (finalFrequency: number) => void;
    setDeltaFrequency: (deltaFrequency: number) => void;
    setBuildingDensity: (buildingDensity: number) => void;
    setTotalFloors: (totalFloors: number) => void;
    setDamping: (damping: number)=> void;
    setTone: (Tone: number)=> void;
    handleClick: ()=> void;
}

export default function InputCard(props: InputCardProps){
    return (
        <Card className="  bg-white border-transparent mb-4">
            <CardHeader>
                <CardTitle className="flex gap-2 items-center text-xl">
                    <Calculator className="w-5 h-5 text-blue-300"/>
                    Input Parameters
                </CardTitle>
                <CardDescription>
                    Enter building dimensions and wind parameters
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="space-y-2">
                        <Label htmlFor="width">Width (m)</Label>
                        <Input
                            id="width"
                            type="number"
                            value={props.width}
                            onChange={(e) => props.setWidth(parseFloat(e.target.value))}
                            className="font-mono bg-[hsl(210,20%,98%)] border-transparent w-5/6 md:w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="height">Height (m)</Label>
                        <Input
                            id="height"
                            type="number"
                            value={props.height}
                            onChange={(e) => props.setHeight(parseFloat(e.target.value))}
                            className="font-mono bg-[hsl(210,20%,98%)] border-transparent w-5/6 md:w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="depth">Depth (m)</Label>
                        <Input
                            id="depth"
                            type="number"
                            value={props.depth}
                            onChange={(e) => props.setDepth(parseFloat(e.target.value))}
                            className="font-mono bg-[hsl(210,20%,98%)] border-transparent w-5/6 md:w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="mean_velocity">Mean Velocity (m/s)</Label>
                        <Input
                            id="mean_velocity"
                            type="number"
                            value={props.meanSpeed}
                            onChange={(e) => props.setMeanSpeed(parseFloat(e.target.value))}
                            className="font-mono bg-[hsl(210,20%,98%)] border-transparent w-5/6 md:w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="NFloors">Building Density</Label>
                        <Input
                            id="NFloors"
                            type="number"
                            value={props.buildingDensity}
                            onChange={(e) => props.setBuildingDensity(parseFloat(e.target.value))}
                            className="font-mono bg-[hsl(210,20%,98%)] border-transparent w-5/6 md:w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="NFloors">Number of Floors</Label>
                        <Input
                            id="NFloors"
                            type="number"
                            value={props.totalFloors}
                            onChange={(e) => props.setTotalFloors(parseFloat(e.target.value))}
                            className="font-mono bg-[hsl(210,20%,98%)] border-transparent w-5/6 md:w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="damping">Damping</Label>
                        <Input
                            id="damping"
                            type="number"
                            value={props.damping}
                            onChange={(e) => props.setDamping(parseFloat(e.target.value))}
                            className="font-mono bg-[hsl(210,20%,98%)] border-transparent w-5/6 md:w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="Tone">Tone</Label>
                        <Input
                            id="Tone"
                            type="number"
                            value={props.Tone}
                            onChange={(e) => props.setTone(parseFloat(e.target.value))}
                            className="font-mono bg-[hsl(210,20%,98%)] border-transparent w-5/6 md:w-full"
                        />
                    </div>

                </div>
                <div className="border-t border-gray-200">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Frequency Range</h4>
                    <div className="grid sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="initialFrequency">Initial (Hz)</Label>
                            <Input
                                id="initialFrequency"
                                type="number"
                                step="0.01"
                                value={props.initialFrequency}
                                onChange={(e) =>props.setInitialFrequency(parseFloat(e.target.value))}
                                className="font-mono bg-[hsl(210,20%,98%)]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="finalFrequency">Final (Hz)</Label>
                            <Input
                                id="finalFrequency"
                                type="number"
                                step="0.01"
                                value={props.finalFrequency}
                                onChange={(e) =>props.setFinalFrequency(parseFloat(e.target.value))}
                                className="font-mono bg-[hsl(210,20%,98%)]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="deltaFrequency">Delta (Hz)</Label>
                            <Input
                                id="deltaFrequency"
                                type="number"
                                step="0.01"
                                value={props.deltaFrequency}
                                onChange={(e) => props.setDeltaFrequency(parseFloat(e.target.value))}
                                className="font-mono bg-[hsl(210,20%,98%)]"
                            />
                        </div>
                    </div>
                </div>
                <Button className="w-full text-center flex justify-center hover:cursor-pointer bg-blue-400 text-white"
                    onClick={props.handleClick}
                >
                    <Calculator />
                    Calculate
                </Button>
            </CardContent>
        </Card>
    )
}