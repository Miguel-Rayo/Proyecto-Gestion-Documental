# Nuevo gemini

import random
from datetime import datetime
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from app.models.documento_model import Documento
from app.models.sede_model import Sede

# Extensiones MIME permitidas (PDF, Word, Excel)
EXTENSIONES_PERMITIDAS = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", # .docx
    "application/msword", # .doc
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", # .xlsx
    "application/vnd.ms-excel" # .xls
]

def generar_numero_radicado(db: Session, sede_id: int) -> str:
    """Genera un número de radicado único: RAD-codigo_postal-DDMMAAAA-000000"""
    codigo_postal = "000000"
    
    if sede_id is not None:
        sede = db.query(Sede).filter(Sede.id == sede_id).first()
        if sede and sede.codigo_postal:
            codigo_postal = sede.codigo_postal

    fecha_str = datetime.now().strftime("%d-%m-%Y")

    while True:
        digitos = f"{random.randint(0, 999999):06d}"
        radicado = f"RAD-{codigo_postal}-{fecha_str}-{digitos}"
        
        # Verificar que sea estrictamente único en BD
        existe = db.query(Documento).filter(Documento.numero_radicado == radicado).first()
        if not existe:
            return radicado

async def subir_documento(db: Session, archivo: UploadFile, usuario_id: int, sede_id: int):
    """Valida, genera el radicado y guarda el archivo en BD"""
    if archivo.content_type not in EXTENSIONES_PERMITIDAS:
        raise HTTPException(
            status_code=400, 
            detail="Formato de archivo no permitido. Solo se admiten PDF, Word y Excel."
        )

    # Leer los bytes del archivo
    contenido = await archivo.read()
    radicado = generar_numero_radicado(db, sede_id)

    nuevo_documento = Documento(
        numero_radicado=radicado,
        nombre=archivo.filename,
        archivo=contenido,
        usuario_radicador=usuario_id,
        estado="RADICADO"
    )

    try:
        db.add(nuevo_documento)
        db.commit()
        db.refresh(nuevo_documento)
        return nuevo_documento
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al guardar el documento en la base de datos.")

def renombrar_documento(db: Session, documento_id: int, nuevo_nombre: str, usuario_id: int):
    """Cambia el nombre del archivo. Valida que el documento exista y pertenezca al usuario."""
    doc = db.query(Documento).filter(Documento.id == documento_id).first()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    
    if doc.usuario_radicador != usuario_id:
        raise HTTPException(status_code=403, detail="No tienes permisos para renombrar este documento")

    doc.nombre = nuevo_nombre
    db.commit()
    db.refresh(doc)
    return doc

def eliminar_documento(db: Session, documento_id: int, usuario_id: int):
    """Elimina el documento del repositorio."""
    doc = db.query(Documento).filter(Documento.id == documento_id).first()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
        
    if doc.usuario_radicador != usuario_id:
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar este documento")

    db.delete(doc)
    db.commit()