# Nuevo gemini

from fastapi import APIRouter, Depends, UploadFile, File, Response, HTTPException
from sqlalchemy.orm import Session
from typing import List
import mimetypes

from app.database import get_db
from app.schemas.documento_schema import DocumentoResponseSchema, DocumentoUpdateSchema
from app.services import documento_service
from app.dependencies.auth_dependency import get_current_user
from app.dependencies.role_checker import require_roles # require_roles
from app.models.documento_model import Documento
from app.models.user_model import Usuario  # Necesario para filtrar por sede

router = APIRouter(prefix="/documentos", tags=["Documentos"])

# Definimos los permisos de escritura (quiénes pueden subir documentos)
permiso_escritura = require_roles(["ADMIN_GENERAL", "ADMIN_LOCAL", "RADICADOR"])

@router.post("/subir", response_model=DocumentoResponseSchema)
async def upload_file(
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user) # Quitamos la dependencia externa temporalmente
):
    """
    Sube un archivo y genera su radicado único.
    Validamos el permiso aquí mismo para evitar conflictos con el ADMIN_GENERAL.
    """
    # 1. Definimos los roles permitidos
    roles_permitidos = ["ADMIN_GENERAL", "ADMIN_LOCAL", "RADICADOR"]
    
    # 2. Verificamos el rol (convertimos a mayúsculas para evitar errores de dedo)
    if current_user.rol.upper() not in roles_permitidos:
        raise HTTPException(
            status_code=403, 
            detail=f"El rol {current_user.rol} no tiene permisos para radicar documentos."
        )

    # 3. Procedemos con el servicio
    return await documento_service.subir_documento(
        db, archivo, current_user.id, current_user.sede_id
    )

@router.get("/", response_model=List[DocumentoResponseSchema])
def list_documents(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Lista los documentos basándose en la jerarquía del usuario:
    - ADMIN_GENERAL: Ve absolutamente todo.
    - ADMIN_LOCAL: Ve todos los documentos de los usuarios de su sede.
    - RADICADOR/GESTIONADOR: Ve solo los documentos que él mismo subió.
    """
    query = db.query(Documento)
    
    if current_user.rol == "ADMIN_GENERAL":
        return query.all()
    
    if current_user.rol == "ADMIN_LOCAL":
        # Hacemos un JOIN con Usuarios para filtrar por sede_id
        return query.join(Usuario, Documento.usuario_radicador == Usuario.id)\
                    .filter(Usuario.sede_id == current_user.sede_id).all()
    
    # Para el resto, solo sus propios archivos
    return query.filter(Documento.usuario_radicador == current_user.id).all()

@router.get("/{doc_id}/ver")
def view_document(doc_id: int, db: Session = Depends(get_db)):
    """
    Visor de archivos: 
    - PDF: Se abre inline en el navegador.
    - Word/Excel: Se descarga automáticamente.
    """
    doc = db.query(Documento).filter(Documento.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    # Adivinar el tipo MIME por la extensión
    mime_type, _ = mimetypes.guess_type(doc.nombre)
    mime_type = mime_type or "application/octet-stream"

    # 'inline' abre en el navegador, 'attachment' fuerza descarga
    disposition = "inline" if mime_type == "application/pdf" else "attachment"
    
    return Response(
        content=doc.archivo,
        media_type=mime_type,
        headers={
            "Content-Disposition": f'{disposition}; filename="{doc.nombre}"',
            "Access-Control-Expose-Headers": "Content-Disposition" # Importante para el front
        }
    )

@router.get("/{doc_id}/descargar")
def download_document(doc_id: int, db: Session = Depends(get_db)):
    """Fuerza la descarga manual de cualquier tipo de archivo."""
    doc = db.query(Documento).filter(Documento.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    mime_type, _ = mimetypes.guess_type(doc.nombre)
    
    return Response(
        content=doc.archivo,
        media_type=mime_type or "application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{doc.nombre}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

@router.put("/{doc_id}", response_model=DocumentoResponseSchema)
def rename_file(
    doc_id: int, 
    data: DocumentoUpdateSchema, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Permite renombrar el archivo."""
    return documento_service.renombrar_documento(db, doc_id, data.nombre, current_user.id)

@router.delete("/{doc_id}")
def delete_file(
    doc_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Elimina el archivo del sistema."""
    documento_service.eliminar_documento(db, doc_id, current_user.id)
    return {"message": "Documento eliminado correctamente"}