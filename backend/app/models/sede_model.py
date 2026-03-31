from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Sede(Base):
    __tablename__ = "sedes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150))
    direccion = Column(String(200))
    codigo_postal = Column(String(10))
    ciudad = Column(String(100))
    departamento = Column(String(100))

class Area(Base):
    __tablename__ = "areas"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)

class SedeArea(Base):
    __tablename__ = "sedes_areas"

    id_sede = Column(Integer, ForeignKey("sedes.id"), primary_key=True)
    id_area = Column(Integer, ForeignKey("areas.id"), primary_key=True)