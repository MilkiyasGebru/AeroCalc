import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
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
} from "@/components/ui/field"
interface IMeanSpeedData {
    height: number;
    speed: number;
}

import {FileUploadDialog} from "@/components/FileUploadDialog.tsx";
import {useInputBuildingContext} from "@/contexts/useInputBuildingContext.ts";
import {useOutputBuildingContext} from "@/contexts/useOutputBuildingContext.ts";
import {TooltipContent, Tooltip, TooltipTrigger, TooltipProvider} from "@radix-ui/react-tooltip";
import MGraphs from "@/components/MGraphs.tsx";
import PSDGraph from "@/components/PSDGraph.tsx";
import ResultsCard from "@/components/ResultsCard.tsx";
import {InternalDatabaseDialog} from "@/components/InternalDatabaseDialog.tsx";


const parseFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            // header: true,
            dynamicTyping: true,
            complete: (results:any) => resolve(results.data),
            error: (error:any) => reject(error),
        });
    });
};

const parseUrl = (url: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(url, {
            download: true,
            header: true,
            dynamicTyping: true,
            complete: (results:any) => resolve(results.data),
            error: (error:any) => reject(error),
        });
    });
};




export default function InputCard(){

    const [checking, setChecking] = useState<string>("")
    // Part-1
    const {width, height,depth,totalFloors, setWidth, setHeight, setDepth,setTotalFloors } = useInputBuildingContext()
    // Part - 2
    const {buildingDensity, meanSpeed,userMeanSpeed, Tone,Talong,Ttorsion,setTtorsion,setTalong, damping, setBuildingDensity, setMeanSpeed, setTone, setDamping,setUserMeanSpeed} = useInputBuildingContext()

    // Part -3
    const {experimentalFrequency, experimentalMeanSpeed, setExperimentalMeanSpeed, setExperimentalFrequency, setMxData, setMyData, setMzData, mxData, myData, mzData} = useInputBuildingContext()
    // Handling Submit
    const {handleAnalyticalCalculation,handleExperimentalCalculation, } = useOutputBuildingContext()

    // final Part
    const {acrossPsds, torsionPsds, experimentalAcrossPsds, experimentalTorsionPsds, experimentalAlongPsds} = useOutputBuildingContext()
    const [step, setStep] = useState(0);
    const [terrain, setTerrain] = useState<string>("open")
    const [analyticalSelected, setAnalyticalSelected] = useState<boolean>(false)

    const [showInternalDialog, setShowInternalDialog] = useState(false);



    const [graphData, setGraphData] = useState<IMeanSpeedData[]>([])

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

        if ((step == 6) || (step == 5 && checking === "")){
            setStep(0)
            setMzData([])
            setMxData([])
            setMyData([])
            setChecking("")
            return
        }

        if (step == 3 ){
            if (analyticalSelected){
                handleAnalyticalCalculation()
            }
            if (checking === "external_database"){
                handleExperimentalCalculation(mxData, myData, mzData)
            }
        }

        if (step == 3 && checking === "internal_database"){
            setShowInternalDialog(true);
        }
        else{
            setStep(s => s + 1)

        }
    }

    const confirmInternalDbSelection = (option: string) => {
        parseUrl(option).then(result => {
            const Mx : number[] = [];
            const Mz : number[] = [];
            const My: number[] = [];
            result.map(val => {
                Mx.push(val.MX)
                My.push(val.MY)
                Mz.push(val.MZ)
            })
            setMxData(Mx)
            setMyData(My)
            setMzData(Mz)
            handleExperimentalCalculation(Mx, My, Mz)
        })
        setShowInternalDialog(false);
        setStep(s => s + 1); // Now move to the next step
    };

    const handlePrev = ()=>{
        setStep(s => s - 1)
    }

    // State for visibility of each dialog
    const [showFile1, setShowFile1] = useState(false);
    const [showFile2, setShowFile2] = useState(false);
    const [showFile3, setShowFile3] = useState(false);

