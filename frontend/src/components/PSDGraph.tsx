import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {frequencies} from "../../CONSTANTS.ts";
import {useInputBuildingContext} from "@/contexts/useInputBuildingContext.ts";
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

interface graph_point {
    frequency: number;
    psd: number | null;
    experimentalPsd: number | null;
}

interface PSDGraphInterface {
    psds: number[];
    experimentalPsds: number[];
    graphType: string;
    showLegend: boolean;
}

const SuperscriptLogTick = ({ x, y, payload }: any) => {
    const value = payload.value;
    const exp = Math.floor(Math.log10(value));

    return (
        <g transform={`translate(${x},${y})`}>
            <text textAnchor="middle" fontSize={12} fill="var(--muted-foreground)">
                10
                <tspan dy="-6" fontSize="10">{exp}</tspan>
            </text>
        </g>
    );
};

interface CustomYLabelProps {
    viewBox?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

const CustomYLabel = (props: CustomYLabelProps) => {
    const { viewBox } = props;
    const x = viewBox?.x || 0;
    const y = viewBox?.y || 0;
    const height = viewBox?.height || 0;
    const cx = x - 60;
    const cy = y + height / 2;

    return (
        <g transform={`translate(${cx},${cy}) rotate(-90)`}>
            <foreignObject width={200} height={20} x={-100} y={90}>
                <div style={{ textAlign: "center", color: "var(--muted-foreground)" }} className="text-sm">
                    <InlineMath math={"f S_M(f) / (0.5\\rho  U_H^2 B H^2)^2 "} />
                </div>
            </foreignObject>
        </g>
    );
};

const CustomXLabel = (props: CustomYLabelProps) => {
    const { viewBox } = props;
    const x = viewBox?.x || 0;
    const y = viewBox?.y || 0;
    const height = viewBox?.height || 0;
    const cx = x - 60;
    const cy = y + height / 2;

    return (
        <g transform={`translate(${cx},${cy}) `}>
            <foreignObject width={200} height={20} x={100} y={0}>
                <div style={{ textAlign: "center", color: "var(--muted-foreground)" }} className="z-50 text-sm">
                    <InlineMath math={" \\\\ fB/UH"} />
                </div>
            </foreignObject>
        </g>
    );
};

export default function PSDGraph(props : PSDGraphInterface) {
    const { psds, experimentalPsds, showLegend = true} = props;
    const {normalizedExperimentalFrequencies} = useInputBuildingContext()
    const allFrequencies = Array.from(new Set([...frequencies, ...normalizedExperimentalFrequencies])).sort((a,b)=>a-b)

    const graph_data: graph_point[] = []
    for (let index = 0; index < allFrequencies.length; index++) {
        if (allFrequencies[index] <= 0) continue; 
        const freqIndex: number = frequencies.indexOf(allFrequencies[index]);
        const expFreqIndex: number = normalizedExperimentalFrequencies.indexOf(allFrequencies[index]);
        graph_data.push({
            frequency: allFrequencies[index],
            psd:  freqIndex !== -1? psds[freqIndex]: null,
            experimentalPsd: expFreqIndex !== -1? experimentalPsds[expFreqIndex]: null,
        })
    }
    const title : string = props.graphType === "Across"? "Across-wind base moment spectrum" : props.graphType === "Along"?  "Along-wind base moment spectrum" :  "Torsion base moment spectrum"

    // Dynamically calculate Y-axis range
    const allValues = [...psds, ...experimentalPsds].filter(v => v > 0);
    const minVal = allValues.length > 0 ? Math.min(...allValues) : 1e-6;
    const maxVal = allValues.length > 0 ? Math.max(...allValues) : 1e-2;
    
    const minExp = Math.floor(Math.log10(minVal));
    const maxExp = Math.ceil(Math.log10(maxVal));
    
    const yTicks = [];
    for (let e = minExp; e <= maxExp; e++) {
        yTicks.push(Math.pow(10, e));
    }

    const ANALYTICAL_COLOR = "#EA580C";
    const EXPERIMENTAL_COLOR = "#0ea5e9";

    return (
        <div className="w-full flex flex-col items-center">
            <h3 className="text-sm font-bold text-muted-foreground mb-2">{title}</h3>
            { (psds.length > 0 || experimentalPsds.length>0) && (
                <div className="w-full aspect-square max-w-[450px] bg-card rounded-lg p-2 border border-border">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={graph_data}
                            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                        >
                            <XAxis 
                                dataKey="frequency" 
                                scale="log"  
                                type="number" 
                                domain={[0.001, 10]}
                                allowDataOverflow={true}
                                label={<CustomXLabel />}
                                tick={<SuperscriptLogTick />}
                                stroke="var(--muted-foreground)"
                                tickMargin={10}
                                ticks={[0.01, 0.1, 1, 10]}
                            />
                            <YAxis 
                                width={80} 
                                scale="log"  
                                type="number"
                                label={<CustomYLabel  />}
                                tick={<SuperscriptLogTick />}
                                tickMargin={10}
                                stroke="var(--muted-foreground)"
                                ticks={yTicks}
                                domain={[Math.pow(10, minExp), Math.pow(10, maxExp)]}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                                formatter={(value, name)=> [
                                    <span className="font-mono font-bold" style={{ color: name === "Analytical" ? ANALYTICAL_COLOR : EXPERIMENTAL_COLOR }}>
                                            {typeof value === 'number' ? value.toExponential(2) : value}
                                        </span>,
                                    name === "Analytical"? `${props.graphType} PSD (Analytical)`
                                        : `Experimental ${props.graphType} PSD`
                                ]}
                                labelFormatter={(label) => (
                                    <span className="font-mono font-bold text-muted-foreground">
                                            Frequency: {Number(label).toExponential(2)}
                                        </span>
                                )}
                            />                            {showLegend && <Legend verticalAlign="top" height={36} iconType="plainline" />}
                            {/* {psds.length > 0  && ( */}
                                <Line 
                                    name="Analytical" 
                                    type="monotone" 
                                    dot={false} 
                                    dataKey="psd" 
                                    connectNulls={true} 
                                    stroke={ANALYTICAL_COLOR} 
                                    strokeWidth={1.5} 
                                    legendType="line"
                                />
                            {/* )} */}
                            {experimentalPsds.length > 0 && (
                                <Line 
                                    name="Experimental" 
                                    type="monotone" 
                                    dot={false} 
                                    dataKey="experimentalPsd" 
                                    connectNulls={true} 
                                    stroke={EXPERIMENTAL_COLOR} 
                                    strokeWidth={1.5} 
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
