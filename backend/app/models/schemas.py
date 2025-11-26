from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

# --- Shared Models ---

class DateRange(BaseModel):
    start_date: date
    end_date: date

# --- Historical Module Models ---

class PrecioHistoricoItem(BaseModel):
    Fecha: date
    TipoPrecio: Optional[str] = None
    PrecioTotal: float
    Honorarios: Optional[float] = 0
    Gastos: Optional[float] = 0
    PrecioAnterior: Optional[float] = None
    DiferenciaPrecio: Optional[float] = None
    PorcentajeCambio: Optional[float] = None

class CoeficienteHistoricoItem(BaseModel):
    Fecha: date
    Unidad: str
    CoeficientePromedio: float
    CoeficienteMinimo: float
    CoeficienteMaximo: float
    CantidadPracticas: int
    Cambio: Optional[float] = None
    PorcentajeCambio: Optional[float] = None

class TasaUsoItem(BaseModel):
    Año: int
    Mes: int
    FechaMes: date
    CantidadLineas: int
    CantidadOrdenes: int
    CantidadTotal: float
    TotalFacturado: float
    PromedioFacturado: float
    MinimoFacturado: float
    MaximoFacturado: float
    CrecimientoCantidad: Optional[float] = None
    PorcentajeCrecimiento: Optional[float] = None

class FacturacionRubroItem(BaseModel):
    Año: int
    Mes: int
    FechaMes: date
    RUCodigo: int
    Rubro: str
    CantidadPracticasDistintas: int
    CantidadTotal: float
    FacturacionTotal: float
    PorcentajeTotal: float
    Ranking: int

class TopPracticaItem(BaseModel):
    NNCodigo: str
    Practica: str
    Rubro: str
    CantidadTotal: float
    FacturacionTotal: float
    CantidadOrdenes: int
    PromedioPrecio: float
    RankingPorUso: int
    RankingPorFacturacion: int
    ScoreCombinado: float