// State for the actual files
    const [file1, setFile1] = useState<File | null>(null);
    const [file2, setFile2] = useState<File | null>(null);
    const [file3, setFile3] = useState<File | null>(null);

    return (
        <div>
            <Card className=" bg-white border-transparent mb-4 max-h-fit  ">
                {step == 0 && <>
                    <CardHeader>
                        <CardTitle className="flex gap-2 items-center justify-center text-xl ">
                            User Input 1 : Building Geometry
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-2 space-y-3 p-4 w-1/2 mx-auto">
                            <div className="flex items-center justify-start  ">
                                <Label htmlFor="width" className="w-2/5">Width (m):</Label>
                                <Input
                                    id="width"
                                    type="number"
                                    value={width}
                                    onChange={(e) => setWidth(Number(parseFloat(e.target.value).toFixed(3)))}
                                    className=" text-center font-mono shadow-none rounded-none bg-white border-x-0 border-t-0 border-b-black h-auto p-0 w-5/6 md:w-2/6"
                                />
                            </div>
                            <div className="flex items-center justify-start">
                                <Label htmlFor="height" className="w-2/5">Height (m):</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(Number(parseFloat(e.target.value).toFixed(3)))}
                                    className="text-center font-mono shadow-none rounded-none bg-white border-x-0 border-t-0 border-b-black h-auto p-0  w-5/6 md:w-2/6"
                                />
                            </div>
                            <div className=" flex items-center justify-start ">
                                <Label htmlFor="depth" className="w-2/5">Depth (m):</Label>
                                <Input
                                    id="depth"
                                    type="number"
                                    value={depth}
                                    onChange={(e) => setDepth(Number(parseFloat(e.target.value).toFixed(3)))}
                                    className="text-center font-mono shadow-none rounded-none bg-white border-x-0 border-t-0 border-b-black h-auto p-0 w-5/6 md:w-2/6"
                                />
                            </div>
                            <div className="space-y-2 flex items-center justify-start ">
                                <Label htmlFor="NFloors" className="w-2/5">Number of Floors:</Label>
                                <Input
                                    id="NFloors"
                                    type="number"
                                    value={totalFloors}
                                    onChange={(e) => setTotalFloors(parseFloat(e.target.value))}
                                    className="text-center font-mono shadow-none rounded-none bg-white border-x-0 border-t-0 border-b-black h-auto p-0  w-5/6 md:w-2/6"
                                />
                            </div>
                            <div className="space-y-2 flex items-center justify-start ">
                                <RectangleWithArrow width={width} height={depth} />
                            </div>

                        </div>
                    </CardContent>
                </>}
                {step == 1 && <>
                    <CardHeader>
                        <CardTitle className="flex gap-2 items-center justify-center text-xl">
                            User Input 2: Dynamic Property
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 mx-auto w-1/2">

                            <div className="space-y-2 flex items-center justify-center">
                                <Label htmlFor="density" className="w-full">Building Density (Kg/m<sup>3</sup>):</Label>
                                <Input
                                    id="density"
                                    type="number"
                                    value={buildingDensity}
                                    onChange={(e) => setBuildingDensity(Number(parseFloat(e.target.value).toFixed(3)))}
                                    className="font-mono shadow-none rounded-none bg-white border-x-0 border-t-0 border-b-black h-auto p-0  w-5/6 md:w-2/6 text-center"
                                />
                            </div>

                            <div className=" flex items-center justify-center ">
                                <Label htmlFor="damping" className="w-full">Damping:</Label>
                                <Input
                                    id="damping"
                                    type="number"
                                    value={damping}
                                    onChange={(e) => setDamping(Number(parseFloat(e.target.value).toFixed(3)))}
                                    className="text-center font-mono shadow-none rounded-none bg-white border-x-0 border-t-0 border-b-black h-auto p-0  w-5/6 md:w-2/6"
                                />
                            </div>
                            <div className="space-y-2 flex items-center justify-center ">
                                <Label htmlFor="Fundamental Period" className="w-full">Fundamental Period in across-wind
                                    direction (sec)</Label>
                                <Input
                                    id="Tone"
                                    type="number"
                                    value={Tone}
                                    onChange={(e) => setTone(Number(parseFloat(e.target.value).toFixed(3)))}
                                    className="text-center font-mono shadow-none rounded-none bg-white border-x-0 border-t-0 border-b-black h-auto p-0  w-5/6 md:w-2/6"
                                />
                            </div>
                            <div className="space-y-2 flex items-center justify-center ">
                                <Label htmlFor="Fundamental Period" className="w-full">Fundamental Period in along-wind
                                    direction (sec)</Label>
                                <Input
                                    id="Tone"
                                    type="number"
                                    value={Talong}
                                    onChange={(e) => setTalong(Number(parseFloat(e.target.value).toFixed(3)))}
                                    className="text-center font-mono shadow-none rounded-none bg-white border-x-0 border-t-0 border-b-black h-auto p-0  w-5/6 md:w-2/6"
                                />
                            </div>
                            <div className="space-y-2 flex items-center justify-center ">
                                <Label htmlFor="Fundamental Period" className="w-full">Fundamental Period in torsion
                                    (sec)</Label>
                                <Input
                                    id="Tone"
                                    type="number"
                                    value={Ttorsion}
                                    onChange={(e) => setTtorsion(Number(parseFloat(e.target.value).toFixed(3)))}
                                    className="text-center font-mono shadow-none rounded-none bg-white border-x-0 border-t-0 border-b-black h-auto p-0  w-5/6 md:w-2/6"
                                />
                            </div>
                            <div className=" flex justify-start">
                                <RectangleWithArrow width={width} height={depth}/>
                            </div>

                        </div>


                    </CardContent>

                </>}
                {step == 2 && <>
                    <CardHeader>
                        <CardTitle className="flex gap-2 items-center justify-center text-xl">
                            User Input 3: Load Wind Climate
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-2 mx-auto w-5/6 justify-start">


                            <div className="space-y-2 flex items-center ">
                                <Label htmlFor="mean_velocity" className="w-1/2">Mean Speed at 10meters at 10 years
                                    (m/s)</Label>
                                <Input
                                    id="mean_velocity"
                                    type="number"
                                    value={meanSpeed}
                                    onChange={(e) => setMeanSpeed(Number(parseFloat(e.target.value).toFixed(3)))}
                                    className="text-center font-mono shadow-none rounded-none bg-white border-x-0 border-t-0 border-b-black h-auto p-0  w-5/6 md:w-1/6"
                                />
                            </div>
                            <div className="space-y-2 flex items-center  ">
                                <Label htmlFor="terrain" className="w-1/2">Terrain Type:</Label>
                                <Select value={terrain} onValueChange={setTerrain}>
                                    <SelectTrigger id="terrain"
                                                   className="w-1/6 max-w-48 border-none bg-white">
                                        <SelectValue placeholder="Open"/>
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


                        <div className=" grid grid-cols-4">
                            <div className="flex items-center gap-1">
                                Wind Speed Profile
                                <TooltipProvider>
                                <Tooltip key="bottom">
                                    <TooltipTrigger asChild>
                                        <div className="flex gap-1">
                                            <p className="font-semibold text-blue-300 w-full hover:cursor-pointer"> i:</p>
                                        </div>

                                    </TooltipTrigger>
                                    < TooltipContent side="bottom">
                                        <div className="border rounded max-w-[200px] bg-white opacity-100 px-2 py-2">
                                            “The wind profile is developed based on the dynamic wind load calculation procedure in NBC 2025”
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                                </TooltipProvider>

                            </div>
                            <MeanSpeedGraph graph_data={graphData}
                                            current_point={{height: height, speed: meanSpeed * coefficient ** 0.5}}/>
                        </div>
                        <div className="space-y-2 flex items-center mt-6 ">
                            <Label htmlFor="mean_velocity" className="w-1/2">Mean Speed at roof meters at 10 years
                                (m/s)</Label>
                            <Input
                                id="mean_velocity"
                                type="number"
                                value={userMeanSpeed}
                                onChange={(e) => setUserMeanSpeed(Number(parseFloat(e.target.value).toFixed(3)))}
                                className="text-center font-mono shadow-none rounded-none bg-white border-x-0 border-t-0 border-b-black h-auto p-0  w-5/6 md:w-1/6"
                            />
                        </div>
                        </div>
                    </CardContent>
                </>}
                {step == 3 && <>
                    <CardHeader>
                        <CardTitle className="flex gap-2 items-center text-xl">
                            Aerodynamic response calculator
                        </CardTitle>

                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols gap-2">


                            <div className="space-y-2 ">
                                <Field orientation="horizontal" className="border rounded-md p-3 border-gray-200 hover:cursor-pointer">
                                    <Checkbox id="analytical-checkbox" name="terms-checkbox" checked={analyticalSelected} onCheckedChange={(checked)=>setAnalyticalSelected(checked==true)} />

                                    <FieldContent>
                                        <Label htmlFor="analytical-checkbox">Use analytical equations for base moment PSD</Label>
                                    </FieldContent>
                                </Field>

                                <RadioGroup value={checking} onValueChange={setChecking}>
                                    <Field orientation="horizontal" className="border rounded-md p-3 border-gray-200 hover:cursor-pointer">
                                        <RadioGroupItem id="internal-database" value="internal_database"    />

                                        <FieldContent>
                                            <Label htmlFor="internal-database">Access the wind tunnel experiment database</Label>
                                        </FieldContent>
                                    </Field>
                                    <Field orientation="horizontal" className="border rounded-md p-3 border-gray-200 hover:cursor-pointer">
                                        <RadioGroupItem id="external-database" value="external_database"   />

                                        <FieldContent>
                                            <Label htmlFor="external-database">Upload wind tunnel experiment data</Label>
                                        </FieldContent>
                                    </Field>
                                </RadioGroup>

                            </div>


                            { checking === "external_database" &&
                                <div className="space-y-2">

                                         <div className="grid grid-cols  gap-2">
                                             <div className="space-y-4 border-t pt-4">
                                                    <Label className="text-sm font-semibold">Required Data Files</Label>

                                                    <div className="grid grid-cols  gap-4">
                                                        {/* File 1 */}
                                                        <div className="flex items-center gap-2">
                                                            <Button variant="outline" onClick={() => setShowFile1(true)} className="w-full">
                                                                {file1 ? "Change across wind time history" : "Upload across wind time history"}
                                                            </Button>
                                                            {file1 && <span className="text-[10px]  text-blue-500">{file1.name}</span>}
                                                        </div>

                                                        {/* File 2 */}
                                                        <div className="flex items-center gap-2">
                                                            <Button variant="outline" onClick={() => setShowFile2(true)} className="w-full">
                                                                {file2 ? "Change along wind time history" : "Upload along wind time history"}
                                                            </Button>
                                                            {file2 && <span className="text-[10px]  text-blue-500">{file2.name}</span>}
                                                        </div>

                                                        {/* File 3 */}
                                                        <div className="flex items-center gap-2">
                                                            <Button variant="outline" onClick={() => setShowFile3(true)} className="w-full">
                                                                {file3 ? "Change Torsion Wind Time History" : "Upload torsion wind time history"}
                                                            </Button>
                                                            {file3 && <span className="text-[10px]  text-blue-500">{file3.name}</span>}
                                                        </div>
                                                    </div>
                                                </div>
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


                                        </div>


                                </div>
                            }


                        </div>


                    </CardContent>
                </>}
                {step == 4 && checking !== "" &&

                    <div className="grid  gap-2">
                        {(mxData.length > 0) && <MGraphs graph_data={{"val": mxData, "Mtype": "MX"}}/>}
                        {(myData.length > 0) && <MGraphs graph_data={{"val": myData, "Mtype": "MY"}}/>}
                        {(mzData.length > 0) && <MGraphs graph_data={{"val": mzData, "Mtype": "MZ"}}/>}

                </div>}
                {((step == 5 && checking !== "") || (step == 4 && checking === "")) &&
                    <div className="w-full flex flex-col gap-6 bg-transparent  mx-auto">
                        <p className="text-center text-2xl">Aerodynamic base moment PSDs</p>
                        <div className="w-full bg-white rounded-md">
                            <PSDGraph psds={acrossPsds} experimentalPsds={experimentalAcrossPsds} graphType="Across"/>
                        </div>
                        <hr className="w-4/5 mx-auto opacity-40"/>
                        <div className="w-full bg-white rounded-md">
                            <PSDGraph psds={torsionPsds} experimentalPsds={experimentalTorsionPsds}
                                      graphType="Torsion"/>
                        </div>
                        <hr className="w-4/5 mx-auto opacity-40"/>

                        <div className="w-full bg-white rounded-md">
                            <PSDGraph psds={[]} experimentalPsds={experimentalAlongPsds} graphType="Along"/>
                        </div>
                    </div>}

                {((step == 6) || (step == 5 && checking === "")) && <ResultsCard/>}


                <FileUploadDialog
                    open={showFile1}
                    onOpenChange={setShowFile1}
                    onFileSelect={async (file) => {
                        setFile1(file);
                        setShowFile1(false);
                        const parsedData = await parseFile(file);
                        console.log("parsed data is", parsedData)
                        setMxData(parsedData.map(x => x[0]));
                        console.log("parsed data is ", parsedData.map(x => x[0]));
                    }}
                />
                <FileUploadDialog
                    open={showFile2}
                    onOpenChange={setShowFile2}
                    onFileSelect={async (file) => { setFile2(file); setShowFile2(false);
                        const parsedData = await parseFile(file);
                        setMyData(parsedData.map(x => x[0]));                    }}
                />
                <FileUploadDialog
                    open={showFile3}
                    onOpenChange={setShowFile3}
                    onFileSelect={async (file) => { setFile3(file); setShowFile3(false);
                        const parsedData = await parseFile(file);
                        console.log("parsed data is",parsedData)
                        setMzData(parsedData.map(x => x[0]));                    }}
                />

                {showInternalDialog &&   <InternalDatabaseDialog open={showInternalDialog} onOpenChange={setShowInternalDialog} onConfirm={confirmInternalDbSelection} />}


            </Card>
            <div className="flex items-center justify-between ">
                <Button
                    className="w-fit px-3 py-2 text-center flex justify-center hover:cursor-pointer bg-white text-black !bg-opacity-100 "
                    onClick={handlePrev}
                    disabled={step == 0}
                >
                    Prev
                </Button>
                <Button
                    className="w-fit px-3 py-2 text-center flex justify-center hover:cursor-pointer bg-white text-black !bg-opacity-100 "
                    onClick={handleNext}
                    disabled={step == 3 && (!(analyticalSelected || checking !== "") || (checking === "external_database" && file1 == null && file2 == null && file3 == null) )}
                >
                    {((step == 6) || (step == 5 && checking === ""))? "Done":"Next"}
                </Button>
            </div>
        </div>

    )
}