import { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PrecioHistoricoItem } from '@/types';

interface GraficoEvolucionProps {
    data: PrecioHistoricoItem[];
    title: string;
    description?: string;
}

export const GraficoEvolucion = ({ data, title, description }: GraficoEvolucionProps) => {
    const chartData = useMemo(() => {
        return data.map(item => ({
            fecha: new Date(item.Fecha).toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
            precio: item.PrecioTotal,
            honorarios: item.Honorarios,
            gastos: item.Gastos,
            originalDate: item.Fecha
        }));
    }, [data]);

    return (
        <Card className="w-full h-[400px]">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
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
                            dataKey="fecha"
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
                            formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="precio"
                            name="Precio Total"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="honorarios"
                            name="Honorarios"
                            stroke="hsl(var(--chart-1))"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                        />
                        <Line
                            type="monotone"
                            dataKey="gastos"
                            name="Gastos"
                            stroke="hsl(var(--chart-2))"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};
