import {CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis} from "recharts";

interface IGraph {
    M1: number;
    M2: number;
    M3: number;
}

export default function MGraphs({graph_data}: {graph_data: IGraph[] }) {

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
                <XAxis   type="category" domain={['auto', 'auto']} // Or ['dataMin', 'dataMax']
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
                <Line type="basis" dataKey="M1" dot={false}  stroke="#8884d8" />
                <Line type="basis" dataKey="M2" dot={false}  stroke="#8884d8" />
                <Line type="basis" dataKey="M3" dot={false}  stroke="#8884d8" />


            </LineChart>
        </div>
    )

}