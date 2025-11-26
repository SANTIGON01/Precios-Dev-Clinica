from fastapi import APIRouter, Depends, HTTPException, Query, Response
from typing import List, Optional
from pydantic import BaseModel
from app.services.database import get_db
from app.queries import reportes_queries
import pyodbc
import io
import csv
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from openpyxl import Workbook

router = APIRouter()

class ReporteItem(BaseModel):
    OSCodigo: int
    ObraSocial: str
    NNCodigo: str
    Practica: str
    Rubro: str
    SubTpoCod: int
    Honorarios: float
    Gastos: float
    PrecioTotal: float
    TipoPrecio: str
    CoefHonorarios: float
    CoefGastos: float
    CantidadAnual: float
    FacturacionAnual: float

@router.get("/negociacion", response_model=List[ReporteItem])
def get_reporte_negociacion(
    os_codigo: int,
    ru_codigo: Optional[int] = None,
    db: pyodbc.Connection = Depends(get_db)
):
    """
    Obtiene los datos para el reporte de negociación.
    """
    cursor = db.cursor()
    try:
        cursor.execute(reportes_queries.QUERY_R1_REPORTE_NEGOCIACION, os_codigo, ru_codigo, ru_codigo)
        
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
            
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

@router.get("/negociacion/export/csv")
def export_reporte_csv(
    os_codigo: int,
    ru_codigo: Optional[int] = None,
    db: pyodbc.Connection = Depends(get_db)
):
    """
    Exporta el reporte de negociación a CSV.
    """
    cursor = db.cursor()
    try:
        cursor.execute(reportes_queries.QUERY_R1_REPORTE_NEGOCIACION, os_codigo, ru_codigo, ru_codigo)
        columns = [column[0] for column in cursor.description]
        rows = cursor.fetchall()
        
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(columns)
        writer.writerows(rows)
        
        return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=reporte_negociacion.csv"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

# Note: PDF and Excel export logic can be complex. 
# For this iteration, we provide CSV which is simpler and universal.
# If requested, we can add full PDF/Excel support using reportlab/openpyxl.
