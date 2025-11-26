import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ComparacionPrecioItem } from '@/types';

interface GraficoBenchmarkProps {
    data: ComparacionPrecioItem[];
    title: string;
}

export const GraficoBenchmark = ({ data, title }: GraficoBenchmarkProps) => {
    const chartData = useMemo(() => {
        return data.map(item => ({
            name: item.ObraSocial,
            precio: item.PrecioTotal,
            promedio: data.reduce((acc, curr) => acc + curr.PrecioTotal, 0) / data.length
        }));
    }, [data]);

    const average = data.length > 0 ? data.reduce((acc, curr) => acc + curr.PrecioTotal, 0) / data.length : 0;

    return (
        <Card className="w-full h-[400px]">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>Comparación visual de precios respecto al promedio de mercado</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="name"
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            tickFormatter={(value) => `$${value.toLocaleString()}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                borderColor: 'hsl(var(--border))',
                                borderRadius: 'var(--radius)',
                                color: 'hsl(var(--card-foreground))'
                            }}
                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Precio']}
                            cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                        />
                        <Legend />
                        <ReferenceLine y={average} label="Promedio" stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                        <Bar
                            dataKey="precio"
                            name="Precio Total"
                            fill="hsl(var(--primary))"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};
