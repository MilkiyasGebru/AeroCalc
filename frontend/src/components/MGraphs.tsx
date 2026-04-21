import { Line, LineChart, Tooltip, XAxis, YAxis, ResponsiveContainer} from "recharts";

interface IGraph {
    val: number[];
    Mtype: string
}

export default function MGraphs({graph_data}:{graph_data: IGraph}) {
    const samplingRate = Math.ceil(graph_data.val.length / 1000);
    const sampledData = graph_data.val.filter((_, index) => index % samplingRate === 0).map(val => ({"val":val}));
    const title : string= graph_data.Mtype === "MX"? "Across-wind Aerodynamic base load timehistory": graph_data.Mtype === "MY"? "Along-wind Aerodynamic base load timehistory":" Aerodynamic base load timehistory (Torsion)"
    // const y_axis_title : string = graph_data.Mtype === "MX"? "Macross-wind(KNm)": graph_data.Mtype === "MY"? "Malong-wind(KNm)":" Mtorsion(KNm)"
    const y_axis_title: string = "M (kNm)"
    
    return (
        <div className="bg-card rounded-md border border-border w-full mx-auto p-4">
            <h4 className="text-sm font-bold text-muted-foreground mb-2 text-center">{title}</h4>
            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={sampledData}
                        margin={{ top: 10, right: 10, left: 20, bottom: 20 }}
                    >
                        <XAxis     
                            allowDataOverflow={true}
                            stroke="var(--muted-foreground)"
                            tick={false}
                            tickLine={false}
                        />
                        <YAxis 
                            width={60}  
                            type="number" 
                            domain={['auto', 'auto']}
                            stroke="var(--muted-foreground)"
                            label={{
                                value: y_axis_title,
                                angle: -90,
                                position: 'insideLeft',
                                style: { textAnchor: 'middle', fill: 'var(--muted-foreground)', fontSize: '12px' },
                                offset: 0
                            }}
                            tick={{fontSize: 10, fill: 'var(--muted-foreground)'}}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                            itemStyle={{ color: 'var(--foreground)' }}
                            formatter={(value, name)=> [
                                <span className="font-mono font-bold text-primary">
                                    {typeof value === 'number' ? value.toFixed(2) : value}
                                </span>,
                                name
                            ]}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="val" 
                            dot={false} 
                            strokeWidth={1}  
                            stroke={(graph_data.Mtype=="MX")?"#EA580C":((graph_data.Mtype=="MY")?"#854D0E":"#CA8A04")}  
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
