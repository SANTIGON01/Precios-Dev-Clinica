from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from datetime import date, timedelta
from app.services.database import get_db
from app.queries import historico_queries
from app.models import schemas
import pyodbc

router = APIRouter()

@router.get("/precios/{nn_codigo}", response_model=List[schemas.PrecioHistoricoItem])
def get_historial_precios(
    nn_codigo: str,
    os_codigo: int,
    sub_tpo_cod: int = 1, # Default to 1 if not specified, or make it required
    fecha_desde: date = Query(default=date.today() - timedelta(days=365)),
    fecha_hasta: date = Query(default=date.today()),
    db: pyodbc.Connection = Depends(get_db)
):
    """
    Obtiene el historial de precios de una práctica específica.
    """
    cursor = db.cursor()
    try:
        cursor.execute(
            historico_queries.QUERY_H1_PRECIO_HISTORICO,
            os_codigo,
            nn_codigo,
            sub_tpo_cod,
            fecha_desde,
            fecha_hasta
        )
        
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
            
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

@router.get("/coeficientes/{unidad}", response_model=List[schemas.CoeficienteHistoricoItem])
def get_historial_coeficientes(
    unidad: str,
    os_codigo: int,
    sub_tpo_cod: int = 1,
    fecha_desde: date = Query(default=date.today() - timedelta(days=365)),
    fecha_hasta: date = Query(default=date.today()),
    db: pyodbc.Connection = Depends(get_db)
):
    """
    Obtiene el historial de coeficientes de una unidad (ej: GALQ, UGQ).
    """
    cursor = db.cursor()
    try:
        cursor.execute(
            historico_queries.QUERY_H2_COEFICIENTES_HISTORICO,
            os_codigo,
            sub_tpo_cod,
            fecha_desde,
            fecha_hasta,
            unidad
        )
        
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
            
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

@router.get("/uso/{nn_codigo}", response_model=List[schemas.TasaUsoItem])
def get_historial_uso(
    nn_codigo: str,
    os_codigo: int,
    fecha_desde: date = Query(default=date.today() - timedelta(days=365)),
    fecha_hasta: date = Query(default=date.today()),
    db: pyodbc.Connection = Depends(get_db)
):
    """
    Obtiene el historial de tasa de uso (cantidad) de una práctica.
    """
    cursor = db.cursor()
    try:
        cursor.execute(
            historico_queries.QUERY_H3_TASA_USO,
            os_codigo,
            nn_codigo,
            fecha_desde,
            fecha_hasta
        )
        
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
            
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

@router.get("/facturacion/rubros", response_model=List[schemas.FacturacionRubroItem])
def get_facturacion_por_rubro(
    os_codigo: int,
    fecha_desde: date = Query(default=date.today() - timedelta(days=365)),
    fecha_hasta: date = Query(default=date.today()),
    db: pyodbc.Connection = Depends(get_db)
):
    """
    Obtiene el análisis de facturación agrupado por rubro/especialidad.
    """
    cursor = db.cursor()
    try:
        cursor.execute(
            historico_queries.QUERY_H4_FACTURACION_RUBRO,
            os_codigo,
            fecha_desde,
            fecha_hasta
        )
        
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
            
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

@router.get("/top-practicas", response_model=List[schemas.TopPracticaItem])
def get_top_practicas(
    os_codigo: int,
    top_n: int = 10,
    ordenar_por: str = 'combinado', # uso, facturacion, combinado
    fecha_desde: date = Query(default=date.today() - timedelta(days=365)),
    fecha_hasta: date = Query(default=date.today()),
    db: pyodbc.Connection = Depends(get_db)
):
    """
    Obtiene el ranking de prácticas más realizadas o facturadas.
    """
    cursor = db.cursor()
    try:
        # Format the query with the TOP N value since it can't be a parameter
        query = historico_queries.QUERY_H5_TOP_PRACTICAS.format(top_n=top_n)
        
        cursor.execute(
            query,
            os_codigo,
            fecha_desde,
            fecha_hasta,
            ordenar_por
        )
        
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
            
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
