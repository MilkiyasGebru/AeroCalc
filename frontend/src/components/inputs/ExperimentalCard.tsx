import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useInputBuildingContext } from "@/contexts/useInputBuildingContext";
import { useOutputBuildingContext } from "@/contexts/useOutputBuildingContext";
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
        setMxData, setMyData, setMzData
    } = useInputBuildingContext();

    const { handleExperimentalCalculation } = useOutputBuildingContext();

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
        <CardTitle className="text-lg font-bold text-purple-700">Experimental data</CardTitle>
      </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="internal-db" 
                            checked={calcType === "internal"} 
                            onCheckedChange={() => {
                                if (calcType === "internal") setCalcType("none");
                                else {
                                    setCalcType("internal");
                                    setShowInternalDialog(true);
                                }
                            }}
                        />
                        <Label htmlFor="internal-db" className="cursor-pointer">Use wind tunnel database</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="external-upload" 
                            checked={calcType === "external"} 
                            onCheckedChange={() => setCalcType(calcType === "external" ? "none" : "external")}
                        />
                        <Label htmlFor="external-upload" className="cursor-pointer">Upload custom Aeodynamic base load timehistory</Label>
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
