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
}

const SuperscriptLogTick = ({ x, y, payload }: any) => {
    const value = payload.value;
    const exp = Math.floor(Math.log10(value));

    return (
        <g transform={`translate(${x},${y})`}>
            <text textAnchor="middle" fontSize={12} fill="hsl(215.4 16.3% 46.9%)">
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
                <div style={{ textAlign: "center", color: "hsl(215.4 16.3% 46.9%)" }} className="text-sm">
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
                <div style={{ textAlign: "center", color: "hsl(215.4 16.3% 46.9%)" }} className="z-50 text-sm">
                    <InlineMath math={" \\\\ fB/UH"} />
                </div>
            </foreignObject>
        </g>
    );
};

export default function PSDGraph(props : PSDGraphInterface) {
    const { psds, experimentalPsds} = props;
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
    
    const getAnalyticalColor = () => {
        if (props.graphType === "Across") return "#EA580C";
        if (props.graphType === "Along") return "#854D0E";
        return "#CA8A04";
    };

    return (
        <div className="w-full flex flex-col items-center">
            <h3 className="text-lg font-bold text-primary mb-4">{title}</h3>
            { (psds.length > 0 || experimentalPsds.length>0) && (
                <div className="w-full h-[500px] max-w-[600px] bg-white rounded-lg p-4 border border-border">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={graph_data}
                            margin={{ top: 20, right: 30, left: 40, bottom: 40 }}
                        >
                            <XAxis 
                                dataKey="frequency" 
                                scale="log"  
                                type="number" 
                                domain={[0.001, 10]}
                                allowDataOverflow={true}
                                label={<CustomXLabel />}
                                tick={<SuperscriptLogTick />}
                                stroke="hsl(215.4 16.3% 46.9%)"
                                tickMargin={10}
                                ticks={[0.01, 0.1, 1, 10]}
                            />
                            <YAxis 
                                width={100} 
                                scale="log"  
                                type="number"
                                label={<CustomYLabel  />}
                                tick={<SuperscriptLogTick />}
                                tickMargin={10}
                                stroke="hsl(215.4 16.3% 46.9%)"
                                ticks={[0.000001, 0.00001, 0.0001, 0.001, 0.01]}
                                domain={[0.000001, 0.02]}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'white', borderColor: 'hsl(214.3 31.8% 91.4%)', borderRadius: '8px' }}
                                formatter={(value, name)=> [
                                    <span className="font-mono font-bold" style={{ color: name === "Analytical" ? getAnalyticalColor() : "#0ea5e9" }}>
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
                            />
                            <Legend verticalAlign="top" height={36}/>
                            {psds.length > 0  && (
                                <Line 
                                    name="Analytical" 
                                    type="monotone" 
                                    dot={false} 
                                    dataKey="psd" 
                                    connectNulls={true} 
                                    stroke={getAnalyticalColor()} 
                                    strokeWidth={1.5} 
                                />
                            )}
                            {experimentalPsds.length > 0 && (
                                <Line 
                                    name="Experimental" 
                                    type="monotone" 
                                    dot={false} 
                                    dataKey="experimentalPsd" 
                                    connectNulls={true} 
                                    stroke="#0ea5e9" 
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
