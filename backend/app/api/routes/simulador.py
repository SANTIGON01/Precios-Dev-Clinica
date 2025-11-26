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
        # Params order in QUERY_S1_IMPACTO_COEFICIENTE:
        # 1. OSCodigo (WHERE clause)
        # 2. TUHonorarios (WHERE clause)
        # 3. TUGastos (WHERE clause)
        # 4. PrCObraSocial (TasaUsoActual subquery)
        # 5. CoeficienteNuevo (SELECT list)
        # 6. TUHonorarios (CASE WHEN)
        # 7. CoeficienteNuevo (CASE WHEN)
        # 8. TUGastos (CASE WHEN)
        # 9. CoeficienteNuevo (CASE WHEN)
        # ... and so on.
        
        # This is error prone with ? placeholders.
        # Ideally we should use named parameters if pyodbc supports it well, or careful ordering.
        # Let's count them carefully.
        
        # 1. P.OSCodigo = ?
        # 2. LTRIM(RTRIM(T.TUHonorarios)) = ?
        # 3. LTRIM(RTRIM(T.TUGastos)) = ?
        # 4. P.PrCObraSocial = ?
        # 5. ? AS CoeficienteNuevo
        # 6. PA.TUHonorarios = ?
        # 7. PA.UnidadesHonorarios * ?
        # 8. PA.TUGastos = ?
        # 9. PA.UnidadesGastos * ?
        # 10. PA.TUHonorarios = ?
        # 11. PA.UnidadesHonorarios * ?
        # 12. PA.TUGastos = ?
        # 13. PA.UnidadesGastos * ?
        # 14. PA.TUHonorarios = ?
        # 15. PA.UnidadesHonorarios * ?
        # 16. PA.TUGastos = ?
        # 17. PA.UnidadesGastos * ?
        # 18. PA.TUHonorarios = ?
        # 19. PA.UnidadesHonorarios * ?
        # 20. PA.TUGastos = ?
        # 21. PA.UnidadesGastos * ?
        # 22. PA.TUHonorarios = ?
        # 23. PA.UnidadesHonorarios * ?
        # 24. PA.TUGastos = ?
        # 25. PA.UnidadesGastos * ?
        
        params = [
            os_codigo, unidad, unidad, os_codigo,
            coeficiente_nuevo,
            unidad, coeficiente_nuevo, unidad, coeficiente_nuevo,
            unidad, coeficiente_nuevo, unidad, coeficiente_nuevo,
            unidad, coeficiente_nuevo, unidad, coeficiente_nuevo,
            unidad, coeficiente_nuevo, unidad, coeficiente_nuevo,
            unidad, coeficiente_nuevo, unidad, coeficiente_nuevo
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
