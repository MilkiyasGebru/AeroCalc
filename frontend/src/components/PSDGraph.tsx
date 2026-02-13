import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import {frequencies} from "../../CONSTANTS.ts";
import {useInputBuildingContext} from "@/contexts/useInputBuildingContext.ts";



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
            <text textAnchor="middle" fontSize={12}>
                10
                <tspan dy="-6" fontSize="10">{exp}</tspan>
            </text>
        </g>
    );
};

export default function PSDGraph(props : PSDGraphInterface) {
    const { psds, experimentalPsds} = props;
    const {normalizedExperimentalFrequencies} = useInputBuildingContext()
    const allFrequencies = Array.from(new Set([...frequencies, ...normalizedExperimentalFrequencies])).sort((a,b)=>a-b)

    const graph_data: graph_point[] = []
    for (let index = 1; index < allFrequencies.length; index++) {
        if (allFrequencies[index] <= 0) continue; // CRITICAL: Log scale breaks at 0
        const freqIndex: number = frequencies.indexOf(allFrequencies[index]);
        const expFreqIndex: number = normalizedExperimentalFrequencies.indexOf(allFrequencies[index]);
        graph_data.push({
            frequency: frequencies[index],
            psd:  freqIndex !== -1? psds[freqIndex]: null,
            experimentalPsd: expFreqIndex !== -1? experimentalPsds[expFreqIndex]: null,
        })
    }
    const title : string = props.graphType === "Across"? "Across-wind base moment spectrum" : props.graphType === "Along"?  "Along-wind base moment spectrum" :  "Torsion base moment spectrum"
    return (
        <>
        { (psds.length > 0 || experimentalPsds.length>0) && <LineChart
            style={{ width: '90%', maxWidth: '1400px', height: '100%', maxHeight: '270px', minWidth:'350px', aspectRatio: 1 }}
            responsive
            data={graph_data}
            margin={{
                top: 5,
                right: 5,
                left: 0,
                bottom: 5,
            }}
        >

            {/*<CartesianGrid strokeDasharray="3 3" />*/}

            <XAxis
                orientation="top"
                height={40}
                xAxisId="title"
                label={{ value: title, position: 'center', dy: -10,style: { fill: '#000000', fontWeight: "normal", fontSize:17 }, }}
                axisLine={false}
                tick={false}
            />

            <XAxis dataKey="frequency" scale="log"  type="number" domain={['auto', 'auto']} // Or ['dataMin', 'dataMax']
                   allowDataOverflow={true}
                   label={{ value: 'fB/UH', position: 'insideBottom', offset: -2 }}
                   // tickFormatter={(value:number)=> {
                   //     const exp: number = Math.floor(Math.log10(value))
                   //     return <text>10 <tspan > {exp}</tspan> <text/>
                   // }}
                   // tickFormatter={<CustomLogTick />}
                   // tickFormatter={(value:number) => `10^${Math.log10(value)}`}
                   tick={<SuperscriptLogTick />}
                   stroke="#000000"
                   tickMargin={10}
                   // domain={[0.0001, 10]}
                   ticks={[0.0001, 0.001, 0.01, 0.1, 1, 10]}
            />
            <YAxis width="auto" scale="log"  type="number"
                   label={{
                       value: 'f S_M(f) / (0.5 ρ U_H^2 B H^2)^2',
                       angle: -90,
                       position: 'insideLeft',
                       style: { textAnchor: 'middle' },
                       offset: 8
                   }}
                   // tickFormatter={(value:number)=> {
                   //     return value.toExponential(2)
                   // }}
                   tick={<SuperscriptLogTick />}
                   tickMargin={10}
                   stroke="#000000"
                   ticks={[0.000001, 0.00001, 0.0001, 0.001, 0.01]}
                   domain={[0.000001, 0.02]}
            />
            <Tooltip
                formatter={(value, name)=> [
                    <span className="font-mono font-bold text-slate-500">
                            {typeof value === 'number' ? value.toExponential(2) : value}
                        </span>,
                    name == `${props.graphType} psd`? `${props.graphType} PSDs`:`Experimental ${props.graphType} PSDs `

                ]}
                labelFormatter={(label) => (
                    <span className="font-mono font-bold text-slate-500">
                            Frequency: {label.toExponential(2)}
                        </span>
                )}
            />
            <Legend />
            <Line name="Analytical" type="basis" dot={false} dataKey="psd" connectNulls={true} stroke={props.graphType !== "Across"?"#fff222":"#af7875"} />
            <Line name="Experimental" type="basis" dot={false} dataKey="experimentalPsd" connectNulls={true} stroke={props.graphType !== "Across"? "#aaa23d":"#ff4d4f"}  />
            {/*<Line type="monotone" dot={false} dataKey="experimental_across_psd" stroke="#ff4d4f" />*/}
            {/*<Line type="monotone" dot={false} dataKey="experimental_torsion_psd" stroke="#ffd666" />*/}


        </LineChart>}
        </>
    )
}