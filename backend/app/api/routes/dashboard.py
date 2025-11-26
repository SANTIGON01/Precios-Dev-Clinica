from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.services.database import get_db
from app.queries import dashboard_queries
import pyodbc

router = APIRouter()

class KPIItem(BaseModel):
    FacturacionAnual: Optional[float]
    FacturacionMensual: Optional[float]
    VariacionMensual: Optional[float]
    OportunidadTotalAnual: Optional[float]

class TopOSItem(BaseModel):
    ObraSocial: str
    Facturacion: float
    Ordenes: int

class EvolucionMensualItem(BaseModel):
    Anio: int
    Mes: int
    Facturacion: float

@router.get("/kpis", response_model=KPIItem)
def get_kpis(db: pyodbc.Connection = Depends(get_db)):
    """
    Obtiene los KPIs generales del dashboard.
    """
    cursor = db.cursor()
    try:
        cursor.execute(dashboard_queries.QUERY_D1_KPIS_GENERALES)
        row = cursor.fetchone()
        if row:
            columns = [column[0] for column in cursor.description]
            return dict(zip(columns, row))
        return {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

@router.get("/top-os", response_model=List[TopOSItem])
def get_top_os(db: pyodbc.Connection = Depends(get_db)):
    """
    Obtiene el top 5 de obras sociales por facturación.
    """
    cursor = db.cursor()
    try:
        cursor.execute(dashboard_queries.QUERY_D2_TOP_OS)
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

@router.get("/evolucion", response_model=List[EvolucionMensualItem])
def get_evolucion_mensual(db: pyodbc.Connection = Depends(get_db)):
    """
    Obtiene la evolución mensual de facturación.
    """
    cursor = db.cursor()
    try:
        cursor.execute(dashboard_queries.QUERY_D3_EVOLUCION_MENSUAL)
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
