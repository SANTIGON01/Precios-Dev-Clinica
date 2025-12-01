import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPIItem } from "@/types";
import { DollarSign, TrendingUp, AlertCircle, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface KPICardsProps {
    data: KPIItem;
}

export const KPICards = ({ data }: KPICardsProps) => {
    const variacion = data.VariacionMensual || 0;
    const isPositive = variacion >= 0;

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white">
                    <CardTitle className="text-sm font-medium text-slate-600">
                        Facturación Anual
                    </CardTitle>
                    <div className="p-2 bg-blue-100 rounded-full">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </div>
                </CardHeader>
                <CardContent className="bg-white pt-4">
                    <div className="text-2xl font-bold text-slate-900">${(data.FacturacionAnual || 0).toLocaleString()}</div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                        Año actual acumulado
                    </p>
                </CardContent>
            </Card>

            <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white">
                    <CardTitle className="text-sm font-medium text-slate-600">
                        Facturación Mensual
                    </CardTitle>
                    <div className="p-2 bg-indigo-100 rounded-full">
                        <Calendar className="h-4 w-4 text-indigo-600" />
                    </div>
                </CardHeader>
                <CardContent className="bg-white pt-4">
                    <div className="text-2xl font-bold text-slate-900">${(data.FacturacionMensual || 0).toLocaleString()}</div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                        Mes en curso
                    </p>
                </CardContent>
            </Card>

            <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white">
                    <CardTitle className="text-sm font-medium text-slate-600">Variación Mensual</CardTitle>
                    <div className={`p-2 rounded-full ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
                        <TrendingUp className={`h-4 w-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                </CardHeader>
                <CardContent className="bg-white pt-4">
                    <div className="flex items-center gap-2">
                        <div className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : ''}{variacion.toFixed(1)}%
                        </div>
                        {isPositive ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                        ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                        vs. mes anterior
                    </p>
                </CardContent>
            </Card>

            <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-200 ring-1 ring-amber-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-br from-white to-amber-50/50">
                    <CardTitle className="text-sm font-medium text-amber-700">
                        Oportunidad Detectada
                    </CardTitle>
                    <div className="p-2 bg-amber-100 rounded-full">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                    </div>
                </CardHeader>
                <CardContent className="bg-gradient-to-br from-white to-amber-50/50 pt-4">
                    <div className="text-2xl font-bold text-amber-600">${(data.OportunidadTotalAnual || 0).toLocaleString()}</div>
                    <p className="text-xs text-amber-600/80 mt-1 font-medium">
                        Potencial anual estimado
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
