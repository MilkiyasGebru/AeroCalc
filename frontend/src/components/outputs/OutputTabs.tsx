import { useState, useEffect } from "react";
import ResultsCard from "@/components/ResultsCard";
import PSDGraph from "@/components/PSDGraph";
import MGraphs from "@/components/MGraphs";
import MeanSpeedGraph from "@/components/MeanSpeedGraph";
import { RectangleWithArrow } from "@/components/RectangleWithArrow";
import { useOutputBuildingContext } from "@/contexts/useOutputBuildingContext";
import { useInputBuildingContext } from "@/contexts/useInputBuildingContext";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface IMeanSpeedData {
  height: number;
  speed: number;
}

export default function OutputTabs() {
    const [activeTab, setActiveTab] = useState("overview");
    const { 
        acrossPsds, torsionPsds, 
        experimentalAcrossPsds, experimentalTorsionPsds, experimentalAlongPsds,
        ar, vr, experimentalAr, experimentalVr
    } = useOutputBuildingContext();

    const { mxData, myData, mzData, height, meanSpeed, terrain, width, depth } = useInputBuildingContext();
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
        { id: "overview", label: "Overview" },
        { id: "spectral", label: "Spectral Analysis" },
        { id: "history", label: "Time History" },
        { id: "site", label: "Site & Geometry" },
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
                    </div>
                )}

                {activeTab === "spectral" && hasResults && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <div className="flex flex-col items-center">
                                <PSDGraph psds={acrossPsds} experimentalPsds={experimentalAcrossPsds} graphType="Across" />
                            </div>
                            <div className="flex flex-col items-center">
                                <PSDGraph psds={torsionPsds} experimentalPsds={experimentalTorsionPsds} graphType="Torsion" />
                            </div>
                            <div className="flex flex-col items-center">
                                <PSDGraph psds={[]} experimentalPsds={experimentalAlongPsds} graphType="Along" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "history" && hasResults && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {mxData.length > 0 && (
                            <Card className="bg-card border-border p-2">
                                <MGraphs graph_data={{ val: mxData, Mtype: "MX" }} />
                            </Card>
                        )}
                        {myData.length > 0 && (
                            <Card className="bg-card border-border p-2">
                                <MGraphs graph_data={{ val: myData, Mtype: "MY" }} />
                            </Card>
                        )}
                        {mzData.length > 0 && (
                            <Card className="bg-card border-border p-2">
                                <MGraphs graph_data={{ val: mzData, Mtype: "MZ" }} />
                            </Card>
                        )}
                        {mxData.length === 0 && myData.length === 0 && mzData.length === 0 && (
                            <div className="text-center p-12 text-muted-foreground">
                                No time history data available. Use experimental data to see these graphs.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "site" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                        <div className="flex flex-col space-y-4">
                            <h3 className="text-lg font-bold text-primary px-2">Building Orientation & Scale</h3>
                            <RectangleWithArrow width={width || 0} height={depth || 0} />
                            <p className="px-2 text-sm text-muted-foreground italic">
                                The diagram automatically rotates to align the largest dimension (B) perpendicular to the wind direction, consistent with the analytical model.
                            </p>
                        </div>

                        <div className="flex flex-col space-y-4">
                            <h3 className="text-lg font-bold text-primary px-2">Mean Wind Speed Profile</h3>
                            <div className="w-full h-[400px] bg-white rounded-xl border border-border/40 shadow-sm p-4">
                                <MeanSpeedGraph 
                                    graph_data={graphData} 
                                    current_point={{
                                        height: height || 0, 
                                        speed: meanSpeed ? meanSpeed * coefficient ** 0.5 : 0
                                    }} 
                                />
                            </div>
                            <p className="px-2 text-sm text-muted-foreground italic">
                                NBC 2025 Dynamic wind load calculation procedure.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
