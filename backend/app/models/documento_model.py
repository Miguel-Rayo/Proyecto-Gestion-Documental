# Nuevo gemini

from sqlalchemy import Column, Integer, String, Enum, ForeignKey, TIMESTAMP, LargeBinary, Text
from sqlalchemy.sql import func
from app.database import Base

class Documento(Base):
    __tablename__ = "documentos"

    id = Column(Integer, primary_key=True, index=True)
    numero_radicado = Column(String(30), unique=True, nullable=False)
    nombre = Column(String(200), nullable=False)
    archivo = Column(LargeBinary, nullable=False) # Representa el LONGBLOB
    fecha_creacion = Column(TIMESTAMP, server_default=func.now())
    fecha_ultima_gestion = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    estado = Column(Enum('RADICADO','TRASLADADO','ACEPTADO','FINALIZADO'), default='RADICADO', nullable=False)
    usuario_radicador = Column(Integer, ForeignKey("usuarios.id"))
    usuario_responsable = Column(Integer, ForeignKey("usuarios.id"), nullable=True)


class DocumentoComentario(Base):
    __tablename__ = "documentos_comentarios"

    id = Column(Integer, primary_key=True, index=True)
    documento_id = Column(Integer, ForeignKey("documentos.id"), nullable=False)
    usuario_emisor = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    usuario_receptor = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    comentario = Column(Text, nullable=True)  # NULL cuando es solo movimiento de trazabilidad
    fecha = Column(TIMESTAMP, server_default=func.now())