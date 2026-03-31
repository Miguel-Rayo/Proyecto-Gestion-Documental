from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user_model import Usuario, RolEnum
from app.dependencies.auth_dependency import get_current_user
from app.dependencies.role_checker import require_roles

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/usuarios/existe-admin-general")
def existe_admin_general(db: Session = Depends(get_db)):

    admin = db.query(Usuario).filter(
        Usuario.rol == RolEnum.ADMIN_GENERAL
    ).first()

    return {"existe": admin is not None}

@router.get("/usuarios/admin-local/{sede_id}")
def existe_admin_local(sede_id: int, db: Session = Depends(get_db)):

    admin = db.query(Usuario).filter(
        Usuario.rol == RolEnum.ADMIN_LOCAL,
        Usuario.sede_id == sede_id
    ).first()

    return {"existe": admin is not None}

@router.get("/profile") # Ruta para obtener el perfil del usuario autenticado
def profile(current_user = Depends(get_current_user)):

    return {
        "nombre": current_user.nombre_completo,
        "rol": current_user.rol
    }

@router.get("/admin-only")
def admin_data(
    user = Depends(require_roles("ADMIN_GENERAL"))
):

    return {"message": "Zona de administrador general"}

@router.get("/gestion")
def gestion(
    user = Depends(require_roles("ADMIN_GENERAL","ADMIN_LOCAL","GESTIONADOR"))
):

    return {"message":"Zona de gestión"}











from typing import Optional
from app.schemas.user_schema import UsuarioCreateAdminSchema, UsuarioUpdateSchema
from app.services.user_service import (
    crear_usuario_desde_panel,
    actualizar_usuario_desde_panel,
    eliminar_usuario_desde_panel,
    AREAS_RESERVADAS
)
from app.models.sede_model import Area, SedeArea


@router.get("/usuarios")
def listar_usuarios(
    sede_id: Optional[int] = None,
    rol: Optional[str] = None,
    cedula: Optional[str] = None,
    current_user=Depends(require_roles("ADMIN_GENERAL", "ADMIN_LOCAL")),
    db: Session = Depends(get_db)
):
    query = db.query(Usuario).filter(Usuario.rol != RolEnum.ADMIN_GENERAL)

    if current_user.rol == "ADMIN_LOCAL":
        query = query.filter(Usuario.sede_id == current_user.sede_id)
    elif sede_id:
        query = query.filter(Usuario.sede_id == sede_id)

    if rol:
        query = query.filter(Usuario.rol == rol)
    if cedula:
        query = query.filter(Usuario.cedula.contains(cedula))

    usuarios = query.all()
    return [
        {
            "id": u.id,
            "nombre_completo": u.nombre_completo,
            "cedula": u.cedula,
            "correo": u.correo,
            "rol": u.rol,
            "sede_id": u.sede_id,
            "area_id": u.area_id,
            "debe_cambiar_password": u.debe_cambiar_password,
        }
        for u in usuarios
    ]


@router.post("/usuarios")
def crear_usuario_admin(
    data: UsuarioCreateAdminSchema,
    current_user=Depends(require_roles("ADMIN_GENERAL", "ADMIN_LOCAL")),
    db: Session = Depends(get_db)
):
    resultado = crear_usuario_desde_panel(db, data, current_user.rol, current_user.sede_id)
    return {
        "mensaje": "Usuario creado correctamente",
        "cedula": resultado["usuario"].cedula,
        "password_temporal": resultado["password_temporal"]
    }


@router.put("/usuarios/{usuario_id}")
def editar_usuario_admin(
    usuario_id: int,
    data: UsuarioUpdateSchema,
    current_user=Depends(require_roles("ADMIN_GENERAL", "ADMIN_LOCAL")),
    db: Session = Depends(get_db)
):
    actualizar_usuario_desde_panel(db, usuario_id, data, current_user.rol, current_user.sede_id)
    return {"mensaje": "Usuario actualizado correctamente"}


@router.delete("/usuarios/{usuario_id}")
def eliminar_usuario_admin(
    usuario_id: int,
    current_user=Depends(require_roles("ADMIN_GENERAL", "ADMIN_LOCAL")),
    db: Session = Depends(get_db)
):
    eliminar_usuario_desde_panel(db, usuario_id, current_user.rol, current_user.sede_id)
    return {"mensaje": "Usuario eliminado correctamente"}


@router.get("/usuarios/{usuario_id}/areas-gestionador")
def areas_para_gestionador(
    usuario_id: int,
    sede_id: int,
    current_user=Depends(require_roles("ADMIN_GENERAL", "ADMIN_LOCAL")),
    db: Session = Depends(get_db)
):
    """Áreas disponibles para asignar a un GESTIONADOR en una sede dada."""
    areas = db.query(Area)\
        .join(SedeArea, Area.id == SedeArea.id_area)\
        .filter(
            SedeArea.id_sede == sede_id,
            Area.nombre.notin_(AREAS_RESERVADAS)
        ).all()
    return [{"id": a.id, "nombre": a.nombre} for a in areas]