import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Calculator} from "lucide-react";
import {Input} from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {Button} from "@/components/ui/button.tsx";
import { useEffect, useState} from "react";
import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import MeanSpeedGraph from "@/components/MeanSpeedGraph.tsx";
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {RectangleWithArrow} from "@/components/RectangleWithArrow.tsx";
import Papa from "papaparse";
import {
    Field,
    FieldContent,
    FieldDescription,
} from "@/components/ui/field"
interface IMeanSpeedData {
    height: number;
    speed: number;
}

import {FileUploadDialog} from "@/components/FileUploadDialog.tsx";
import {useInputBuildingContext} from "@/contexts/useInputBuildingContext.ts";
import {useOutputBuildingContext} from "@/contexts/useOutputBuildingContext.ts";


const parseFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            complete: (results:any) => resolve(results.data),
            error: (error:any) => reject(error),
        });
    });
};




export default function InputCard(){

    // Part-1
    const {width, height,depth,totalFloors, setWidth, setHeight, setDepth,setTotalFloors } = useInputBuildingContext()
    // Part - 2
    const {buildingDensity, meanSpeed, Tone, damping, setBuildingDensity, setMeanSpeed, setTone, setDamping} = useInputBuildingContext()

    // Part -3
    const {experimentalFrequency, experimentalMeanSpeed, setExperimentalMeanSpeed, setExperimentalFrequency} = useInputBuildingContext()
    // Handling Submit
    const {handleAnalyticalCalculation,handleExperimentalCalculation, } = useOutputBuildingContext()

    const [step, setStep] = useState(0);
    const [terrain, setTerrain] = useState<string>("open")
    const [analyticalSelected, setAnalyticalSelected] = useState<boolean>(false)
    const [experimentalSelected, setExperimentalSelected] = useState<boolean>(false)
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [experimentSource, setExperimentSource] = useState<string>("");
    const handleExperimentSelection = (value : string)=>{
        if (value == "database"){
            setExperimentSource(value)
        }
        else {
            setShowFileUpload(true);
            setExperimentSource(value)
        }
    }
    const handleSubmit = async ()=>{
        if (analyticalSelected){
            handleAnalyticalCalculation()
        }

        if (uploadedFile && experimentalSelected){
            const parsedData = await parseFile(uploadedFile)
            handleExperimentalCalculation(parsedData)


        }

    }

    const [graphData, setGraphData] = useState<IMeanSpeedData[]>([])

    const handleFileSelect = (file: File) => {
        setUploadedFile(file);

    };
    const coefficient = (terrain == "open")? (height/10)**0.28: 0.5*((height/12.7)**0.5);

    useEffect(() => {
        const handler: number | undefined = setTimeout(()=>{
            const MaxHeight: number = height * 1.5;
            const graph_data = [];
            let h : number = 0;
            while (h < MaxHeight){
                const c = (terrain == "open")? (h/10)**0.28: 0.5*((h/12.7)**0.5);
                graph_data.push({
                    height: h,
                    speed: meanSpeed * c ** 0.5
                })
                h += 1;
            }
            setGraphData(graph_data)
        }, 1000)
        return ()=>clearTimeout(handler)

    }, [terrain, height, meanSpeed]);

    const handleNext = ()=>{
        setStep(s => s + 1)
    }
    const handlePrev = ()=>{
        setStep(s => s - 1)
    }
    return (
        <Card className="  bg-white border-transparent mb-4">
            {step == 0 && <>
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center text-xl">
                        <Calculator className="w-5 h-5 text-blue-300"/>
                        Geometry Input Parameters
                    </CardTitle>
                    <CardDescription>
                        Enter building geometery dimensions
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols sm:grid-cols-2 gap-2">
                        <div className="space-y-2">
                            <Label htmlFor="width">Width (m)</Label>
                            <Input
                                id="width"
                                type="number"
                                value={width}
                                onChange={(e) => setWidth(parseFloat(e.target.value))}
                                className="font-mono bg-[hsl(210,20%,98%)] border-transparent w-5/6 md:w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="height">Height (m)</Label>
                            <Input
                                id="height"
                                type="number"
                                value={height}
                                onChange={(e) => setHeight(parseFloat(e.target.value))}
                                className="font-mono bg-[hsl(210,20%,98%)] border-transparent w-5/6 md:w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="depth">Depth (m)</Label>
                            <Input
                                id="depth"
                                type="number"
                                value={depth}
                                onChange={(e) => setDepth(parseFloat(e.target.value))}
                                className="font-mono bg-[hsl(210,20%,98%)] border-transparent w-5/6 md:w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="NFloors">Number of Floors</Label>
                            <Input
                                id="NFloors"
                                type="number"
                                value={totalFloors}
                                onChange={(e) => setTotalFloors(parseFloat(e.target.value))}
                                className="font-mono bg-[hsl(210,20%,98%)] border-transparent w-5/6 md:w-full"
                            />
                        </div>

                    </div>

                    <div className="flex gap-2">
                        <Button
                            className="w-full text-center flex justify-center hover:cursor-pointer bg-blue-400 text-white"
                            onClick={handlePrev}
                            disabled={true}
                        >
                            Prev
                        </Button>
                        <Button
                            className="w-full text-center flex justify-center hover:cursor-pointer bg-blue-400 text-white"
                            onClick={handleNext}
                        >
                            Next
                        </Button>

                    </div>
                    <RectangleWithArrow width={width} height={depth} />
                </CardContent>
            </>}
            {step == 1 && <>
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center text-xl">
                        <Calculator className="w-5 h-5 text-blue-300"/>
                        Dynamic Property Input Parameters
                    </CardTitle>
                    <CardDescription>
                    Enter the dynamic properites
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols sm:grid-cols-2 gap-2">

                        <div className="space-y-2">
                            <Label htmlFor="density">Building Density (Kg/m<sup>3</sup>)</Label>
                            <Input
                                id="density"
                                type="number"
                                value={buildingDensity}
                                onChange={(e) => setBuildingDensity(parseFloat(e.target.value))}
                                className="font-mono bg-[hsl(210,20%,98%)] border-transparent w-5/6 md:w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="damping">Damping</Label>
                            <Input
                                id="damping"
                                type="number"
                                value={damping}
                                onChange={(e) => setDamping(parseFloat(e.target.value))}
                                className="font-mono bg-[hsl(210,20%,98%)] border-transparent w-5/6 md:w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="Fundamental Period">Fundamental Period (sec)</Label>
                            <Input
                                id="Tone"
                                type="number"
                                value={Tone}
                                onChange={(e) => setTone(parseFloat(e.target.value))}
                                className="font-mono bg-[hsl(210,20%,98%)] border-transparent w-5/6 md:w-full"
                            />
                        </div>

                    </div>
                    <div className="flex gap-2">
                        <Button
                            className="w-full text-center flex justify-center hover:cursor-pointer bg-blue-400 text-white"
                            onClick={handlePrev}
                        >
                            Prev
                        </Button>
                        <Button
                            className="w-full text-center flex justify-center hover:cursor-pointer bg-blue-400 text-white"
                            onClick={handleNext}
                        >
                            Next
                        </Button>

                    </div>

                </CardContent>
            </>}
            {step == 2 && <>
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center text-xl">
                        <Calculator className="w-5 h-5 text-blue-300"/>
                        Wind Parameters
                    </CardTitle>
                    <CardDescription>
                        Enter the wind properites
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols sm:grid-cols-2 gap-2">


                        <div className="space-y-2">
                            <Label htmlFor="mean_velocity">Mean Speed at 10meters at 10 years (m/s)</Label>
                            <Input
                                id="mean_velocity"
                                type="number"
                                value={meanSpeed}
                                onChange={(e) => setMeanSpeed(parseFloat(e.target.value))}
                                className="font-mono bg-[hsl(210,20%,98%)] border-transparent w-5/6 md:w-full"
                            />
                        </div>
                        <div>
                            <Label htmlFor="terrain">Terrain Type</Label>
                            <Select value={terrain} onValueChange={setTerrain}>
                                <SelectTrigger id="terrain" className="w-full max-w-48 border-transparent bg-[hsl(210,20%,98%)]">
                                    <SelectValue placeholder="Open" />
                                </SelectTrigger>
                                <SelectContent className="bg-[hsl(210,20%,98%)]">
                                    <SelectGroup>
                                        <SelectLabel>Terrain</SelectLabel>
                                        <SelectItem value="open" className="hover:bg-white">open</SelectItem>
                                        <SelectItem value="rough" className="hover:bg-white">rough</SelectItem>

                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                    </div>
                    <MeanSpeedGraph graph_data={graphData} current_point={{height: height, speed: meanSpeed * coefficient ** 0.5}}/>


                    <div className="flex gap-2">
                        <Button
                            className="w-full text-center flex justify-center hover:cursor-pointer bg-blue-400 text-white"
                            onClick={handlePrev}
                        >
                            Prev
                        </Button>
                        <Button
                            className="w-full text-center flex justify-center hover:cursor-pointer bg-blue-400 text-white"
                            onClick={handleNext}
                        >
                            Next
                        </Button>

                    </div>

                </CardContent>
            </>}
            {step == 3 && <>
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center text-xl">
                        <Calculator className="w-5 h-5 text-blue-300"/>
                        Aerodynamic
                    </CardTitle>
                    <CardDescription>
                        Choose how you want to perform the calculation
                    </CardDescription>

                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols gap-2">


                        <div className="space-y-2 ">
                            <Field orientation="horizontal" className="border rounded-md p-3 border-gray-200 hover:cursor-pointer">
                                <Checkbox id="analytical-checkbox" name="terms-checkbox" checked={analyticalSelected} onCheckedChange={(checked)=>setAnalyticalSelected(checked==true)} />

                                <FieldContent>
                                    <Label htmlFor="analytical-checkbox">Analytical Calculation</Label>
                                    <FieldDescription>
                                        Use percise mathematical formulas
                                    </FieldDescription>
                                </FieldContent>
                            </Field>
                            <Field orientation="horizontal" className="border rounded-md p-3 border-gray-200 hover:cursor-pointer">
                                <Checkbox id="experimental-checkbox" name="terms-checkbox" checked={experimentalSelected} onCheckedChange={(checked)=>setExperimentalSelected(checked===true)} />

                                <FieldContent>
                                    <Label htmlFor="experimental-checkbox">Experimental Calculation</Label>
                                    <FieldDescription>
                                        Use available experimental data from our database or file upload
                                    </FieldDescription>
                                </FieldContent>
                            </Field>
                        </div>


                        { experimentalSelected &&
                            <div className="space-y-2">
                                <h2>Data Source</h2>
                                <RadioGroup value={experimentSource} onValueChange={(value)=>handleExperimentSelection(value)} className="w-fit">
                                    <div className="flex items-center gap-3">
                                        <RadioGroupItem value="database" id="r1" disabled={true} />
                                        <Label htmlFor="r1">Database</Label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <RadioGroupItem value="file_upload" id="r2" />
                                        <Label htmlFor="r2">Upload Data</Label>
                                        {uploadedFile && (
                                            <span className="text-xs text-primary font-medium">
                                                {uploadedFile.name}
                                            </span>
                                        )}
                                    </div>
                                    {experimentSource=="file_upload" && <div className="grid grid-cols sm:grid-cols-2 gap-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="experimentalMeanSpeed">U_H_expt (m/s)</Label>
                                            <Input
                                                id="experimentalMeanSpeed"
                                                type="number"
                                                value={experimentalMeanSpeed}
                                                onChange={(e) => setExperimentalMeanSpeed(parseFloat(e.target.value))}
                                                className="font-mono bg-[hsl(210,20%,98%)] border-transparent w-5/6 md:w-full"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="experimentalFrequency">f_expt</Label>
                                            <Input
                                                id="experimentalFrequency"
                                                type="number"
                                                value={experimentalFrequency}
                                                onChange={(e) => setExperimentalFrequency(parseFloat(e.target.value))}
                                                className="font-mono bg-[hsl(210,20%,98%)] border-transparent w-5/6 md:w-full"
                                            />
                                        </div>


                                    </div>}

                                </RadioGroup>

                            </div>
                        }


                    </div>


                    <div className="flex gap-2">
                        <Button
                            className="w-full text-center flex justify-center hover:cursor-pointer bg-blue-400 text-white"
                            onClick={handlePrev}
                        >
                            Prev
                        </Button>
                        <Button
                            className="w-full text-center flex justify-center hover:cursor-pointer bg-blue-400 text-white"
                            onClick={handleSubmit}
                            disabled={!(analyticalSelected || (experimentalSelected && (uploadedFile !== null)))}
                        >
                            Submit
                        </Button>

                    </div>

                </CardContent>
            </>}


            <FileUploadDialog
                open={showFileUpload}
                onOpenChange={setShowFileUpload}
                onFileSelect={handleFileSelect}
            />
        </Card>
    )
}