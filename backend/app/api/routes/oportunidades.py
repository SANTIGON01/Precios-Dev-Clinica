from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
from app.services.database import get_db
from app.queries import oportunidades_queries
import pyodbc

router = APIRouter()

class OportunidadPrecioItem(BaseModel):
    OSCodigo: int
    ObraSocial: str
    NNCodigo: str
    Practica: str
    Rubro: str
    CantidadAnual: float
    FacturacionAnual: float
    PrecioPromedioPagado: float
    PrecioPromedioMercado: float
    PrecioMaximoMercado: float
    DiferenciaVsPromedio: float
    OportunidadAnual: float
    Score: float

class OportunidadModalidadItem(BaseModel):
    OSCodigo: int
    ObraSocial: str
    NNCodigo: str
    Practica: str
    Rubro: str
    PrecioFijado: float
    PrecioNomenclador: float
    DiferenciaUnit: float
    CantidadAnual: float
    OportunidadAnual: float

@router.get("/precio", response_model=List[OportunidadPrecioItem])
def get_oportunidades_precio(
    db: pyodbc.Connection = Depends(get_db)
):
    """
    Detecta oportunidades de negociación basadas en precios bajos comparados con el mercado.
    """
    cursor = db.cursor()
    try:
        cursor.execute(oportunidades_queries.QUERY_O1_OPORTUNIDADES_PRECIO)
        
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
            
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

@router.get("/modalidad", response_model=List[OportunidadModalidadItem])
def get_oportunidades_modalidad(
    db: pyodbc.Connection = Depends(get_db)
):
    """
    Detecta oportunidades de cambio de modalidad (Fijado -> Nomenclador).
    """
    cursor = db.cursor()
    try:
        cursor.execute(oportunidades_queries.QUERY_O2_OPORTUNIDADES_MODALIDAD)
        
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
            
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
