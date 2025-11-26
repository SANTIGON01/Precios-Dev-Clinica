# D1: KPIs Generales
QUERY_D1_KPIS_GENERALES = """
SELECT 
    -- Total Facturado (Año actual)
    (SELECT SUM(PrDImpPractica) 
     FROM PRACTIC1 WITH(NOLOCK) 
     WHERE PrDEstado = ' ' AND PrDFechaPrac >= DATEFROMPARTS(YEAR(GETDATE()), 1, 1)) AS FacturacionAnual,
     
    -- Total Facturado (Mes actual)
    (SELECT SUM(PrDImpPractica) 
     FROM PRACTIC1 WITH(NOLOCK) 
     WHERE PrDEstado = ' ' AND PrDFechaPrac >= DATEADD(month, DATEDIFF(month, 0, GETDATE()), 0)) AS FacturacionMensual,
     
    -- Variación Mensual (vs mes anterior)
    (
        SELECT 
            (SUM(CASE WHEN PrDFechaPrac >= DATEADD(month, DATEDIFF(month, 0, GETDATE()), 0) THEN PrDImpPractica ELSE 0 END) -
             SUM(CASE WHEN PrDFechaPrac >= DATEADD(month, DATEDIFF(month, 0, GETDATE())-1, 0) 
                           AND PrDFechaPrac < DATEADD(month, DATEDIFF(month, 0, GETDATE()), 0) THEN PrDImpPractica ELSE 0 END))
            * 100.0 / NULLIF(SUM(CASE WHEN PrDFechaPrac >= DATEADD(month, DATEDIFF(month, 0, GETDATE())-1, 0) 
                                           AND PrDFechaPrac < DATEADD(month, DATEDIFF(month, 0, GETDATE()), 0) THEN PrDImpPractica ELSE 0 END), 0)
        FROM PRACTIC1 WITH(NOLOCK)
        WHERE PrDEstado = ' ' AND PrDFechaPrac >= DATEADD(month, DATEDIFF(month, 0, GETDATE())-1, 0)
    ) AS VariacionMensual,
    
    -- Oportunidades Detectadas (Estimado)
    (
        -- Suma simple de oportunidades por precio (top 50)
        SELECT SUM(OportunidadAnual) FROM (
            SELECT TOP 50
                (AVG(PM.PrecioPromedioMercado) - AVG(MP.PrecioPromedioPagado)) * SUM(MP.CantidadAnual) AS OportunidadAnual
            FROM (
                SELECT 
                    P.PrCObraSocial, LTRIM(RTRIM(P1.PrDPractica)) AS NNCodigo,
                    SUM(P1.PrDCantidad) AS CantidadAnual,
                    AVG(P1.PrDImpPractica / NULLIF(P1.PrDCantidad, 0)) AS PrecioPromedioPagado
                FROM PRACTIC1 P1 WITH(NOLOCK)
                    INNER JOIN PRACTICAS P WITH(NOLOCK) ON P1.PrCNumero = P.PrCNumero
                WHERE P1.PrDEstado = ' ' AND P1.PrDFechaPrac >= DATEADD(year, -1, GETDATE())
                GROUP BY P.PrCObraSocial, LTRIM(RTRIM(P1.PrDPractica))
            ) MP
            CROSS APPLY (
                SELECT AVG(PrecioPromedioPagado) AS PrecioPromedioMercado
                FROM (
                    SELECT AVG(P1.PrDImpPractica / NULLIF(P1.PrDCantidad, 0)) AS PrecioPromedioPagado
                    FROM PRACTIC1 P1 WITH(NOLOCK)
                    WHERE LTRIM(RTRIM(P1.PrDPractica)) = MP.NNCodigo 
                        AND P1.PrDEstado = ' ' AND P1.PrDFechaPrac >= DATEADD(year, -1, GETDATE())
                    GROUP BY P1.PrCObraSocial
                ) X
            ) PM
            WHERE MP.PrecioPromedioPagado < PM.PrecioPromedioMercado
            GROUP BY MP.NNCodigo
        ) T
    ) AS OportunidadTotalAnual
"""

# D2: Top 5 Obras Sociales por Facturación
QUERY_D2_TOP_OS = """
SELECT TOP 5
    A.ArDescripcion AS ObraSocial,
    SUM(P1.PrDImpPractica) AS Facturacion,
    COUNT(DISTINCT P1.PrCNumero) AS Ordenes
FROM PRACTIC1 P1 WITH(NOLOCK)
    INNER JOIN PRACTICAS P WITH(NOLOCK) ON P1.PrCNumero = P.PrCNumero
    INNER JOIN ARANCELES A WITH(NOLOCK) ON A.ArCodigo = CAST(P.PrCObraSocial AS VARCHAR(10))
WHERE 
    P1.PrDEstado = ' ' 
    AND P1.PrDFechaPrac >= DATEADD(year, -1, GETDATE())
    AND A.ArEstado = 'A'
GROUP BY A.ArDescripcion
ORDER BY Facturacion DESC
"""

# D3: Evolución Mensual (Últimos 12 meses)
QUERY_D3_EVOLUCION_MENSUAL = """
SELECT 
    YEAR(P1.PrDFechaPrac) AS Anio,
    MONTH(P1.PrDFechaPrac) AS Mes,
    SUM(P1.PrDImpPractica) AS Facturacion
FROM PRACTIC1 P1 WITH(NOLOCK)
WHERE 
    P1.PrDEstado = ' ' 
    AND P1.PrDFechaPrac >= DATEADD(year, -1, GETDATE())
GROUP BY YEAR(P1.PrDFechaPrac), MONTH(P1.PrDFechaPrac)
ORDER BY Anio, Mes
"""
