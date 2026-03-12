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





@router.get("/profile") # Ruta para obtener el perfil del usuario autenticado (ejemplo)
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