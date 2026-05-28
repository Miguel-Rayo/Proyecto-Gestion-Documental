# Análisis de Algoritmos — Gestión Documental

Este documento describe los tipos de algoritmos identificados en el proyecto, indicando su presencia, naturaleza, ubicación y forma de aplicación.

---

## 1. Algoritmos de Ordenamiento

**Presencia: SÍ**

### Ordenamiento en base de datos (SQL ORDER BY)
- **Archivo:** [backend/app/routes/sede_routes.py](backend/app/routes/sede_routes.py) — Línea 67
- **Forma:** La consulta usa `.order_by(Area.nombre)` para ordenar alfabéticamente las áreas al momento de retornarlas. El ordenamiento lo ejecuta el motor de base de datos (SQLAlchemy traduce esto a `ORDER BY nombre`).

### Deduplicación con conservación de orden (Frontend)
- **Archivo:** [frontend/react-app/src/pages/BandejaEntrada.jsx](frontend/react-app/src/pages/BandejaEntrada.jsx) — Líneas 86–90
- **Forma:** Se usa `.filter((v, i, a) => a.indexOf(v) === i)` para eliminar duplicados de una lista de destinatarios, conservando el primer valor encontrado. Es un algoritmo de filtro con complejidad O(n²) (índice buscado linealmente por cada elemento).

---

## 2. Algoritmos Iterativos

**Presencia: SÍ**

Los algoritmos iterativos están ampliamente presentes en todo el proyecto. Se listan los más representativos:

### Backend — Python

| Archivo | Líneas | Descripción |
|---|---|---|
| [backend/app/utils/security.py](backend/app/utils/security.py) | 23 | Generación de contraseña aleatoria con `for i in range(10)` — itera 10 veces para construir la contraseña caracter a caracter |
| [backend/app/routes/sede_routes.py](backend/app/routes/sede_routes.py) | 87–90 | `for nombre_area in (data.areas or [])` — asigna áreas a una sede iterando la lista recibida |
| [backend/app/routes/sede_routes.py](backend/app/routes/sede_routes.py) | 191–220 | Tres bucles `for` consecutivos: uno para detectar áreas a quitar, otro para quitarlas y otro para agregarlas |
| [backend/app/routes/user_routes.py](backend/app/routes/user_routes.py) | 87–100 | Filtrado iterativo de usuarios aplicando condiciones sucesivas (sede, rol, cédula) |

### Frontend — JavaScript/React

| Archivo | Descripción |
|---|---|
| [frontend/react-app/src/pages/BandejaEntrada.jsx](frontend/react-app/src/pages/BandejaEntrada.jsx) | Cadenas de `.map()` y `.filter()` para procesar destinatarios y estados de documentos |
| [frontend/react-app/src/pages/Operacion.jsx](frontend/react-app/src/pages/Operacion.jsx) | `.map()` y `.filter()` para procesar sedes, áreas y personas |
| [frontend/react-app/src/pages/Dashboard.jsx](frontend/react-app/src/pages/Dashboard.jsx) | Múltiples `.map()` para renderizar tarjetas de módulos y listas de comentarios |
| [frontend/react-app/src/components/RegisterForm.jsx](frontend/react-app/src/components/RegisterForm.jsx) | `.map()` sobre departamentos, ciudades y sedes para construir los `<option>` de los selectores |

---

## 3. Algoritmos Recursivos

**Presencia: NO**

No se encontró ninguna función que se llame a sí misma ni ningún patrón de recursión (directa o indirecta) en el código fuente. Toda la lógica repetitiva se implementa de forma iterativa mediante bucles `for`, comprensiones de lista y métodos funcionales de array (`.map()`, `.filter()`, `.reduce()`).

---

## 4. Algoritmos Voraces (Greedy)

**Presencia: SÍ — aplicado de forma implícita**

Un algoritmo voraz toma en cada paso la mejor decisión local disponible sin reconsiderar decisiones anteriores. En este proyecto se aplica en la selección de destinatarios de un documento y en el filtrado priorizado de usuarios.

