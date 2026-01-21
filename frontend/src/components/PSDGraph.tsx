import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface PSDGraphProps {
    frequencies: number[];
    torsion_psds: number[];
    across_psds: number[];
}

interface graph_point {
    frequency: number;
    torsion_psd: number;
    across_psd: number;
}
export default function PSDGraph(props: PSDGraphProps) {

    const graph_data: graph_point[] = props.frequencies.map((frequency, index)=>{
        return {
            frequency: frequency,
            torsion_psd: props.torsion_psds[index],
            across_psd: props.across_psds[index],
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
            <YAxis width="auto" scale="log" type="number" domain={[0.00001, 1]}
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
            <Line type="monotone" dataKey="across_psd" stroke="#8884d8" />
            <Line type="monotone" dataKey="torsion_psd" stroke="#82ca9d" />

        </LineChart>
    )
}