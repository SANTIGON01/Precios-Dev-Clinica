import { useState } from 'react';
import { FormularioSimulacion } from '@/components/Simulador/FormularioSimulacion';
import { ResultadosSimulacion } from '@/components/Simulador/ResultadosSimulacion';
import { simuladorService } from '@/services/api';
import { SimulacionCoeficienteResponse, SimulacionCambioTipoResponse } from '@/types';

export const Simulador = () => {
    const [loading, setLoading] = useState(false);
    const [simulationType, setSimulationType] = useState<'coeficiente' | 'tipo' | null>(null);
    const [resultsCoeficiente, setResultsCoeficiente] = useState<SimulacionCoeficienteResponse[]>([]);
    const [resultsTipo, setResultsTipo] = useState<SimulacionCambioTipoResponse[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleSimulate = async (type: 'coeficiente' | 'tipo', params: any) => {
        setLoading(true);
        setError(null);
        setSimulationType(type);
        setResultsCoeficiente([]);
        setResultsTipo([]);

        try {
            if (type === 'coeficiente') {
                // Hardcoded OS code 1 for demo, in real app it comes from params or context
                const result = await simuladorService.simularCoeficiente(1, params.unidad, params.coeficienteNuevo);
                setResultsCoeficiente(result);
            } else {
                const result = await simuladorService.simularCambioTipo(1, params.nnCodigo);
                setResultsTipo(result);
            }
        } catch (err) {
            console.error(err);
            setError('Error al ejecutar la simulación. Verifique los parámetros y la conexión.');

            // Mock data for demo if backend fails
            if (type === 'coeficiente') {
                setResultsCoeficiente([
                    {
                        NNCodigo: '420101',
                        Practica: 'CONSULTA MEDICA',
                        Rubro: 'CONSULTAS',
                        TipoPrecio: 'N',
                        UnidadesHonorarios: 10,
                        UnidadesGastos: 0,
                        CoefActualHon: 1000,
                        CoefActualGas: 500,
                        CoeficienteNuevo: params.coeficienteNuevo,
                        PrecioActual: 10000,
                        PrecioNuevo: params.coeficienteNuevo * 10,
                        DiferenciaPrecio: (params.coeficienteNuevo * 10) - 10000,
                        UsoMesActual: 150,
                        UsoPromedioMensual: 145,
                        ImpactoMensual: ((params.coeficienteNuevo * 10) - 10000) * 150,
                        ImpactoAnualProyectado: ((params.coeficienteNuevo * 10) - 10000) * 145 * 12
                    }
                ]);
            } else {
                setResultsTipo([
                    {
                        NNCodigo: params.nnCodigo,
                        Practica: 'PRACTICA EJEMPLO',
                        Rubro: 'QUIRURGICA',
                        PrecioFijadoActual: 50000,
                        PrecioSiNomenclador: 85000,
                        DiferenciaPorProcedimiento: 35000,
                        PorcentajeDiferencia: 70,
                        UsoMesActual: 20,
                        UsoPromedioMensual: 18,
                        UsoUltimos12Meses: 200,
                        AhorroMensualProyectado: 700000,
                        AhorroAnualProyectado: 7560000,
                        Recomendacion: 'URGENTE: Cambiar a Nomenclador inmediatamente'
                    }
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Simulador de Escenarios</h1>
                <p className="text-muted-foreground">
                    Proyecte el impacto económico de cambios en coeficientes o modalidades de contratación.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <FormularioSimulacion onSimulate={handleSimulate} loading={loading} />
                </div>

                <div className="lg:col-span-2">
                    {error && (
                        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                            {error}
                        </div>
                    )}

                    {!simulationType && !loading && !error && (
                        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg text-muted-foreground">
                            Configure los parámetros y ejecute una simulación para ver los resultados.
                        </div>
                    )}

                    <ResultadosSimulacion
                        type={simulationType}
                        resultsCoeficiente={resultsCoeficiente}
                        resultsTipo={resultsTipo}
                    />
                </div>
            </div>
        </div>
    );
};
