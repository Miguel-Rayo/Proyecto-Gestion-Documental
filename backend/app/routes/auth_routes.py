from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal, get_db
from app.services.user_service import registrar_usuario
from app.schemas.user_schema import UserCreate, LoginSchema, ChangePasswordSchema
from app.models.user_model import Usuario
from app.utils.security import hash_password, verificar_password
from app.utils.jwt_handler import crear_token, verificar_token

router = APIRouter()


@router.post("/register")
def register(data: UserCreate, db: Session = Depends(get_db)):
    password = registrar_usuario(db, data)
    return {
        "mensaje": "Usuario creado correctamente",
        "password_temporal": password
    }

@router.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    cedula = data.cedula
    password = data.password

    usuario = db.query(Usuario).filter(Usuario.cedula == cedula).first()

    if not usuario:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    if not verificar_password(password, usuario.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    token = crear_token({
        "user_id": usuario.id,
        "rol": usuario.rol
    })

    return {
        "token": token,
        "user_id": usuario.id,
        "nombre": usuario.nombre_completo,
        "rol": usuario.rol,
        "debe_cambiar_password": usuario.debe_cambiar_password
    }

@router.post("/change-password")
def change_password(data: ChangePasswordSchema, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id == data.user_id).first()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario.password_hash = hash_password(data.password)
    usuario.debe_cambiar_password = False
    db.commit()

    return {"mensaje": "Contraseña actualizada correctamente"}