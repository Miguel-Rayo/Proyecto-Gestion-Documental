from fastapi import Depends, HTTPException
from app.dependencies.auth_dependency import get_current_user

def require_roles(*roles): # Mejora de la función para aceptar múltiples roles
    # Si por error pasamos una lista [role1, role2], la aplanamos
    if len(roles) == 1 and isinstance(roles[0], list):
        roles = roles[0]
        
    def role_checker(user = Depends(get_current_user)):
        # Convertimos todo a mayúsculas para evitar errores de escritura
        user_role = user.rol.upper()
        allowed_roles = [r.upper() for r in roles]

        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"El rol {user_role} no tiene permisos para esta acción"
            )

        return user

    return role_checker