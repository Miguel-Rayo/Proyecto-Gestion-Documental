# Añade este endpoint en tu router (por ejemplo en operacion.py o comentarios.py)
# Asegúrate de importar los modelos y la sesión de DB que ya uses en tu proyecto

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, aliased
from sqlalchemy import select
from typing import List
from datetime import datetime

# Ajusta estos imports según tu estructura de proyecto
from app.database import get_db
from app.models.user_model import Usuario
from app.models.documento_model import DocumentoComentario, Documento
from app.dependencies.auth_dependency import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/comentarios", tags=["comentarios"])


class ComentarioOut(BaseModel):
    id: int
    documento_id: int
    nombre_documento: str
    nombre_receptor: str
    comentario: str | None
    fecha: datetime

    class Config:
        from_attributes = True

@router.get("/mis-comentarios", response_model=List[ComentarioOut])
def get_mis_comentarios(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Retorna todos los comentarios donde el usuario autenticado
    es el receptor (usuario_receptor == current_user.id).
    """
    # Ahora el alias es para el Emisor (quien escribió el comentario)
    Emisor = aliased(Usuario)

    resultados = (
        db.query(
            DocumentoComentario.id,
            DocumentoComentario.documento_id,
            Documento.nombre.label("nombre_documento"),
            # Ahora queremos saber quién nos envió el comentario
            Emisor.nombre_completo.label("nombre_receptor"), 
            DocumentoComentario.comentario,
            DocumentoComentario.fecha,
        )
        .join(Documento, Documento.id == DocumentoComentario.documento_id)
        # Unimos con la tabla de usuarios basándonos en quien EMITIÓ el mensaje
        .join(Emisor, Emisor.id == DocumentoComentario.usuario_emisor)
        .filter(
            # CAMBIO CLAVE: Filtramos por receptor
            DocumentoComentario.usuario_receptor == current_user.id,
            DocumentoComentario.comentario.isnot(None)
        )
        .order_by(DocumentoComentario.fecha.desc())
        .all()
    )

    return [
        ComentarioOut(
            id=r.id,
            documento_id=r.documento_id,
            nombre_documento=r.nombre_documento,
            nombre_receptor=r.nombre_receptor, # Aquí aparecerá el nombre de quien te lo envió
            comentario=r.comentario,
            fecha=r.fecha,
        )
        for r in resultados
    ]