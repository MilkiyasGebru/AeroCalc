import { Line, LineChart, ReferenceDot, Tooltip, XAxis, YAxis, ResponsiveContainer} from "recharts";

interface IMeanSpeedGraph {
    speed: number;
    height: number;
}

export default function MeanSpeedGraph({graph_data, current_point}: {graph_data: IMeanSpeedGraph[], current_point: IMeanSpeedGraph }) {

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={graph_data}
                margin={{ top: 20, right: 30, left: 40, bottom: 40 }}
            >
                <XAxis 
                    dataKey="speed"   
                    type="number" 
                    stroke="var(--muted-foreground)" 
                    domain={['auto', 'auto']} 
                    allowDataOverflow={true}
                    label={{ 
                        value: 'Wind Speed (m/s)', 
                        position: 'insideBottom', 
                        offset: -10,
                        style: { fill: 'var(--foreground)', fontWeight: "bold", fontSize: 15, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' } 
                    }}
                    tick={{fontSize: 12, fill: 'var(--muted-foreground)'}}
                />
                <YAxis 
                    width={50}  
                    type="number" 
                    domain={['auto', 'auto']} 
                    stroke="var(--muted-foreground)"
                    label={{
                        value: 'Height (m)',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fill: 'var(--foreground)', fontWeight: "bold", fontSize: 15, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' },
                        offset: 10
                    }}
                    tick={{fontSize: 12, fill: 'var(--muted-foreground)'}}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                    formatter={(value)=> [
                        <span className="font-mono font-bold text-primary">
                            {typeof value === 'number' ? value.toFixed(2) : value}
                        </span>,
                        "Height"
                    ]}
                    labelFormatter={(label) => (
                        <span className="font-mono font-bold text-muted-foreground">
                            Speed: {label.toFixed(2)}
                        </span>
                    )}
                />
                <Line 
                    type="monotone" 
                    dataKey="height" 
                    dot={false} 
                    stroke="hsl(161 94% 30%)" 
                    strokeWidth={1.5}
                />
                <ReferenceDot
                    x={current_point.speed}
                    y={current_point.height}
                    r={5}
                    fill="hsl(161 94% 30%)"
                    stroke="white"
                    strokeWidth={2}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
