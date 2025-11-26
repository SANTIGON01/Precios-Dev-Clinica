import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SimulacionCoeficienteResponse, SimulacionCambioTipoResponse } from "@/types";

interface ResultadosSimulacionProps {
    type: 'coeficiente' | 'tipo' | null;
    resultsCoeficiente?: SimulacionCoeficienteResponse[];
    resultsTipo?: SimulacionCambioTipoResponse[];
}

export const ResultadosSimulacion = ({ type, resultsCoeficiente, resultsTipo }: ResultadosSimulacionProps) => {
    if (!type) return null;

    if (type === 'coeficiente' && resultsCoeficiente) {
        const totalImpact = resultsCoeficiente.reduce((acc, curr) => acc + curr.ImpactoMensual, 0);

        return (
            <div className="space-y-6">
                <Card className="bg-slate-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-blue-700">Resumen de Impacto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Prácticas Afectadas</p>
                                <p className="text-2xl font-bold">{resultsCoeficiente.length}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Impacto Mensual Total</p>
                                <p className={`text-2xl font-bold ${totalImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {totalImpact >= 0 ? '+' : ''}${totalImpact.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Impacto Anual Proyectado</p>
                                <p className={`text-2xl font-bold ${totalImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {totalImpact >= 0 ? '+' : ''}${(totalImpact * 12).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Detalle por Práctica</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Práctica</TableHead>
                                    <TableHead>Precio Actual</TableHead>
                                    <TableHead>Precio Nuevo</TableHead>
                                    <TableHead>Diferencia</TableHead>
                                    <TableHead>Uso Mes</TableHead>
                                    <TableHead>Impacto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {resultsCoeficiente.map((item) => (
                                    <TableRow key={item.NNCodigo}>
                                        <TableCell>
                                            <div className="font-medium">{item.NNCodigo}</div>
                                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">{item.Practica}</div>
                                        </TableCell>
                                        <TableCell>${item.PrecioActual.toLocaleString()}</TableCell>
                                        <TableCell>${item.PrecioNuevo.toLocaleString()}</TableCell>
                                        <TableCell className={item.DiferenciaPrecio >= 0 ? 'text-green-600' : 'text-red-600'}>
                                            {item.DiferenciaPrecio >= 0 ? '+' : ''}${item.DiferenciaPrecio.toLocaleString()}
                                        </TableCell>
                                        <TableCell>{item.UsoMesActual}</TableCell>
                                        <TableCell className={`font-bold ${item.ImpactoMensual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {item.ImpactoMensual >= 0 ? '+' : ''}${item.ImpactoMensual.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (type === 'tipo' && resultsTipo) {
        return (
            <div className="space-y-6">
                {resultsTipo.map((item) => (
                    <Card key={item.NNCodigo} className="border-l-4 border-l-blue-500">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>{item.Practica}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{item.NNCodigo} - {item.Rubro}</p>
                                </div>
                                <Badge variant={item.AhorroMensualProyectado > 0 ? 'default' : 'destructive'}>
                                    {item.Recomendacion.split(':')[0]}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Comparativa de Precios</p>
                                        <div className="mt-2 space-y-2">
                                            <div className="flex justify-between">
                                                <span>Precio Fijado (Actual):</span>
                                                <span className="font-bold">${item.PrecioFijadoActual.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Precio Nomenclador (Simulado):</span>
                                                <span className="font-bold text-blue-600">${item.PrecioSiNomenclador.toLocaleString()}</span>
                                            </div>
                                            <div className="pt-2 border-t flex justify-between">
                                                <span>Diferencia:</span>
                                                <span className={`font-bold ${item.DiferenciaPorProcedimiento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {item.DiferenciaPorProcedimiento >= 0 ? '+' : ''}${item.DiferenciaPorProcedimiento.toLocaleString()} ({item.PorcentajeDiferencia}%)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Proyección de Impacto</p>
                                        <div className="mt-2 space-y-2">
                                            <div className="flex justify-between">
                                                <span>Uso Mensual Promedio:</span>
                                                <span>{item.UsoPromedioMensual.toFixed(1)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Ahorro Mensual:</span>
                                                <span className={`font-bold ${item.AhorroMensualProyectado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    ${item.AhorroMensualProyectado.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Ahorro Anual:</span>
                                                <span className={`font-bold ${item.AhorroAnualProyectado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    ${item.AhorroAnualProyectado.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-slate-100 rounded-lg">
                                <p className="font-medium text-slate-900">Recomendación:</p>
                                <p className="text-slate-700">{item.Recomendacion}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return null;
};
