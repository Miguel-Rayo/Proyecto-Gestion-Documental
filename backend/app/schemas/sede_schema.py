from pydantic import BaseModel
from typing import Optional, List


class SedeCreateSchema(BaseModel):
    nombre: str
    direccion: str
    codigo_postal: Optional[str] = None
    ciudad: str
    departamento: str
    areas: Optional[List[str]] = None  # nombres de áreas a asignar al crear


class SedeUpdateSchema(BaseModel):
    nombre: Optional[str] = None
    direccion: Optional[str] = None
    codigo_postal: Optional[str] = None
    ciudad: Optional[str] = None
    departamento: Optional[str] = None
    areas: Optional[List[str]] = None  # None = no tocar áreas, [] = quitar todas