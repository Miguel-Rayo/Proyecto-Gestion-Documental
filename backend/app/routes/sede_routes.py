from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.sede_model import Sede

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