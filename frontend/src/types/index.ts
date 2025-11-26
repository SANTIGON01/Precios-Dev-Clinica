export interface PrecioHistoricoItem {
    Fecha: string;
    TipoPrecio: string | null;
    PrecioTotal: number;
    Honorarios: number;
    Gastos: number;
    PrecioAnterior: number | null;
    DiferenciaPrecio: number | null;
    PorcentajeCambio: number | null;
}

export interface CoeficienteHistoricoItem {
    Fecha: string;
    Unidad: string;
    CoeficientePromedio: number;
    CoeficienteMinimo: number;
    CoeficienteMaximo: number;
    CantidadPracticas: number;
    Cambio: number | null;
    PorcentajeCambio: number | null;
}

export interface TasaUsoItem {
    Año: number;
    Mes: number;
    FechaMes: string;
    CantidadLineas: number;
    CantidadOrdenes: number;
    CantidadTotal: number;
    TotalFacturado: number;
    PromedioFacturado: number;
    MinimoFacturado: number;
    MaximoFacturado: number;
    CrecimientoCantidad: number | null;
    PorcentajeCrecimiento: number | null;
}

export interface FacturacionRubroItem {
    Año: number;
    Mes: number;
    FechaMes: string;
    RUCodigo: number;
    Rubro: string;
    CantidadPracticasDistintas: number;
    CantidadTotal: number;
    FacturacionTotal: number;
    PorcentajeTotal: number;
    Ranking: number;
}

export interface TopPracticaItem {
    NNCodigo: string;
    Practica: string;
    Rubro: string;
    CantidadTotal: number;
    FacturacionTotal: number;
    CantidadOrdenes: number;
    PromedioPrecio: number;
    RankingPorUso: number;
    RankingPorFacturacion: number;
    ScoreCombinado: number;
}

export interface SimulacionCoeficienteResponse {
    NNCodigo: string;
    Practica: string;
    Rubro: string;
    TipoPrecio: string;
    UnidadesHonorarios: number;
    UnidadesGastos: number;
    CoefActualHon: number;
    CoefActualGas: number;
    CoeficienteNuevo: number;
    PrecioActual: number;
    PrecioNuevo: number;
    DiferenciaPrecio: number;
    UsoMesActual: number;
    UsoPromedioMensual: number;
    ImpactoMensual: number;
    ImpactoAnualProyectado: number;
}

export interface SimulacionCambioTipoResponse {
    NNCodigo: string;
    Practica: string;
    Rubro: string;
    PrecioFijadoActual: number;
    PrecioSiNomenclador: number;
    DiferenciaPorProcedimiento: number;
    PorcentajeDiferencia: number | null;
    UsoMesActual: number;
    UsoPromedioMensual: number;
    UsoUltimos12Meses: number;
    AhorroMensualProyectado: number;
    AhorroAnualProyectado: number;
    Recomendacion: string;
}

export interface ComparacionCoeficienteItem {
    CodigoOS: number;
    ObraSocial: string;
    Unidad: string;
    SubTpoCod: number;
    Coeficiente: number;
    DiferenciaVsPromedio: number;
    PorcentajeSobrePromedio: number | null;
    Ranking: number;
}

export interface ComparacionPrecioItem {
    OSCodigo: number;
    ObraSocial: string;
    TipoPrecio: string | null;
    PrecioTotal: number;
    Honorarios: number | null;
    Gastos: number | null;
    DiferenciaVsPromedio: number;
    PorcentajeSobrePromedio: number | null;
    PrecioMaximoMercado: number;
    PrecioMinimoMercado: number;
    Ranking: number;
    CoefHonorarios: number | null;
    CoefGastos: number | null;
    UnidadHonorarios: string | null;
    UnidadGastos: string | null;
    UsoMesActual: number;
    Categoria: string;
}

export interface MixFacturacionItem {
    OSCodigo: number;
    ObraSocial: string;
    CantidadOrdenes: number;
    CantidadLineas: number;
    CantidadPracticas: number;
    PracticasDistintas: number;
    FacturacionTotal: number;
    TicketPromedio: number;
    PorcentajeFacturacionTotal: number;
    PorcentajeVolumenTotal: number;
    RankingPorFacturacion: number;
    RankingPorVolumen: number;
    RankingPorTicket: number;
    Segmento: string;
}

export interface OportunidadPrecioItem {
    OSCodigo: number;
    ObraSocial: string;
    NNCodigo: string;
    Practica: string;
    Rubro: string;
    CantidadAnual: number;
    FacturacionAnual: number;
    PrecioPromedioPagado: number;
    PrecioPromedioMercado: number;
    PrecioMaximoMercado: number;
    DiferenciaVsPromedio: number;
    OportunidadAnual: number;
    Score: number;
}

export interface OportunidadModalidadItem {
    OSCodigo: number;
    ObraSocial: string;
    NNCodigo: string;
    Practica: string;
    Rubro: string;
    PrecioFijado: number;
    PrecioNomenclador: number;
    DiferenciaUnit: number;
    CantidadAnual: number;
    OportunidadAnual: number;
}

export interface ReporteItem {
    OSCodigo: number;
    ObraSocial: string;
    NNCodigo: string;
    Practica: string;
    Rubro: string;
    SubTpoCod: number;
    Honorarios: number;
    Gastos: number;
    PrecioTotal: number;
    TipoPrecio: string;
    CoefHonorarios: number;
    CoefGastos: number;
    CantidadAnual: number;
    FacturacionAnual: number;
}
