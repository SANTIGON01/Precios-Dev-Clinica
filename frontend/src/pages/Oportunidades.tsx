import { useState, useEffect } from 'react';
import { ListaOportunidades } from '@/components/Oportunidades/ListaOportunidades';
import { oportunidadesService } from '@/services/api';
import { OportunidadPrecioItem, OportunidadModalidadItem } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const Oportunidades = () => {
    const [loading, setLoading] = useState(false);
    const [dataPrecio, setDataPrecio] = useState<OportunidadPrecioItem[]>([]);
    const [dataModalidad, setDataModalidad] = useState<OportunidadModalidadItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [precios, modalidad] = await Promise.all([
                oportunidadesService.getOportunidadesPrecio(),
                oportunidadesService.getOportunidadesModalidad()
            ]);
            setDataPrecio(precios);
            setDataModalidad(modalidad);
        } catch (err) {
            console.error(err);
            setError('Error al cargar las oportunidades. Verifique la conexión con el backend.');

            // Mock data for demo
            setDataPrecio([
                {
                    OSCodigo: 1,
                    ObraSocial: 'OSDE',
                    NNCodigo: '420101',
                    Practica: 'CONSULTA MEDICA',
                    Rubro: 'CONSULTAS',
                    CantidadAnual: 5000,
                    FacturacionAnual: 50000000,
                    PrecioPromedioPagado: 10000,
                    PrecioPromedioMercado: 12000,
                    PrecioMaximoMercado: 15000,
                    DiferenciaVsPromedio: 2000,
                    OportunidadAnual: 10000000,
                    Score: 2000000
                }
            ]);

            setDataModalidad([
                {
                    OSCodigo: 3,
                    ObraSocial: 'GALENO',
                    NNCodigo: '180116',
                    Practica: 'PRACTICA QUIRURGICA',
                    Rubro: 'QUIRURGICA',
                    PrecioFijado: 45000,
                    PrecioNomenclador: 60000,
                    DiferenciaUnit: 15000,
                    CantidadAnual: 200,
                    OportunidadAnual: 3000000
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const totalOportunidad =
        dataPrecio.reduce((acc, curr) => acc + curr.OportunidadAnual, 0) +
        dataModalidad.reduce((acc, curr) => acc + curr.OportunidadAnual, 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Detector de Oportunidades</h1>
                <p className="text-muted-foreground">
                    Identificación automática de oportunidades de mejora en precios y modalidades de contratación.
                </p>
            </div>

            <Alert className="bg-green-50 border-green-200">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Oportunidad Total Detectada</AlertTitle>
                <AlertDescription className="text-green-700 font-bold text-lg">
                    ${totalOportunidad.toLocaleString()} anuales
                </AlertDescription>
            </Alert>

            {error && (
                <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                    {error}
                </div>
            )}

            <Tabs defaultValue="precio" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="precio">Precios Bajos</TabsTrigger>
                    <TabsTrigger value="modalidad">Cambio de Modalidad</TabsTrigger>
                </TabsList>

                <TabsContent value="precio">
                    <ListaOportunidades type="precio" dataPrecio={dataPrecio} />
                </TabsContent>

                <TabsContent value="modalidad">
                    <ListaOportunidades type="modalidad" dataModalidad={dataModalidad} />
                </TabsContent>
            </Tabs>
        </div>
    );
};
