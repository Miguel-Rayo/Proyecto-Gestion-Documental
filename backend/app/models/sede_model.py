from sqlalchemy import Column, Integer, String
from app.database import Base

class Sede(Base):
    __tablename__ = "sedes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150))
    direccion = Column(String(200))
    codigo_postal = Column(String(10))
    ciudad = Column(String(100))
    departamento = Column(String(100))