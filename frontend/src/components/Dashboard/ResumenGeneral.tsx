import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TopOSItem, EvolucionMensualItem } from "@/types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ResumenGeneralProps {
    topOS: TopOSItem[];
    evolucion: EvolucionMensualItem[];
}

export const ResumenGeneral = ({ topOS, evolucion }: ResumenGeneralProps) => {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 border-none shadow-md hover:shadow-lg transition-all duration-200">
                <CardHeader>
                    <CardTitle className="text-xl text-slate-800">Evolución de Facturación</CardTitle>
                    <CardDescription>Tendencia de ingresos en los últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={evolucion}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="Mes"
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `Mes ${value}`}
                                dy={10}
                            />
                            <YAxis
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
                                dx={-10}
                            />
                            <Tooltip
                                cursor={{ fill: '#f1f5f9' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Facturación']}
                                labelFormatter={(label) => `Mes ${label}`}
                            />
                            <Bar
                                dataKey="Facturacion"
                                fill="#2563eb"
                                radius={[6, 6, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="col-span-3 border-none shadow-md hover:shadow-lg transition-all duration-200">
                <CardHeader>
                    <CardTitle className="text-xl text-slate-800">Top 5 Obras Sociales</CardTitle>
                    <CardDescription>Principales generadores de ingresos</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {topOS.map((item, index) => (
                            <div key={index} className="flex items-center group">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-sm ring-2 ring-white shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    {index + 1}
                                </div>
                                <div className="ml-4 space-y-1 flex-1">
                                    <p className="text-sm font-semibold text-slate-700 leading-none group-hover:text-blue-700 transition-colors">{item.ObraSocial}</p>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {item.Ordenes} órdenes procesadas
                                    </p>
                                </div>
                                <div className="ml-auto font-bold text-slate-700">
                                    ${(item.Facturacion / 1000000).toFixed(1)}M
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
