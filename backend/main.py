from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import historico, simulador, comparador, oportunidades, reportes, dashboard

app = FastAPI(
    title="Sistema de Análisis y Negociación de Precios",
    description="API para análisis, simulación y negociación de precios de prácticas médicas",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(historico.router, prefix="/api/v1/historico", tags=["historico"])
app.include_router(simulador.router, prefix="/api/v1/simulador", tags=["simulador"])
app.include_router(comparador.router, prefix="/api/v1/comparador", tags=["comparador"])
app.include_router(oportunidades.router, prefix="/api/v1/oportunidades", tags=["oportunidades"])
app.include_router(reportes.router, prefix="/api/v1/reportes", tags=["reportes"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Pricing Analysis System API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