### Selección de destinatarios por jerarquía de roles
- **Archivo:** [backend/app/routes/operacion_routes.py](backend/app/routes/operacion_routes.py) — Líneas 15–71
- **Forma:** La función `obtener_destinatarios()` recorre una jerarquía de roles (ej. Auxiliar → Jefe de Área → Administrador de Sede → Superadministrador) y en cada nivel selecciona de inmediato a los usuarios disponibles que cumplan el criterio, sin revisar niveles ya procesados. Cada decisión es local y definitiva — patrón clásico voraz.

### Filtrado secuencial (greedy filtering) de usuarios
- **Archivo:** [backend/app/routes/user_routes.py](backend/app/routes/user_routes.py) — Líneas 88–100
- **Forma:** Los filtros se aplican en cadena: primero por sede, luego por rol, luego por cédula. Cada filtro reduce el conjunto de candidatos de forma irrevocable, lo que constituye una estrategia voraz de reducción progresiva del espacio de búsqueda.

---

## 5. Algoritmos de Programación Lineal / Programación Dinámica

**Presencia: NO**

No se identificó ningún algoritmo de optimización formal como la programación lineal (minimización/maximización de una función objetivo sujeta a restricciones) ni programación dinámica (memoización, tablas DP, subproblemas superpuestos). Tampoco existe una variante del problema de la mochila (knapsack) ni ningún esquema de asignación óptima de recursos.

Lo más cercano a una optimización son las consultas SQL con JOINs y filtros en [backend/app/routes/documento_routes.py](backend/app/routes/documento_routes.py) (líneas 57–68), donde se reduce el conjunto de resultados mediante condiciones encadenadas, pero esto es optimización de consultas a nivel de motor de base de datos, no un algoritmo de programación lineal implementado en el código de la aplicación.

---

## 6. Algoritmos de Cifrado y Seguridad de Contraseñas

**Presencia: SÍ — implementación completa y robusta**

### Hashing de contraseñas con Bcrypt
- **Archivo:** [backend/app/utils/security.py](backend/app/utils/security.py) — Líneas 17–29
- **Algoritmo:** **Bcrypt** — algoritmo de hash adaptativo diseñado específicamente para contraseñas. Incorpora un *salt* aleatorio automático en cada llamada, lo que lo hace resistente a ataques de diccionario y tablas rainbow.
- **Función `hash_password()`** (línea 26): `bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())` — genera el hash con sal.
- **Función `verificar_password()`** (línea 29): `bcrypt.checkpw(password, hashed)` — compara el texto plano contra el hash almacenado sin revelar la contraseña original.

### Autenticación con JWT (JSON Web Token)
- **Archivo:** [backend/app/utils/jwt_handler.py](backend/app/utils/jwt_handler.py)
- **Algoritmo de firma:** **HS256** (HMAC con SHA-256) — firma simétrica que garantiza integridad y autenticidad del token.
- **Función `crear_token()`**: genera un JWT firmado con `SECRET_KEY` y establece una expiración de 60 minutos.
- **Función `verificar_token()`**: decodifica y valida la firma del token; lanza excepción si el token está expirado o ha sido manipulado.

### Integración en el flujo de autenticación
- **Archivo:** [backend/app/routes/auth_routes.py](backend/app/routes/auth_routes.py) — Líneas 31–58
  - Inicio de sesión: verifica contraseña con `verificar_password()` y emite JWT con `crear_token()`.
  - Cambio de contraseña: re-hashea la nueva contraseña antes de persistirla.
- **Archivo:** [backend/app/dependencies/auth_dependency.py](backend/app/dependencies/auth_dependency.py) — Líneas 12–53
  - Middleware que extrae y valida el JWT en cada petición protegida; rechaza tokens inválidos o expirados.

### Generación segura de contraseñas temporales
- **Archivo:** [backend/app/utils/security.py](backend/app/utils/security.py) — Líneas 21–23
- **Módulo:** `secrets` (criptográficamente seguro, a diferencia de `random`)
- **Función `generar_password()`**: genera una contraseña aleatoria de 10 caracteres usando `secrets.choice()` sobre un alfabeto de letras, dígitos y símbolos especiales.

### Validación de fortaleza de contraseña (Frontend)
- **Archivo:** [frontend/react-app/src/pages/ChangePassword.jsx](frontend/react-app/src/pages/ChangePassword.jsx) — Líneas 14–22
- Reglas obligatorias: mínimo 8 caracteres, al menos una mayúscula, una minúscula, un dígito y un símbolo especial.

