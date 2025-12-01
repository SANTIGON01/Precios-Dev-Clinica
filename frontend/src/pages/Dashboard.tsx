import { useState, useEffect } from 'react';
import { KPICards } from '@/components/Dashboard/KPICards';
import { ResumenGeneral } from '@/components/Dashboard/ResumenGeneral';
import { dashboardService } from '@/services/api';
import { KPIItem, TopOSItem, EvolucionMensualItem } from '@/types';

export const Dashboard = () => {
    const [loading, setLoading] = useState(false);
    const [kpis, setKpis] = useState<KPIItem>({
        FacturacionAnual: 0,
        FacturacionMensual: 0,
        VariacionMensual: 0,
        OportunidadTotalAnual: 0
    });
    const [topOS, setTopOS] = useState<TopOSItem[]>([]);
    const [evolucion, setEvolucion] = useState<EvolucionMensualItem[]>([]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [kpiData, topOSData, evolucionData] = await Promise.all([
                dashboardService.getKPIs(),
                dashboardService.getTopOS(),
                dashboardService.getEvolucionMensual()
            ]);
            setKpis(kpiData);
            setTopOS(topOSData);
            setEvolucion(evolucionData);
        } catch (err) {
            console.error(err);
            // Mock data for demo if backend fails or is empty
            setKpis({
                FacturacionAnual: 150000000,
                FacturacionMensual: 12500000,
                VariacionMensual: 5.2,
                OportunidadTotalAnual: 25000000
            });
            setTopOS([
                { ObraSocial: 'OSDE', Facturacion: 50000000, Ordenes: 1200 },
                { ObraSocial: 'SWISS MEDICAL', Facturacion: 35000000, Ordenes: 900 },
                { ObraSocial: 'GALENO', Facturacion: 25000000, Ordenes: 750 },
                { ObraSocial: 'OMINT', Facturacion: 15000000, Ordenes: 400 },
                { ObraSocial: 'MEDIFE', Facturacion: 10000000, Ordenes: 300 }
            ]);
            setEvolucion([
                { Anio: 2024, Mes: 1, Facturacion: 10000000 },
                { Anio: 2024, Mes: 2, Facturacion: 11000000 },
                { Anio: 2024, Mes: 3, Facturacion: 10500000 },
                { Anio: 2024, Mes: 4, Facturacion: 12000000 },
                { Anio: 2024, Mes: 5, Facturacion: 12500000 },
                { Anio: 2024, Mes: 6, Facturacion: 13000000 }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Cargando dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard General</h1>
                <p className="text-slate-500 mt-2 text-lg">
                    Visión estratégica del rendimiento y oportunidades de negocio.
                </p>
            </div>

            <KPICards data={kpis} />

            <ResumenGeneral topOS={topOS} evolucion={evolucion} />
        </div>
    );
};
