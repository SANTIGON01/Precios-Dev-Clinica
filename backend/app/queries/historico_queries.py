# H1: Historial de Precio de una Práctica
QUERY_H1_PRECIO_HISTORICO = """
SELECT 
    P.PrcFVig AS Fecha,
    P.PrcFEsImporte AS TipoPrecio,
    
    -- Precio guardado
    ISNULL(P.PrcFHono, 0) + ISNULL(P.PrcFGast, 0) AS PrecioTotal,
    P.PrcFHono AS Honorarios,
    P.PrcFGast AS Gastos,
    
    -- Cambio vs mes anterior
    LAG(ISNULL(P.PrcFHono, 0) + ISNULL(P.PrcFGast, 0)) 
        OVER (ORDER BY P.PrcFVig) AS PrecioAnterior,
    
    (ISNULL(P.PrcFHono, 0) + ISNULL(P.PrcFGast, 0)) - 
    LAG(ISNULL(P.PrcFHono, 0) + ISNULL(P.PrcFGast, 0)) 
        OVER (ORDER BY P.PrcFVig) AS DiferenciaPrecio,
    
    -- Porcentaje de cambio
    CASE 
        WHEN LAG(ISNULL(P.PrcFHono, 0) + ISNULL(P.PrcFGast, 0)) 
                OVER (ORDER BY P.PrcFVig) > 0
        THEN ROUND(
            ((ISNULL(P.PrcFHono, 0) + ISNULL(P.PrcFGast, 0)) - 
             LAG(ISNULL(P.PrcFHono, 0) + ISNULL(P.PrcFGast, 0)) 
                 OVER (ORDER BY P.PrcFVig)) * 100.0 /
            LAG(ISNULL(P.PrcFHono, 0) + ISNULL(P.PrcFGast, 0)) 
                OVER (ORDER BY P.PrcFVig)
        , 2)
        ELSE NULL
    END AS PorcentajeCambio

FROM PRECIOSVIG P WITH(NOLOCK)

WHERE 
    P.OSCodigo = ?
    AND P.NNCodigo = ?
    AND P.SubTpoCod = ?
    AND P.PrcFVig >= ?
    AND P.PrcFVig <= ?

ORDER BY P.PrcFVig ASC;
"""

# H2: Historial de Coeficientes de una Unidad
QUERY_H2_COEFICIENTES_HISTORICO = """
WITH CoeficientesRaw AS (
    -- Honorarios
    SELECT 
        P.PrcFVig AS Fecha,
        P.NNCodigo,
        T.TUHonorarios AS Unidad,
        CASE 
            WHEN (N.NNHonEspec + (N.NNHonAyudante * N.NNCantAyudantes) + N.NNHonPerfus) > 0
            THEN P.PrcFHono / (N.NNHonEspec + (N.NNHonAyudante * N.NNCantAyudantes) + N.NNHonPerfus)
            ELSE NULL
        END AS Coeficiente
    FROM PRECIOSVIG P WITH(NOLOCK)
        INNER JOIN NOMENCLADOR N WITH(NOLOCK) ON P.NNCodigo = N.NNCodigo
        INNER JOIN TIPOUNID T WITH(NOLOCK) ON T.TUCodigo = N.NNTipoUnidad
    WHERE 
        P.OSCodigo = ?
        AND P.SubTpoCod = ?
        AND P.PrcFEsImporte = 'N'
        AND P.PrcFVig >= ?
        AND P.PrcFVig <= ?
        AND LTRIM(RTRIM(T.TUHonorarios)) NOT IN ('', 'PESO')

    UNION ALL

    -- Gastos
    SELECT 
        P.PrcFVig AS Fecha,
        P.NNCodigo,
        T.TUGastos AS Unidad,
        CASE 
            WHEN N.NNGastos > 0
            THEN P.PrcFGast / N.NNGastos
            ELSE NULL
        END AS Coeficiente
    FROM PRECIOSVIG P WITH(NOLOCK)
        INNER JOIN NOMENCLADOR N WITH(NOLOCK) ON P.NNCodigo = N.NNCodigo
        INNER JOIN TIPOUNID T WITH(NOLOCK) ON T.TUCodigo = N.NNTipoUnidad
    WHERE 
        P.OSCodigo = ?
        AND P.SubTpoCod = ?
        AND P.PrcFEsImporte = 'N'
        AND P.PrcFVig >= ?
        AND P.PrcFVig <= ?
        AND LTRIM(RTRIM(T.TUGastos)) NOT IN ('', 'PESO')
)

SELECT 
    Fecha,
    Unidad,
    ROUND(AVG(Coeficiente), 2) AS CoeficientePromedio,
    ROUND(MIN(Coeficiente), 2) AS CoeficienteMinimo,
    ROUND(MAX(Coeficiente), 2) AS CoeficienteMaximo,
    COUNT(*) AS CantidadPracticas,
    
    -- Cambio vs mes anterior
    ROUND(AVG(Coeficiente) - LAG(AVG(Coeficiente)) OVER (ORDER BY Fecha), 2) AS Cambio,
    
    -- Porcentaje de cambio
    CASE 
        WHEN LAG(AVG(Coeficiente)) OVER (ORDER BY Fecha) > 0
        THEN ROUND(
            (AVG(Coeficiente) - LAG(AVG(Coeficiente)) OVER (ORDER BY Fecha)) * 100.0 /
            LAG(AVG(Coeficiente)) OVER (ORDER BY Fecha)
        , 2)
        ELSE NULL
    END AS PorcentajeCambio

FROM CoeficientesRaw
WHERE LTRIM(RTRIM(Unidad)) = ?
GROUP BY Fecha, Unidad
ORDER BY Fecha ASC;
"""

