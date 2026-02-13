import { Line, LineChart, Tooltip, XAxis, YAxis} from "recharts";

interface IGraph {
    val: number[];
    Mtype: string
}

export default function MGraphs({graph_data}:{graph_data: IGraph}) {
    const samplingRate = Math.ceil(graph_data.val.length / 1000);
    const sampledData = graph_data.val.filter((_, index) => index % samplingRate === 0).map(val => ({"val":val}));
    const title : string= graph_data.Mtype === "MX"? "Across-wind base moment time history": graph_data.Mtype === "MY"? "Along-wind base moment time history":" Base torsion moment time history"
    const y_axis_title : string = graph_data.Mtype === "MX"? "Macross-wind(KNm)": graph_data.Mtype === "MY"? "Malong-wind(KNm)":" Mtorsion(KNm)"
    return (
        <div className="bg-white rounded-md border-transparent w-full mx-auto p-3">
            <LineChart
                style={{ width: '100%', height: '100%', maxHeight: '30vh', aspectRatio: 1.618 }}
                responsive
                data={sampledData}
                margin={{
                    top: 5,
                    right: 5,
                    left: 0,
                    bottom: 5,
                }}
            >

                {/*<CartesianGrid strokeDasharray="3 3" />*/}
                <XAxis
                    stroke="#000000"
                    orientation="top"
                    height={40}
                    xAxisId="title"
                    label={{ value: title, position: 'center', dy: -10, style: { fill: '#000000', fontWeight: "normal" } }}
                    axisLine={false}
                    tick={false}
                />
                <XAxis     // Or ['dataMin', 'dataMax']
                       allowDataOverflow={true}
                       stroke="#000000"
                       tick={false}
                       tickLine={false}
                />
                <YAxis width="auto"  type="number" domain={['auto', 'auto']}
                       stroke="#000000"
                       label={{
                           value: y_axis_title,
                           angle: -90,
                           position: 'insideLeft',
                           style: { textAnchor: 'middle' },
                           offset: 20
                       }}
                />
                <Tooltip
                    formatter={(value, name)=> [
                        <span className="font-mono font-bold text-slate-500">
                            {typeof value === 'number' ? value.toFixed(2) : value}
                        </span>,
                        name

                    ]}

                    labelFormatter={() => (
                        <span className="font-mono font-bold text-slate-500">
                            {/*Speed: {label.toFixed(2)}*/}
                        </span>
                    )}

                />
                <Line type="basis" dataKey="val" dot={false} strokeWidth={0.7}  stroke={(graph_data.Mtype=="MX")?"#ff4d4f":((graph_data.Mtype=="MY")?"#73d13d":"#ffd666")}  />


            </LineChart>
        </div>
    )

}