import pyodbc
from typing import Generator
from app.core.config import settings

class Database:
    _connection_string = (
        f"DRIVER={settings.DB_DRIVER};"
        f"SERVER={settings.DB_SERVER};"
        f"DATABASE={settings.DB_NAME};"
        f"UID={settings.DB_USER};"
        f"PWD={settings.DB_PASSWORD}"
    )

    @classmethod
    def get_connection(cls):
        try:
            conn = pyodbc.connect(cls._connection_string)
            return conn
        except Exception as e:
            print(f"Error connecting to database: {e}")
            raise

def get_db() -> Generator:
    conn = None
    try:
        conn = Database.get_connection()
        yield conn
    finally:
        if conn:
            conn.close()
