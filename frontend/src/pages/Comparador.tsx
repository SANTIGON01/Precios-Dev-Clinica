import { useState, useEffect } from 'react';
import { TablaComparativa } from '@/components/Comparador/TablaComparativa';
import { GraficoBenchmark } from '@/components/Comparador/GraficoBenchmark';
import { comparadorService } from '@/services/api';
import { ComparacionPrecioItem } from '@/types';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export const Comparador = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ComparacionPrecioItem[]>([]);
    const [nnCodigo, setNnCodigo] = useState('420101');
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!nnCodigo) return;

        setLoading(true);
        setError(null);
        try {
            const result = await comparadorService.getPrecioPractica(nnCodigo);
            setData(result);
        } catch (err) {
            console.error(err);
            setError('Error al cargar los datos comparativos.');

            // Mock data for demo
            const mockData: ComparacionPrecioItem[] = [
                {
                    OSCodigo: 1,
                    ObraSocial: 'OSDE',
                    TipoPrecio: 'N',
                    PrecioTotal: 15000,
                    Honorarios: 10000,
                    Gastos: 5000,
                    DiferenciaVsPromedio: 2500,
                    PorcentajeSobrePromedio: 20,
                    PrecioMaximoMercado: 15000,
                    PrecioMinimoMercado: 10000,
                    Ranking: 1,
                    CoefHonorarios: 100,
                    CoefGastos: 50,
                    UnidadHonorarios: 'GALQ',
                    UnidadGastos: 'UGQ',
                    UsoMesActual: 150,
                    Categoria: 'TOP - Mejor pago'
                },
                {
                    OSCodigo: 2,
                    ObraSocial: 'SWISS MEDICAL',
                    TipoPrecio: 'N',
                    PrecioTotal: 14000,
                    Honorarios: 9500,
                    Gastos: 4500,
                    DiferenciaVsPromedio: 1500,
                    PorcentajeSobrePromedio: 12,
                    PrecioMaximoMercado: 15000,
                    PrecioMinimoMercado: 10000,
                    Ranking: 2,
                    CoefHonorarios: 95,
                    CoefGastos: 45,
                    UnidadHonorarios: 'GALQ',
                    UnidadGastos: 'UGQ',
                    UsoMesActual: 120,
                    Categoria: 'MEDIO-ALTO'
                },
                {
                    OSCodigo: 3,
                    ObraSocial: 'GALENO',
                    TipoPrecio: 'S',
                    PrecioTotal: 11000,
                    Honorarios: 8000,
                    Gastos: 3000,
                    DiferenciaVsPromedio: -1500,
                    PorcentajeSobrePromedio: -12,
                    PrecioMaximoMercado: 15000,
                    PrecioMinimoMercado: 10000,
                    Ranking: 3,
                    CoefHonorarios: null,
                    CoefGastos: null,
                    UnidadHonorarios: null,
                    UnidadGastos: null,
                    UsoMesActual: 200,
                    Categoria: 'MEDIO-BAJO'
                },
                {
                    OSCodigo: 4,
                    ObraSocial: 'OMINT',
                    TipoPrecio: 'N',
                    PrecioTotal: 10000,
                    Honorarios: 7000,
                    Gastos: 3000,
                    DiferenciaVsPromedio: -2500,
                    PorcentajeSobrePromedio: -20,
                    PrecioMaximoMercado: 15000,
                    PrecioMinimoMercado: 10000,
                    Ranking: 4,
                    CoefHonorarios: 70,
                    CoefGastos: 30,
                    UnidadHonorarios: 'GALQ',
                    UnidadGastos: 'UGQ',
                    UsoMesActual: 80,
                    Categoria: 'BAJO - Peor pago'
                }
            ];
            setData(mockData);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleSearch();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Comparador de Obras Sociales</h1>
                <p className="text-muted-foreground">
                    Analice cómo pagan las distintas obras sociales para una misma práctica.
                </p>
            </div>

            <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                    type="text"
                    placeholder="Código de práctica (ej: 420101)"
                    value={nnCodigo}
                    onChange={(e) => setNnCodigo(e.target.value)}
                />
                <Button onClick={handleSearch} disabled={loading}>
                    <Search className="h-4 w-4 mr-2" />
                    Comparar
                </Button>
            </div>

            {error && (
                <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                    {error}
                </div>
            )}

            {data.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="lg:col-span-2">
                        <GraficoBenchmark data={data} title={`Benchmark de Precios - ${nnCodigo}`} />
                    </div>
                    <div className="lg:col-span-2">
                        <TablaComparativa data={data} />
                    </div>
                </div>
            )}
        </div>
    );
};
