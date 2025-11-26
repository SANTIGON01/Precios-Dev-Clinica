import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPIItem } from "@/types";
import { DollarSign, TrendingUp, AlertCircle, Calendar } from "lucide-react";

interface KPICardsProps {
    data: KPIItem;
}

export const KPICards = ({ data }: KPICardsProps) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Facturación Anual
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${(data.FacturacionAnual || 0).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        Año actual
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Facturación Mensual
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${(data.FacturacionMensual || 0).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        Mes actual
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Variación Mensual</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${(data.VariacionMensual || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(data.VariacionMensual || 0) >= 0 ? '+' : ''}{(data.VariacionMensual || 0).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                        vs. mes anterior
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Oportunidad Detectada
                    </CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">${(data.OportunidadTotalAnual || 0).toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        Potencial anual estimado
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
