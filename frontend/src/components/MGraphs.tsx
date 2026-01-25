import {CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis} from "recharts";

interface IGraph {
    val: number[];
    Mtype: string
}

export default function MGraphs({graph_data}:{graph_data: IGraph}) {
    const samplingRate = Math.ceil(graph_data.val.length / 1000);
    const sampledData = graph_data.val.filter((_, index) => index % samplingRate === 0).map(val => ({"val":val}));
    return (
        <div>
            <LineChart
                style={{ width: '90%', maxWidth: '1400px', height: '100%', maxHeight: '70vh', aspectRatio: 1.618 }}
                responsive
                data={sampledData}
                margin={{
                    top: 5,
                    right: 5,
                    left: 0,
                    bottom: 5,
                }}
            >

                <CartesianGrid strokeDasharray="3 3" />
                <XAxis   type="category" domain={['auto', 'auto']} // Or ['dataMin', 'dataMax']
                       allowDataOverflow={true}
                       label={{ value: '', position: 'insideBottom', offset: 0 }}
                />
                <YAxis width="auto"  type="number" domain={['auto', 'auto']}
                       label={{
                           value: graph_data.Mtype,
                           angle: -90,
                           position: 'insideLeft',
                           style: { textAnchor: 'middle' },
                           offset: 20
                       }}
                />
                <Tooltip />
                <Legend />
                <Line type="basis" dataKey="val" dot={false}  stroke={(graph_data.Mtype=="M1")?"#ff4d4f":((graph_data.Mtype=="M2")?"#73d13d":"#ffd666")}  />


            </LineChart>
        </div>
    )

}