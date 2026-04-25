import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Symbols} from "recharts";

interface AccelartionLimitGraphProps {
    points?: { frequency: number; acceleration: number; label: string; color?: string; shape?: "circle" | "diamond" | "square" | "wye" }[];
}

export default function AccelartionLimitGraph({ points = [] }: AccelartionLimitGraphProps) {
    const frequencies : number[] = [0.06,0.08,0.1, 0.12,0.14,0.16,0.18,0.2,0.22,0.24,0.26,0.28,0.3,0.32,0.34,0.36,0.38,0.4,0.42,0.44,0.46,0.48,0.5,0.52,0.54,0.56,0.58,0.6,0.62,0.64,0.66,0.68,0.7,0.72,0.74,0.76,0.78,0.8,0.82,0.84,0.86,0.88,0.9,0.92,0.94,0.96,0.98,1,2]
    
    const graph_data = frequencies.map(f => {
        const exponent_for_fn = Math.log(0.21/0.06)/Math.log(0.06)
        const officeLimit = 0.06 / 0.00981 * Math.pow(f , exponent_for_fn) ;
        const residenceLimit = (2 / 3) * officeLimit;

        return {
            frequency: f,
            office: parseFloat(officeLimit.toFixed(4)),
            residence: parseFloat(residenceLimit.toFixed(4)),
        };
    });

    return (
        <ResponsiveContainer width="100%" height={450}>
            <LineChart
                data={graph_data}
                margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                    dataKey="frequency"
                    type="number"
                    stroke="var(--muted-foreground)"
                    domain={[0, 1]}
                    label={{
                        value: 'Lowest natural frequency fn (Hz)',
                        position: 'bottom',
                        offset: 20,
                        style: { fill: 'var(--foreground)', fontWeight: "bold", fontSize: 12 }
                    }}
                    tick={{ fontSize: 10 }}
                />
                <YAxis
                    stroke="var(--muted-foreground)"
                    label={{
                        value: 'Acceleration (milli-g)',
                        angle: -90,
                        position: 'insideLeft',
                        offset: 30,
                        style: { textAnchor: 'middle', fill: 'var(--foreground)', fontWeight: "bold", fontSize: 12 }
                    }}
                    tick={{ fontSize: 10 }}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: number = 0, name: string ="") => [value.toFixed(2), name]}
                    labelFormatter={(label: number) => `Frequency: ${label.toFixed(2)} Hz`}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }}/>

                <Line
                    name="Office Limit"
                    type="monotone"
                    dataKey="office"
                    stroke="var(--foreground)"
                    strokeWidth={2}
                    dot={false}
                    legendType="plainline"
                />

                <Line
                    name="Residence Limit"
                    type="monotone"
                    dataKey="residence"
                    stroke="var(--foreground)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    legendType="plainline"
                />

                {points.map((point, index) => (
                    <Line
                        key={index}
                        name={point.label}
                        data={[{ frequency: point.frequency, acceleration: point.acceleration }]}
                        type="monotone"
                        dataKey="acceleration"
                        stroke={point.color || (index === 0 ? "#EA580C" : "#854D0E")}
                        strokeWidth={0}
                        dot={(props: any) => {
                            const { cx, cy } = props;
                            return (
                                <Symbols
                                    cx={cx}
                                    cy={cy}
                                    type={point.shape || "circle"}
                                    size={80}
                                    fill={point.color || (index === 0 ? "#EA580C" : "#854D0E")}
                                />
                            );
                        }}
                        legendType={point.shape || "circle"}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    )
}