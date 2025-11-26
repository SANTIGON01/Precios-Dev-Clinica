# C1: Comparar Coeficientes entre Obras Sociales
QUERY_C1_COMPARAR_COEFICIENTES = """
SELECT 
    A.ArCodigo AS CodigoOS,
    A.ArDescripcion AS ObraSocial,
    A1.UACodigo AS Unidad,
    A1.SubTpoCod,
    A1.ArCoef AS Coeficiente,
    
    -- Comparación con promedio del mercado
    A1.ArCoef - AVG(A1.ArCoef) OVER (PARTITION BY A1.UACodigo, A1.SubTpoCod) AS DiferenciaVsPromedio,
    
    -- Porcentaje sobre promedio
    CASE 
        WHEN AVG(A1.ArCoef) OVER (PARTITION BY A1.UACodigo, A1.SubTpoCod) > 0
        THEN ROUND(
            (A1.ArCoef * 100.0 / AVG(A1.ArCoef) OVER (PARTITION BY A1.UACodigo, A1.SubTpoCod)) - 100
        , 2)
        ELSE NULL
    END AS PorcentajeSobrePromedio,
    
    -- Ranking
    DENSE_RANK() OVER (PARTITION BY A1.UACodigo, A1.SubTpoCod ORDER BY A1.ArCoef DESC) AS Ranking

FROM ARANCEL1 A1 WITH(NOLOCK)
    INNER JOIN ARANCELES A WITH(NOLOCK) ON A.ArCodigo = A1.ArCodigo

WHERE 
    A.ArEstado = 'A'
    AND A1.UACodigo IN ({unidades_list})  -- Ej: 'GALQ','UGQ','GALP','UGB'
    AND A1.SubTpoCod = ?
    AND A1.ArPrIni = 0  -- Coeficiente general (no por rango)

ORDER BY A1.UACodigo, A1.ArCoef DESC;
"""

# C2: Comparar Precio de una Práctica
QUERY_C2_COMPARAR_PRECIO = """
WITH PreciosActuales AS (
    SELECT 
        P.OSCodigo,
        A.ArDescripcion AS ObraSocial,
        P.NNCodigo,
        N.NNAbreviada AS Practica,
        P.SubTpoCod,
        P.PrcFEsImporte AS TipoPrecio,
        
        -- Precio total
        ISNULL(P.PrcFHono, 0) + ISNULL(P.PrcFGast, 0) AS PrecioTotal,
        
        -- Componentes
        P.PrcFHono AS Honorarios,
        P.PrcFGast AS Gastos,
        
        -- Nomenclador base
        N.NNHonEspec + (N.NNHonAyudante * N.NNCantAyudantes) + N.NNHonPerfus AS UnidadesHonorarios,
        N.NNGastos AS UnidadesGastos,
        
        T.TUHonorarios,
        T.TUGastos,
        
        -- Coeficientes actuales
        ALH.ArCoef AS CoefHonorarios,
        ALG.ArCoef AS CoefGastos,
        
        ROW_NUMBER() OVER (PARTITION BY P.OSCodigo ORDER BY P.PrcFVig DESC) AS rn
        
    FROM PRECIOSVIG P WITH(NOLOCK)
        INNER JOIN NOMENCLADOR N WITH(NOLOCK) ON P.NNCodigo = N.NNCodigo
        INNER JOIN TIPOUNID T WITH(NOLOCK) ON T.TUCodigo = N.NNTipoUnidad
        INNER JOIN ARANCELES A WITH(NOLOCK) ON A.ArCodigo = CAST(P.OSCodigo AS VARCHAR(10))
        
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
        P.NNCodigo = ?
        AND P.SubTpoCod = ?
        AND A.ArEstado = 'A'
),

TasaUsoPorOS AS (
    SELECT 
        P.PrCObraSocial AS OSCodigo,
        SUM(CASE WHEN P1.PrDFechaPrac >= DATEADD(month, -1, GETDATE()) 
                 THEN P1.PrDCantidad ELSE 0 END) AS UsoMesActual
    FROM PRACTIC1 P1 WITH(NOLOCK)
        INNER JOIN PRACTICAS P WITH(NOLOCK) ON P1.PrCNumero = P.PrCNumero
    WHERE 
        LTRIM(RTRIM(P1.PrDPractica)) = ?
        AND P1.PrDEstado = ' '
        AND P1.PrDFechaPrac >= DATEADD(month, -1, GETDATE())
    GROUP BY P.PrCObraSocial
)

SELECT 
    PA.OSCodigo,
    PA.ObraSocial,
    PA.TipoPrecio,
    
    -- Precio
    PA.PrecioTotal,
    PA.Honorarios,
    PA.Gastos,
    
    -- Comparación con otras OS
    PA.PrecioTotal - AVG(PA.PrecioTotal) OVER () AS DiferenciaVsPromedio,
    
    CASE 
        WHEN AVG(PA.PrecioTotal) OVER () > 0
        THEN ROUND(
            (PA.PrecioTotal * 100.0 / AVG(PA.PrecioTotal) OVER ()) - 100
        , 2)
        ELSE NULL
    END AS PorcentajeSobrePromedio,
    
    -- Máximo y mínimo del mercado
    MAX(PA.PrecioTotal) OVER () AS PrecioMaximoMercado,
    MIN(PA.PrecioTotal) OVER () AS PrecioMinimoMercado,
    
    -- Ranking
    DENSE_RANK() OVER (ORDER BY PA.PrecioTotal DESC) AS Ranking,
    
    -- Coeficientes
    PA.CoefHonorarios,
    PA.CoefGastos,
    PA.TUHonorarios AS UnidadHonorarios,
    PA.TUGastos AS UnidadGastos,
    
    -- Tasa de uso
    ISNULL(TU.UsoMesActual, 0) AS UsoMesActual,
    
    -- Categoría
    CASE 
        WHEN PA.PrecioTotal >= MAX(PA.PrecioTotal) OVER () * 0.9
        THEN 'TOP - Mejor pago'
        
        WHEN PA.PrecioTotal >= AVG(PA.PrecioTotal) OVER ()
        THEN 'MEDIO-ALTO'
        
        WHEN PA.PrecioTotal >= AVG(PA.PrecioTotal) OVER () * 0.8
        THEN 'MEDIO-BAJO'
        
        ELSE 'BAJO - Peor pago'
    END AS Categoria

FROM PreciosActuales PA
    LEFT JOIN TasaUsoPorOS TU ON TU.OSCodigo = PA.OSCodigo

WHERE PA.rn = 1

ORDER BY PA.PrecioTotal DESC;
"""

