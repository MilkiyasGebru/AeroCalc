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
    calculatePeakFactor
} from "@/hooks/useCalculateBuildingResponse";

interface OptimizedResultCardProps {
    title: string;
    unit: string;
    analytical: number | null;
    experimental: number | null;
    analyticalPeakFactor?: number | null;
    experimentalPeakFactor?: number | null;
    icon: React.ReactNode;
    colorClass: string;
    isAnalyticalEnabled: boolean;
    isExperimentalEnabled: boolean;
}

function OptimizedResultCard({ title, unit, analytical, experimental, analyticalPeakFactor, experimentalPeakFactor, icon, colorClass, isAnalyticalEnabled, isExperimentalEnabled }: OptimizedResultCardProps) {
    const showAnalytical = isAnalyticalEnabled && analytical !== null;
    const showExperimental = isExperimentalEnabled && experimental !== null;

    if (!showAnalytical && !showExperimental) return null;
    
    // Use either analytical or experimental peak factor (they are usually the same in this logic)
    const peakFactor = analyticalPeakFactor || experimentalPeakFactor;

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
                                    <p className="text-[10px] text-muted-foreground font-bold">Analytical (PEAK)</p>
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
                                    <p className="text-[10px] text-muted-foreground font-bold">Experimental (PEAK)</p>
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
    const [stiffnessMultAlong, setStiffnessMultAlong] = useState(1);
    const [stiffnessMultAcross, setStiffnessMultAcross] = useState(1);
    const [stiffnessMultTorsion, setStiffnessMultTorsion] = useState(1);

    const optimizedResults = useMemo(() => {
        if (height != null && width != null && depth != null && totalFloors != null && damping != null && meanSpeed != null && Talong != null && Ttorsion != null && Tacross != null && buildingDensity != null) {
            
            const currentDensity = buildingDensity * densityMult;
            const currentDamping = damping * dampingMult;
            
            // Stiffness multiplier multiplies frequency, which means it divides the period
            const currentTalong = Talong / stiffnessMultAlong;
            const currentTacross = Tacross / stiffnessMultAcross;
            const currentTtorsion = Ttorsion / stiffnessMultTorsion;

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

            // Peak Factor Calculations based on the specified logic
            // const { calculatePeakFactor } = require("@/hooks/useCalculateBuildingResponse.ts");
            const fAlong = 1/currentTalong;
            const fAcross = 1/currentTacross;
            
            // Across and Torsion Peak Factor: max(PF(w, across_f, along_f), PF(d, along_f, across_f))
            const pfAcross1 = calculatePeakFactor(height, width, fAcross, fAlong, speed, currentDamping);
            const pfAcross2 = calculatePeakFactor(height, depth, fAlong, fAcross, speed, currentDamping);
            const pfAcrossTorsion = Math.max(pfAcross1, pfAcross2);

            // Along Peak Factor: PF(d, along_f, across_f)
            const pfAlong = calculatePeakFactor(height, depth, fAlong, fAcross, speed, currentDamping);

            return {
                analytical: {
                    alongAcc, acrossAcc, torsionVel,
                    alongFreq: 1 / currentTalong,
                    acrossFreq: 1 / currentTacross,
                    torsionFreq: 1 / currentTtorsion,
                    damping: currentDamping,
                    density: currentDensity,
                    alongPeakFactor: pfAlong,
                    acrossPeakFactor: pfAcrossTorsion,
                    torsionPeakFactor: pfAcrossTorsion
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
    }, [width, height, depth, meanSpeed, damping, totalFloors, terrain, Talong, Tacross, Ttorsion, buildingDensity, userMeanSpeed, densityMult, dampingMult, stiffnessMultAlong, stiffnessMultAcross, stiffnessMultTorsion, experimentalFrequency, experimentalAcrossPsds, experimentalTorsionPsds, experimentalAlongPsds, normalizedExperimentalFrequencies, experimentalMeanSpeed]);

    const showAnalytical = wasAnalyticalRun;
    const showExperimental = wasExperimentalRun;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="space-y-6">
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Optimization sliders</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <Label className="font-bold text-xs">Building density multiplier</Label>
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
                                    <Label className="font-bold text-xs">Damping multiplier</Label>
                                    <Badge variant="secondary">{dampingMult.toFixed(2)}x</Badge>
                                </div>
                                <input 
                                    type="range" min="0.5" max="5" step="0.1" 
                                    value={dampingMult} 
                                    onChange={(e) => setDampingMult(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>

                            <div className="space-y-4 pt-4 border-t border-border">
                                <Label className="text-sm font-bold text-muted-foreground  tracking-wider">Stiffness multipliers</Label>
                                
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <Label className="font-bold text-xs">Along-wind multiplier</Label>
                                        <Badge variant="secondary">{stiffnessMultAlong.toFixed(2)}x</Badge>
                                    </div>
                                    <input 
                                        type="range" min="0.5" max="5" step="0.1" 
                                        value={stiffnessMultAlong} 
                                        onChange={(e) => setStiffnessMultAlong(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-amber-600"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <Label className="font-bold text-xs">Across-wind multiplier</Label>
                                        <Badge variant="secondary">{stiffnessMultAcross.toFixed(2)}x</Badge>
                                    </div>
                                    <input 
                                        type="range" min="0.5" max="5" step="0.1" 
                                        value={stiffnessMultAcross} 
                                        onChange={(e) => setStiffnessMultAcross(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-orange-500"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <Label className="font-bold text-xs">Torsion multiplier</Label>
                                        <Badge variant="secondary">{stiffnessMultTorsion.toFixed(2)}x</Badge>
                                    </div>
                                    <input 
                                        type="range" min="0.5" max="5" step="0.1" 
                                        value={stiffnessMultTorsion} 
                                        onChange={(e) => setStiffnessMultTorsion(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-yellow-600"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {(wasAnalyticalRun || wasExperimentalRun) && (
                        <Card className="border-border bg-muted/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Activity className="h-4 w-4" /> Optimized parameters
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-[11px] space-y-2">
                                {wasAnalyticalRun && (
                                    <>
                                        <div className="flex justify-between border-b border-border pb-1">
                                            <span className="text-muted-foreground">Along freq:</span>
                                            <span className="font-mono font-bold">{optimizedResults?.analytical.alongFreq.toFixed(3)} Hz</span>
                                        </div>
                                        <div className="flex justify-between border-b border-border pb-1">
                                            <span className="text-muted-foreground">Across freq:</span>
                                            <span className="font-mono font-bold">{optimizedResults?.analytical.acrossFreq.toFixed(3)} Hz</span>
                                        </div>
                                        <div className="flex justify-between border-b border-border pb-1">
                                            <span className="text-muted-foreground">Torsion freq:</span>
                                            <span className="font-mono font-bold">{optimizedResults?.analytical.torsionFreq.toFixed(3)} Hz</span>
                                        </div>
                                    </>
                                )}
                                {wasExperimentalRun && !wasAnalyticalRun && (
                                     <div className="flex justify-between border-b border-border pb-1">
                                        <span className="text-muted-foreground">Exp. freq:</span>
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
                            analyticalPeakFactor={optimizedResults?.analytical.alongPeakFactor ?? null}
                            // experimentalPeakFactor={optimizedResults?.experimental.alongPeakFactor ?? null}
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
                            analyticalPeakFactor={optimizedResults?.analytical.acrossPeakFactor ?? null}
                            // experimentalPeakFactor={optimizedResults?.experimental.acrossPeakFactor ?? null}
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
                            analyticalPeakFactor={optimizedResults?.analytical.torsionPeakFactor ?? null}
                            // experimentalPeakFactor={optimizedResults?.experimental.torsionPeakFactor ?? null}
                            icon={<RotateCw className="h-4 w-4" />}
                            colorClass="text-[#CA8A04]"
                            isAnalyticalEnabled={wasAnalyticalRun}
                            isExperimentalEnabled={wasExperimentalRun}
                        />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <Card className="border-border">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold text-muted-foreground text-center">Acceleration limits</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AccelartionLimitGraph 
                                    points={[
                                        ...(showAnalytical ? [
                                            { frequency: optimizedResults?.analytical.alongFreq ?? 0, acceleration: (optimizedResults?.analytical.alongAcc && optimizedResults?.analytical.alongPeakFactor) ? optimizedResults.analytical.alongAcc * optimizedResults.analytical.alongPeakFactor : (optimizedResults?.analytical.alongAcc ?? 0), label: "Analytical along", color: "#ef4444", shape: "circle" as const },
                                            { frequency: optimizedResults?.analytical.acrossFreq ?? 0, acceleration: (optimizedResults?.analytical.acrossAcc && optimizedResults?.analytical.acrossPeakFactor) ? optimizedResults.analytical.acrossAcc * optimizedResults.analytical.acrossPeakFactor : (optimizedResults?.analytical.acrossAcc ?? 0), label: "Analytical across", color: "#ef4444", shape: "diamond" as const}
                                        ] : []),
                                        ...(showExperimental ? [
                                            { frequency: optimizedResults?.experimental.alongFreq ?? 0, acceleration: (optimizedResults?.experimental.alongAcc && optimizedResults?.experimental.alongPeakFactor) ? optimizedResults.experimental.alongAcc * optimizedResults.experimental.alongPeakFactor : (optimizedResults?.experimental.alongAcc ?? 0), label: "Exp. along", color: "#3b82f6", shape: "circle" as const },
                                            { frequency: optimizedResults?.experimental.acrossFreq ?? 0, acceleration: (optimizedResults?.experimental.acrossAcc && optimizedResults?.experimental.acrossPeakFactor) ? optimizedResults.experimental.acrossAcc * optimizedResults.experimental.acrossPeakFactor : (optimizedResults?.experimental.acrossAcc ?? 0), label: "Exp. across", color: "#3b82f6", shape: "diamond" as const }
                                        ] : [])
                                    ]} 
                                />
                            </CardContent>
                        </Card>

                        <Card className="border-border">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold text-muted-foreground text-center">Torsional velocity limits</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <TorsionLimitGraph 
                                    points={[
                                        ...(showAnalytical ? [
                                            { frequency: optimizedResults?.analytical.torsionFreq ?? 0, velocity: (optimizedResults?.analytical.torsionVel && optimizedResults?.analytical.torsionPeakFactor) ? optimizedResults.analytical.torsionVel * optimizedResults.analytical.torsionPeakFactor : (optimizedResults?.analytical.torsionVel ?? 0), label: "Analytical torsion", color: "#ef4444", shape: "circle" as const }
                                        ] : []),
                                        ...(showExperimental ? [
                                            { frequency: optimizedResults?.experimental.torsionFreq ?? 0, velocity: (optimizedResults?.experimental.torsionVel && optimizedResults?.experimental.torsionPeakFactor) ? optimizedResults.experimental.torsionVel * optimizedResults.experimental.torsionPeakFactor : (optimizedResults?.experimental.torsionVel ?? 0), label: "Exp. Torsion", color: "#3b82f6", shape: "circle" as const }
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
