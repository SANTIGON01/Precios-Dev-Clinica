from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import date, timedelta
from pydantic import BaseModel
from app.services.database import get_db
from app.queries import comparador_queries
import pyodbc

router = APIRouter()

class ComparacionCoeficienteItem(BaseModel):
    CodigoOS: int
    ObraSocial: str
    Unidad: str
    SubTpoCod: int
    Coeficiente: float
    DiferenciaVsPromedio: float
    PorcentajeSobrePromedio: Optional[float]
    Ranking: int

class ComparacionPrecioItem(BaseModel):
    OSCodigo: int
    ObraSocial: str
    TipoPrecio: Optional[str]
    PrecioTotal: float
    Honorarios: Optional[float]
    Gastos: Optional[float]
    DiferenciaVsPromedio: float
    PorcentajeSobrePromedio: Optional[float]
    PrecioMaximoMercado: float
    PrecioMinimoMercado: float
    Ranking: int
    CoefHonorarios: Optional[float]
    CoefGastos: Optional[float]
    UnidadHonorarios: Optional[str]
    UnidadGastos: Optional[str]
    UsoMesActual: int
    Categoria: str

class MixFacturacionItem(BaseModel):
    OSCodigo: int
    ObraSocial: str
    CantidadOrdenes: int
    CantidadLineas: int
    CantidadPracticas: float
    PracticasDistintas: int
    FacturacionTotal: float
    TicketPromedio: float
    PorcentajeFacturacionTotal: float
    PorcentajeVolumenTotal: float
    RankingPorFacturacion: int
    RankingPorVolumen: int
    RankingPorTicket: int
    Segmento: str

@router.get("/coeficientes", response_model=List[ComparacionCoeficienteItem])
def comparar_coeficientes(
    unidades: str = Query(..., description="Comma separated list of units, e.g. GALQ,UGQ"),
    sub_tpo_cod: int = 1,
    db: pyodbc.Connection = Depends(get_db)
):
    """
    Compara coeficientes entre todas las obras sociales activas.
    """
    cursor = db.cursor()
    try:
        # Format the list for IN clause
        unidades_list = unidades.split(',')
        placeholders = ','.join([f"'{u.strip()}'" for u in unidades_list])
        
        query = comparador_queries.QUERY_C1_COMPARAR_COEFICIENTES.format(unidades_list=placeholders)
        
        cursor.execute(query, sub_tpo_cod)
        
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
            
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

@router.get("/precio/{nn_codigo}", response_model=List[ComparacionPrecioItem])
def comparar_precio_practica(
    nn_codigo: str,
    sub_tpo_cod: int = 1,
    db: pyodbc.Connection = Depends(get_db)
):
    """
    Compara el precio de una práctica específica en todas las obras sociales.
    """
    cursor = db.cursor()
    try:
        # Params: NNCodigo, SubTpoCod, NNCodigo (for usage subquery)
        cursor.execute(comparador_queries.QUERY_C2_COMPARAR_PRECIO, nn_codigo, sub_tpo_cod, nn_codigo)
        
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
            
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

@router.get("/mix", response_model=List[MixFacturacionItem])
def get_mix_facturacion(
    fecha_desde: date = Query(default=date.today() - timedelta(days=365)),
    fecha_hasta: date = Query(default=date.today()),
    db: pyodbc.Connection = Depends(get_db)
):
    """
    Obtiene el mix de facturación y volumen por obra social.
    """
    cursor = db.cursor()
    try:
        cursor.execute(comparador_queries.QUERY_C3_MIX_OS, fecha_desde, fecha_hasta)
        
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
            
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