# C3: Mix de Facturación por OS
QUERY_C3_MIX_OS = """
WITH FacturacionPorOS AS (
    SELECT 
        P.PrCObraSocial AS OSCodigo,
        A.ArDescripcion AS ObraSocial,
        
        -- Volumen
        COUNT(DISTINCT P1.PrCNumero) AS CantidadOrdenes,
        COUNT(*) AS CantidadLineas,
        SUM(P1.PrDCantidad) AS CantidadPracticas,
        COUNT(DISTINCT LTRIM(RTRIM(P1.PrDPractica))) AS PracticasDistintas,
        
        -- Facturación
        SUM(P1.PrDImpPractica) AS FacturacionTotal,
        AVG(P1.PrDImpPractica) AS TicketPromedio,
        
        -- Facturación por categoría
        SUM(CASE WHEN R.RUCodigo IN (1,2,3) THEN P1.PrDImpPractica ELSE 0 END) AS Facturacion_CirugiaAlta,
        SUM(CASE WHEN R.RUCodigo IN (4,5,6) THEN P1.PrDImpPractica ELSE 0 END) AS Facturacion_Diagnostico

    FROM PRACTIC1 P1 WITH(NOLOCK)
        INNER JOIN PRACTICAS P WITH(NOLOCK) ON P1.PrCNumero = P.PrCNumero
        INNER JOIN ARANCELES A WITH(NOLOCK) ON A.ArCodigo = CAST(P.PrCObraSocial AS VARCHAR(10))
        LEFT JOIN NOMENCLADOR N WITH(NOLOCK) ON LTRIM(RTRIM(P1.PrDPractica)) = N.NNCodigo
        LEFT JOIN RUBROS R WITH(NOLOCK) ON R.RUCodigo = N.NNRuCodigo

    WHERE 
        P1.PrDEstado = ' '
        AND P1.PrDFechaPrac >= ?
        AND P1.PrDFechaPrac <= ?
        AND A.ArEstado = 'A'

    GROUP BY 
        P.PrCObraSocial,
        A.ArDescripcion
)

SELECT 
    OSCodigo,
    ObraSocial,
    
    -- Volumen
    CantidadOrdenes,
    CantidadLineas,
    CantidadPracticas,
    PracticasDistintas,
    
    -- Facturación
    FacturacionTotal,
    TicketPromedio,
    
    -- Participación
    FacturacionTotal * 100.0 / SUM(FacturacionTotal) OVER () AS PorcentajeFacturacionTotal,
    CantidadPracticas * 100.0 / SUM(CantidadPracticas) OVER () AS PorcentajeVolumenTotal,
    
    -- Rankings
    DENSE_RANK() OVER (ORDER BY FacturacionTotal DESC) AS RankingPorFacturacion,
    DENSE_RANK() OVER (ORDER BY CantidadPracticas DESC) AS RankingPorVolumen,
    DENSE_RANK() OVER (ORDER BY TicketPromedio DESC) AS RankingPorTicket,
    
    -- Categorización
    CASE 
        WHEN FacturacionTotal >= PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY FacturacionTotal) OVER ()
        THEN 'A - Alto valor'
        
        WHEN FacturacionTotal >= PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY FacturacionTotal) OVER ()
        THEN 'B - Medio valor'
        
        WHEN FacturacionTotal >= PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY FacturacionTotal) OVER ()
        THEN 'C - Bajo valor'
        
        ELSE 'D - Muy bajo valor'
    END AS Segmento

FROM FacturacionPorOS

ORDER BY FacturacionTotal DESC;
"""
