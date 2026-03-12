from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Boolean
from app.database import Base
import enum

class RolEnum(str, enum.Enum):
    ADMIN_GENERAL = "ADMIN_GENERAL"
    ADMIN_LOCAL = "ADMIN_LOCAL"
    GESTIONADOR = "GESTIONADOR"
    RADICADOR = "RADICADOR"


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre_completo = Column(String(150), nullable=False)
    cedula = Column(String(20), unique=True, nullable=False)
    correo = Column(String(150), unique=True, nullable=False)
    rol = Column(Enum(RolEnum))
    sede_id = Column(Integer, ForeignKey("sedes.id"))
    password_hash = Column(String(255))
    debe_cambiar_password = Column(Boolean, default=True)  # 1 para True, 0 para False