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
import { PrecioHistoricoItem } from "@/types";

interface TablaHistoricoProps {
    data: PrecioHistoricoItem[];
}

export const TablaHistorico = ({ data }: TablaHistoricoProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Detalle Histórico</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead className="text-right">Honorarios</TableHead>
                            <TableHead className="text-right">Gastos</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">Variación</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{new Date(item.Fecha).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge variant={item.TipoPrecio === 'N' ? 'default' : 'secondary'}>
                                        {item.TipoPrecio === 'N' ? 'Nomenclador' : 'Fijado'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">${item.Honorarios?.toLocaleString()}</TableCell>
                                <TableCell className="text-right">${item.Gastos?.toLocaleString()}</TableCell>
                                <TableCell className="text-right font-bold">${item.PrecioTotal.toLocaleString()}</TableCell>
                                <TableCell className="text-right">
                                    {item.PorcentajeCambio ? (
                                        <span className={item.PorcentajeCambio > 0 ? "text-green-600" : "text-red-600"}>
                                            {item.PorcentajeCambio > 0 ? '+' : ''}{item.PorcentajeCambio}%
                                        </span>
                                    ) : '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
