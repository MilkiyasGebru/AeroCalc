import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import {frequencies} from "../../CONSTANTS.ts";
import {useOutputBuildingContext} from "@/contexts/useOutputBuildingContext.ts";



interface graph_point {
    frequency: number;
    torsion_psd: number;
    across_psd: number;
}
export default function PSDGraph() {
    const {torsionPsds, acrossPsds,experimentalAcrossPsds,experimentalTorsionPsds} = useOutputBuildingContext()
    const graph_data: graph_point[] = frequencies.map((frequency, index)=>{
        return {
            frequency: frequency,
            torsion_psd: torsionPsds[index],
            across_psd: acrossPsds[index],
            experimental_torsion_psd: Math.max(experimentalTorsionPsds[index],0.00000001),
            experimental_across_psd: Math.max(experimentalAcrossPsds[index],0.000001),
        }
    })

    return (

        <LineChart
            style={{ width: '90%', maxWidth: '1400px', height: '100%', maxHeight: '70vh', aspectRatio: 1.618 }}
            responsive
            data={graph_data}
            margin={{
                top: 5,
                right: 5,
                left: 0,
                bottom: 5,
            }}
        >

            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="frequency" scale="log"  type="number" domain={['auto', 'auto']} // Or ['dataMin', 'dataMax']
                   allowDataOverflow={true}
                   label={{ value: 'fB/UH', position: 'insideBottom', offset: 0 }}
            />
            <YAxis width="auto" scale="log" type="number" domain={['auto', 'auto']}
                   label={{
                       value: 'f S_M(f) / (0.5 ρ U_H^2 B H^2)^2',
                       angle: -90,
                       position: 'insideLeft',
                       style: { textAnchor: 'middle' },
                       offset: 20
                   }}
            />
            <Tooltip />
            <Legend />
            <Line type="monotone" dot={false} dataKey="across_psd" stroke="#8884d8" />
            <Line type="monotone" dot={false} dataKey="torsion_psd" stroke="#82ca9d" />
            <Line type="monotone" dot={false} dataKey="experimental_across_psd" stroke="#8724d8" />
            <Line type="monotone" dot={false} dataKey="experimental_torsion_psd" stroke="#756a9d" />


        </LineChart>
    )
}