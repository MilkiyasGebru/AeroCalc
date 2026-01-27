import {CartesianGrid, Legend, Line, LineChart, ReferenceDot, Tooltip, XAxis, YAxis} from "recharts";

interface IMeanSpeedGraph {
    speed: number;
    height: number;
}




export default function MeanSpeedGraph({graph_data, current_point}: {graph_data: IMeanSpeedGraph[], current_point: IMeanSpeedGraph }) {

    return (
        <div>
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
                <XAxis dataKey="speed"   type="number" domain={['auto', 'auto']} // Or ['dataMin', 'dataMax']
                       allowDataOverflow={true}
                       label={{ value: 'Height', position: 'insideBottom', offset: 0 }}
                />
                <YAxis width="auto"  type="number" domain={['auto', 'auto']}
                       label={{
                           value: 'Mean Speed',
                           angle: -90,
                           position: 'insideLeft',
                           style: { textAnchor: 'middle' },
                           offset: 20
                       }}
                />
                <Tooltip />
                <Legend />
                <Line type="basis" dataKey="height" dot={false}  stroke="#8884d8" />
                <ReferenceDot
                    x={current_point.speed}
                    y={current_point.height}
                    r={2}
                    fill="#8884d8"
                    stroke="red"
                    strokeWidth={4}
                />

            </LineChart>
        </div>
    )

}