from fastapi import APIRouter, Depends, Query, UploadFile, File, Response, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import mimetypes

from app.database import get_db
from app.schemas.documento_schema import (
    DocumentoResponseSchema,
    DocumentoUpdateSchema,
    DocumentoPreviewSchema,
    ReportePreviewResponse,
    ResponsablePreviewSchema,
)
from app.services import documento_service
from app.dependencies.auth_dependency import get_current_user
from app.dependencies.role_checker import require_roles
from app.models.documento_model import Documento
from app.models.user_model import Usuario
from app.models.sede_model import Sede
from app.utils.reportes_algoritmos import (
    construir_filas_con_proteccion,
    generar_csv,
)

router = APIRouter(prefix="/documentos", tags=["Documentos"])

ROLES_REPORTE = ["ADMIN_GENERAL", "ADMIN_LOCAL", "GESTIONADOR"]

permiso_escritura = require_roles(["ADMIN_GENERAL", "ADMIN_LOCAL", "RADICADOR"])


def _filtrar_documentos_por_rol(
    db: Session,
    current_user: Usuario,
    fecha_inicio: datetime,
    fecha_fin: datetime,
) -> list:
    query = db.query(Documento).filter(
        Documento.fecha_ultima_gestion >= fecha_inicio,
        Documento.fecha_ultima_gestion <= fecha_fin,
    )

    rol = current_user.rol.upper()

    if rol == "ADMIN_GENERAL":
        return query.all()

    if rol == "ADMIN_LOCAL":
        ids_usuarios_sede = [
            u.id for u in db.query(Usuario.id).filter(Usuario.sede_id == current_user.sede_id).all()
        ]
        if not ids_usuarios_sede:
            return []
        return query.filter(
            (Documento.usuario_responsable.in_(ids_usuarios_sede))
            | (
                (Documento.usuario_responsable.is_(None))
                & (Documento.usuario_radicador.in_(ids_usuarios_sede))
            )
        ).all()

    return query.filter(Documento.usuario_responsable == current_user.id).all()


def _construir_info_responsable(doc: Documento, usuarios_map: dict, sedes_map: dict) -> ResponsablePreviewSchema:
    responsable_id = doc.usuario_responsable if doc.usuario_responsable is not None else doc.usuario_radicador

    if responsable_id is None:
        return ResponsablePreviewSchema(
            id=0,
            cedula="N/A",
            nombre="Sin usuario asignado",
            rol="DESCONOCIDO",
            sede="N/A",
        )

    usuario = usuarios_map.get(responsable_id)
    if usuario is None:
        return ResponsablePreviewSchema(
            id=responsable_id,
            cedula="N/A",
            nombre="Usuario eliminado",
            rol="DESCONOCIDO",
            sede="N/A",
        )

    rol_str = usuario.rol.value if hasattr(usuario.rol, "value") else str(usuario.rol)

    if rol_str == "ADMIN_GENERAL":
        sede_nombre = "Direccion General"
    elif usuario.sede_id is not None:
        sede = sedes_map.get(usuario.sede_id)
        sede_nombre = sede.nombre if sede else "Sede no encontrada"
    else:
        sede_nombre = "Sin sede asignada"

    return ResponsablePreviewSchema(
        id=usuario.id,
        cedula=usuario.cedula,
        nombre=usuario.nombre_completo,
        rol=rol_str,
        sede=sede_nombre,
    )


