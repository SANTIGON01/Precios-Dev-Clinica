import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OportunidadPrecioItem, OportunidadModalidadItem } from "@/types";

interface ListaOportunidadesProps {
    type: 'precio' | 'modalidad';
    dataPrecio?: OportunidadPrecioItem[];
    dataModalidad?: OportunidadModalidadItem[];
}

export const ListaOportunidades = ({ type, dataPrecio, dataModalidad }: ListaOportunidadesProps) => {
    if (type === 'precio' && dataPrecio) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Oportunidades por Precio Bajo</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Obra Social</TableHead>
                                <TableHead>Práctica</TableHead>
                                <TableHead className="text-right">Precio Pagado</TableHead>
                                <TableHead className="text-right">Precio Mercado</TableHead>
                                <TableHead className="text-right">Diferencia</TableHead>
                                <TableHead className="text-right">Oportunidad Anual</TableHead>
                                <TableHead className="text-right">Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dataPrecio.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.ObraSocial}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{item.Practica}</div>
                                        <div className="text-xs text-muted-foreground">{item.NNCodigo}</div>
                                    </TableCell>
                                    <TableCell className="text-right text-red-600 font-medium">${item.PrecioPromedioPagado.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">${item.PrecioPromedioMercado.toLocaleString()}</TableCell>
                                    <TableCell className="text-right text-green-600">+${item.DiferenciaVsPromedio.toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-bold text-green-700">${item.OportunidadAnual.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={item.Score > 1000000 ? 'destructive' : 'default'}>
                                            {Math.round(item.Score).toLocaleString()}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        );
    }

    if (type === 'modalidad' && dataModalidad) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Oportunidades por Cambio de Modalidad (Fijado → Nomenclador)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Obra Social</TableHead>
                                <TableHead>Práctica</TableHead>
                                <TableHead className="text-right">Precio Fijado</TableHead>
                                <TableHead className="text-right">Precio Nomenclador</TableHead>
                                <TableHead className="text-right">Diferencia Unit.</TableHead>
                                <TableHead className="text-right">Volumen Anual</TableHead>
                                <TableHead className="text-right">Oportunidad Anual</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dataModalidad.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.ObraSocial}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{item.Practica}</div>
                                        <div className="text-xs text-muted-foreground">{item.NNCodigo}</div>
                                    </TableCell>
                                    <TableCell className="text-right">${item.PrecioFijado.toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-medium text-blue-600">${item.PrecioNomenclador.toLocaleString()}</TableCell>
                                    <TableCell className="text-right text-green-600">+${item.DiferenciaUnit.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">{item.CantidadAnual}</TableCell>
                                    <TableCell className="text-right font-bold text-green-700">${item.OportunidadAnual.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        );
    }

    return null;
};
