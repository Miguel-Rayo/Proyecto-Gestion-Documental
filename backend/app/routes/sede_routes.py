from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.sede_model import Sede, Area, SedeArea
from app.schemas.sede_schema import SedeCreateSchema, SedeUpdateSchema
from app.dependencies.role_checker import require_roles
from app.models.user_model import Usuario

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/sedes/departamentos")
def obtener_departamentos(db: Session = Depends(get_db)):

    departamentos = db.query(Sede.departamento).distinct().all()

    return [d[0] for d in departamentos]

@router.post("/usuarios/seleccionar-area")
def seleccionar_area(data: dict, db: Session = Depends(get_db)):
    from app.models.user_model import Usuario
    usuario = db.query(Usuario).filter(Usuario.id == data.get("user_id")).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    area = db.query(Area).filter(Area.nombre == data.get("nombre_area")).first()
    if not area:
        raise HTTPException(status_code=404, detail="Área no encontrada")

    usuario.area_id = area.id
    usuario.debe_seleccionar_area = False
    db.commit()
    return {"mensaje": "Área asignada correctamente"}

@router.get("/sedes/lista")
def listar_todas_sedes(
    current_user=Depends(require_roles("ADMIN_GENERAL")),
    db: Session = Depends(get_db)
):
    sedes = db.query(Sede).all()
    return [
        {
            "id": s.id,
            "nombre": s.nombre,
            "ciudad": s.ciudad,
            "departamento": s.departamento,
            "direccion": s.direccion,
            "codigo_postal": s.codigo_postal,
        }
        for s in sedes
    ]

@router.get("/areas/todas")
def listar_todas_areas(
    current_user=Depends(require_roles("ADMIN_GENERAL")),
    db: Session = Depends(get_db)
):
    """Todas las áreas del sistema, para el selector al crear/editar sedes."""
    areas = db.query(Area).order_by(Area.nombre).all()
    return [{"id": a.id, "nombre": a.nombre} for a in areas]


@router.post("/sedes/nueva")
def crear_sede(
    data: SedeCreateSchema,
    current_user=Depends(require_roles("ADMIN_GENERAL")),
    db: Session = Depends(get_db)
):
    sede = Sede(
        nombre=data.nombre,
        direccion=data.direccion,
        codigo_postal=data.codigo_postal,
        ciudad=data.ciudad,
        departamento=data.departamento
    )
    db.add(sede)
    db.flush()

    for nombre_area in (data.areas or []):
        area = db.query(Area).filter(Area.nombre == nombre_area).first()
        if area:
            db.add(SedeArea(id_sede=sede.id, id_area=area.id))

    db.commit()
    return {"mensaje": "Sede creada correctamente", "id": sede.id}

@router.get("/sedes/ciudades/{departamento}")
def obtener_ciudades(departamento: str, db: Session = Depends(get_db)):

    ciudades = (
        db.query(Sede.ciudad)
        .filter(Sede.departamento == departamento)
        .distinct()
        .all()
    )

    return [c[0] for c in ciudades]

@router.get("/sedes/{ciudad}")
def obtener_sedes(ciudad: str, db: Session = Depends(get_db)):

    sedes = db.query(Sede).filter(Sede.ciudad == ciudad).all()

    return sedes

@router.get("/areas/por-rol/{rol}/{sede_id}")
def areas_por_rol(rol: str, sede_id: Optional[str] = None, db: Session = Depends(get_db)):

    AREAS_EXCLUIDAS_GESTIONADOR = [
        "Dirección y Gerencia General",
        "Administración",
        "Correspondencia y Gestión Documental"
    ]

    if rol == "ADMIN_GENERAL":
        areas = db.query(Area).filter(Area.nombre == "Dirección y Gerencia General").all()

    elif rol == "ADMIN_LOCAL":
        areas = db.query(Area).filter(Area.nombre == "Administración").all()

    elif rol == "RADICADOR":
        areas = db.query(Area).filter(Area.nombre == "Correspondencia y Gestión Documental").all()

    elif rol == "GESTIONADOR":
        areas = db.query(Area)\
            .join(SedeArea, Area.id == SedeArea.id_area)\
            .filter(
                SedeArea.id_sede == sede_id,
                Area.nombre.notin_(AREAS_EXCLUIDAS_GESTIONADOR)
            ).all()

    return [{"id": a.id, "nombre": a.nombre} for a in areas]

