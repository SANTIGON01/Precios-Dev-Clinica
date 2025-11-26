# R1: Reporte Detallado de Negociación
QUERY_R1_REPORTE_NEGOCIACION = """
SELECT 
    P.OSCodigo,
    A.ArDescripcion AS ObraSocial,
    LTRIM(RTRIM(P.NNCodigo)) AS NNCodigo,
    N.NNAbreviada AS Practica,
    R.RUDescripcion AS Rubro,
    P.SubTpoCod,
    
    -- Precios
    ISNULL(P.PrcFHono, 0) AS Honorarios,
    ISNULL(P.PrcFGast, 0) AS Gastos,
    ISNULL(P.PrcFHono, 0) + ISNULL(P.PrcFGast, 0) AS PrecioTotal,
    P.PrcFEsImporte AS TipoPrecio,
    
    -- Coeficientes (si aplica)
    ISNULL(ALH.ArCoef, 0) AS CoefHonorarios,
    ISNULL(ALG.ArCoef, 0) AS CoefGastos,
    
    -- Uso (si se solicita)
    ISNULL(U.CantidadAnual, 0) AS CantidadAnual,
    ISNULL(U.FacturacionAnual, 0) AS FacturacionAnual

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
        
    LEFT JOIN (
        SELECT 
            P1.PrCObraSocial,
            LTRIM(RTRIM(P1.PrDPractica)) AS NNCodigo,
            SUM(P1.PrDCantidad) AS CantidadAnual,
            SUM(P1.PrDImpPractica) AS FacturacionAnual
        FROM PRACTIC1 P1 WITH(NOLOCK)
        WHERE P1.PrDEstado = ' ' AND P1.PrDFechaPrac >= DATEADD(year, -1, GETDATE())
        GROUP BY P1.PrCObraSocial, LTRIM(RTRIM(P1.PrDPractica))
    ) U ON U.PrCObraSocial = P.OSCodigo AND U.NNCodigo = P.NNCodigo

WHERE 
    P.OSCodigo = ?
    AND P.PrcFVig = (SELECT MAX(PrcFVig) FROM PRECIOSVIG WHERE OSCodigo = P.OSCodigo AND NNCodigo = P.NNCodigo)
    AND A.ArEstado = 'A'
    AND (? IS NULL OR R.RUCodigo = ?) -- Filtro opcional por rubro

ORDER BY 
    R.RUDescripcion, N.NNAbreviada;
"""
