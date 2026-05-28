# Nuevo gemini

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DocumentoUpdateSchema(BaseModel):
    nombre: str

class DocumentoResponseSchema(BaseModel):
    id: int
    numero_radicado: str
    nombre: str
    fecha_creacion: datetime
    fecha_ultima_gestion: datetime
    estado: str
    usuario_radicador: Optional[int]
    usuario_responsable: Optional[int]

    class Config:
        from_attributes = True





# Para cuando alguien envía o traslada un documento
class DocumentoEnvio(BaseModel):
    documento_id: int
    usuario_destinatario_id: int # El ID de la persona elegida en el panel

# Para cuando el gestionador finaliza la operación
class DocumentoFinalizar(BaseModel):
    documento_id: int
    comentario: str

# Para mostrar los destinatarios en el panel de selección
class DestinatarioOut(BaseModel):
    id: int
    nombre_completo: str
    rol: str
    sede_nombre: str
    area_nombre: str

    class Config:
        from_attributes = True


class ResponsablePreviewSchema(BaseModel):
    id: int
    cedula: str
    nombre: str
    rol: str
    sede: str


class DocumentoPreviewSchema(BaseModel):
    numero_radicado: str
    nombre_documento: str
    fecha_ultima_gestion: Optional[datetime]
    estado: str
    responsable: ResponsablePreviewSchema


class ReportePreviewResponse(BaseModel):
    total: int
    documentos: list[DocumentoPreviewSchema]