@router.post("/subir", response_model=DocumentoResponseSchema)
async def upload_file(
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    roles_permitidos = ["ADMIN_GENERAL", "ADMIN_LOCAL", "RADICADOR"]

    if current_user.rol.upper() not in roles_permitidos:
        raise HTTPException(
            status_code=403,
            detail=f"El rol {current_user.rol} no tiene permisos para radicar documentos."
        )

    return await documento_service.subir_documento(
        db, archivo, current_user.id, current_user.sede_id
    )


@router.get("/exportar-csv")
def exportar_documentos_csv(
    fecha_inicio: datetime = Query(..., description="Formato: 2024-01-01T00:00:00"),
    fecha_fin: datetime = Query(..., description="Formato: 2024-12-31T23:59:59"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    if current_user.rol.upper() not in ROLES_REPORTE:
        raise HTTPException(
            status_code=403,
            detail=f"El rol {current_user.rol} no tiene permisos para exportar reportes."
        )

    documentos = _filtrar_documentos_por_rol(db, current_user, fecha_inicio, fecha_fin)

    if not documentos:
        raise HTTPException(status_code=204, detail="No se encontraron documentos en ese rango de fechas.")

    mitad = len(documentos) // 2
    primera_mitad = documentos[:mitad]
    segunda_mitad = documentos[mitad:]

    filas_simple = construir_filas_con_proteccion(primera_mitad, "simple")
    filas_cruzada = construir_filas_con_proteccion(segunda_mitad, "cruzada")
    filas_totales = filas_simple + filas_cruzada

    csv_file = generar_csv(filas_totales)

    return StreamingResponse(
        csv_file,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=reporte_documentos.csv"},
    )


@router.get("/preview-reporte", response_model=ReportePreviewResponse)
def preview_reporte(
    fecha_inicio: datetime = Query(..., description="Formato: 2024-01-01T00:00:00"),
    fecha_fin: datetime = Query(..., description="Formato: 2024-12-31T23:59:59"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    if current_user.rol.upper() not in ROLES_REPORTE:
        raise HTTPException(
            status_code=403,
            detail=f"El rol {current_user.rol} no tiene permisos para generar reportes."
        )

    documentos = _filtrar_documentos_por_rol(db, current_user, fecha_inicio, fecha_fin)

    if not documentos:
        return ReportePreviewResponse(total=0, documentos=[])

    ids_responsables = set()
    for doc in documentos:
        resp_id = doc.usuario_responsable if doc.usuario_responsable is not None else doc.usuario_radicador
        if resp_id is not None:
            ids_responsables.add(resp_id)

    usuarios_map = {}
    if ids_responsables:
        usuarios = db.query(Usuario).filter(Usuario.id.in_(ids_responsables)).all()
        usuarios_map = {u.id: u for u in usuarios}

    ids_sedes = set()
    for u in usuarios_map.values():
        if u.sede_id is not None:
            ids_sedes.add(u.sede_id)

    sedes_map = {}
    if ids_sedes:
        sedes = db.query(Sede).filter(Sede.id.in_(ids_sedes)).all()
        sedes_map = {s.id: s for s in sedes}

    preview_docs = []
    for doc in documentos:
        responsable = _construir_info_responsable(doc, usuarios_map, sedes_map)
        preview_docs.append(
            DocumentoPreviewSchema(
                numero_radicado=doc.numero_radicado,
                nombre_documento=doc.nombre,
                fecha_ultima_gestion=doc.fecha_ultima_gestion,
                estado=doc.estado,
                responsable=responsable,
            )
        )

    return ReportePreviewResponse(total=len(preview_docs), documentos=preview_docs)


@router.get("/", response_model=List[DocumentoResponseSchema])
def list_documents(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Documento)

    if current_user.rol == "ADMIN_GENERAL":
        return query.all()

    if current_user.rol == "ADMIN_LOCAL":
        return query.join(Usuario, Documento.usuario_radicador == Usuario.id)\
                    .filter(Usuario.sede_id == current_user.sede_id).all()

    return query.filter(Documento.usuario_radicador == current_user.id).all()


@router.get("/{doc_id}/ver")
def view_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(Documento).filter(Documento.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    mime_type, _ = mimetypes.guess_type(doc.nombre)
    mime_type = mime_type or "application/octet-stream"

    disposition = "inline" if mime_type == "application/pdf" else "attachment"

    return Response(
        content=doc.archivo,
        media_type=mime_type,
        headers={
            "Content-Disposition": f'{disposition}; filename="{doc.nombre}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )


@router.get("/{doc_id}/descargar")
def download_document(doc_id: int, db: Session = Depends(get_db)):
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
    return documento_service.renombrar_documento(db, doc_id, data.nombre, current_user.id)


@router.delete("/{doc_id}")
def delete_file(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    documento_service.eliminar_documento(db, doc_id, current_user.id)
    return {"message": "Documento eliminado correctamente"}
