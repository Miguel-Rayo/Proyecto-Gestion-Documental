from typing import Optional

from sqlalchemy.orm import Session
from app.models.user_model import Usuario, RolEnum
from app.utils.security import generar_password, hash_password
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from app.models.sede_model import Area, SedeArea

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



AREAS_RESERVADAS = [
    "Dirección y Gerencia General",
    "Administración",
    "Correspondencia y Gestión Documental"
]

def _area_automatica_por_rol(rol: str) -> Optional[str]:
    mapa = {
        "ADMIN_LOCAL": "Administración",
        "RADICADOR": "Correspondencia y Gestión Documental",
        "ADMIN_GENERAL": "Dirección y Gerencia General",
    }
    return mapa.get(rol)

def _sede_tiene_area(sede_id: int, nombre_area: str, db: Session) -> bool:
    area = db.query(Area).filter(Area.nombre == nombre_area).first()
    if not area:
        return False
    return db.query(SedeArea).filter(
        SedeArea.id_sede == sede_id,
        SedeArea.id_area == area.id
    ).first() is not None

def crear_usuario_desde_panel(db: Session, data, editor_rol: str, editor_sede_id: Optional[int]):

    # Bloqueo absoluto: ADMIN_GENERAL nunca se crea desde el panel
    if data.rol == RolEnum.ADMIN_GENERAL:
        raise HTTPException(status_code=403, detail="El rol ADMIN_GENERAL no puede crearse desde el panel")

    # ADMIN_LOCAL solo puede crear GESTIONADOR y RADICADOR en su propia sede
    if editor_rol == "ADMIN_LOCAL":
        if data.rol == RolEnum.ADMIN_LOCAL:
            raise HTTPException(status_code=403, detail="No tienes permiso para crear un ADMIN_LOCAL")
        if data.sede_id != editor_sede_id:
            raise HTTPException(status_code=403, detail="Solo puedes crear usuarios para tu propia sede")

    # R2
    if data.rol == RolEnum.ADMIN_LOCAL:
        existe = db.query(Usuario).filter(
            Usuario.rol == RolEnum.ADMIN_LOCAL,
            Usuario.sede_id == data.sede_id
        ).first()
        if existe:
            raise HTTPException(status_code=400, detail="Esta sede ya tiene ADMINISTRADOR LOCAL")

    # Determinar área
    area_nombre = _area_automatica_por_rol(data.rol)

    if data.rol == RolEnum.GESTIONADOR:
        if not data.area_nombre:
            raise HTTPException(status_code=400, detail="Debes seleccionar un área para el GESTIONADOR")
        if data.area_nombre in AREAS_RESERVADAS:
            raise HTTPException(status_code=400, detail="Esa área no está disponible para GESTIONADOR")
        area_nombre = data.area_nombre

    # R6 y R7: verificar que la sede tenga el área requerida
    if data.sede_id and area_nombre:
        if not _sede_tiene_area(data.sede_id, area_nombre, db):
            raise HTTPException(
                status_code=400,
                detail=f"La sede no tiene asignada el área '{area_nombre}'"
            )

    area = db.query(Area).filter(Area.nombre == area_nombre).first() if area_nombre else None

    password_plano = generar_password()

    nuevo_usuario = Usuario(
        nombre_completo=data.nombre_completo,
        cedula=data.cedula,
        correo=data.correo,
        rol=data.rol,
        sede_id=data.sede_id,
        area_id=area.id if area else None,
        debe_seleccionar_area=False,
        password_hash=hash_password(password_plano)
    )

    try:
        db.add(nuevo_usuario)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="La cédula o correo ya están registrados")

    return {"usuario": nuevo_usuario, "password_temporal": password_plano}


def actualizar_usuario_desde_panel(db: Session, usuario_id: int, data, editor_rol: str, editor_sede_id: Optional[int]):

    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # ADMIN_LOCAL solo puede editar usuarios de su propia sede
    if editor_rol == "ADMIN_LOCAL" and usuario.sede_id != editor_sede_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para editar este usuario")

    if data.nombre_completo:
        usuario.nombre_completo = data.nombre_completo
    if data.cedula:
        usuario.cedula = data.cedula
    if data.correo:
        usuario.correo = data.correo

    sede_destino = data.sede_id if data.sede_id is not None else usuario.sede_id

    if data.rol and data.rol != usuario.rol:
        nuevo_rol = data.rol

        if editor_rol == "ADMIN_LOCAL" and nuevo_rol == RolEnum.ADMIN_LOCAL:
            raise HTTPException(status_code=403, detail="No tienes permiso para asignar ese rol")

        # R2
        if nuevo_rol == RolEnum.ADMIN_LOCAL:
            existe = db.query(Usuario).filter(
                Usuario.rol == RolEnum.ADMIN_LOCAL,
                Usuario.sede_id == sede_destino,
                Usuario.id != usuario_id
            ).first()
            if existe:
                raise HTTPException(status_code=400, detail="Esa sede ya tiene un ADMINISTRADOR LOCAL")

        area_nombre = _area_automatica_por_rol(nuevo_rol)

        if nuevo_rol == RolEnum.GESTIONADOR:
            if not data.area_nombre:
                # Señal especial: el frontend debe pedir al admin que elija área
                raise HTTPException(status_code=422, detail="REQUIERE_SELECCION_AREA")
            if data.area_nombre in AREAS_RESERVADAS:
                raise HTTPException(status_code=400, detail="Esa área no está disponible para GESTIONADOR")
            area_nombre = data.area_nombre

        if sede_destino and area_nombre:
            if not _sede_tiene_area(sede_destino, area_nombre, db):
                raise HTTPException(
                    status_code=400,
                    detail=f"La sede no tiene el área '{area_nombre}'. Asígnala primero desde gestión de sedes."
                )

        area = db.query(Area).filter(Area.nombre == area_nombre).first() if area_nombre else None
        usuario.rol = nuevo_rol
        usuario.area_id = area.id if area else None

    if data.sede_id is not None:
        usuario.sede_id = data.sede_id

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="La cédula o correo ya están registrados")

    return usuario


def eliminar_usuario_desde_panel(db: Session, usuario_id: int, editor_rol: str, editor_sede_id: Optional[int]):

    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if editor_rol == "ADMIN_LOCAL" and usuario.sede_id != editor_sede_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar este usuario")

    db.delete(usuario)
    db.commit()