# H3: Historial de Tasa de Uso
QUERY_H3_TASA_USO = """
SELECT 
    YEAR(P1.PrDFechaPrac) AS Año,
    MONTH(P1.PrDFechaPrac) AS Mes,
    -- DATEFROMPARTS not always available in older SQL Server, using string concat or similar if needed, but assuming 2012+
    DATEFROMPARTS(YEAR(P1.PrDFechaPrac), MONTH(P1.PrDFechaPrac), 1) AS FechaMes,
    
    -- Métricas de uso
    COUNT(*) AS CantidadLineas,
    COUNT(DISTINCT P1.PrCNumero) AS CantidadOrdenes,
    SUM(P1.PrDCantidad) AS CantidadTotal,
    
    -- Métricas económicas
    SUM(P1.PrDImpPractica) AS TotalFacturado,
    AVG(P1.PrDImpPractica) AS PromedioFacturado,
    MIN(P1.PrDImpPractica) AS MinimoFacturado,
    MAX(P1.PrDImpPractica) AS MaximoFacturado,
    
    -- Crecimiento vs mes anterior
    SUM(P1.PrDCantidad) - LAG(SUM(P1.PrDCantidad)) 
        OVER (ORDER BY YEAR(P1.PrDFechaPrac), MONTH(P1.PrDFechaPrac)) AS CrecimientoCantidad,
    
    -- Crecimiento porcentual
    CASE 
        WHEN LAG(SUM(P1.PrDCantidad)) OVER (ORDER BY YEAR(P1.PrDFechaPrac), MONTH(P1.PrDFechaPrac)) > 0
        THEN ROUND(
            (SUM(P1.PrDCantidad) - LAG(SUM(P1.PrDCantidad)) 
                OVER (ORDER BY YEAR(P1.PrDFechaPrac), MONTH(P1.PrDFechaPrac))) * 100.0 /
            LAG(SUM(P1.PrDCantidad)) OVER (ORDER BY YEAR(P1.PrDFechaPrac), MONTH(P1.PrDFechaPrac))
        , 2)
        ELSE NULL
    END AS PorcentajeCrecimiento

FROM PRACTIC1 P1 WITH(NOLOCK)
    INNER JOIN PRACTICAS P WITH(NOLOCK) ON P1.PrCNumero = P.PrCNumero

WHERE 
    P.PrCObraSocial = ?
    AND LTRIM(RTRIM(P1.PrDPractica)) = ?
    AND P1.PrDEstado = ' '
    AND P1.PrDFechaPrac >= ?
    AND P1.PrDFechaPrac <= ?

GROUP BY 
    YEAR(P1.PrDFechaPrac),
    MONTH(P1.PrDFechaPrac)

ORDER BY Año, Mes;
"""

