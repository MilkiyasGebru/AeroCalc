import { useState, useEffect } from "react";
import ResultsCard from "@/components/ResultsCard";
import PSDGraph from "@/components/PSDGraph";
import MGraphs from "@/components/MGraphs";
import MeanSpeedGraph from "@/components/MeanSpeedGraph";
import OptimizationTab from "@/components/outputs/OptimizationTab";
import AccelartionLimitGraph from "@/components/AccelartionLimitGraph";
import TorsionLimitGraph from "@/components/TorsionLimitGraph";
import { RectangleWithArrow } from "@/components/RectangleWithArrow";
import { useOutputBuildingContext } from "@/contexts/useOutputBuildingContext";
import { useInputBuildingContext } from "@/contexts/useInputBuildingContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface IMeanSpeedData {
  height: number;
  speed: number;
}

export default function OutputTabs() {
    const [activeTab, setActiveTab] = useState("overview");
    const { 
        acrossPsds, torsionPsds, alongPsds,
        experimentalAcrossPsds, experimentalTorsionPsds, experimentalAlongPsds,
        ar, experimentalAr, vr, experimentalVr, 
        accelartionYDirection, experimentalAccelartionYDirection,
        wasAnalyticalRun, wasExperimentalRun
    } = useOutputBuildingContext();

    const { 
        mxData, myData, mzData, height, meanSpeed, terrain, width, depth,
        Talong, Tacross, Ttorsion 
    } = useInputBuildingContext();
    const [graphData, setGraphData] = useState<IMeanSpeedData[]>([]);

    const coefficient = (height !== undefined && meanSpeed !== undefined)
        ? (terrain === "open" ? (height / 10) ** 0.28 : 0.5 * ((height / 12.7) ** 0.5))
        : 0;

    useEffect(() => {
        if (Number.isFinite(height) && Number.isFinite(meanSpeed) && height != undefined && meanSpeed != undefined) {
            const MaxHeight = height * 1.5;
            const data = [];
            let h = 0;
            while (h < MaxHeight) {
                const c = (terrain === "open") ? (h / 10) ** 0.28 : 0.5 * ((h / 12.7) ** 0.5);
                data.push({
                    height: h,
                    speed: meanSpeed * c ** 0.5
                });
                h += 1;
            }
            setGraphData(data);
        }
    }, [terrain, height, meanSpeed]);

    const tabs = [
        { id: "overview", label: "Dynamic response summary" },
        { id: "optimization", label: "Dynamic response optimization" },
        { id: "site", label: "Building orientation & wind profile" },
        { id: "history", label: "Aerodynamic base load timehistory" },
        { id: "spectral", label: "Aerodynamic base load spectra" },
        
    ];

    const hasResults = ar !== null || experimentalAr !== null;

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex border-b border-border">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "px-6 py-3 text-sm font-medium transition-colors relative",
                            activeTab === tab.id 
                                ? "text-primary border-b-2 border-primary" 
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {!hasResults && activeTab !== "site" && (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2 opacity-50">
                        <p className="text-xl">No analysis results yet</p>
                        <p>Configure inputs and click "Run Analysis" to see results</p>
                    </div>
                )}

                {activeTab === "overview" && hasResults && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <Card className="bg-card border-border">
                            <ResultsCard />
                        </Card>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            <Card className="border-border">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-bold text-muted-foreground text-center">Acceleration Limits</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <AccelartionLimitGraph 
                                        points={[
                                            ...(wasAnalyticalRun ? [
                                                { frequency: Talong ? 1/Talong : 0, acceleration: accelartionYDirection ?? 0, label: "Analytical Along", color: "#ef4444", shape: "circle" as const},
                                                { frequency: Tacross ? 1/Tacross : 0, acceleration: ar ?? 0, label: "Analytical Across", color: "#ef4444", shape: "diamond"  as const }
                                            ] : []),
                                            ...(wasExperimentalRun ? [
                                                { frequency: Talong ? 1/Talong : 0, acceleration: experimentalAccelartionYDirection ?? 0, label: "Exp. Along", color: "#3b82f6", shape: "circle"  as const},
                                                { frequency: Tacross ? 1/Tacross : 0, acceleration: experimentalAr ?? 0, label: "Exp. Across", color: "#3b82f6", shape: "diamond" as const }
                                            ] : [])
                                        ]} 
                                    />
                                </CardContent>
                            </Card>

                            <Card className="border-border">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-bold text-muted-foreground text-center">Torsional Velocity Limits</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <TorsionLimitGraph 
                                        points={[
                                            ...(wasAnalyticalRun ? [
                                                { frequency: Ttorsion ? 1/Ttorsion : 0, velocity: vr ?? 0, label: "Analytical Torsion", color: "#ef4444", shape: "circle" as const }
                                            ] : []),
                                            ...(wasExperimentalRun ? [
                                                { frequency: Ttorsion ? 1/Ttorsion : 0, velocity: experimentalVr ?? 0, label: "Exp. Torsion", color: "#3b82f6", shape: "circle" as const }
                                            ] : [])
                                        ]} 
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === "optimization" && hasResults && (
                    <div className="animate-in fade-in duration-500">
                        <OptimizationTab />
                    </div>
                )}

                {activeTab === "spectral" && hasResults && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                { (alongPsds.length > 0 || experimentalAlongPsds.length > 0) && (
                                    <div className="flex flex-col items-center">
                                        <PSDGraph psds={alongPsds} experimentalPsds={experimentalAlongPsds} graphType="Along" showLegend={true} />
                                    </div>
                                )}
                            <div className="flex flex-col items-center">
                                <PSDGraph psds={acrossPsds} experimentalPsds={experimentalAcrossPsds} graphType="Across" showLegend={experimentalAlongPsds.length === 0} />
                            </div>
                            <div className="flex flex-col items-center">
                                <PSDGraph psds={torsionPsds} experimentalPsds={experimentalTorsionPsds} graphType="Torsion" showLegend={experimentalAlongPsds.length === 0 && acrossPsds.length === 0 && experimentalAcrossPsds.length === 0} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "history" && hasResults && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {myData.length > 0 && (
                            <Card className="bg-card border-border p-2">
                                <MGraphs graph_data={{ val: myData, Mtype: "MY" }} />
                            </Card>
                        )}
                        {mxData.length > 0 && (
                            <Card className="bg-card border-border p-2">
                                <MGraphs graph_data={{ val: mxData, Mtype: "MX" }} />
                            </Card>
                        )}
                        {mzData.length > 0 && (
                            <Card className="bg-card border-border p-2">
                                <MGraphs graph_data={{ val: mzData, Mtype: "MZ" }} />
                            </Card>
                        )}
                        {mxData.length === 0 && myData.length === 0 && mzData.length === 0 && (
                            <div className="text-center p-12 text-muted-foreground">
                                No Aerodynamic base load timehistory data available. Use experimental data to see these graphs.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "site" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                        <div className="flex flex-col space-y-4">
                            <h3 className="text-lg font-bold text-primary px-2">Building orientation</h3>
                            <RectangleWithArrow width={width || 0} height={depth || 0} />
                            <p className="px-2 text-sm text-muted-foreground italic">
                                The diagram automatically rotates to align the largest dimension (B) perpendicular to the wind direction, consistent with the analytical model.
                            </p>
                        </div>

                        <div className="flex flex-col space-y-4">
                            <h3 className="text-lg font-bold text-primary px-2">Mean wind speed profile</h3>
                            <div className="w-full h-[400px] bg-card rounded-xl border border-border shadow-sm p-4">
                                <MeanSpeedGraph 
                                    graph_data={graphData} 
                                    current_point={{
                                        height: height || 0, 
                                        speed: meanSpeed ? meanSpeed * coefficient ** 0.5 : 0
                                    }} 
                                />
                            </div>
                            <p className="px-2 text-sm text-muted-foreground italic">
                                The wind profile diagram uses the NBC 2025 dynamic wind load calculation procedure.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