# Algoritmos de Recursividad — Exportación CSV

## Contexto

En el módulo de exportación de documentos del sistema de gestión documental, se implementaron dos tipos de recursividad para procesar la lista de documentos filtrada por rango de fechas y construir las filas del archivo CSV resultante. La lista se divide en dos mitades: la primera es procesada con **recursividad simple** y la segunda con **recursividad indirecta (cruzada)**.

---

## 1. Recursividad Simple

### Definición

La recursividad simple ocurre cuando **una función se llama a sí misma directamente**, avanzando hacia un caso base que detiene las llamadas. Es la forma más directa y común de recursividad.

### Flujo de ejecución

```
construir_filas_simple([doc0, doc1, doc2], index=0)
  → agrega doc0
  → construir_filas_simple([doc0, doc1, doc2], index=1)
      → agrega doc1
      → construir_filas_simple([doc0, doc1, doc2], index=2)
          → agrega doc2
          → construir_filas_simple([doc0, doc1, doc2], index=3)
              → index >= len(documentos) ✓ CASO BASE → retorna resultado
```

### Código

```python
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
```

### Componentes clave

| Componente | Descripción |
|---|---|
| **Caso base** | `index >= len(documentos)` — detiene la recursión cuando ya no hay más elementos |
| **Caso recursivo** | `construir_filas_simple(documentos, index + 1, resultado)` — avanza al siguiente documento |
| **Acumulador** | `resultado` — lista compartida que se va llenando en cada llamada |
| **Profundidad** | `n` llamadas, donde `n` es el tamaño de la primera mitad de la lista |

### Representación gráfica

```
Función A
   │
   ├─ ¿index >= len? → NO → agrega fila → llama A(index+1)
   │                                              │
   │                                    ¿index >= len? → NO → ...
   │
   └─ ¿index >= len? → SÍ → retorna resultado ✓
```

---

## 2. Recursividad Indirecta (Cruzada)

### Definición

La recursividad indirecta ocurre cuando **dos o más funciones se llaman mutuamente** formando un ciclo. La función A llama a B, y B llama de vuelta a A, hasta que una de ellas alcanza el caso base. También se conoce como recursividad cruzada o mutua.

### Flujo de ejecución

```
procesar_documento([doc0, doc1, doc2], index=0)   ← Función A
  → index < len ✓ → delega a agregar_fila(index=0)

    agregar_fila([doc0, doc1, doc2], index=0)      ← Función B
      → agrega doc0
      → llama procesar_documento(index=1)          ← de vuelta a A

        procesar_documento([...], index=1)          ← Función A
          → index < len ✓ → delega a agregar_fila(index=1)

            agregar_fila([...], index=1)            ← Función B
              → agrega doc1
              → llama procesar_documento(index=2)

                procesar_documento([...], index=2)
                  → agrega doc2 → procesar_documento(index=3)

                    procesar_documento([...], index=3)
                      → index >= len ✓ CASO BASE → retorna resultado
```

### Código

```python
def procesar_documento(documentos: list, index: int, resultado: list) -> list:
    """
    Función A — verifica si hay más documentos y delega a agregar_fila.
    """
    # Caso base: no hay más documentos
    if index >= len(documentos):
        return resultado

    # Llama a la Función B
    return agregar_fila(documentos, index, resultado)


def agregar_fila(documentos: list, index: int, resultado: list) -> list:
    """
    Función B — agrega la fila y vuelve a llamar a procesar_documento.
    """
    doc = documentos[index]
    resultado.append({
        "id": doc.id,
        "fecha_ultima_gestion": doc.fecha_ultima_gestion,
        "usuario_responsable": doc.usuario_responsable,
        "estado": doc.estado
    })

    # Vuelve a llamar a la Función A
    return procesar_documento(documentos, index + 1, resultado)
```

### Componentes clave

