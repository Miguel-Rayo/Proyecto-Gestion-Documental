import csv
import io
import sys

CAMPOS_CSV = ["numero_radicado", "fecha_ultima_gestion", "responsable_id", "estado"]

UMBRAL_FALLBACK_ITERATIVO = 5000


def construir_filas_simple(documentos: list, index: int = 0, resultado: list = None) -> list:
    if resultado is None:
        resultado = []

    if index >= len(documentos):
        return resultado

    doc = documentos[index]
    resultado.append({
        "numero_radicado": doc.numero_radicado,
        "fecha_ultima_gestion": doc.fecha_ultima_gestion,
        "responsable_id": doc.usuario_responsable if doc.usuario_responsable is not None else doc.usuario_radicador,
        "estado": doc.estado
    })

    return construir_filas_simple(documentos, index + 1, resultado)


def procesar_documento(documentos: list, index: int, resultado: list) -> list:
    if index >= len(documentos):
        return resultado

    return agregar_fila(documentos, index, resultado)


def agregar_fila(documentos: list, index: int, resultado: list) -> list:
    doc = documentos[index]
    resultado.append({
        "numero_radicado": doc.numero_radicado,
        "fecha_ultima_gestion": doc.fecha_ultima_gestion,
        "responsable_id": doc.usuario_responsable if doc.usuario_responsable is not None else doc.usuario_radicador,
        "estado": doc.estado
    })

    return procesar_documento(documentos, index + 1, resultado)


def _construir_filas_simple_iterativo(documentos: list) -> list:
    resultado = []
    for doc in documentos:
        resultado.append({
            "numero_radicado": doc.numero_radicado,
            "fecha_ultima_gestion": doc.fecha_ultima_gestion,
            "responsable_id": doc.usuario_responsable if doc.usuario_responsable is not None else doc.usuario_radicador,
            "estado": doc.estado
        })
    return resultado


def _construir_filas_cruzada_iterativo(documentos: list) -> list:
    resultado = []
    for doc in documentos:
        resultado.append({
            "numero_radicado": doc.numero_radicado,
            "fecha_ultima_gestion": doc.fecha_ultima_gestion,
            "responsable_id": doc.usuario_responsable if doc.usuario_responsable is not None else doc.usuario_radicador,
            "estado": doc.estado
        })
    return resultado


def construir_filas_con_proteccion(documentos: list, metodo: str = "simple") -> list:
    if not documentos:
        return []

    if len(documentos) > UMBRAL_FALLBACK_ITERATIVO:
        if metodo == "cruzada":
            return _construir_filas_cruzada_iterativo(documentos)
        return _construir_filas_simple_iterativo(documentos)

    limite_original = sys.getrecursionlimit()
    limite_necesario = len(documentos) + 100
    sys.setrecursionlimit(max(limite_original, limite_necesario))

    try:
        if metodo == "cruzada":
            return procesar_documento(documentos, 0, [])
        return construir_filas_simple(documentos, 0, [])
    finally:
        sys.setrecursionlimit(limite_original)


def generar_csv(filas: list) -> io.StringIO:
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=CAMPOS_CSV)
    writer.writeheader()
    writer.writerows(filas)
    output.seek(0)
    return output
