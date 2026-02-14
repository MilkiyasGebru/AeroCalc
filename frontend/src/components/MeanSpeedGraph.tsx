import { Line, LineChart, ReferenceDot, Tooltip, XAxis, YAxis} from "recharts";

interface IMeanSpeedGraph {
    speed: number;
    height: number;
}




export default function MeanSpeedGraph({graph_data, current_point}: {graph_data: IMeanSpeedGraph[], current_point: IMeanSpeedGraph }) {

    return (
        <div className="col-span-3">
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

                <XAxis dataKey="speed"   type="number" stroke="#000000" domain={['auto', 'auto']} // Or ['dataMin', 'dataMax']
                       allowDataOverflow={true}
                       label={{ value: 'Wind Speed (m/s)', position: 'insideBottom', offset: -3,style: { fill: '#000000', fontWeight: "normal", fontSize:14 } }}
                />
                <YAxis width="auto"  type="number" domain={['auto', 'auto']} stroke="#000000"
                       label={{
                           value: 'Height (m)',
                           angle: -90,
                           position: 'insideLeft',
                           style: { textAnchor: 'middle',fill: '#000000', fontWeight: "normal", fontSize:14 },
                           offset: 10
                       }}
                />
                <Tooltip
                    formatter={(value)=> [
                        <span className="font-mono font-bold text-slate-500">
                            {typeof value === 'number' ? value.toFixed(2) : value}
                        </span>,
                        "Height"

                    ]}
                    labelFormatter={(label) => (
                        <span className="font-mono font-bold text-slate-500">
                            Speed: {label.toFixed(2)}
                        </span>
                        )}
                            />
                {/*<Legend />*/}
                <Line type="basis" dataKey="height" dot={false} stroke="#8884d8"/>
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