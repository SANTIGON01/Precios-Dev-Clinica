import { useState, useEffect } from 'react';
import { GraficoEvolucion } from '@/components/Historico/GraficoEvolucion';
import { TablaHistorico } from '@/components/Historico/TablaHistorico';
import { FiltrosHistorico } from '@/components/Historico/FiltrosHistorico';
import { historicoService } from '@/services/api';
import { PrecioHistoricoItem } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Historico = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<PrecioHistoricoItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Mock initial load or handle search
    const handleSearch = async (filters: any) => {
        setLoading(true);
        setError(null);
        try {
            // Hardcoded for demo purposes until filters are fully wired
            // In a real app, we'd use the filter values
            const result = await historicoService.getPrecios('420101', 1);
            setData(result);
        } catch (err) {
            console.error(err);
            setError('Error al cargar los datos. Asegúrese de que el backend esté corriendo.');

            // Fallback mock data for demo if backend fails
            const mockData: PrecioHistoricoItem[] = Array.from({ length: 12 }, (_, i) => ({
                Fecha: new Date(2023, i, 1).toISOString(),
                TipoPrecio: 'N',
                PrecioTotal: 15000 + (i * 500) + (Math.random() * 1000),
                Honorarios: 10000 + (i * 300),
                Gastos: 5000 + (i * 200),
                PrecioAnterior: null,
                DiferenciaPrecio: null,
                PorcentajeCambio: 2.5
            }));
            setData(mockData);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Load initial data
        handleSearch({});
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Análisis Histórico</h1>
                <p className="text-muted-foreground">
                    Evolución de precios, coeficientes y tasas de uso en el tiempo.
                </p>
            </div>

            <FiltrosHistorico onSearch={handleSearch} />

            {error && (
                <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                    {error}
                </div>
            )}

            <Tabs defaultValue="precios" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="precios">Precios</TabsTrigger>
                    <TabsTrigger value="coeficientes">Coeficientes</TabsTrigger>
                    <TabsTrigger value="uso">Tasa de Uso</TabsTrigger>
                    <TabsTrigger value="facturacion">Facturación</TabsTrigger>
                </TabsList>

                <TabsContent value="precios" className="space-y-4">
                    <GraficoEvolucion
                        data={data}
                        title="Evolución de Precio"
                        description="Variación del precio total (Honorarios + Gastos) en el último período."
                    />
                    <TablaHistorico data={data} />
                </TabsContent>

                <TabsContent value="coeficientes">
                    <Card>
                        <CardHeader><CardTitle>Coeficientes</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Seleccione una unidad para ver su evolución.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="uso">
                    <Card>
                        <CardHeader><CardTitle>Tasa de Uso</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Visualización de cantidad de prácticas realizadas.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="facturacion">
                    <Card>
                        <CardHeader><CardTitle>Facturación</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Análisis de facturación por rubro.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
