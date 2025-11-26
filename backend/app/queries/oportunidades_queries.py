# O1: Identificar Prácticas Mal Pagadas con Alto Volumen
QUERY_O1_OPORTUNIDADES_PRECIO = """
WITH MetricasPractica AS (
    SELECT 
        P.PrCObraSocial AS OSCodigo,
        A.ArDescripcion AS ObraSocial,
        LTRIM(RTRIM(P1.PrDPractica)) AS NNCodigo,
        
        -- Volumen
        SUM(P1.PrDCantidad) AS CantidadAnual,
        SUM(P1.PrDImpPractica) AS FacturacionAnual,
        
        -- Precio promedio real pagado
        AVG(P1.PrDImpPractica / NULLIF(P1.PrDCantidad, 0)) AS PrecioPromedioPagado
        
    FROM PRACTIC1 P1 WITH(NOLOCK)
        INNER JOIN PRACTICAS P WITH(NOLOCK) ON P1.PrCNumero = P.PrCNumero
        INNER JOIN ARANCELES A WITH(NOLOCK) ON A.ArCodigo = CAST(P.PrCObraSocial AS VARCHAR(10))
    
    WHERE 
        P1.PrDEstado = ' '
        AND P1.PrDFechaPrac >= DATEADD(year, -1, GETDATE())
        AND A.ArEstado = 'A'
        
    GROUP BY 
        P.PrCObraSocial,
        A.ArDescripcion,
        LTRIM(RTRIM(P1.PrDPractica))
),

PreciosMercado AS (
    SELECT 
        MP.NNCodigo,
        AVG(MP.PrecioPromedioPagado) AS PrecioPromedioMercado,
        MAX(MP.PrecioPromedioPagado) AS PrecioMaximoMercado,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY MP.PrecioPromedioPagado) OVER (PARTITION BY MP.NNCodigo) AS MedianaMercado
    FROM MetricasPractica MP
    GROUP BY MP.NNCodigo
)

SELECT TOP 50
    MP.OSCodigo,
    MP.ObraSocial,
    MP.NNCodigo,
    N.NNAbreviada AS Practica,
    R.RUDescripcion AS Rubro,
    
    -- Métricas
    MP.CantidadAnual,
    MP.FacturacionAnual,
    MP.PrecioPromedioPagado,
    
    -- Comparativa Mercado
    PM.PrecioPromedioMercado,
    PM.PrecioMaximoMercado,
    
    -- Diferencia (Oportunidad)
    PM.PrecioPromedioMercado - MP.PrecioPromedioPagado AS DiferenciaVsPromedio,
    (PM.PrecioPromedioMercado - MP.PrecioPromedioPagado) * MP.CantidadAnual AS OportunidadAnual,
    
    -- Score de Oportunidad (Volumen * Diferencia %)
    (MP.CantidadAnual * ((PM.PrecioPromedioMercado - MP.PrecioPromedioPagado) / NULLIF(MP.PrecioPromedioPagado, 0))) AS Score

FROM MetricasPractica MP
    INNER JOIN PreciosMercado PM ON PM.NNCodigo = MP.NNCodigo
    LEFT JOIN NOMENCLADOR N WITH(NOLOCK) ON N.NNCodigo = MP.NNCodigo
    LEFT JOIN RUBROS R WITH(NOLOCK) ON R.RUCodigo = N.NNRuCodigo

WHERE 
    MP.PrecioPromedioPagado < PM.PrecioPromedioMercado
    AND MP.CantidadAnual > 10 -- Filtro de ruido

ORDER BY 
    OportunidadAnual DESC;
"""

# O2: Oportunidades por Cambio de Modalidad (Fijado -> Nomenclador)
# Similar a S2 pero masivo para todas las prácticas de una OS
QUERY_O2_OPORTUNIDADES_MODALIDAD = """
WITH PracticasFijadas AS (
    SELECT 
        P.OSCodigo,
        A.ArDescripcion AS ObraSocial,
        P.NNCodigo,
        N.NNAbreviada AS Practica,
        R.RUDescripcion AS Rubro,
        
        -- Precio Fijado
        ISNULL(P.PrcFHono, 0) + ISNULL(P.PrcFGast, 0) AS PrecioFijado,
        
        -- Precio Nomenclador Teórico
        (
            (N.NNHonEspec + (N.NNHonAyudante * N.NNCantAyudantes) + N.NNHonPerfus) * ISNULL(ALH.ArCoef, 0)
        ) + (
            N.NNGastos * ISNULL(ALG.ArCoef, 0)
        ) AS PrecioNomenclador,
        
        -- Coeficientes usados
        ISNULL(ALH.ArCoef, 0) AS CoefHon,
        ISNULL(ALG.ArCoef, 0) AS CoefGas
        
    FROM PRECIOSVIG P WITH(NOLOCK)
        INNER JOIN NOMENCLADOR N WITH(NOLOCK) ON P.NNCodigo = N.NNCodigo
        INNER JOIN TIPOUNID T WITH(NOLOCK) ON T.TUCodigo = N.NNTipoUnidad
        INNER JOIN RUBROS R WITH(NOLOCK) ON R.RUCodigo = N.NNRuCodigo
        INNER JOIN ARANCELES A WITH(NOLOCK) ON A.ArCodigo = CAST(P.OSCodigo AS VARCHAR(10))
        
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
        P.PrcFEsImporte = 'S'
        AND P.PrcFVig = (SELECT MAX(PrcFVig) FROM PRECIOSVIG WHERE OSCodigo = P.OSCodigo AND NNCodigo = P.NNCodigo)
        AND A.ArEstado = 'A'
),

VolumenAnual AS (
    SELECT 
        P.PrCObraSocial AS OSCodigo,
        LTRIM(RTRIM(P1.PrDPractica)) AS NNCodigo,
        SUM(P1.PrDCantidad) AS CantidadAnual
    FROM PRACTIC1 P1 WITH(NOLOCK)
        INNER JOIN PRACTICAS P WITH(NOLOCK) ON P1.PrCNumero = P.PrCNumero
    WHERE 
        P1.PrDEstado = ' '
        AND P1.PrDFechaPrac >= DATEADD(year, -1, GETDATE())
    GROUP BY P.PrCObraSocial, LTRIM(RTRIM(P1.PrDPractica))
)

SELECT TOP 50
    PF.OSCodigo,
    PF.ObraSocial,
    PF.NNCodigo,
    PF.Practica,
    PF.Rubro,
    
    PF.PrecioFijado,
    PF.PrecioNomenclador,
    
    -- Diferencia
    PF.PrecioNomenclador - PF.PrecioFijado AS DiferenciaUnit,
    
    -- Volumen
    ISNULL(VA.CantidadAnual, 0) AS CantidadAnual,
    
    -- Oportunidad
    (PF.PrecioNomenclador - PF.PrecioFijado) * ISNULL(VA.CantidadAnual, 0) AS OportunidadAnual

FROM PracticasFijadas PF
    INNER JOIN VolumenAnual VA ON VA.OSCodigo = PF.OSCodigo AND VA.NNCodigo = PF.NNCodigo

WHERE 
    PF.PrecioNomenclador > PF.PrecioFijado
    AND ISNULL(VA.CantidadAnual, 0) > 0

ORDER BY 
    OportunidadAnual DESC;
"""
