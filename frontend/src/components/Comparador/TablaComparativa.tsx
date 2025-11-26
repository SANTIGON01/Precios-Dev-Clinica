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
import { ComparacionPrecioItem } from "@/types";

interface TablaComparativaProps {
    data: ComparacionPrecioItem[];
}

export const TablaComparativa = ({ data }: TablaComparativaProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Comparativa de Precios por Obra Social</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ranking</TableHead>
                            <TableHead>Obra Social</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead className="text-right">Precio Total</TableHead>
                            <TableHead className="text-right">Vs Promedio</TableHead>
                            <TableHead className="text-right">Uso Mensual</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item) => (
                            <TableRow key={item.OSCodigo}>
                                <TableCell className="font-medium">#{item.Ranking}</TableCell>
                                <TableCell>{item.ObraSocial}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            item.Categoria.includes('TOP') ? 'default' :
                                                item.Categoria.includes('MEDIO-ALTO') ? 'secondary' :
                                                    item.Categoria.includes('MEDIO-BAJO') ? 'outline' : 'destructive'
                                        }
                                    >
                                        {item.Categoria}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-bold">${item.PrecioTotal.toLocaleString()}</TableCell>
                                <TableCell className="text-right">
                                    <span className={item.DiferenciaVsPromedio >= 0 ? "text-green-600" : "text-red-600"}>
                                        {item.DiferenciaVsPromedio >= 0 ? '+' : ''}{item.PorcentajeSobrePromedio}%
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">{item.UsoMesActual}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
