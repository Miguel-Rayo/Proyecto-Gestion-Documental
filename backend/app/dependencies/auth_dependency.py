from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user_model import Usuario
from app.utils.jwt_handler import SECRET_KEY, ALGORITHM

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Token inválido"
            )

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Token inválido"
        )

    usuario = db.query(Usuario).filter(
        Usuario.id == user_id
    ).first()

    if not usuario:

        raise HTTPException(
            status_code=401,
            detail="Usuario no encontrado"
        )

    return usuario