# H4: Análisis de Facturación por Rubro
QUERY_H4_FACTURACION_RUBRO = """
SELECT 
    YEAR(P1.PrDFechaPrac) AS Año,
    MONTH(P1.PrDFechaPrac) AS Mes,
    DATEFROMPARTS(YEAR(P1.PrDFechaPrac), MONTH(P1.PrDFechaPrac), 1) AS FechaMes,
    
    R.RUCodigo,
    R.RUDescripcion AS Rubro,
    
    -- Métricas
    COUNT(DISTINCT LTRIM(RTRIM(P1.PrDPractica))) AS CantidadPracticasDistintas,
    SUM(P1.PrDCantidad) AS CantidadTotal,
    SUM(P1.PrDImpPractica) AS FacturacionTotal,
    
    -- Participación sobre total
    SUM(P1.PrDImpPractica) * 100.0 / 
        SUM(SUM(P1.PrDImpPractica)) OVER (PARTITION BY YEAR(P1.PrDFechaPrac), MONTH(P1.PrDFechaPrac)) AS PorcentajeTotal,
    
    -- Ranking
    DENSE_RANK() OVER (
        PARTITION BY YEAR(P1.PrDFechaPrac), MONTH(P1.PrDFechaPrac) 
        ORDER BY SUM(P1.PrDImpPractica) DESC
    ) AS Ranking

FROM PRACTIC1 P1 WITH(NOLOCK)
    INNER JOIN PRACTICAS P WITH(NOLOCK) ON P1.PrCNumero = P.PrCNumero
    INNER JOIN NOMENCLADOR N WITH(NOLOCK) ON LTRIM(RTRIM(P1.PrDPractica)) = N.NNCodigo
    INNER JOIN RUBROS R WITH(NOLOCK) ON R.RUCodigo = N.NNRuCodigo

WHERE 
    P.PrCObraSocial = ?
    AND P1.PrDEstado = ' '
    AND P1.PrDFechaPrac >= ?
    AND P1.PrDFechaPrac <= ?

GROUP BY 
    YEAR(P1.PrDFechaPrac),
    MONTH(P1.PrDFechaPrac),
    R.RUCodigo,
    R.RUDescripcion

ORDER BY Año, Mes, FacturacionTotal DESC;
"""

# H5: Top Prácticas por Período
# Note: TOP parameter needs to be handled in python or string formatting as pyodbc params don't work for TOP
QUERY_H5_TOP_PRACTICAS = """
WITH Ranking AS (
    SELECT 
        LTRIM(RTRIM(P1.PrDPractica)) AS NNCodigo,
        N.NNAbreviada AS Practica,
        R.RUDescripcion AS Rubro,
        
        SUM(P1.PrDCantidad) AS CantidadTotal,
        SUM(P1.PrDImpPractica) AS FacturacionTotal,
        COUNT(DISTINCT P1.PrCNumero) AS CantidadOrdenes,
        AVG(P1.PrDImpPractica) AS PromedioPrecio,
        
        DENSE_RANK() OVER (ORDER BY SUM(P1.PrDCantidad) DESC) AS RankingPorUso,
        DENSE_RANK() OVER (ORDER BY SUM(P1.PrDImpPractica) DESC) AS RankingPorFacturacion

    FROM PRACTIC1 P1 WITH(NOLOCK)
        INNER JOIN PRACTICAS P WITH(NOLOCK) ON P1.PrCNumero = P.PrCNumero
        INNER JOIN NOMENCLADOR N WITH(NOLOCK) ON LTRIM(RTRIM(P1.PrDPractica)) = N.NNCodigo
        INNER JOIN RUBROS R WITH(NOLOCK) ON R.RUCodigo = N.NNRuCodigo

    WHERE 
        P.PrCObraSocial = ?
        AND P1.PrDEstado = ' '
        AND P1.PrDFechaPrac >= ?
        AND P1.PrDFechaPrac <= ?

    GROUP BY 
        LTRIM(RTRIM(P1.PrDPractica)),
        N.NNAbreviada,
        R.RUDescripcion
)

SELECT TOP {top_n}
    NNCodigo,
    Practica,
    Rubro,
    CantidadTotal,
    FacturacionTotal,
    CantidadOrdenes,
    PromedioPrecio,
    RankingPorUso,
    RankingPorFacturacion,
    
    -- Score combinado (uso + facturación)
    (RankingPorUso * 0.6 + RankingPorFacturacion * 0.4) AS ScoreCombinado

FROM Ranking

ORDER BY 
    CASE ?
        WHEN 'uso' THEN RankingPorUso
        WHEN 'facturacion' THEN RankingPorFacturacion
        ELSE (RankingPorUso * 0.6 + RankingPorFacturacion * 0.4)
    END;
"""