@router.get("/sedes/{sede_id}/detalle")
def detalle_sede(
    sede_id: int,
    current_user=Depends(require_roles("ADMIN_GENERAL")),
    db: Session = Depends(get_db)
):
    sede = db.query(Sede).filter(Sede.id == sede_id).first()
    if not sede:
        raise HTTPException(status_code=404, detail="Sede no encontrada")

    areas = db.query(Area)\
        .join(SedeArea, Area.id == SedeArea.id_area)\
        .filter(SedeArea.id_sede == sede_id).all()

    total_usuarios = db.query(Usuario).filter(Usuario.sede_id == sede_id).count()

    return {
        "id": sede.id,
        "nombre": sede.nombre,
        "ciudad": sede.ciudad,
        "departamento": sede.departamento,
        "direccion": sede.direccion,
        "codigo_postal": sede.codigo_postal,
        "areas": [{"id": a.id, "nombre": a.nombre} for a in areas],
        "total_usuarios": total_usuarios
    }

@router.put("/sedes/{sede_id}")
def editar_sede(
    sede_id: int,
    data: SedeUpdateSchema,
    current_user=Depends(require_roles("ADMIN_GENERAL")),
    db: Session = Depends(get_db)
):
    sede = db.query(Sede).filter(Sede.id == sede_id).first()
    if not sede:
        raise HTTPException(status_code=404, detail="Sede no encontrada")

    if data.nombre: sede.nombre = data.nombre
    if data.direccion: sede.direccion = data.direccion
    if data.codigo_postal: sede.codigo_postal = data.codigo_postal
    if data.ciudad: sede.ciudad = data.ciudad
    if data.departamento: sede.departamento = data.departamento

    if data.areas is not None:
        asignaciones_actuales = db.query(SedeArea).filter(SedeArea.id_sede == sede_id).all()
        
        # Mapear área nombre → objeto SedeArea actual
        mapa_actuales = {}
        for sa in asignaciones_actuales:
            area = db.query(Area).filter(Area.id == sa.id_area).first()
            if area:
                mapa_actuales[area.nombre] = sa

        nombres_actuales = set(mapa_actuales.keys())
        nombres_nuevos = set(data.areas)

        areas_a_quitar = nombres_actuales - nombres_nuevos  # las que se eliminaron
        areas_a_agregar = nombres_nuevos - nombres_actuales  # las que se añadieron

        # Validar solo las que se van a quitar
        for nombre in areas_a_quitar:
            sa = mapa_actuales[nombre]
            afectados = db.query(Usuario).filter(
                Usuario.sede_id == sede_id,
                Usuario.area_id == sa.id_area
            ).count()
            if afectados > 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"No se puede desasignar '{nombre}': tiene {afectados} usuario(s) activo(s) en esta sede"
                )
            db.delete(sa)

        # Agregar solo las nuevas
        for nombre in areas_a_agregar:
            area = db.query(Area).filter(Area.nombre == nombre).first()
            if area:
                db.add(SedeArea(id_sede=sede_id, id_area=area.id))

    db.commit()
    return {"mensaje": "Sede actualizada correctamente"} 


@router.delete("/sedes/{sede_id}")
def eliminar_sede(
    sede_id: int,
    confirmar: bool = False,
    current_user=Depends(require_roles("ADMIN_GENERAL")),
    db: Session = Depends(get_db)
):
    sede = db.query(Sede).filter(Sede.id == sede_id).first()
    if not sede:
        raise HTTPException(status_code=404, detail="Sede no encontrada")

    total_usuarios = db.query(Usuario).filter(Usuario.sede_id == sede_id).count()

    if total_usuarios > 0 and not confirmar:
        return {
            "requiere_confirmacion": True,
            "mensaje": f"Esta sede tiene {total_usuarios} usuario(s). ¿Deseas eliminarlos también?",
            "total_usuarios": total_usuarios
        }

    db.query(Usuario).filter(Usuario.sede_id == sede_id).delete()
    db.query(SedeArea).filter(SedeArea.id_sede == sede_id).delete()
    db.delete(sede)
    db.commit()
    return {"mensaje": "Sede eliminada correctamente"}