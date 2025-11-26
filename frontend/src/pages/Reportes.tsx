import { useState } from 'react';
import { ConfiguradorReporte } from '@/components/Reportes/ConfiguradorReporte';
import { reportesService } from '@/services/api';
import { ReporteItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Reportes = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ReporteItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async (filters: any) => {
        setLoading(true);
        setError(null);
        try {
            const result = await reportesService.getReporteNegociacion(filters.osCodigo, filters.ruCodigo);
            setData(result);
        } catch (err) {
            console.error(err);
            setError('Error al generar el reporte.');

            // Mock data
            setData([
                {
                    OSCodigo: 1,
                    ObraSocial: 'OSDE',
                    NNCodigo: '420101',
                    Practica: 'CONSULTA MEDICA',
                    Rubro: 'CONSULTAS',
                    SubTpoCod: 1,
                    Honorarios: 10000,
                    Gastos: 5000,
                    PrecioTotal: 15000,
                    TipoPrecio: 'N',
                    CoefHonorarios: 100,
                    CoefGastos: 50,
                    CantidadAnual: 5000,
                    FacturacionAnual: 75000000
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (filters: any) => {
        setLoading(true);
        try {
            const blob = await reportesService.exportReporteCsv(filters.osCodigo, filters.ruCodigo);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'reporte_negociacion.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
            setError('Error al exportar el reporte.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Generador de Reportes</h1>
                <p className="text-muted-foreground">
                    Herramientas para la generación y exportación de informes detallados.
                </p>
            </div>

            <ConfiguradorReporte
                onGenerate={handleGenerate}
                onExport={handleExport}
                loading={loading}
            />

            {error && (
                <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                    {error}
                </div>
            )}

            {data.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Vista Previa del Reporte</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Práctica</TableHead>
                                    <TableHead>Rubro</TableHead>
                                    <TableHead className="text-right">Honorarios</TableHead>
                                    <TableHead className="text-right">Gastos</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-right">Tipo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <div className="font-medium">{item.Practica}</div>
                                            <div className="text-xs text-muted-foreground">{item.NNCodigo}</div>
                                        </TableCell>
                                        <TableCell>{item.Rubro}</TableCell>
                                        <TableCell className="text-right">${item.Honorarios.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">${item.Gastos.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-bold">${item.PrecioTotal.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{item.TipoPrecio === 'N' ? 'Nomenclador' : 'Fijado'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
