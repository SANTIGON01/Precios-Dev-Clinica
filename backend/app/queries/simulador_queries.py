# S1: Impacto de Cambio de Coeficiente
# S1: Impacto de Cambio de Coeficiente
QUERY_S1_IMPACTO_COEFICIENTE = """
WITH PracticasAfectadas AS (
    -- Obtener todas las prácticas que usan esta unidad
    SELECT 
        P.OSCodigo,
        P.NNCodigo,
        N.NNAbreviada AS Practica,
        P.SubTpoCod,
        P.PrcFEsImporte AS TipoPrecio,
        
        -- Unidades base
        N.NNHonEspec + (N.NNHonAyudante * N.NNCantAyudantes) + N.NNHonPerfus AS UnidadesHonorarios,
        N.NNGastos AS UnidadesGastos,
        
        T.TUHonorarios,
        T.TUGastos,
        
        -- Coeficiente actual
        ISNULL(ALH.ArCoef, 0) AS CoefActualHon,
        ISNULL(ALG.ArCoef, 0) AS CoefActualGas,
        
        -- Precio actual
        ISNULL(P.PrcFHono, 0) + ISNULL(P.PrcFGast, 0) AS PrecioActual,
        
        -- Rubro
        R.RUDescripcion AS Rubro,
        
        ROW_NUMBER() OVER (PARTITION BY P.NNCodigo ORDER BY P.PrcFVig DESC) AS rn
        
    FROM PRECIOSVIG P WITH(NOLOCK)
        INNER JOIN NOMENCLADOR N WITH(NOLOCK) ON P.NNCodigo = N.NNCodigo
        INNER JOIN TIPOUNID T WITH(NOLOCK) ON T.TUCodigo = N.NNTipoUnidad
        INNER JOIN RUBROS R WITH(NOLOCK) ON R.RUCodigo = N.NNRuCodigo
        
        LEFT JOIN ARANCEL1 ALH WITH(NOLOCK) ON 
            ALH.ArCodigo = CAST(P.OSCodigo AS VARCHAR(10))
            AND P.NNCodigo BETWEEN ALH.ArPrIni AND ALH.ArPrFin
            AND ALH.SubTpoCod = P.SubTpoCod
            AND LTRIM(RTRIM(ALH.UACodigo)) = LTRIM(RTRIM(T.TUHonorarios))
        
        LEFT JOIN ARANCEL1 ALG WITH(NOLOCK) ON 
            ALG.ArCodigo = CAST(P.OSCodigo AS VARCHAR(10))
            AND P.NNCodigo BETWEEN ALG.ArPrIni AND ALG.ArPrFin
            AND ALG.SubTpoCod = P.SubTpoCod
            AND LTRIM(RTRIM(ALG.UACodigo)) = LTRIM(RTRIM(T.TUGastos))
    
    WHERE 
        P.OSCodigo = ?
        AND (
            LTRIM(RTRIM(T.TUHonorarios)) = ?
            OR LTRIM(RTRIM(T.TUGastos)) = ?
        )
),

TasaUsoActual AS (
    -- Obtener uso mensual de cada práctica
    SELECT 
        LTRIM(RTRIM(P1.PrDPractica)) AS NNCodigo,
        SUM(CASE WHEN P1.PrDFechaPrac >= DATEADD(month, -1, GETDATE()) 
                 THEN P1.PrDCantidad ELSE 0 END) AS UsoMesActual,
        AVG(P1.PrDCantidad) AS UsoPromedioMensual
    FROM PRACTIC1 P1 WITH(NOLOCK)
        INNER JOIN PRACTICAS P WITH(NOLOCK) ON P1.PrCNumero = P.PrCNumero
    WHERE 
        P.PrCObraSocial = ?
        AND P1.PrDEstado = ' '
        AND P1.PrDFechaPrac >= DATEADD(month, -3, GETDATE())
    GROUP BY LTRIM(RTRIM(P1.PrDPractica))
),

SimulacionCalculada AS (
    SELECT 
        PA.*,
        ISNULL(TU.UsoMesActual, 0) AS UsoMesActual,
        ISNULL(TU.UsoPromedioMensual, 0) AS UsoPromedioMensual,
        
        -- Calcular Precio Nuevo una sola vez
        CASE 
            WHEN PA.TUHonorarios = ?
            THEN (PA.UnidadesHonorarios * ?) + (PA.UnidadesGastos * PA.CoefActualGas)
            
            WHEN PA.TUGastos = ?
            THEN (PA.UnidadesHonorarios * PA.CoefActualHon) + (PA.UnidadesGastos * ?)
            
            ELSE PA.PrecioActual
        END AS PrecioNuevo
        
    FROM PracticasAfectadas PA
        LEFT JOIN TasaUsoActual TU ON TU.NNCodigo = PA.NNCodigo
    WHERE PA.rn = 1
)

SELECT 
    NNCodigo,
    Practica,
    Rubro,
    TipoPrecio,
    UnidadesHonorarios,
    UnidadesGastos,
    CoefActualHon,
    CoefActualGas,
    ? AS CoeficienteNuevo,
    PrecioActual,
    PrecioNuevo,
    
    -- Diferencia
    (PrecioNuevo - PrecioActual) AS DiferenciaPrecio,
    
    UsoMesActual,
    UsoPromedioMensual,
    
    -- Impacto económico
    (PrecioNuevo - PrecioActual) * UsoMesActual AS ImpactoMensual,
    (PrecioNuevo - PrecioActual) * UsoPromedioMensual * 12 AS ImpactoAnualProyectado

FROM SimulacionCalculada

ORDER BY ABS((PrecioNuevo - PrecioActual) * UsoMesActual) DESC;
"""

