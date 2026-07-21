import { useOutputBuildingContext } from "@/contexts/useOutputBuildingContext.ts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Wind, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResponseCardProps {
    title: string;
    unit: string;
    analytical: number | null;
    experimental: number | null;
    peakFactor: number | null;
    icon: React.ReactNode;
    colorClass: string;
    isAnalyticalEnabled: boolean;
    isExperimentalEnabled: boolean;
}

function ResponseCard({ title, unit, analytical, experimental, peakFactor, icon, colorClass, isAnalyticalEnabled, isExperimentalEnabled }: ResponseCardProps) {
    const showAnalytical = isAnalyticalEnabled && analytical !== null;
    const showExperimental = isExperimentalEnabled && experimental !== null;

    if (!showAnalytical && !showExperimental) return null;

    return (
        <Card className="overflow-hidden border-border bg-card hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
                <CardTitle className="text-sm font-bold tracking-tight">{title}</CardTitle>
                <div className={cn(colorClass)}>{icon}</div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className={cn("grid gap-4", showAnalytical && showExperimental ? "grid-cols-2" : "grid-cols-1")}>
                    {showAnalytical && (
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] text-muted-foreground font-bold">Analytical (RMS)</p>
                                <div className="flex items-baseline gap-1">
                                    <span className={cn("text-2xl font-bold", colorClass)}>{analytical?.toFixed(2) ?? "--"}</span>
                                    <span className="text-[10px] text-muted-foreground">{unit}</span>
                                </div>
                            </div>
                            
                            {peakFactor && (
                                <div className="pt-2 border-t border-dashed border-border/50">
                                    <p className="text-[10px] text-muted-foreground font-bold">Analytical (Peak)</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className={cn("text-2xl font-bold", colorClass)}>{(analytical * peakFactor).toFixed(2)}</span>
                                        <span className="text-[10px] text-muted-foreground">{unit}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {showExperimental && (
                        <div className={cn("space-y-3", showAnalytical && "border-l border-border pl-4")}>
                            <div>
                                <p className="text-[10px] text-muted-foreground font-bold">Experimental (RMS)</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-sky-600">{experimental?.toFixed(2) ?? "--"}</span>
                                    <span className="text-[10px] text-muted-foreground">{unit}</span>
                                </div>
                            </div>

                            {peakFactor && (
                                <div className="pt-2 border-t border-dashed border-border/50">
                                    <p className="text-[10px] text-muted-foreground font-bold">Experimental (Peak)</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-sky-600">{(experimental * peakFactor).toFixed(2)}</span>
                                        <span className="text-[10px] text-muted-foreground">{unit}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {peakFactor && (
                    <div className="pt-2 border-t border-border flex justify-center">
                        <Badge variant="secondary" className="text-[10px] font-bold px-4 py-1">
                            Peak Factor: {peakFactor.toFixed(3)}
                        </Badge>
                    </div>
                )}
                
                {showAnalytical && showExperimental && (
                    <div className="pt-3 border-t border-border flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] font-mono">
                            Diff (RMS): {Math.abs(((analytical - experimental) / analytical) * 100).toFixed(1)}%
                        </Badge>
                        <div className="flex gap-1">
                            <div className={cn("h-1.5 w-1.5 rounded-full", colorClass.replace('text-', 'bg-'))}></div>
                            <div className="h-1.5 w-1.5 rounded-full bg-sky-600"></div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function ResultsCard() {
    const { 
        ar, vr, experimentalAr, experimentalVr, 
        accelartionYDirection, experimentalAccelartionYDirection,
        wasAnalyticalRun, wasExperimentalRun,
        alongPeakFactor, acrossPeakFactor, torsionPeakFactor
    } = useOutputBuildingContext();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ResponseCard 
                    title="Along-wind acceleration (rms)" 
                    unit="milli-g" 
                    analytical={accelartionYDirection} 
                    experimental={experimentalAccelartionYDirection} 
                    peakFactor={alongPeakFactor}
                    icon={<ArrowRight className="h-4 w-4" />}
                    colorClass="text-[#854D0E]"
                    isAnalyticalEnabled={wasAnalyticalRun}
                    isExperimentalEnabled={wasExperimentalRun}
                />
                <ResponseCard 
                    title="Across-wind acceleration (rms)" 
                    unit="milli-g" 
                    analytical={ar} 
                    experimental={experimentalAr} 
                    peakFactor={acrossPeakFactor}
                    icon={<Wind className="h-4 w-4" />}
                    colorClass="text-[#EA580C]"
                    isAnalyticalEnabled={wasAnalyticalRun}
                    isExperimentalEnabled={wasExperimentalRun}
                />
                <ResponseCard 
                    title="Torsion velocity (rms)" 
                    unit="milli-rad/s" 
                    analytical={vr} 
                    experimental={experimentalVr} 
                    peakFactor={torsionPeakFactor}
                    icon={<RotateCw className="h-4 w-4" />}
                    colorClass="text-[#CA8A04]"
                    isAnalyticalEnabled={wasAnalyticalRun}
                    isExperimentalEnabled={wasExperimentalRun}
                />
            </div>
        </div>
    );
}
