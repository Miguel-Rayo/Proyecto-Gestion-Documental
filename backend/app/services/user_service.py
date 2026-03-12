from sqlalchemy.orm import Session
from app.models.user_model import Usuario, RolEnum
from app.utils.security import generar_password, hash_password
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

def registrar_usuario(db: Session, data):

    # Verificar cédula duplicada
    usuario_existente = db.query(Usuario).filter(
        Usuario.cedula == data.cedula
    ).first()

    if usuario_existente:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un usuario con esa cédula"
        )
    
    # Verificar correo duplicado
    correo_existente = db.query(Usuario).filter(
        Usuario.correo == data.correo
    ).first()

    if correo_existente:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un usuario con ese correo"
        )
    
    # Verificar ADMIN_GENERAL único
    if data.rol == RolEnum.ADMIN_GENERAL:

        admin = db.query(Usuario).filter(
            Usuario.rol == RolEnum.ADMIN_GENERAL
        ).first()

        if admin:
            raise HTTPException(
                status_code=400,
                detail="Ya existe un administrador general"
            )
        
    # Verificar ADMIN_LOCAL por sede
    if data.rol == RolEnum.ADMIN_LOCAL:

        admin_local = db.query(Usuario).filter(
            Usuario.rol == RolEnum.ADMIN_LOCAL,
            Usuario.sede_id == data.sede_id
        ).first()

        if admin_local:
            raise HTTPException(
                status_code=400,
                detail="Esta sede ya tiene administrador local"
            )


    password_plano = generar_password()

    usuario = Usuario(
        nombre_completo=data.nombre_completo,
        cedula=data.cedula,
        correo=data.correo,
        rol=data.rol,
        sede_id=data.sede_id,
        password_hash=hash_password(password_plano)
    )

    # print("********************************")
    # print("Password generada: " + password_plano)
    # print("Hash de la password: " + hash_password(password_plano))
    # print("********************************")

    db.add(usuario) 
    db.commit()

    return password_plano