# S2: Simular Cambio de Tipo (S -> N)
QUERY_S2_CAMBIO_TIPO = """
WITH PracticaFijada AS (
    SELECT 
        P.OSCodigo,
        P.NNCodigo,
        N.NNAbreviada AS Practica,
        P.SubTpoCod,
        
        -- Precio fijado actual
        ISNULL(P.PrcFHono, 0) + ISNULL(P.PrcFGast, 0) AS PrecioFijadoActual,
        
        -- Unidades base
        N.NNHonEspec + (N.NNHonAyudante * N.NNCantAyudantes) + N.NNHonPerfus AS UnidadesHonorarios,
        N.NNGastos AS UnidadesGastos,
        
        T.TUHonorarios,
        T.TUGastos,
        
        -- Coeficientes actuales
        ISNULL(ALH.ArCoef, 0) AS CoefActualHon,
        ISNULL(ALG.ArCoef, 0) AS CoefActualGas,
        
        R.RUDescripcion AS Rubro
        
    FROM PRECIOSVIG P WITH(NOLOCK)
        INNER JOIN NOMENCLADOR N WITH(NOLOCK) ON P.NNCodigo = N.NNCodigo
        INNER JOIN TIPOUNID T WITH(NOLOCK) ON T.TUCodigo = N.NNTipoUnidad
        INNER JOIN RUBROS R WITH(NOLOCK) ON R.RUCodigo = N.NNRuCodigo
        
        LEFT JOIN ARANCEL1 ALH WITH(NOLOCK) ON 
            ALH.ArCodigo = CAST(P.OSCodigo AS VARCHAR(10))
            AND P.NNCodigo BETWEEN ALH.ArPrIni AND ALH.ArPrFin
            AND ALH.SubTpoCod = P.SubTpoCod
            AND LTRIM(RTRIM(ALH.UACodigo)) = LTRIM(RTRIM(T.TUHonorarios))
            AND LTRIM(RTRIM(T.TUHonorarios)) NOT IN ('', 'PESO')
        
        LEFT JOIN ARANCEL1 ALG WITH(NOLOCK) ON 
            ALG.ArCodigo = CAST(P.OSCodigo AS VARCHAR(10))
            AND P.NNCodigo BETWEEN ALG.ArPrIni AND ALG.ArPrFin
            AND ALG.SubTpoCod = P.SubTpoCod
            AND LTRIM(RTRIM(ALG.UACodigo)) = LTRIM(RTRIM(T.TUGastos))
            AND LTRIM(RTRIM(T.TUGastos)) NOT IN ('', 'PESO')
    
    WHERE 
        P.OSCodigo = ?
        AND P.NNCodigo = ?
        AND P.SubTpoCod = ?
        AND P.PrcFEsImporte = 'S'
        AND P.PrcFVig = (SELECT MAX(PrcFVig) FROM PRECIOSVIG WHERE OSCodigo = ? AND NNCodigo = ?)
),

TasaUso AS (
    SELECT 
        SUM(CASE WHEN P1.PrDFechaPrac >= DATEADD(month, -1, GETDATE()) 
                 THEN P1.PrDCantidad ELSE 0 END) AS UsoMesActual,
        AVG(CASE WHEN P1.PrDFechaPrac >= DATEADD(month, -3, GETDATE()) 
                 THEN P1.PrDCantidad ELSE NULL END) AS UsoPromedioMensual,
        SUM(CASE WHEN P1.PrDFechaPrac >= DATEADD(month, -12, GETDATE()) 
                 THEN P1.PrDCantidad ELSE 0 END) AS UsoUltimos12Meses
    FROM PRACTIC1 P1 WITH(NOLOCK)
        INNER JOIN PRACTICAS P WITH(NOLOCK) ON P1.PrCNumero = P.PrCNumero
    WHERE 
        P.PrCObraSocial = ?
        AND LTRIM(RTRIM(P1.PrDPractica)) = ?
        AND P1.PrDEstado = ' '
        AND P1.PrDFechaPrac >= DATEADD(month, -12, GETDATE())
)

SELECT 
    PF.NNCodigo,
    PF.Practica,
    PF.Rubro,
    
    -- Precio actual (fijado)
    PF.PrecioFijadoActual,
    
    -- Precio si fuera nomenclador
    (PF.UnidadesHonorarios * PF.CoefActualHon) + (PF.UnidadesGastos * PF.CoefActualGas) AS PrecioSiNomenclador,
    
    -- Diferencia (ahorro si es positivo)
    ((PF.UnidadesHonorarios * PF.CoefActualHon) + (PF.UnidadesGastos * PF.CoefActualGas)) - PF.PrecioFijadoActual AS DiferenciaPorProcedimiento,
    
    -- Porcentaje de diferencia
    CASE 
        WHEN PF.PrecioFijadoActual > 0
        THEN ROUND(
            (((PF.UnidadesHonorarios * PF.CoefActualHon) + (PF.UnidadesGastos * PF.CoefActualGas)) - PF.PrecioFijadoActual) * 100.0 / PF.PrecioFijadoActual
        , 2)
        ELSE NULL
    END AS PorcentajeDiferencia,
    
    -- Tasa de uso
    ISNULL(TU.UsoMesActual, 0) AS UsoMesActual,
    ISNULL(TU.UsoPromedioMensual, 0) AS UsoPromedioMensual,
    ISNULL(TU.UsoUltimos12Meses, 0) AS UsoUltimos12Meses,
    
    -- Impacto económico
    (((PF.UnidadesHonorarios * PF.CoefActualHon) + (PF.UnidadesGastos * PF.CoefActualGas)) - PF.PrecioFijadoActual) * ISNULL(TU.UsoMesActual, 0) AS AhorroMensualProyectado,
    
    (((PF.UnidadesHonorarios * PF.CoefActualHon) + (PF.UnidadesGastos * PF.CoefActualGas)) - PF.PrecioFijadoActual) * ISNULL(TU.UsoPromedioMensual, 0) * 12 AS AhorroAnualProyectado,
    
    -- Recomendación
    CASE 
        WHEN ((PF.UnidadesHonorarios * PF.CoefActualHon) + (PF.UnidadesGastos * PF.CoefActualGas)) > PF.PrecioFijadoActual
             AND ISNULL(TU.UsoMesActual, 0) > 50
        THEN 'URGENTE: Cambiar a Nomenclador inmediatamente'
        
        WHEN ((PF.UnidadesHonorarios * PF.CoefActualHon) + (PF.UnidadesGastos * PF.CoefActualGas)) > PF.PrecioFijadoActual
             AND ISNULL(TU.UsoMesActual, 0) > 20
        THEN 'RECOMENDADO: Cambiar a Nomenclador'
        
        WHEN ((PF.UnidadesHonorarios * PF.CoefActualHon) + (PF.UnidadesGastos * PF.CoefActualGas)) > PF.PrecioFijadoActual
        THEN 'CONSIDERAR: Cambiar a Nomenclador'
        
        ELSE 'MANTENER: Precio fijado es mejor'
    END AS Recomendacion

FROM PracticaFijada PF
    CROSS JOIN TasaUso TU;
"""

# S3: Simular Múltiples Cambios
# Note: This query uses a temp table #Escenarios which is tricky with simple execution.
# We will implement the logic by iterating in Python or constructing a large query dynamically.
# For simplicity in this iteration, we will implement S3 logic in Python by calling S1 logic multiple times or similar.
# Or we can use a Table Valued Parameter if supported, but standard pyodbc usually prefers simple queries.
# We will skip the complex temp table SQL for S3 and handle it in the application layer for now.
