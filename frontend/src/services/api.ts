import axios from 'axios';
import {
    PrecioHistoricoItem,
    CoeficienteHistoricoItem,
    TasaUsoItem,
    FacturacionRubroItem,
    TopPracticaItem,
    SimulacionCoeficienteResponse,
    SimulacionCambioTipoResponse,
    ComparacionCoeficienteItem,
    ComparacionPrecioItem,
    MixFacturacionItem,
    OportunidadPrecioItem,
    OportunidadModalidadItem,
    ReporteItem,
    KPIItem,
    TopOSItem,
    EvolucionMensualItem
} from '@/types';

const API_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const historicoService = {
    getPrecios: async (nnCodigo: string, osCodigo: number, fechaDesde?: string, fechaHasta?: string) => {
        const params = { nn_codigo: nnCodigo, os_codigo: osCodigo, fecha_desde: fechaDesde, fecha_hasta: fechaHasta };
        const response = await api.get<PrecioHistoricoItem[]>(`/historico/precios/${nnCodigo}`, { params });
        return response.data;
    },

    getCoeficientes: async (unidad: string, osCodigo: number, fechaDesde?: string, fechaHasta?: string) => {
        const params = { unidad, os_codigo: osCodigo, fecha_desde: fechaDesde, fecha_hasta: fechaHasta };
        const response = await api.get<CoeficienteHistoricoItem[]>(`/historico/coeficientes/${unidad}`, { params });
        return response.data;
    },

    getUso: async (nnCodigo: string, osCodigo: number, fechaDesde?: string, fechaHasta?: string) => {
        const params = { nn_codigo: nnCodigo, os_codigo: osCodigo, fecha_desde: fechaDesde, fecha_hasta: fechaHasta };
        const response = await api.get<TasaUsoItem[]>(`/historico/uso/${nnCodigo}`, { params });
        return response.data;
    },

    getFacturacionRubros: async (osCodigo: number, fechaDesde?: string, fechaHasta?: string) => {
        const params = { os_codigo: osCodigo, fecha_desde: fechaDesde, fecha_hasta: fechaHasta };
        const response = await api.get<FacturacionRubroItem[]>('/historico/facturacion/rubros', { params });
        return response.data;
    },

    getTopPracticas: async (osCodigo: number, topN: number = 10, ordenarPor: string = 'combinado', fechaDesde?: string, fechaHasta?: string) => {
        const params = { os_codigo: osCodigo, top_n: topN, ordenar_por: ordenarPor, fecha_desde: fechaDesde, fecha_hasta: fechaHasta };
        const response = await api.get<TopPracticaItem[]>('/historico/top-practicas', { params });
        return response.data;
    }
};

export const simuladorService = {
    simularCoeficiente: async (osCodigo: number, unidad: string, coeficienteNuevo: number) => {
        const params = { os_codigo: osCodigo, unidad, coeficiente_nuevo: coeficienteNuevo };
        const response = await api.get<SimulacionCoeficienteResponse[]>('/simulador/coeficiente', { params });
        return response.data;
    },

    simularCambioTipo: async (osCodigo: number, nnCodigo: string, subTpoCod: number = 1) => {
        const params = { os_codigo: osCodigo, nn_codigo: nnCodigo, sub_tpo_cod: subTpoCod };
        const response = await api.get<SimulacionCambioTipoResponse[]>('/simulador/cambio-tipo', { params });
        return response.data;
    }
};

export const comparadorService = {
    getCoeficientes: async (unidades: string, subTpoCod: number = 1) => {
        const params = { unidades, sub_tpo_cod: subTpoCod };
        const response = await api.get<ComparacionCoeficienteItem[]>('/comparador/coeficientes', { params });
        return response.data;
    },

    getPrecioPractica: async (nnCodigo: string, subTpoCod: number = 1) => {
        const params = { nn_codigo: nnCodigo, sub_tpo_cod: subTpoCod };
        const response = await api.get<ComparacionPrecioItem[]>(`/comparador/precio/${nnCodigo}`, { params });
        return response.data;
    },

    getMixFacturacion: async (fechaDesde?: string, fechaHasta?: string) => {
        const params = { fecha_desde: fechaDesde, fecha_hasta: fechaHasta };
        const response = await api.get<MixFacturacionItem[]>('/comparador/mix', { params });
        return response.data;
    }
};

export const oportunidadesService = {
    getOportunidadesPrecio: async () => {
        const response = await api.get<OportunidadPrecioItem[]>('/oportunidades/precio');
        return response.data;
    },

    getOportunidadesModalidad: async () => {
        const response = await api.get<OportunidadModalidadItem[]>('/oportunidades/modalidad');
        return response.data;
    }
};

export const reportesService = {
    getReporteNegociacion: async (osCodigo: number, ruCodigo?: number) => {
        const params = { os_codigo: osCodigo, ru_codigo: ruCodigo };
        const response = await api.get<ReporteItem[]>('/reportes/negociacion', { params });
        return response.data;
    },

    exportReporteCsv: async (osCodigo: number, ruCodigo?: number) => {
        const params = { os_codigo: osCodigo, ru_codigo: ruCodigo };
        const response = await api.get('/reportes/negociacion/export/csv', {
            params,
            responseType: 'blob'
        });
        return response.data;
    }
};

export const dashboardService = {
    getKPIs: async () => {
        const response = await api.get<KPIItem>('/dashboard/kpis');
        return response.data;
    },

    getTopOS: async () => {
        const response = await api.get<TopOSItem[]>('/dashboard/top-os');
        return response.data;
    },

    getEvolucionMensual: async () => {
        const response = await api.get<EvolucionMensualItem[]>('/dashboard/evolucion');
        return response.data;
    }
};

export default api;
