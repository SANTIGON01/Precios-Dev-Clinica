from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
from app.services.database import get_db
from app.queries import simulador_queries
import pyodbc

router = APIRouter()

class SimulacionCoeficienteResponse(BaseModel):
    NNCodigo: str
    Practica: str
    Rubro: str
    TipoPrecio: str
    UnidadesHonorarios: float
    UnidadesGastos: float
    CoefActualHon: float
    CoefActualGas: float
    CoeficienteNuevo: float
    PrecioActual: float
    PrecioNuevo: float
    DiferenciaPrecio: float
    UsoMesActual: float
    UsoPromedioMensual: float
    ImpactoMensual: float
    ImpactoAnualProyectado: float

class SimulacionCambioTipoResponse(BaseModel):
    NNCodigo: str
    Practica: str
    Rubro: str
    PrecioFijadoActual: float
    PrecioSiNomenclador: float
    DiferenciaPorProcedimiento: float
    PorcentajeDiferencia: Optional[float]
    UsoMesActual: float
    UsoPromedioMensual: float
    UsoUltimos12Meses: float
    AhorroMensualProyectado: float
    AhorroAnualProyectado: float
    Recomendacion: str

@router.get("/coeficiente", response_model=List[SimulacionCoeficienteResponse])
def simular_cambio_coeficiente(
    os_codigo: int,
    unidad: str,
    coeficiente_nuevo: float,
    db: pyodbc.Connection = Depends(get_db)
):
    """
    Simula el impacto de cambiar el coeficiente de una unidad (ej: GALQ) a un nuevo valor.
    """
    cursor = db.cursor()
    try:
        # The query has many placeholders for the same parameters.
        # We need to provide them in the correct order.
        # Params order in New QUERY_S1_IMPACTO_COEFICIENTE:
        # 1. OSCodigo (WHERE)
        # 2. TUHonorarios (WHERE)
        # 3. TUGastos (WHERE)
        # 4. PrCObraSocial (TasaUso)
        # 5. TUHonorarios (CASE WHEN)
        # 6. CoeficienteNuevo (CASE WHEN)
        # 7. TUGastos (CASE WHEN)
        # 8. CoeficienteNuevo (CASE WHEN)
        # 9. CoeficienteNuevo (SELECT list)
        
        params = [
            os_codigo, unidad, unidad, os_codigo,
            unidad, coeficiente_nuevo, unidad, coeficiente_nuevo,
            coeficiente_nuevo
        ]
        
        cursor.execute(simulador_queries.QUERY_S1_IMPACTO_COEFICIENTE, params)
        
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
            
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

@router.get("/cambio-tipo", response_model=List[SimulacionCambioTipoResponse])
def simular_cambio_tipo(
    os_codigo: int,
    nn_codigo: str,
    sub_tpo_cod: int = 1,
    db: pyodbc.Connection = Depends(get_db)
):
    """
    Simula el impacto de cambiar una práctica de tipo Fijado (S) a Nomenclador (N).
    """
    cursor = db.cursor()
    try:
        # Params order in QUERY_S2_CAMBIO_TIPO:
        # 1. OSCodigo
        # 2. NNCodigo
        # 3. SubTpoCod
        # 4. OSCodigo (subquery)
        # 5. NNCodigo (subquery)
        # 6. PrCObraSocial
        # 7. PrDPractica
        
        params = [
            os_codigo, nn_codigo, sub_tpo_cod, os_codigo, nn_codigo,
            os_codigo, nn_codigo
        ]
        
        cursor.execute(simulador_queries.QUERY_S2_CAMBIO_TIPO, params)
        
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
            
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
