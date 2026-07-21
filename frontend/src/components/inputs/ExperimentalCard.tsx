import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useInputBuildingContext } from "@/contexts/useInputBuildingContext";
// import { useOutputBuildingContext } from "@/contexts/useOutputBuildingContext";
import { useState } from "react";
import { FileUploadDialog } from "@/components/FileUploadDialog";
import { InternalDatabaseDialog } from "@/components/InternalDatabaseDialog";
import Papa from "papaparse";

const parseFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            dynamicTyping: true,
            complete: (results: any) => resolve(results.data),
            error: (error: any) => reject(error),
        });
    });
};

const parseUrl = (url: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(url, {
            download: true,
            header: true,
            dynamicTyping: true,
            complete: (results: any) => resolve(results.data),
            error: (error: any) => reject(error),
        });
    });
};

export default function ExperimentalCard() {
    const {
        experimentalFrequency, setExperimentalFrequency,
        experimentalMeanSpeed, setExperimentalMeanSpeed,
        setMxData, setMyData, setMzData,
        isAnalyticalEnabled, setIsAnalyticalEnabled
    } = useInputBuildingContext();

    // const { handleExperimentalCalculation } = useOutputBuildingContext();

    const [calcType, setCalcType] = useState<"none" | "internal" | "external">("none");
    const [showInternalDialog, setShowInternalDialog] = useState(false);
    const [showFile1, setShowFile1] = useState(false);
    const [showFile2, setShowFile2] = useState(false);
    const [showFile3, setShowFile3] = useState(false);

    const [file1, setFile1] = useState<File | null>(null);
    const [file2, setFile2] = useState<File | null>(null);
    const [file3, setFile3] = useState<File | null>(null);

    const confirmInternalDbSelection = (option: string) => {
        parseUrl(option).then(result => {
            const Mx: number[] = [];
            const Mz: number[] = [];
            const My: number[] = [];
            result.map(val => {
                Mx.push(val.MX);
                My.push(val.MY);
                Mz.push(val.MZ);
            });
            setMxData(Mx);
            setMyData(My);
            setMzData(Mz);
            // Calculation is now manual via Run Analysis button, but we store the data in context
        });
        setShowInternalDialog(false);
    };

    return (
        <Card className="bg-card border-border border-t-4 border-t-purple-500 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-purple-700">Aerodynamic response</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="analytical-model" 
                            checked={isAnalyticalEnabled} 
                            onCheckedChange={(checked) => setIsAnalyticalEnabled(!!checked)}
                        />
                        <Label htmlFor="analytical-model" className="cursor-pointer">Analytical prediction models</Label>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[400px]">
                                    <p>Across-wind base moment and base torsion power spectral densities (PSDs) are calculated based on analytical equations developed in <a href="https://link.springer.com/chapter/10.1007/978-3-031-96763-4_26" target="_blank" rel="noopener noreferrer" className="underline text-blue-500">Berile et al. (2024)</a> using wind tunnel tests conducted on models representing tall mass-timber building geometries.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div className=" border-border  pt-1">
                        {/* <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Experimental options</p> */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="internal-db"
                                    checked={calcType === "internal"}
                                    onCheckedChange={() => {
                                        if (calcType === "internal") {
                                            setCalcType("none");
                                            setMxData([]); setMyData([]); setMzData([]);
                                        } else {
                                            setCalcType("internal");
                                            setShowInternalDialog(true);
                                        }
                                    }}
                                />
                                <Label htmlFor="internal-db" className="cursor-pointer">Wind tunnel database</Label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[300px]">
                                            <p>“HFPI and HFBB wind tunnel experiment database composed of tests conducted on models representing tall mass-timber building geometries”</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="external-upload" 
                                    checked={calcType === "external"} 
                                    onCheckedChange={() => {
                                        if (calcType === "external") {
                                            setCalcType("none");
                                            setMxData([]); setMyData([]); setMzData([]);
                                        } else {
                                            setCalcType("external");
                                        }
                                    }}
                                />
                                <Label htmlFor="external-upload" className="cursor-pointer">Upload base load time history</Label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[300px]">
                                            <p>“A column vector of base moment time history (kNm) form a wind tunnel test scaled to full-scale geometry and the wind speed at roof as specified in the previous input, in .csv format”</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>
                </div>

                {calcType === "external" && (
                    <div className="pt-2 space-y-4 border-t border-border mt-4">
                        <div className="grid grid-cols-1 gap-2">
                            <Button variant="outline" size="sm" onClick={() => setShowFile2(true)} className={file2 ? "border-primary text-primary" : ""}>
                                {file2 ? `Along: ${file2.name}` : "Upload along wind"}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setShowFile1(true)} className={file1 ? "border-primary text-primary" : ""}>
                                {file1 ? `Across: ${file1.name}` : "Upload across wind"}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setShowFile3(true)} className={file3 ? "border-primary text-primary" : ""}>
                                {file3 ? `Torsion: ${file3.name}` : "Upload torsion wind"}
                            </Button>
                        </div>
                    </div>
                )}

                {(calcType !== "none") && (
                    <div className="flex flex-col gap-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="expSpeed">U_H_expt (m/s)</Label>
                            <Input
                                id="expSpeed"
                                type="number"
                                value={experimentalMeanSpeed}
                                onChange={(e) => setExperimentalMeanSpeed(Number(parseFloat(e.target.value).toFixed(2)))}
                                className="bg-background border-border"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expFreq">f_expt (Hz)</Label>
                            <Input
                                id="expFreq"
                                type="number"
                                value={experimentalFrequency}
                                onChange={(e) => setExperimentalFrequency(Number(parseFloat(e.target.value).toFixed(2)))}
                                className="bg-background border-border"
                            />
                        </div>
                    </div>
                )}

                <FileUploadDialog
                    open={showFile1}
                    onOpenChange={setShowFile1}
                    onFileSelect={async (file) => {
                        setFile1(file);
                        const parsedData = await parseFile(file);
                        setMxData(parsedData.map(x => x[0]));
                    }}
                />
                <FileUploadDialog
                    open={showFile2}
                    onOpenChange={setShowFile2}
                    onFileSelect={async (file) => {
                        setFile2(file);
                        const parsedData = await parseFile(file);
                        setMyData(parsedData.map(x => x[0]));
                    }}
                />
                <FileUploadDialog
                    open={showFile3}
                    onOpenChange={setShowFile3}
                    onFileSelect={async (file) => {
                        setFile3(file);
                        const parsedData = await parseFile(file);
                        setMzData(parsedData.map(x => x[0]));
                    }}
                />

                <InternalDatabaseDialog 
                    open={showInternalDialog} 
                    onOpenChange={setShowInternalDialog} 
                    onConfirm={confirmInternalDbSelection} 
                />
            </CardContent>
        </Card>
    );
}
