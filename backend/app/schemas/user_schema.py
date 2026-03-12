from pydantic import BaseModel, EmailStr
from enum import Enum
from typing import Optional


class RolEnum(str, Enum):
    ADMIN_GENERAL = "ADMIN_GENERAL"
    ADMIN_LOCAL = "ADMIN_LOCAL"
    GESTIONADOR = "GESTIONADOR"
    RADICADOR = "RADICADOR"


class UserCreate(BaseModel):
    nombre_completo: str
    cedula: str
    correo: EmailStr
    rol: RolEnum
    sede_id: Optional[int]

class LoginSchema(BaseModel):
    cedula: str
    password: str

class ChangePasswordSchema(BaseModel):
    user_id: int
    password: str