| Componente | Descripción |
|---|---|
| **Caso base** | Solo en `procesar_documento`: `index >= len(documentos)` |
| **Función A** | `procesar_documento` — actúa como **controlador**: verifica y delega |
| **Función B** | `agregar_fila` — actúa como **ejecutor**: procesa y reenvía |
| **Profundidad** | `2n` llamadas (A y B se alternan), donde `n` es el tamaño de la segunda mitad |

### Representación gráfica

```
  Función A                    Función B
(procesar_documento)         (agregar_fila)
        │                          │
        ├── ¿index >= len? ──SÍ──► retorna resultado ✓
        │
        └── NO ──────────────────► agrega fila
                                   │
                                   └──────────────────► llama A(index+1)
                                                               │
                                                        ¿index >= len? ...
```

---

## 3. Comparación entre ambos algoritmos

| Característica | Recursividad Simple | Recursividad Cruzada |
|---|---|---|
| **Número de funciones** | 1 | 2 |
| **Patrón de llamadas** | A → A → A → ... | A → B → A → B → ... |
| **Caso base** | En la misma función | Solo en la Función A |
| **Llamadas totales** | n | 2n |
| **Complejidad temporal** | O(n) | O(n) |
| **Complejidad espacial** | O(n) en el call stack | O(n) en el call stack |
| **Legibilidad** | Alta — todo en un lugar | Media — lógica distribuida |
| **Uso natural** | Listas, contadores | Parsers, gramáticas, estados alternos |

---

## 4. Aplicación en el endpoint

```python
# Dividir la lista en dos mitades
mitad = len(documentos) // 2
primera_mitad = documentos[:mitad]   # → recursividad simple
segunda_mitad = documentos[mitad:]   # → recursividad cruzada

filas_simple  = construir_filas_simple(primera_mitad, 0, [])
filas_cruzada = procesar_documento(segunda_mitad, 0, [])

filas_totales = filas_simple + filas_cruzada
```

```
documentos = [d1, d2, d3, d4, d5, d6]
                  ↓                  ↓
         [d1, d2, d3]       [d4, d5, d6]
       Rec. Simple           Rec. Cruzada
              ↓                    ↓
         filas_simple        filas_cruzada
                    ↓
             CSV final (6 filas)
```

---

## 5. Consideraciones importantes

**Límite de recursión en Python**

Python tiene un límite por defecto de **1000 llamadas recursivas** en el call stack. Para volúmenes grandes de documentos se recomienda verificar o aumentar este límite:

```python
import sys
sys.setrecursionlimit(5000)  # ajustar según el volumen esperado
```

**¿Cuándo usar cada una?**

La recursividad simple es suficiente para recorrer listas planas. La recursividad cruzada tiene más sentido en problemas donde dos estados o roles se alternan naturalmente, como parsers de lenguajes, validación de pares (apertura/cierre de paréntesis), o máquinas de estados con dos fases. En este proyecto se usa con fines académicos para demostrar ambos conceptos.


---

## Resumen General

| Categoría | Presente | Archivos Clave |
|---|---|---|
| Algoritmos de Ordenamiento | **SÍ** | `sede_routes.py`, `BandejaEntrada.jsx` |
| Algoritmos Iterativos | **SÍ** | Múltiples archivos backend y frontend |
| Algoritmos Recursivos | **NO** | — |
| Algoritmos Voraces (Greedy) | **SÍ** | `operacion_routes.py`, `user_routes.py` |
| Programación Lineal / Dinámica | **NO** | — |
| Cifrado y Seguridad de Contraseñas | **SÍ** | `security.py`, `jwt_handler.py`, `auth_routes.py` |
| Recursiviad | **Sí** | `reportes_algoritmos.py` |  

El proyecto usa una arquitectura Cliente-Servidor desacoplada (REST API + SPA):

Capa	Tecnología	Rol
- Frontend	React (SPA)	Vistas + lógica de presentación
- Backend	FastAPI (Python)	Lógica de negocio + endpoints REST
- Base de datos	SQLAlchemy (ORM)	Persistencia

Dentro del backend se puede ver un patrón similar a MVC:

1. Routes (/routes/) → Controladores
2. Models (/models/) → Modelos de datos
3. La vista no existe en el backend — la maneja React completamente por separado

Arquitectura de capas con API REST, donde el frontend y backend están completamente separados y se comunican vía HTTP/JSON.