from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth_routes, user_routes, sede_routes, documento_routes, operacion_routes, comentario_routes
    
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # en producción se restringe
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth_routes.router, prefix="/auth")
app.include_router(user_routes.router)
app.include_router(sede_routes.router)
app.include_router(documento_routes.router) # Nuevo gemini
app.include_router(operacion_routes.router)
app.include_router(comentario_routes.router)