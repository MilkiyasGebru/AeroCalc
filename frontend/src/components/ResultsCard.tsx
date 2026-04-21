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
    icon: React.ReactNode;
    colorClass: string;
}

function ResponseCard({ title, unit, analytical, experimental, icon, colorClass }: ResponseCardProps) {
    if (analytical === null && experimental === null) return null;

    return (
        <Card className="overflow-hidden border-border bg-card hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
                <CardTitle className="text-sm font-bold tracking-tight">{title}</CardTitle>
                <div className={cn(colorClass)}>{icon}</div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground font-bold">Analytical</p>
                        <div className="flex items-baseline gap-1">
                            <span className={cn("text-2xl font-bold", colorClass)}>{analytical?.toFixed(2) ?? "--"}</span>
                            <span className="text-[10px] text-muted-foreground">{unit}</span>
                        </div>
                    </div>
                    <div className="space-y-1 border-l border-border pl-4">
                        <p className="text-[10px] text-muted-foreground font-bold">Experimental</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-sky-600">{experimental?.toFixed(2) ?? "--"}</span>
                            <span className="text-[10px] text-muted-foreground">{unit}</span>
                        </div>
                    </div>
                </div>
                
                {analytical !== null && experimental !== null && (
                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] font-mono">
                            Diff: {Math.abs(((analytical - experimental) / analytical) * 100).toFixed(1)}%
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
        accelartionYDirection, experimentalAccelartionYDirection 
    } = useOutputBuildingContext();

    return (
        <div className="space-y-6">
            {/* <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-bold tracking-tight">Dynamic response summary</h2>
            </div> */}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ResponseCard 
                    title="Along-wind acceleration (rms)" 
                    unit="milli-g" 
                    analytical={accelartionYDirection} 
                    experimental={experimentalAccelartionYDirection} 
                    icon={<ArrowRight className="h-4 w-4" />}
                    colorClass="text-[#854D0E]"
                />
                <ResponseCard 
                    title="Across-wind acceleration (rms)" 
                    unit="milli-g" 
                    analytical={ar} 
                    experimental={experimentalAr} 
                    icon={<Wind className="h-4 w-4" />}
                    colorClass="text-[#EA580C]"
                />
                <ResponseCard 
                    title="Torsion velocity (rms)" 
                    unit="milli-rad/s" 
                    analytical={vr} 
                    experimental={experimentalVr} 
                    icon={<RotateCw className="h-4 w-4" />}
                    colorClass="text-[#CA8A04]"
                />
            </div>
        </div>
    );
}
