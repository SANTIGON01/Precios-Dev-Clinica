import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopOSItem, EvolucionMensualItem } from "@/types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ResumenGeneralProps {
    topOS: TopOSItem[];
    evolucion: EvolucionMensualItem[];
}

export const ResumenGeneral = ({ topOS, evolucion }: ResumenGeneralProps) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Evolución de Facturación</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={evolucion}>
                            <XAxis
                                dataKey="Mes"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Facturación']}
                                labelFormatter={(label) => `Mes ${label}`}
                            />
                            <Bar dataKey="Facturacion" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Top 5 Obras Sociales</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {topOS.map((item, index) => (
                            <div key={index} className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{item.ObraSocial}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {item.Ordenes} órdenes
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">
                                    ${item.Facturacion.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
