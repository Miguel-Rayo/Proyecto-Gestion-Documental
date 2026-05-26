import csv
import io

# RECURSIVIDAD SIMPLE
# Recorre la lista de documentos uno a uno acumulando filas
def construir_filas_simple(documentos: list, index: int = 0, resultado: list = None) -> list:
    """
    Recursividad simple: se llama a sí misma avanzando el índice
    hasta procesar todos los documentos.
    """
    if resultado is None:
        resultado = []

    # Caso base: ya procesamos todos
    if index >= len(documentos):
        return resultado

    doc = documentos[index]
    resultado.append({
        "id": doc.id,
        "fecha_ultima_gestion": doc.fecha_ultima_gestion,
        "usuario_responsable": doc.usuario_responsable,
        "estado": doc.estado
    })

    # Llamada recursiva avanzando al siguiente
    return construir_filas_simple(documentos, index + 1, resultado)


# ============================================================
# RECURSIVIDAD INDIRECTA (CRUZADA)
# procesar_documento -> agregar_fila -> procesar_documento
# ============================================================
def procesar_documento(documentos: list, index: int, resultado: list) -> list:
    """
    Función A de la recursividad cruzada.
    Verifica si hay más documentos y delega a agregar_fila.
    """
    if index >= len(documentos):
        return resultado

    # Llama a la función B (cruzada)
    return agregar_fila(documentos, index, resultado)


def agregar_fila(documentos: list, index: int, resultado: list) -> list:
    """
    Función B de la recursividad cruzada.
    Agrega la fila y vuelve a llamar a procesar_documento.
    """
    doc = documentos[index]
    resultado.append({
        "id": doc.id,
        "fecha_ultima_gestion": doc.fecha_ultima_gestion,
        "usuario_responsable": doc.usuario_responsable,
        "estado": doc.estado
    })

    # Vuelve a llamar a la función A (cruzada)
    return procesar_documento(documentos, index + 1, resultado)


# ============================================================
# FUNCIÓN QUE GENERA EL CSV
# ============================================================
def generar_csv(filas: list) -> io.StringIO:
    output = io.StringIO()
    writer = csv.DictWriter(
        output,
        fieldnames=["id", "fecha_ultima_gestion", "usuario_responsable", "estado"]
    )
    writer.writeheader()
    writer.writerows(filas)
    output.seek(0)
    return output
