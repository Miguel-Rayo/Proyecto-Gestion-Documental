# Nuevo gemini

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies.role_checker import require_roles
from app.models.user_model import Usuario
from app.models.documento_model import Documento, DocumentoComentario
from app.schemas import DestinatarioOut, DocumentoEnvio, DocumentoFinalizar
from app.dependencies.auth_dependency import get_current_user
from datetime import datetime

router = APIRouter(prefix="/operacion", tags=["Operación"])

@router.get("/destinatarios", response_model=list[DestinatarioOut])
def obtener_destinatarios(
    documento_id: int = None, # Opcional: para saber quién me lo envió a mí
    current_user: Usuario = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    query = db.query(Usuario).filter(Usuario.id != current_user.id) # Nunca a mí mismo

    # --- REGLA 1: RADICADOR ---
    if current_user.rol == "RADICADOR":
        # Solo GESTIONADORES de sedes distintas
        query = query.filter(
            Usuario.rol == "GESTIONADOR",
            Usuario.sede_id != current_user.sede_id
        )

    # --- REGLA 2: GESTIONADOR ---
    elif current_user.rol == "GESTIONADOR":
        # Solo a otros GESTIONADORES (cualquier sede)
        query = query.filter(Usuario.rol == "GESTIONADOR")
        # EXCEPCIÓN: No enviar a quien me lo envió a mí
        if documento_id:
            ultimo_mov = db.query(DocumentoComentario).filter(
                DocumentoComentario.documento_id == documento_id
            ).order_by(DocumentoComentario.id.desc()).first()
            if ultimo_mov:
                query = query.filter(Usuario.id != ultimo_mov.usuario_emisor)

    # --- REGLA 3: ADMIN_LOCAL ---
    elif current_user.rol == "ADMIN_LOCAL":
        # A cualquier GESTIONADOR o al ADMIN_GENERAL
        query = query.filter(Usuario.rol.in_(["GESTIONADOR", "ADMIN_GENERAL"]))

    # --- REGLA 4: ADMIN_GENERAL ---
    elif current_user.rol == "ADMIN_GENERAL":
        # A cualquier GESTIONADOR o ADMIN_LOCAL
        query = query.filter(Usuario.rol.in_(["GESTIONADOR", "ADMIN_LOCAL"]))
        # EXCEPCIÓN: No devolver al mismo que se lo envió
        if documento_id:
            ultimo_mov = db.query(DocumentoComentario).filter(
                DocumentoComentario.documento_id == documento_id
            ).order_by(DocumentoComentario.id.desc()).first()
            if ultimo_mov:
                query = query.filter(Usuario.id != ultimo_mov.usuario_emisor)

    destinatarios = query.all()
    
    # Formateamos la salida para el Frontend
    return [
        {
            "id": d.id,
            "nombre_completo": d.nombre_completo,
            "rol": d.rol,
            "sede_nombre": d.sede.nombre if d.sede else "N/A",
            "area_nombre": d.area.nombre if d.area else "N/A"
        } for d in destinatarios
    ]

# --- 1. ENVIAR (Radicador, Admin Local, Admin General) ---
@router.post("/enviar")
def enviar_documento(datos: DocumentoEnvio, current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Documento).filter(Documento.id == datos.documento_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    # Actualizamos el documento
    doc.usuario_responsable = datos.usuario_destinatario_id
    doc.fecha_ultima_gestion = datetime.now()
    # El estado se mantiene en 'RADICADO' según tu regla
    
    # Creamos el registro de "rastreo" en comentarios (comentario es NULL)
    nuevo_movimiento = DocumentoComentario(
        documento_id=doc.id,
        usuario_emisor=current_user.id,
        usuario_receptor=datos.usuario_destinatario_id,
        comentario=None 
    )
    
    db.add(nuevo_movimiento)
    db.commit()
    return {"message": "Documento enviado con éxito"}

# --- 2. TRASLADAR (Gestionador, Admin General) ---
@router.post("/trasladar")
def trasladar_documento(datos: DocumentoEnvio, current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Documento).filter(Documento.id == datos.documento_id).first()
    
    # Regla especial: Admin Local NO puede trasladar si el Admin General se lo envió
    if current_user.rol == "ADMIN_LOCAL":
         raise HTTPException(status_code=403, detail="El Admin Local no tiene permitido trasladar documentos")

    doc.usuario_responsable = datos.usuario_destinatario_id
    doc.estado = "TRASLADADO"
    doc.fecha_ultima_gestion = datetime.now()

    # Registramos el traslado en la tabla de comentarios (reescribimos el emisor para el siguiente paso)
    nuevo_traslado = DocumentoComentario(
        documento_id=doc.id,
        usuario_emisor=current_user.id,
        usuario_receptor=datos.usuario_destinatario_id,
        comentario=None
    )
    
    db.add(nuevo_traslado)
    db.commit()
    return {"message": "Documento trasladado con éxito"}

# --- 3. ACEPTAR (Gestionador, Admin Local, Admin General) ---
@router.post("/aceptar/{documento_id}")
def aceptar_documento(documento_id: int, current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Documento).filter(Documento.id == documento_id).first()
    
    if doc.usuario_responsable != current_user.id:
        raise HTTPException(status_code=403, detail="No eres el responsable de este documento")

    doc.estado = "ACEPTADO"
    doc.fecha_ultima_gestion = datetime.now()
    db.commit()
    return {"message": "Documento aceptado"}

# --- 4. FINALIZAR (Con comentario obligatorio) ---
@router.post("/finalizar")
def finalizar_documento(datos: DocumentoFinalizar, current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Documento).filter(Documento.id == datos.documento_id).first()
    
    if not datos.comentario or len(datos.comentario.strip()) == 0:
        raise HTTPException(status_code=400, detail="El comentario es obligatorio para finalizar")

    # Buscamos quién le envió el documento a este usuario (el último registro con comentario NULL)
    ultimo_movimiento = db.query(DocumentoComentario).filter(
        DocumentoComentario.documento_id == doc.id,
        DocumentoComentario.usuario_receptor == current_user.id,
        DocumentoComentario.comentario == None
    ).order_by(DocumentoComentario.id.desc()).first()

    # Si no hay movimiento previo (caso raro), el receptor será el radicador original
    receptor_comentario = ultimo_movimiento.usuario_emisor if ultimo_movimiento else doc.usuario_radicador

    # Actualizamos estado del documento
    doc.estado = "FINALIZADO"
    doc.fecha_ultima_gestion = datetime.now()

    # Creamos el registro del comentario final
    comentario_final = DocumentoComentario(
        documento_id=doc.id,
        usuario_emisor=current_user.id,
        usuario_receptor=receptor_comentario,
        comentario=datos.comentario
    )

    db.add(comentario_final)
    db.commit()
    return {"message": "Ha finalizado la operación correctamente"}



# Bandeja de Entrada (Lo que me llegó pero no he aceptado/finalizado)
# En app/routes/operacion_routes.py

@router.get("/bandeja-entrada")
def obtener_bandeja(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Usamos .with_entities para seleccionar SOLO lo que necesitamos mostrar en la tabla
    # EXCLUIMOS la columna 'archivo'
    documentos = db.query(
        Documento.id,
        Documento.numero_radicado,
        Documento.nombre,
        Documento.estado,
        Documento.fecha_creacion
    ).filter(
        Documento.usuario_responsable == current_user.id,
        Documento.estado.in_(['RADICADO', 'TRASLADADO'])
    ).all()
    
    # Convertimos a una lista de diccionarios para que FastAPI lo envíe fácil
    return [
        {
            "id": d.id, 
            "numero_radicado": d.numero_radicado, 
            "nombre": d.nombre, 
            "estado": d.estado,
            "fecha_creacion": d.fecha_creacion
        } for d in documentos
    ]

# Mi Gestión (Lo que ya acepté o finalicé)
@router.get("/mi-gestion")
def obtener_mi_gestion(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    documentos = db.query(
        Documento.id,
        Documento.numero_radicado,
        Documento.nombre,
        Documento.estado
    ).filter(
        Documento.usuario_responsable == current_user.id,
        Documento.estado.in_(['ACEPTADO', 'FINALIZADO'])
    ).all()
    
    return [
        {
            "id": d.id, 
            "numero_radicado": d.numero_radicado, 
            "nombre": d.nombre, 
            "estado": d.estado
        } for d in documentos
    ]
