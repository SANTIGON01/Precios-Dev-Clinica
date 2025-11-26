from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Sistema de Análisis y Negociación de Precios"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = ["http://localhost:5173", "http://localhost:3000"]

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    DB_SERVER: str = "localhost"
    DB_USER: str = "sa"
    DB_PASSWORD: str = "password"
    DB_NAME: str = "CLINICA"
    DB_DRIVER: str = "{ODBC Driver 17 for SQL Server}"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
