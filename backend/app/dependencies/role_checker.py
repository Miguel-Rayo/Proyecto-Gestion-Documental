from fastapi import Depends, HTTPException
from app.dependencies.auth_dependency import get_current_user

def require_roles(*roles):

    def role_checker(user = Depends(get_current_user)):

        if user.rol not in roles:

            raise HTTPException(
                status_code=403,
                detail="No tienes permisos"
            )

        return user

    return role_checker