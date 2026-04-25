import { useState, useMemo } from "react";
import { useInputBuildingContext } from "@/contexts/useInputBuildingContext";
import { useOutputBuildingContext } from "@/contexts/useOutputBuildingContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Wind, RotateCw, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import AccelartionLimitGraph from "@/components/AccelartionLimitGraph";
import TorsionLimitGraph from "@/components/TorsionLimitGraph";
import { frequencies } from "../../../CONSTANTS";
import {
    CalculateAcrossPsdResponse, CalculateFD,
    CalculateTorsionPsdResponse, CalculateAlong,
} from "@/hooks/useCalculateBuildingResponse";

interface OptimizedResultCardProps {
    title: string;
    unit: string;
    analytical: number | null;
    experimental: number | null;
    icon: React.ReactNode;
    colorClass: string;
    isAnalyticalEnabled: boolean;
    isExperimentalEnabled: boolean;
}

function OptimizedResultCard({ title, unit, analytical, experimental, icon, colorClass, isAnalyticalEnabled, isExperimentalEnabled }: OptimizedResultCardProps) {
    const showAnalytical = isAnalyticalEnabled && analytical !== null;
    const showExperimental = isExperimentalEnabled && experimental !== null;

    if (!showAnalytical && !showExperimental) return null;
    console.log("Optimization Tab", analytical)
    return (
        <Card className="overflow-hidden border-border bg-card hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
                <CardTitle className="text-sm font-bold tracking-tight">{title}</CardTitle>
                <div className={cn(colorClass)}>{icon}</div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className={cn("grid gap-4", showAnalytical && showExperimental ? "grid-cols-2" : "grid-cols-1")}>
                    {showAnalytical && (
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground font-bold">Analytical</p>
                            <div className="flex items-baseline gap-1">
                                <span className={cn("text-2xl font-bold", colorClass)}>{analytical?.toFixed(2) ?? "--"}</span>
                                <span className="text-[10px] text-muted-foreground">{unit}</span>
                            </div>
                        </div>
                    )}
                    {showExperimental && (
                        <div className={cn("space-y-1", showAnalytical && "border-l border-border pl-4")}>
                            <p className="text-[10px] text-muted-foreground font-bold">Experimental</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-sky-600">{experimental?.toFixed(8) ?? "--"}</span>
                                <span className="text-[10px] text-muted-foreground">{unit}</span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default function OptimizationTab() {
    const {
        width, height, depth, meanSpeed, damping, totalFloors, terrain, Talong, Ttorsion, Tacross,
        buildingDensity, userMeanSpeed, experimentalFrequency, experimentalMeanSpeed,normalizedExperimentalFrequencies
    } = useInputBuildingContext();

    const { 
        experimentalAcrossPsds, experimentalTorsionPsds, experimentalAlongPsds,
         wasAnalyticalRun, wasExperimentalRun
    } = useOutputBuildingContext();

    const [densityMult, setDensityMult] = useState(1);
    const [dampingMult, setDampingMult] = useState(1);
    const [stiffnessMult, setStiffnessMult] = useState(1);

    const optimizedResults = useMemo(() => {
        if (height != null && width != null && depth != null && totalFloors != null && damping != null && meanSpeed != null && Talong != null && Ttorsion != null && Tacross != null && buildingDensity != null) {
            
            const currentDensity = buildingDensity * densityMult;
            const currentDamping = damping * dampingMult;
            
            // Stiffness multiplier multiplies frequency, which means it divides the period
            const currentTalong = Talong / stiffnessMult;
            const currentTacross = Tacross / stiffnessMult;
            const currentTtorsion = Ttorsion / stiffnessMult;

            const c = (terrain == "open") ? (height / 10) ** 0.28 : 0.5 * ((height / 12.7) ** 0.5);
            let speed: number = (userMeanSpeed != null && Number.isFinite(userMeanSpeed)) ? userMeanSpeed : meanSpeed * c ** 0.5;
            
            const isDesktop = !!(window as any).pywebview;
            const expCalcSpeed = isDesktop ? speed : (userMeanSpeed != null && Number.isFinite(userMeanSpeed)) ? userMeanSpeed : meanSpeed;

            // Reconstruct frequencies for experimental
            const pwelch_frequencies = (normalizedExperimentalFrequencies && normalizedExperimentalFrequencies.length > 0 && experimentalMeanSpeed && width) 
                ? normalizedExperimentalFrequencies.map(fn => fn * experimentalMeanSpeed / width)
                : frequencies;

            let across_psds: number[] = CalculateAcrossPsdResponse(Math.max(width, depth), height, Math.min(width, depth), frequencies);
            let torsion_psds: number[] = CalculateTorsionPsdResponse(Math.max(width, depth), height, Math.min(width, depth), speed, frequencies);
            
            // Analytical
            const alongAcc = CalculateAlong(Math.max(width, depth), height, Math.min(width, depth), speed, currentTalong, currentDamping, frequencies, currentDensity);
            const [torsionVel, _] = CalculateFD(Math.max(width, depth), height, Math.min(width, depth), speed, currentTtorsion, totalFloors, currentDamping, frequencies, across_psds, torsion_psds, currentDensity);
            const [__, acrossAcc] = CalculateFD(Math.max(width, depth), height, Math.min(width, depth), speed, currentTacross, totalFloors, currentDamping, frequencies, across_psds, torsion_psds, currentDensity);

            // Experimental
            let expAlongAcc = null;
            let expAcrossAcc = null;
            let expTorsionVel = null;

            if (experimentalAcrossPsds.length > 0 && experimentalTorsionPsds.length > 0) {
                const [exVT, __] = CalculateFD(Math.max(width, depth), height, Math.min(width, depth), expCalcSpeed, currentTtorsion, totalFloors, currentDamping, pwelch_frequencies, experimentalAcrossPsds, experimentalTorsionPsds, currentDensity);
                const [___, exAR_across] = CalculateFD(Math.max(width, depth), height, Math.min(width, depth), expCalcSpeed, currentTacross, totalFloors, currentDamping, pwelch_frequencies, experimentalAcrossPsds, experimentalTorsionPsds, currentDensity);
                
                expAcrossAcc = exAR_across;
                expTorsionVel = exVT;

                if (experimentalAlongPsds.length > 0) {
                    const [____, exAL] = CalculateFD(Math.max(width, depth), height, Math.min(width, depth), expCalcSpeed, currentTalong, totalFloors, currentDamping, pwelch_frequencies, experimentalAlongPsds, experimentalTorsionPsds, currentDensity);
                    expAlongAcc = exAL;
                }
            }
            console.log("Experiment Values",expAlongAcc,expAcrossAcc,expTorsionVel)

            return {
                analytical: {
                    alongAcc, acrossAcc, torsionVel,
                    alongFreq: 1 / currentTalong,
                    acrossFreq: 1 / currentTacross,
                    torsionFreq: 1 / currentTtorsion,
                    damping: currentDamping,
                    density: currentDensity
                },
                experimental: {
                    alongAcc: expAlongAcc,
                    acrossAcc: expAcrossAcc,
                    torsionVel: expTorsionVel,
                    alongFreq: 1 / currentTalong,
                    acrossFreq: 1 / currentTacross,
                    torsionFreq: 1 / currentTtorsion
                }
            };
        }
        return null;
    }, [width, height, depth, meanSpeed, damping, totalFloors, terrain, Talong, Tacross, Ttorsion, buildingDensity, userMeanSpeed, densityMult, dampingMult, stiffnessMult, experimentalFrequency, experimentalAcrossPsds, experimentalTorsionPsds, experimentalAlongPsds, normalizedExperimentalFrequencies, experimentalMeanSpeed]);

    const showAnalytical = wasAnalyticalRun;
    const showExperimental = wasExperimentalRun;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="space-y-6">
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Optimization Sliders</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <Label className="font-bold text-xs">Building Density Multiplier</Label>
                                    <Badge variant="secondary">{densityMult.toFixed(2)}x</Badge>
                                </div>
                                <input 
                                    type="range" min="0.5" max="5" step="0.1" 
                                    value={densityMult} 
                                    onChange={(e) => setDensityMult(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <Label className="font-bold text-xs">Damping Multiplier</Label>
                                    <Badge variant="secondary">{dampingMult.toFixed(2)}x</Badge>
                                </div>
                                <input 
                                    type="range" min="0.5" max="5" step="0.1" 
                                    value={dampingMult} 
                                    onChange={(e) => setDampingMult(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <Label className="font-bold text-xs">Stiffness Multiplier</Label>
                                    <Badge variant="secondary">{stiffnessMult.toFixed(2)}x</Badge>
                                </div>
                                <input 
                                    type="range" min="0.5" max="5" step="0.1" 
                                    value={stiffnessMult} 
                                    onChange={(e) => setStiffnessMult(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {(wasAnalyticalRun || wasExperimentalRun) && (
                        <Card className="border-border bg-muted/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Activity className="h-4 w-4" /> Optimized Parameters
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-[11px] space-y-2">
                                {wasAnalyticalRun && (
                                    <>
                                        <div className="flex justify-between border-b border-border pb-1">
                                            <span className="text-muted-foreground">Along Freq:</span>
                                            <span className="font-mono font-bold">{optimizedResults?.analytical.alongFreq.toFixed(3)} Hz</span>
                                        </div>
                                        <div className="flex justify-between border-b border-border pb-1">
                                            <span className="text-muted-foreground">Across Freq:</span>
                                            <span className="font-mono font-bold">{optimizedResults?.analytical.acrossFreq.toFixed(3)} Hz</span>
                                        </div>
                                        <div className="flex justify-between border-b border-border pb-1">
                                            <span className="text-muted-foreground">Torsion Freq:</span>
                                            <span className="font-mono font-bold">{optimizedResults?.analytical.torsionFreq.toFixed(3)} Hz</span>
                                        </div>
                                    </>
                                )}
                                {wasExperimentalRun && !wasAnalyticalRun && (
                                     <div className="flex justify-between border-b border-border pb-1">
                                        <span className="text-muted-foreground">Exp. Freq:</span>
                                        <span className="font-mono font-bold">{optimizedResults?.experimental.alongFreq.toFixed(3)} Hz</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-b border-border pb-1">
                                    <span className="text-muted-foreground">Damping:</span>
                                    <span className="font-mono font-bold">{(optimizedResults?.analytical.damping ? optimizedResults.analytical.damping * 100 : 0).toFixed(2)} %</span>
                                </div>
                                <div className="flex justify-between border-b border-border pb-1">
                                    <span className="text-muted-foreground">Density:</span>
                                    <span className="font-mono font-bold">{optimizedResults?.analytical.density.toFixed(1)} kg/m³</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <OptimizedResultCard 
                            title="Along-wind acceleration (RMS)" 
                            unit="milli-g" 
                            analytical={optimizedResults?.analytical.alongAcc ?? null} 
                            experimental={optimizedResults?.experimental.alongAcc ?? null}
                            icon={<ArrowRight className="h-4 w-4" />}
                            colorClass="text-[#854D0E]"
                            isAnalyticalEnabled={wasAnalyticalRun}
                            isExperimentalEnabled={wasExperimentalRun}
                        />
                        <OptimizedResultCard 
                            title="Across-wind acceleration (RMS)" 
                            unit="milli-g" 
                            analytical={optimizedResults?.analytical.acrossAcc ?? null} 
                            experimental={optimizedResults?.experimental.acrossAcc ?? null}
                            icon={<Wind className="h-4 w-4" />}
                            colorClass="text-[#EA580C]"
                            isAnalyticalEnabled={wasAnalyticalRun}
                            isExperimentalEnabled={wasExperimentalRun}
                        />
                        <OptimizedResultCard 
                            title="Torsion velocity (RMS)" 
                            unit="milli-rad/s" 
                            analytical={optimizedResults?.analytical.torsionVel ?? null} 
                            experimental={optimizedResults?.experimental.torsionVel ?? null}
                            icon={<RotateCw className="h-4 w-4" />}
                            colorClass="text-[#CA8A04]"
                            isAnalyticalEnabled={wasAnalyticalRun}
                            isExperimentalEnabled={wasExperimentalRun}
                        />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <Card className="border-border">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold text-muted-foreground text-center">Acceleration Limits</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AccelartionLimitGraph 
                                    points={[
                                        ...(showAnalytical ? [
                                            { frequency: optimizedResults?.analytical.alongFreq ?? 0, acceleration: optimizedResults?.analytical.alongAcc ?? 0, label: "Analytical Along" },
                                            { frequency: optimizedResults?.analytical.acrossFreq ?? 0, acceleration: optimizedResults?.analytical.acrossAcc ?? 0, label: "Analytical Across" }
                                        ] : []),
                                        ...(showExperimental ? [
                                            { frequency: optimizedResults?.experimental.alongFreq ?? 0, acceleration: optimizedResults?.experimental.alongAcc ?? 0, label: "Exp. Along" },
                                            { frequency: optimizedResults?.experimental.acrossFreq ?? 0, acceleration: optimizedResults?.experimental.acrossAcc ?? 0, label: "Exp. Across" }
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
                                        ...(showAnalytical ? [
                                            { frequency: optimizedResults?.analytical.torsionFreq ?? 0, velocity: optimizedResults?.analytical.torsionVel ?? 0, label: "Analytical Torsion" }
                                        ] : []),
                                        ...(showExperimental ? [
                                            { frequency: optimizedResults?.experimental.torsionFreq ?? 0, velocity: optimizedResults?.experimental.torsionVel ?? 0, label: "Exp. Torsion" }
                                        ] : [])
                                    ]} 
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
