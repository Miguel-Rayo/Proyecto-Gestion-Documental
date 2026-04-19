# Sistema de Gestión Documental

Proyecto académico desarrollado como ejercicio práctico de diseño de algoritmos y arquitectura de software. El sistema permite radicar, gestionar y realizar seguimiento de documentos a través de un flujo de trabajo multirol en una organización con múltiples sedes.

---

## Tabla de Contenidos

1. [Stack Tecnológico](#1-stack-tecnológico)
2. [Diagrama de Arquitectura](#2-diagrama-de-arquitectura)
3. [Diagrama de Despliegue](#3-diagrama-de-despliegue)
4. [Diagramas de Secuencia](#4-diagramas-de-secuencia)
   - [4.1 Autenticación y primer acceso](#41-autenticación-y-primer-acceso)
   - [4.2 Radicación de un documento](#42-radicación-de-un-documento)
   - [4.3 Flujo completo de operaciones sobre un documento](#43-flujo-completo-de-operaciones-sobre-un-documento)
   - [4.4 Gestión de usuarios desde el panel administrativo](#44-gestión-de-usuarios-desde-el-panel-administrativo)
   - [4.5 Gestión de sedes](#45-gestión-de-sedes)
5. [Comparativa OWASP Top 10 vs Implementación](#5-comparativa-owasp-top-10-vs-implementación)
6. [Diccionario de Datos](#6-diccionario-de-datos)

---

## 1. Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend — Framework UI | React | 19.2 |
| Frontend — Componentes | Material UI (MUI) | 7.3 |
| Frontend — Bundler | Vite | 7.3 |
| Frontend — HTTP Client | Axios | 1.13 |
| Frontend — Routing | React Router DOM | 7.13 |
| Backend — Framework | FastAPI | 0.135 |
| Backend — Servidor ASGI | Uvicorn | 0.41 |
| Backend — ORM | SQLAlchemy | 2.0 |
| Backend — Validación | Pydantic | 2.12 |
| Backend — Autenticación | python-jose (JWT HS256) | 3.5 |
| Backend — Hashing | passlib + bcrypt | 1.7 / 5.0 |
| Backend — Driver BD | PyMySQL | 1.1 |
| Base de Datos | MySQL | 8.x |

---

## 2. Diagrama de Arquitectura

El sistema sigue una arquitectura de **tres capas** (presentación, lógica de negocio, datos) con separación de responsabilidades en el backend mediante el patrón **Router → Service → Model**.

```mermaid
graph TB
    subgraph FRONTEND["FRONTEND — React + Vite (puerto 5173)"]
        direction TB
        Pages["Páginas\n(Login, Dashboard, Repositorio,\nOperacion, SelectArea,\nAdmin: GestionUsuarios, GestionSedes)"]
        Components["Componentes\n(ProtectedRoute, RegisterForm)"]
        Services["Servicios HTTP\n(api.js · operacionService.js)"]
        Pages --> Components
        Pages --> Services
    end

    subgraph BACKEND["BACKEND — FastAPI + Uvicorn (puerto 8000)"]
        direction TB

        subgraph Middleware["Middleware"]
            CORS["CORSMiddleware"]
        end

        subgraph Routers["Routers (app/routes/)"]
            R_AUTH["auth_routes\n/auth/login\n/auth/register\n/auth/change-password"]
            R_USER["user_routes\n/usuarios\n/profile"]
            R_SEDE["sede_routes\n/sedes\n/areas"]
            R_DOC["documento_routes\n/documentos"]
            R_OP["operacion_routes\n/operacion"]
            R_COM["comentario_routes\n/comentarios"]
        end

        subgraph Dependencies["Dependencies (app/dependencies/)"]
            AUTH_DEP["auth_dependency\nget_current_user()"]
            ROLE_DEP["role_checker\nrequire_roles()"]
        end

        subgraph Services_BE["Services (app/services/)"]
            SVC_USER["user_service\n· registrar_usuario\n· crear_usuario_desde_panel\n· actualizar_usuario\n· eliminar_usuario"]
            SVC_DOC["documento_service\n· subir_documento\n· generar_numero_radicado\n· renombrar_documento\n· eliminar_documento"]
        end

        subgraph Utils["Utils (app/utils/)"]
            JWT["jwt_handler\n· crear_token\n· verificar_token"]
            SEC["security\n· hash_password\n· verificar_password\n· generar_password"]
        end

        subgraph Models["Models / ORM (app/models/)"]
            M_USER["Usuario"]
            M_DOC["Documento\nDocumentoComentario"]
            M_SEDE["Sede · Area · SedeArea"]
        end

        subgraph Schemas["Schemas Pydantic (app/schemas/)"]
            SCH["UserCreate · LoginSchema\nChangePasswordSchema\nDocumentoResponseSchema\nDocumentoEnvio · DocumentoFinalizar\nDestinatarioOut · ..."]
        end

        CORS --> Routers
        Routers --> Dependencies
        Routers --> Services_BE
        Routers --> Models
        Services_BE --> Models
        Services_BE --> Utils
        Dependencies --> Utils
        Dependencies --> Models
        Routers --> Schemas
    end

    subgraph DB["BASE DE DATOS — MySQL (puerto 3306)"]
        direction TB
        T_SEDES["sedes"]
        T_AREAS["areas"]
        T_SA["sedes_areas"]
        T_USR["usuarios"]
        T_DOC["documentos"]
        T_COM["documentos_comentarios"]
    end

    FRONTEND -- "HTTP/JSON\nAuthorization: Bearer JWT" --> BACKEND
    Models -- "SQLAlchemy ORM" --> DB



graph LR
    %% === CAPA FRONTEND ===
    subgraph FRONTEND["FRONTEND — React + Vite (puerto 5173)"]
        direction TB
        Pages["Páginas<br/>(Login, Dashboard, Repositorio,<br/>Operacion, SelectArea,<br/>Admin: GestionUsuarios, GestionSedes)"]
        Components["Componentes<br/>(ProtectedRoute, RegisterForm)"]
        Services["Servicios HTTP<br/>(api.js · operacionService.js)"]
        Pages --> Components
        Pages --> Services
    end

    %% === CAPA BACKEND ===
    subgraph BACKEND["BACKEND — FastAPI + Uvicorn (puerto 8000)"]
        direction TB

        subgraph Middleware["Middleware"]
            CORS["CORSMiddleware"]
        end

        subgraph Routers["Routers (app/routes/)"]
            R_AUTH["auth_routes<br/>/auth/login<br/>/auth/register<br/>/auth/change-password"]
            R_USER["user_routes<br/>/usuarios<br/>/profile"]
            R_SEDE["sede_routes<br/>/sedes<br/>/areas"]
            R_DOC["documento_routes<br/>/documentos"]
            R_OP["operacion_routes<br/>/operacion"]
            R_COM["comentario_routes<br/>/comentarios"]
        end

        subgraph Dependencies["Dependencies (app/dependencies/)"]
            AUTH_DEP["auth_dependency<br/>get_current_user()"]
            ROLE_DEP["role_checker<br/>require_roles()"]
        end

        subgraph Services_BE["Services (app/services/)"]
            SVC_USER["user_service<br/>· registrar_usuario<br/>· crear_usuario_desde_panel<br/>· actualizar_usuario<br/>· eliminar_usuario"]
            SVC_DOC["documento_service<br/>· subir_documento<br/>· generar_numero_radicado<br/>· renombrar_documento<br/>· eliminar_documento"]
        end

        subgraph Utils["Utils (app/utils/)"]
            JWT["jwt_handler<br/>· crear_token<br/>· verificar_token"]
            SEC["security<br/>· hash_password<br/>· verificar_password<br/>· generar_password"]
        end

        subgraph Models["Models / ORM (app/models/)"]
            M_USER["Usuario"]
            M_DOC["Documento<br/>DocumentoComentario"]
            M_SEDE["Sede · Area · SedeArea"]
        end

        subgraph Schemas["Schemas Pydantic (app/schemas/)"]
            SCH["UserCreate · LoginSchema<br/>ChangePasswordSchema<br/>DocumentoResponseSchema<br/>DocumentoEnvio · DocumentoFinalizar<br/>DestinatarioOut · ..."]
        end

        CORS --> Routers
        Routers --> Dependencies
        Routers --> Services_BE
        Routers --> Schemas
        Services_BE --> Models
        Services_BE --> Utils
        Dependencies --> Utils
        Dependencies --> Models
    end

    %% === CAPA BASE DE DATOS ===
    subgraph DB["BASE DE DATOS — MySQL (puerto 3306)"]
        direction TB
        T_SEDES["sedes"]
        T_AREAS["areas"]
        T_SA["sedes_areas"]
        T_USR["usuarios"]
        T_DOC["documentos"]
        T_COM["documentos_comentarios"]
    end

    FRONTEND -->|"HTTP/JSON<br/>Authorization: Bearer JWT"| BACKEND
    Models -->|"SQLAlchemy ORM"| DB
```

### Roles del sistema y jerarquía

```mermaid
graph TD
    AG["ADMIN_GENERAL\n· Ve todo el sistema\n· Gestiona sedes y áreas\n· Crea ADMIN_LOCAL\n· Área: Dirección y Gerencia General"]
    AL["ADMIN_LOCAL\n· Gestiona su sede\n· Crea RADICADOR y GESTIONADOR\n· Área: Administración"]
    RAD["RADICADOR\n· Sube documentos\n· Los envía a GESTIONADORES\n· Área: Correspondencia y Gestión Documental"]
    GES["GESTIONADOR\n· Recibe documentos\n· Acepta, traslada y finaliza\n· Área: cualquier área no reservada"]

    AG -->|"crea / gestiona"| AL
    AL -->|"crea / gestiona"| RAD
    AL -->|"crea / gestiona"| GES
    AG -->|"también puede crear"| GES
```

---

## 3. Diagrama de Despliegue

```mermaid
graph LR
    subgraph CLIENT["Equipo del Usuario"]
        BROWSER["Navegador Web\n(Chrome / Firefox / Edge)"]
    end

    subgraph DEV_SERVER["Servidor de Desarrollo Local"]
        direction TB

        subgraph VITE["Proceso: Vite Dev Server\npuerto 5173"]
            REACT_BUNDLE["Archivos estáticos\nHTML + JS + CSS\n(React compilado en memoria)"]
        end

        subgraph UVICORN["Proceso: Uvicorn\npuerto 8000"]
            FASTAPI_APP["Aplicación FastAPI\n(Python 3.x)"]
        end

        subgraph MYSQL_SRV["Proceso: MySQL Server\npuerto 3306"]
            DB_SCHEMA["Base de datos: documentsmanage\n6 tablas"]
        end

        VITE -- "TCP localhost:8000\nHTTP/REST + JSON\nBearer JWT" --> UVICORN
        UVICORN -- "TCP localhost:3306\nProtocolo MySQL\nvía PyMySQL + SQLAlchemy" --> MYSQL_SRV
    end

    BROWSER -- "HTTP localhost:5173\n(solicita la SPA)" --> VITE
    BROWSER -- "HTTP localhost:8000\n(peticiones API directas\ncon token en header)" --> UVICORN
```

> **Nota sobre el entorno de desarrollo:** Los tres procesos corren en la misma máquina. En un entorno de producción hipotético cada uno estaría en un contenedor o servidor separado, y la comunicación cliente-servidor usaría HTTPS.

### Flujo de arranque del sistema

```mermaid
sequenceDiagram
    participant DEV as Desarrollador
    participant MYSQL as MySQL
    participant UV as Uvicorn (FastAPI)
    participant VITE as Vite Dev Server

    DEV->>MYSQL: Ejecuta schema.sql (CREATE TABLE + INSERT datos iniciales)
    MYSQL-->>DEV: BD lista (6 tablas, 20 sedes, 37 áreas)
    DEV->>UV: uvicorn app.main:app --reload (puerto 8000)
    UV->>MYSQL: create_engine() — verifica conexión
    MYSQL-->>UV: Conexión establecida
    UV-->>DEV: API lista en http://localhost:8000
    DEV->>VITE: npm run dev (puerto 5173)
    VITE-->>DEV: Frontend listo en http://localhost:5173
```

---

## 4. Diagramas de Secuencia

### 4.1 Autenticación y primer acceso

Este diagrama cubre el ciclo completo desde el primer login de un usuario recién creado hasta que queda listo para operar.

```mermaid
sequenceDiagram
    actor U as Usuario
    participant FE as Frontend (React)
    participant BE as Backend (FastAPI)
    participant DB as MySQL

    Note over U,DB: ── Paso 1: Login ──

    U->>FE: Introduce cédula y contraseña
    FE->>BE: POST /auth/login { cedula, password }
    BE->>DB: SELECT * FROM usuarios WHERE cedula = ?
    DB-->>BE: Registro del usuario (incluye password_hash)
    BE->>BE: verificar_password(password, password_hash) — bcrypt
    alt Credenciales incorrectas
        BE-->>FE: 401 "Credenciales incorrectas"
        FE-->>U: Muestra mensaje de error
    else Credenciales correctas
        BE->>BE: crear_token({ user_id, rol }) — JWT HS256, 60 min
        BE-->>FE: 200 { token, user_id, nombre, rol,\ndebe_cambiar_password, sede_id, debe_seleccionar_area }
        FE->>FE: Guarda token y datos en localStorage
    end

    Note over U,DB: ── Paso 2a: Cambio de contraseña obligatorio (si debe_cambiar_password = true) ──

    FE->>FE: Detecta debe_cambiar_password = true
    FE-->>U: Redirige a pantalla de cambio de contraseña
    U->>FE: Introduce nueva contraseña
    FE->>BE: POST /auth/change-password { user_id, password }
    BE->>DB: UPDATE usuarios SET password_hash = ?, debe_cambiar_password = false WHERE id = ?
    DB-->>BE: OK
    BE-->>FE: 200 "Contraseña actualizada correctamente"
    FE-->>U: Redirige al Dashboard

    Note over U,DB: ── Paso 2b: Selección de área (si debe_seleccionar_area = true) ──

    FE->>FE: Detecta debe_seleccionar_area = true
    FE-->>U: Redirige a pantalla de selección de área
    FE->>BE: GET /areas/por-rol/{rol}/{sede_id}
    BE->>DB: SELECT areas JOIN sedes_areas WHERE id_sede = ?
    DB-->>BE: Lista de áreas disponibles para el rol
    BE-->>FE: [ { id, nombre }, ... ]
    FE-->>U: Muestra selector de área
    U->>FE: Elige su área
    FE->>BE: POST /usuarios/seleccionar-area { user_id, nombre_area }
    BE->>DB: UPDATE usuarios SET area_id = ?, debe_seleccionar_area = false WHERE id = ?
    DB-->>BE: OK
    BE-->>FE: 200 "Área asignada correctamente"
    FE-->>U: Redirige al Dashboard
```

---

### 4.2 Radicación de un documento

```mermaid
sequenceDiagram
    actor RAD as Radicador / Admin
    participant FE as Frontend (React)
    participant BE as Backend (FastAPI)
    participant DB as MySQL

    RAD->>FE: Selecciona archivo (PDF, DOCX, XLSX) y hace clic en "Radicar"
    FE->>BE: POST /documentos/subir\n(multipart/form-data, Authorization: Bearer token)
    
    BE->>BE: get_current_user() — decodifica JWT, obtiene usuario de BD
    BE->>BE: Verifica rol: ¿es ADMIN_GENERAL, ADMIN_LOCAL o RADICADOR?
    
    alt Rol no autorizado (ej: GESTIONADOR)
        BE-->>FE: 403 "El rol GESTIONADOR no tiene permisos para radicar documentos"
        FE-->>RAD: Muestra error
    else Rol autorizado
        BE->>BE: Valida content_type del archivo\n(solo PDF, DOCX, DOC, XLSX, XLS)
        alt Formato no permitido
            BE-->>FE: 400 "Formato de archivo no permitido"
            FE-->>RAD: Muestra error
        else Formato válido
            BE->>DB: SELECT sedes WHERE id = sede_id (para obtener código postal)
            DB-->>BE: { codigo_postal }
            BE->>BE: generar_numero_radicado()\nFormato: RAD-{cod_postal}-{DD-MM-AAAA}-{6 dígitos aleatorios}
            BE->>DB: SELECT documentos WHERE numero_radicado = ? (verificar unicidad)
            DB-->>BE: null (no existe → radicado válido)
            BE->>DB: INSERT INTO documentos\n(numero_radicado, nombre, archivo LONGBLOB,\nestado='RADICADO', usuario_radicador)
            DB-->>BE: Registro creado (id asignado)
            BE-->>FE: 200 DocumentoResponseSchema\n{ id, numero_radicado, nombre, estado, fecha_creacion }
            FE-->>RAD: Muestra confirmación con número de radicado
        end
    end
```

---

### 4.3 Flujo completo de operaciones sobre un documento

Este diagrama muestra el ciclo de vida de un documento desde que es radicado hasta que es finalizado, pasando por todos los posibles actores.

```mermaid
sequenceDiagram
    actor R as Radicador
    actor G1 as Gestionador A
    actor G2 as Gestionador B
    participant FE as Frontend
    participant BE as Backend
    participant DB as MySQL

    Note over R,DB: ── Etapa 1: ENVIAR (estado permanece RADICADO) ──

    R->>FE: Selecciona documento y destinatario, hace clic "Enviar"
    FE->>BE: GET /operacion/destinatarios\n(Radicador solo ve GESTIONADORES de otras sedes)
    BE->>DB: SELECT usuarios WHERE rol='GESTIONADOR' AND sede_id != mi_sede
    DB-->>BE: Lista de gestionadores disponibles
    BE-->>FE: [ { id, nombre_completo, rol, sede_nombre, area_nombre } ]
    FE-->>R: Muestra lista de destinatarios
    R->>FE: Elige Gestionador A, confirma
    FE->>BE: POST /operacion/enviar\n{ documento_id, usuario_destinatario_id }
    BE->>DB: UPDATE documentos SET usuario_responsable = G1_id, fecha_ultima_gestion = NOW()
    BE->>DB: INSERT INTO documentos_comentarios\n(documento_id, emisor=R, receptor=G1, comentario=NULL)
    DB-->>BE: OK
    BE-->>FE: 200 "Documento enviado con éxito"
    FE-->>R: Confirmación

    Note over R,DB: ── Etapa 2: ACEPTAR (estado cambia a ACEPTADO) ──

    G1->>FE: Consulta bandeja de entrada
    FE->>BE: GET /operacion/bandeja-entrada\n(Authorization: Bearer token de G1)
    BE->>DB: SELECT documentos WHERE usuario_responsable = G1_id\nAND estado IN ('RADICADO', 'TRASLADADO')
    DB-->>BE: Lista de documentos pendientes
    BE-->>FE: [ { id, numero_radicado, nombre, estado, fecha_creacion } ]
    FE-->>G1: Muestra bandeja de entrada
    G1->>FE: Hace clic en "Aceptar" sobre el documento
    FE->>BE: POST /operacion/aceptar/{documento_id}
    BE->>DB: SELECT documentos WHERE id = documento_id
    DB-->>BE: Documento (usuario_responsable = G1_id)
    BE->>BE: Verifica: doc.usuario_responsable == current_user.id
    BE->>DB: UPDATE documentos SET estado='ACEPTADO', fecha_ultima_gestion = NOW()
    DB-->>BE: OK
    BE-->>FE: 200 "Documento aceptado"
    FE-->>G1: Confirmación

    Note over R,DB: ── Etapa 3 (opcional): TRASLADAR a otro Gestionador ──

    G1->>FE: Decide trasladar a Gestionador B
    FE->>BE: GET /operacion/destinatarios?documento_id=X\n(Excluye quien me lo envió — lógica de último movimiento)
    BE->>DB: SELECT ultimo movimiento en documentos_comentarios WHERE doc_id = X ORDER BY id DESC
    DB-->>BE: { usuario_emisor: R_id }
    BE->>DB: SELECT usuarios WHERE rol='GESTIONADOR' AND id != R_id AND id != G1_id
    DB-->>BE: Lista (incluye G2)
    BE-->>FE: [ G2, ... ]
    FE-->>G1: Muestra destinatarios disponibles
    G1->>FE: Selecciona G2, confirma traslado
    FE->>BE: POST /operacion/trasladar\n{ documento_id, usuario_destinatario_id: G2_id }
    BE->>BE: Verifica que current_user.rol != 'ADMIN_LOCAL'
    BE->>DB: UPDATE documentos SET usuario_responsable=G2_id, estado='TRASLADADO', fecha_ultima_gestion=NOW()
    BE->>DB: INSERT INTO documentos_comentarios\n(documento_id, emisor=G1, receptor=G2, comentario=NULL)
    DB-->>BE: OK
    BE-->>FE: 200 "Documento trasladado con éxito"
    FE-->>G1: Confirmación

    Note over R,DB: ── Etapa 4: FINALIZAR (estado cambia a FINALIZADO, comentario obligatorio) ──

    G2->>FE: Consulta su bandeja, ve el documento trasladado
    G2->>FE: Escribe comentario de respuesta y hace clic "Finalizar"
    FE->>BE: POST /operacion/finalizar\n{ documento_id, comentario: "texto de respuesta" }
    BE->>BE: Verifica que comentario no esté vacío
    BE->>DB: SELECT documentos_comentarios WHERE documento_id=X\nAND usuario_receptor=G2_id AND comentario IS NULL\nORDER BY id DESC LIMIT 1
    DB-->>BE: { usuario_emisor: G1_id } (quién me lo envió)
    BE->>DB: UPDATE documentos SET estado='FINALIZADO', fecha_ultima_gestion=NOW()
    BE->>DB: INSERT INTO documentos_comentarios\n(documento_id, emisor=G2, receptor=G1, comentario="texto de respuesta")
    DB-->>BE: OK
    BE-->>FE: 200 "Ha finalizado la operación correctamente"
    FE-->>G2: Confirmación — el documento queda en "Mi Gestión"
```

---

### 4.4 Gestión de usuarios desde el panel administrativo

```mermaid
sequenceDiagram
    actor ADMIN as Admin General / Admin Local
    participant FE as Frontend
    participant BE as Backend
    participant DB as MySQL

    Note over ADMIN,DB: ── Listar usuarios ──

    ADMIN->>FE: Accede a Gestión de Usuarios
    FE->>BE: GET /usuarios?sede_id=&rol=&cedula=\n(Authorization: Bearer token)
    BE->>BE: require_roles("ADMIN_GENERAL", "ADMIN_LOCAL")
    alt Es ADMIN_LOCAL
        BE->>DB: SELECT usuarios WHERE sede_id = mi_sede AND rol != 'ADMIN_GENERAL'
    else Es ADMIN_GENERAL
        BE->>DB: SELECT usuarios WHERE rol != 'ADMIN_GENERAL' [+ filtros opcionales]
    end
    DB-->>BE: Lista de usuarios
    BE-->>FE: [ { id, nombre_completo, cedula, correo, rol, sede_id, area_id, debe_cambiar_password } ]
    FE-->>ADMIN: Tabla de usuarios

    Note over ADMIN,DB: ── Crear usuario ──

    ADMIN->>FE: Rellena formulario: nombre, cédula, correo, rol, sede, área
    FE->>BE: POST /usuarios\n{ nombre_completo, cedula, correo, rol, sede_id, area_nombre }
    BE->>BE: Bloqueo: ADMIN_GENERAL no se crea desde panel
    BE->>BE: Si editor es ADMIN_LOCAL: solo puede crear en su sede
    BE->>DB: SELECT usuarios WHERE rol='ADMIN_LOCAL' AND sede_id=? (verifica unicidad si rol=ADMIN_LOCAL)
    BE->>BE: _area_automatica_por_rol(rol)\n→ ADMIN_LOCAL→Administración\n→ RADICADOR→Correspondencia y Gestión Documental\n→ GESTIONADOR→área elegida por admin
    BE->>DB: Verifica que la sede tenga el área requerida (sedes_areas)
    BE->>BE: generar_password() — contraseña temporal de 10 caracteres
    BE->>BE: hash_password() — bcrypt
    BE->>DB: INSERT INTO usuarios (... password_hash, debe_cambiar_password=TRUE, debe_seleccionar_area=FALSE)
    DB-->>BE: OK
    BE-->>FE: 200 { mensaje, cedula, password_temporal }
    FE-->>ADMIN: Muestra cédula y contraseña temporal generada

    Note over ADMIN,DB: ── Editar usuario ──

    ADMIN->>FE: Modifica datos del usuario (nombre, cédula, correo, rol, sede)
    FE->>BE: PUT /usuarios/{usuario_id}\n{ nombre_completo?, cedula?, correo?, rol?, sede_id?, area_nombre? }
    BE->>BE: Validaciones de permisos y reglas de negocio (igual que en creación)
    alt Cambio de rol requiere nueva área (GESTIONADOR)
        BE-->>FE: 422 "REQUIERE_SELECCION_AREA"
        FE->>FE: Abre modal de selección de área
        FE->>BE: Reintenta PUT con area_nombre incluido
    end
    BE->>DB: UPDATE usuarios SET ... WHERE id = ?
    DB-->>BE: OK
    BE-->>FE: 200 "Usuario actualizado correctamente"

    Note over ADMIN,DB: ── Eliminar usuario ──

    ADMIN->>FE: Hace clic en eliminar usuario
    FE->>BE: DELETE /usuarios/{usuario_id}
    BE->>BE: require_roles("ADMIN_GENERAL", "ADMIN_LOCAL")
    BE->>BE: Si ADMIN_LOCAL: verifica que el usuario pertenece a su sede
    BE->>DB: DELETE FROM usuarios WHERE id = ?
    DB-->>BE: OK
    BE-->>FE: 200 "Usuario eliminado correctamente"
    FE-->>ADMIN: Refresca la tabla
```

---

### 4.5 Gestión de sedes

```mermaid
sequenceDiagram
    actor AG as Admin General
    participant FE as Frontend
    participant BE as Backend
    participant DB as MySQL

    Note over AG,DB: ── Ver detalle de una sede ──

    AG->>FE: Selecciona una sede en el panel
    FE->>BE: GET /sedes/{sede_id}/detalle
    BE->>BE: require_roles("ADMIN_GENERAL")
    BE->>DB: SELECT sedes WHERE id = sede_id
    BE->>DB: SELECT areas JOIN sedes_areas WHERE id_sede = sede_id
    BE->>DB: SELECT COUNT(*) FROM usuarios WHERE sede_id = sede_id
    DB-->>BE: Datos completos
    BE-->>FE: { id, nombre, ciudad, departamento, direccion, codigo_postal, areas[], total_usuarios }
    FE-->>AG: Muestra detalle con áreas y número de usuarios

    Note over AG,DB: ── Editar sede (modificar áreas asignadas) ──

    AG->>FE: Modifica la lista de áreas de la sede
    FE->>BE: PUT /sedes/{sede_id}\n{ nombre?, ..., areas: ["Area1", "Area2", ...] }
    BE->>DB: SELECT sedes_areas WHERE id_sede = sede_id (áreas actuales)
    BE->>BE: Calcula áreas_a_quitar = actuales − nuevas\náreas_a_agregar = nuevas − actuales
    loop Por cada área a quitar
        BE->>DB: SELECT COUNT(*) FROM usuarios WHERE sede_id=? AND area_id=? (hay usuarios?)
        alt Hay usuarios activos en esa área
            BE-->>FE: 400 "No se puede desasignar '{area}': tiene N usuario(s) activo(s)"
            FE-->>AG: Muestra error
        else No hay usuarios
            BE->>DB: DELETE FROM sedes_areas WHERE id_sede=? AND id_area=?
        end
    end
    loop Por cada área a agregar
        BE->>DB: INSERT INTO sedes_areas (id_sede, id_area)
    end
    DB-->>BE: OK
    BE-->>FE: 200 "Sede actualizada correctamente"

    Note over AG,DB: ── Eliminar sede ──

    AG->>FE: Hace clic en eliminar sede
    FE->>BE: DELETE /sedes/{sede_id}?confirmar=false
    BE->>DB: SELECT COUNT(*) FROM usuarios WHERE sede_id = sede_id
    alt Tiene usuarios Y confirmar=false
        BE-->>FE: 200 { requiere_confirmacion: true, mensaje, total_usuarios }
        FE-->>AG: Muestra diálogo de confirmación con total de usuarios afectados
        AG->>FE: Confirma la eliminación
        FE->>BE: DELETE /sedes/{sede_id}?confirmar=true
    end
    BE->>DB: DELETE FROM usuarios WHERE sede_id = ?
    BE->>DB: DELETE FROM sedes_areas WHERE id_sede = ?
    BE->>DB: DELETE FROM sedes WHERE id = ?
    DB-->>BE: OK
    BE-->>FE: 200 "Sede eliminada correctamente"
```

---

## 5. Comparativa OWASP Top 10 vs Implementación

La siguiente tabla evalúa cada categoría del estándar **OWASP Top 10 (edición 2021)** contra las decisiones de implementación presentes en este proyecto. El objetivo es académico: identificar qué se está aplicando correctamente, qué se está aplicando de forma parcial, y qué no se ha implementado aún.

### Leyenda
- ✅ **Implementado** — La práctica está presente de forma funcional.
- ⚠️ **Parcial** — Existe una aproximación al control, pero con limitaciones o brechas.
- ❌ **No implementado** — La práctica está ausente.

---

### A01:2021 — Broken Access Control (Control de Acceso Roto)

**Qué exige OWASP:** Denegar el acceso por defecto, implementar control de acceso en el servidor (no solo en el cliente), registrar fallos de acceso, limitar el acceso a los recursos según quién los posee.

| Control | Estado | Evidencia en el proyecto |
|---------|--------|--------------------------|
| Verificación de rol en el servidor para cada endpoint sensible | ✅ | `require_roles()` en [role_checker.py](backend/app/dependencies/role_checker.py) se aplica en `/usuarios`, `/sedes/lista`, `/sedes/nueva`, etc. |
| El frontend restringe rutas según rol | ⚠️ | [ProtectedRoute.jsx](frontend/react-app/src/components/ProtectedRoute.jsx) solo verifica la existencia del token en `localStorage`, no su validez real ni el rol. |
| El usuario solo puede ver/modificar sus propios recursos | ⚠️ | En `list_documents` ([documento_routes.py](backend/app/routes/documento_routes.py:46)) se filtra por `usuario_radicador`. En `renombrar_documento` y `eliminar_documento` se verifica propiedad. Sin embargo, los endpoints `/documentos/{id}/ver` y `/documentos/{id}/descargar` no verifican autenticación ni propiedad del documento. |
| ADMIN_LOCAL limitado a su propia sede | ✅ | [user_service.py](backend/app/services/user_service.py:115) valida que `data.sede_id == editor_sede_id`. |
| Control de quién puede trasladar documentos | ✅ | [operacion_routes.py](backend/app/routes/operacion_routes.py:103) lanza 403 si el rol es `ADMIN_LOCAL`. |
| Registro de intentos de acceso fallidos | ❌ | No existe logging de eventos de seguridad en ningún módulo. |

---

### A02:2021 — Cryptographic Failures (Fallos Criptográficos)

**Qué exige OWASP:** Proteger los datos sensibles en tránsito (TLS) y en reposo (cifrado), no usar claves hardcodeadas, usar algoritmos de hashing modernos para contraseñas.

| Control | Estado | Evidencia en el proyecto |
|---------|--------|--------------------------|
| Hashing de contraseñas con algoritmo robusto | ✅ | [security.py](backend/app/utils/security.py) usa `passlib` con `bcrypt` (adaptive hashing, resistente a fuerza bruta). |
| Clave secreta JWT externalizada a variables de entorno | ❌ | [jwt_handler.py](backend/app/utils/jwt_handler.py:4): `SECRET_KEY = "SUPER_SECRET_KEY_CAMBIAR_EN_PRODUCCION"` hardcodeada en código fuente. |
| Credenciales de base de datos en variables de entorno | ❌ | [database.py](backend/app/database.py:4): `DATABASE_URL = "mysql+pymysql://root:root@localhost/documentsmanage"` hardcodeada. |
| Datos en tránsito protegidos con HTTPS | ❌ | En desarrollo se usa HTTP puro. No hay configuración de TLS. |
| Documentos almacenados cifrados | ❌ | [documento_model.py](backend/app/models/documento_model.py): columna `archivo LONGBLOB` sin cifrado en reposo. |
| Token JWT con expiración configurada | ✅ | [jwt_handler.py](backend/app/utils/jwt_handler.py:6): `ACCESS_TOKEN_EXPIRE_MINUTES = 60`. |

---

### A03:2021 — Injection (Inyección)

**Qué exige OWASP:** Usar consultas parametrizadas o ORMs, validar y sanear la entrada del usuario, no construir consultas SQL concatenando strings.

| Control | Estado | Evidencia en el proyecto |
|---------|--------|--------------------------|
| Uso de ORM parametrizado (previene SQL Injection) | ✅ | SQLAlchemy genera consultas parametrizadas en todas las operaciones. No hay SQL crudo construido con concatenación. |
| Validación de tipos de entrada con Pydantic | ✅ | Todos los endpoints principales usan schemas Pydantic (ej. `LoginSchema`, `UserCreate`, `DocumentoEnvio`). |
| Endpoint sin schema Pydantic (usa `dict` libre) | ⚠️ | [sede_routes.py](backend/app/routes/sede_routes.py:28): `def seleccionar_area(data: dict, ...)` acepta cualquier diccionario sin validación estructural. |
| Prevención de XSS en el frontend | ✅ | React escapa automáticamente el contenido renderizado en JSX. No se usa `dangerouslySetInnerHTML` en ningún componente. |
| Validación de tipo MIME en carga de archivos | ✅ | [documento_service.py](backend/app/services/documento_service.py:11) valida `content_type` contra lista blanca de tipos permitidos. |

---

### A04:2021 — Insecure Design (Diseño Inseguro)

**Qué exige OWASP:** Modelar amenazas desde el diseño, implementar controles de negocio seguros, separar la lógica de autenticación de la lógica de negocio.

| Control | Estado | Evidencia en el proyecto |
|---------|--------|--------------------------|
| Separación de autenticación y lógica de negocio | ✅ | `auth_routes` está separado. `get_current_user` y `require_roles` son dependencias reutilizables. |
| Flujo de primer acceso controlado (cambio de contraseña obligatorio) | ✅ | `debe_cambiar_password = TRUE` al crear usuario, verificado en el frontend durante el login. |
| Unicidad de rol ADMIN_GENERAL garantizada | ⚠️ | [user_service.py](backend/app/services/user_service.py:35): se verifica con una query SELECT antes del INSERT, pero sin lock de BD, lo que abre una ventana de condición de carrera. |
| Número de radicado único | ⚠️ | [documento_service.py](backend/app/services/documento_service.py:30): el bucle `while` verifica unicidad antes de insertar, pero sin transacción aislada puede fallar bajo concurrencia alta. |
| Validación de transiciones de estado del documento | ⚠️ | Los endpoints `aceptar` y `finalizar` no comprueban el estado actual del documento antes de modificarlo (se puede "aceptar" un documento ya finalizado). |
| Protección contra fuerza bruta en login | ❌ | No hay rate limiting ni bloqueo de cuenta tras intentos fallidos en `/auth/login`. |

---

### A05:2021 — Security Misconfiguration (Mala Configuración de Seguridad)

**Qué exige OWASP:** Configurar de forma segura todos los componentes, restringir orígenes CORS, no exponer información de diagnóstico en producción, deshabilitar funcionalidades no necesarias.

| Control | Estado | Evidencia en el proyecto |
|---------|--------|--------------------------|
| CORS restringido a orígenes específicos | ❌ | [main.py](backend/app/main.py:10): `allow_origins=["*"]` con `allow_credentials=True`. Esta combinación está expresamente prohibida por la especificación CORS cuando se usan credenciales. |
| Errores internos no expuestos al cliente | ⚠️ | Los `HTTPException` devuelven mensajes descriptivos útiles para el desarrollo. El `except Exception as e` en `documento_service` descarta el error real en vez de loguearlo. |
| Credenciales de desarrollo no en código fuente | ❌ | `root:root` y la secret key están en archivos de código versionados. |
| Variables de entorno gestionadas con `.env` | ❌ | No existe un archivo `.env` ni uso de `python-dotenv` en el proyecto actual. |
| FastAPI en modo debug desactivado en producción | ⚠️ | No hay distinción entre entornos `dev`/`prod` configurada. |

---

### A06:2021 — Vulnerable and Outdated Components (Componentes Vulnerables y Desactualizados)

**Qué exige OWASP:** Mantener un inventario de dependencias, verificar fuentes, aplicar parches de seguridad de forma regular.

| Control | Estado | Evidencia en el proyecto |
|---------|--------|--------------------------|
| Dependencias declaradas explícitamente | ✅ | [requirements.txt](backend/requirements.txt) (backend) y [package.json](frontend/react-app/package.json) (frontend) con versiones fijadas. |
| Uso de versiones recientes de frameworks principales | ✅ | FastAPI 0.135, React 19.2, SQLAlchemy 2.0, MUI 7.3 — todas son versiones actuales a la fecha del proyecto. |
| Auditoría automatizada de vulnerabilidades | ❌ | No hay `pip audit`, `npm audit` ni integración con herramientas como Dependabot o Snyk. |
| Entorno virtual aislado (Python) | ✅ | El proyecto usa `venv` para aislar dependencias Python. |

---

### A07:2021 — Identification and Authentication Failures (Fallos de Identificación y Autenticación)

**Qué exige OWASP:** Implementar autenticación multifactor, evitar credenciales por defecto, proteger la recuperación de contraseñas, limitar intentos de login, expirar sesiones.

| Control | Estado | Evidencia en el proyecto |
|---------|--------|--------------------------|
| Contraseñas hasheadas (no almacenadas en texto plano) | ✅ | `hash_password()` usa bcrypt vía `passlib`. |
| Contraseñas temporales generadas aleatoriamente | ✅ | [security.py](backend/app/utils/security.py): `generar_password()` con `secrets.choice()` sobre charset alfanumérico. |
| Flujo de cambio de contraseña al primer acceso | ✅ | `debe_cambiar_password` controla el flujo desde el login hasta el cambio. |
| Verificación de contraseña actual al cambiar contraseña | ❌ | [auth_routes.py](backend/app/routes/auth_routes.py:49): el endpoint `change-password` solo recibe `user_id` y la nueva contraseña. No solicita la contraseña actual. |
| Token JWT con expiración | ✅ | 60 minutos de expiración configurados en `jwt_handler.py`. |
| Manejo de token expirado en el frontend | ❌ | No hay interceptor Axios que detecte respuestas 401 y redirija al login automáticamente. |
| Autenticación multifactor | ❌ | No implementada. Fuera del alcance del proyecto académico. |
| Limitación de intentos de login (rate limiting) | ❌ | No hay ningún mecanismo de throttling en `/auth/login`. |

---

### A08:2021 — Software and Data Integrity Failures (Fallos de Integridad de Software y Datos)

**Qué exige OWASP:** Verificar la integridad de las actualizaciones de software, usar firmas digitales, proteger los pipelines de CI/CD, no deserializar datos no confiables.

| Control | Estado | Evidencia en el proyecto |
|---------|--------|--------------------------|
| Validación del tipo de archivo subido | ✅ | [documento_service.py](backend/app/services/documento_service.py:41): lista blanca de MIME types permitidos. |
| Verificación de integridad del token JWT en cada request | ✅ | [auth_dependency.py](backend/app/dependencies/auth_dependency.py): `jwt.decode()` verifica firma y expiración en cada petición protegida. |
| Verificación de integridad por magic bytes del archivo | ❌ | Solo se valida el `content_type` reportado por el cliente (que puede manipularse). No se verifican los bytes reales del archivo. |
| Pipeline de CI/CD con validación de integridad | ❌ | No existe configuración de CI/CD. Proyecto académico local. |

---

### A09:2021 — Security Logging and Monitoring Failures (Fallos de Registro y Monitoreo)

**Qué exige OWASP:** Registrar logins (exitosos y fallidos), accesos a recursos sensibles, errores del sistema. Generar alertas ante actividad sospechosa.

| Control | Estado | Evidencia en el proyecto |
|---------|--------|--------------------------|
| Logging de eventos de autenticación | ❌ | No hay ninguna llamada a `logging` en `auth_routes.py`. Los intentos fallidos de login no se registran. |
| Logging de errores del sistema | ❌ | En [documento_service.py](backend/app/services/documento_service.py:64): el bloque `except Exception as e` hace rollback y lanza HTTPException pero no registra el error original. |
| Trazabilidad de movimientos de documentos | ✅ | La tabla `documentos_comentarios` actúa como log de auditoría: registra emisor, receptor, fecha y comentario de cada operación sobre un documento. |
| Registro de cambios de roles o configuración | ❌ | Las operaciones de modificación de usuarios y sedes no generan ningún registro de auditoría. |
| Sistema de alertas o monitoreo activo | ❌ | No implementado. Fuera del alcance del proyecto académico. |

---

### A10:2021 — Server-Side Request Forgery (SSRF)

**Qué exige OWASP:** Validar y sanear todas las URLs proporcionadas por el cliente, deshabilitar redirecciones HTTP innecesarias, segmentar el acceso a recursos internos.

| Control | Estado | Evidencia en el proyecto |
|---------|--------|--------------------------|
| El backend no realiza peticiones HTTP a URLs controladas por el cliente | ✅ | La aplicación no tiene endpoints que reciban URLs como parámetro y hagan fetch de ellas. No aplica como vector de ataque en el diseño actual. |
| Exposición de servicios internos | ⚠️ | El backend expone directamente el puerto 8000. En producción debería estar detrás de un reverse proxy (Nginx/Caddy) que limite la exposición de superficie. |

---

### Resumen ejecutivo OWASP

```mermaid
pie title Distribución del estado de controles OWASP Top 10
    "Implementado ✅" : 14
    "Parcial ⚠️" : 11
    "No implementado ❌" : 13
```

| Categoría OWASP | Controles ✅ | Controles ⚠️ | Controles ❌ |
|-----------------|:-----------:|:------------:|:-----------:|
| A01 Broken Access Control | 4 | 2 | 1 |
| A02 Cryptographic Failures | 2 | 0 | 4 |
| A03 Injection | 4 | 1 | 0 |
| A04 Insecure Design | 3 | 3 | 1 |
| A05 Security Misconfiguration | 0 | 1 | 4 |
| A06 Vulnerable Components | 3 | 0 | 1 |
| A07 Auth Failures | 4 | 0 | 4 |
| A08 Data Integrity | 2 | 0 | 2 |
| A09 Logging & Monitoring | 1 | 0 | 4 |
| A10 SSRF | 1 | 1 | 0 |

---

## 6. Diccionario de Datos

El schema de base de datos (`documentsmanage`) consta de **6 tablas**. A continuación se describe cada una con sus columnas, tipos, restricciones y propósito semántico.

---

### Tabla: `sedes`

Almacena las sedes físicas de la organización. Cada sede tiene una ubicación geográfica y un código postal que se usa para generar los números de radicado.

| Columna | Tipo | Nulo | Restricción | Descripción |
|---------|------|:----:|------------|-------------|
| `id` | INT | No | PK, AUTO_INCREMENT | Identificador único de la sede |
| `nombre` | VARCHAR(150) | No | NOT NULL | Nombre descriptivo de la sede (ej. "Sede Bogotá Centro") |
| `direccion` | VARCHAR(200) | No | NOT NULL | Dirección física completa (calle, carrera, número) |
| `codigo_postal` | VARCHAR(10) | Sí | — | Código postal. Se usa como parte del número de radicado (formato `RAD-{codigo_postal}-{fecha}-{seq}`) |
| `ciudad` | VARCHAR(100) | No | NOT NULL | Ciudad donde se ubica la sede |
| `departamento` | VARCHAR(100) | No | NOT NULL | Departamento colombiano donde se ubica la sede |

**Datos iniciales:** 20 sedes precargadas en ciudades de Colombia (Bogotá, Medellín, Cali, Barranquilla, etc.).

**Relaciones:**
- Una sede puede tener muchas áreas (`sedes_areas`).
- Una sede puede tener muchos usuarios (`usuarios.sede_id`).

---

### Tabla: `areas`

Catálogo global de áreas organizacionales. Las áreas son compartidas entre todas las sedes; la tabla `sedes_areas` determina cuáles aplican a cada sede.

| Columna | Tipo | Nulo | Restricción | Descripción |
|---------|------|:----:|------------|-------------|
| `id` | INT | No | PK, AUTO_INCREMENT | Identificador único del área |
| `nombre` | VARCHAR(150) | No | NOT NULL | Nombre del área funcional (ej. "Recursos Humanos", "Finanzas") |

**Datos iniciales:** 37 áreas funcionales precargadas, incluyendo tres **áreas reservadas** que se asignan automáticamente según el rol del usuario:

| Área reservada | Rol asignado |
|----------------|-------------|
| Dirección y Gerencia General | ADMIN_GENERAL |
| Administración | ADMIN_LOCAL |
| Correspondencia y Gestión Documental | RADICADOR |

Las demás áreas están disponibles para ser asignadas a **GESTIONADORES**.

**Relaciones:**
- Un área puede estar en muchas sedes (`sedes_areas`).
- Un usuario puede pertenecer a un área (`usuarios.area_id`).

---

### Tabla: `sedes_areas`

Tabla de unión (relación N:M) que define qué áreas están habilitadas en cada sede. Antes de asignar un usuario a un área dentro de una sede, el sistema verifica que la combinación exista en esta tabla.

| Columna | Tipo | Nulo | Restricción | Descripción |
|---------|------|:----:|------------|-------------|
| `id_sede` | INT | No | PK (compuesto), FK → `sedes.id` | Referencia a la sede |
| `id_area` | INT | No | PK (compuesto), FK → `areas.id` | Referencia al área |

**Clave primaria:** Compuesta por `(id_sede, id_area)` — no puede existir la misma combinación dos veces.

**Restricción de negocio:** Al editar una sede, no se puede desasignar un área si hay usuarios activos asignados a ella en esa sede. El backend lo valida antes de ejecutar el DELETE.

---

### Tabla: `usuarios`

Entidad central del sistema. Representa a todos los actores que interactúan con la plataforma. El rol determina qué operaciones puede realizar cada usuario y a qué datos tiene acceso.

| Columna | Tipo | Nulo | Restricción | Descripción |
|---------|------|:----:|------------|-------------|
| `id` | INT | No | PK, AUTO_INCREMENT | Identificador único del usuario |
| `nombre_completo` | VARCHAR(150) | No | NOT NULL | Nombre y apellidos del usuario |
| `cedula` | VARCHAR(20) | No | UNIQUE, NOT NULL | Número de identificación. Se usa como credencial de acceso (login) |
| `correo` | VARCHAR(150) | No | UNIQUE, NOT NULL | Correo electrónico. Único en el sistema |
| `rol` | ENUM | No | NOT NULL | Rol del usuario. Valores posibles: `ADMIN_GENERAL`, `ADMIN_LOCAL`, `GESTIONADOR`, `RADICADOR` |
| `sede_id` | INT | Sí | FK → `sedes.id` | Sede a la que pertenece el usuario. NULL solo para ADMIN_GENERAL |
| `area_id` | INT | Sí | FK → `areas.id` | Área asignada al usuario. Se determina por rol (automática o elegida) |
| `debe_seleccionar_area` | BOOLEAN | — | DEFAULT TRUE | Indica si el usuario debe elegir su área en el primer acceso. Se establece en FALSE al crear desde el panel de admin |
| `password_hash` | VARCHAR(255) | No | NOT NULL | Hash bcrypt de la contraseña. Nunca se almacena la contraseña en texto plano |
| `debe_cambiar_password` | BOOLEAN | — | DEFAULT TRUE | Indica si el usuario debe cambiar su contraseña en el primer login |
| `fecha_creacion` | TIMESTAMP | — | DEFAULT CURRENT_TIMESTAMP | Fecha y hora de creación del registro |

**Restricciones de negocio:**
- Solo puede existir **un** usuario con rol `ADMIN_GENERAL` en todo el sistema.
- Solo puede existir **un** `ADMIN_LOCAL` por sede.
- La combinación `(sede_id, area_id)` debe existir en `sedes_areas` (FK compuesta).

**Valores del ENUM `rol`:**

| Valor | Descripción |
|-------|-------------|
| `ADMIN_GENERAL` | Acceso total. Gestiona sedes, áreas y puede crear ADMIN_LOCAL. Puede radicar documentos. |
| `ADMIN_LOCAL` | Gestiona usuarios de su sede. Puede enviar documentos pero no trasladarlos. |
| `GESTIONADOR` | Recibe, acepta, traslada y finaliza documentos. Principal actor de la gestión documental. |
| `RADICADOR` | Sube documentos al sistema y los envía a gestionadores de otras sedes. |

---

### Tabla: `documentos`

Representa cada documento radicado en el sistema. El archivo binario se almacena directamente en la base de datos como `LONGBLOB`. El campo `estado` refleja la etapa actual del documento en su ciclo de vida.

| Columna | Tipo | Nulo | Restricción | Descripción |
|---------|------|:----:|------------|-------------|
| `id` | INT | No | PK, AUTO_INCREMENT | Identificador único del documento |
| `numero_radicado` | VARCHAR(30) | No | UNIQUE, NOT NULL | Código único generado al radicar. Formato: `RAD-{cod_postal}-{DD-MM-AAAA}-{6 dígitos}` |
| `nombre` | VARCHAR(200) | No | NOT NULL | Nombre del archivo (incluyendo extensión). Puede renombrarse posteriormente |
| `archivo` | LONGBLOB | No | NOT NULL | Contenido binario del archivo (PDF, DOCX, DOC, XLSX, XLS) |
| `fecha_creacion` | TIMESTAMP | — | DEFAULT CURRENT_TIMESTAMP | Fecha y hora en que se radicó el documento |
| `fecha_ultima_gestion` | TIMESTAMP | — | DEFAULT CURRENT_TIMESTAMP | Se actualiza en cada operación (enviar, trasladar, aceptar, finalizar) |
| `estado` | ENUM | No | NOT NULL, DEFAULT 'RADICADO' | Estado actual del documento en el flujo de trabajo |
| `usuario_radicador` | INT | Sí | FK → `usuarios.id` | Usuario que subió el documento. NULL si el usuario fue eliminado |
| `usuario_responsable` | INT | Sí | FK → `usuarios.id` | Usuario actualmente responsable del documento (cambia con cada operación) |

**Ciclo de vida del campo `estado`:**

```mermaid
stateDiagram-v2
    [*] --> RADICADO : POST /documentos/subir
    RADICADO --> RADICADO : POST /operacion/enviar\n(solo cambia responsable, no estado)
    RADICADO --> TRASLADADO : POST /operacion/trasladar\n(Gestionador o Admin General)
    TRASLADADO --> ACEPTADO : POST /operacion/aceptar/{id}\n(usuario responsable actual)
    RADICADO --> ACEPTADO : POST /operacion/aceptar/{id}
    ACEPTADO --> FINALIZADO : POST /operacion/finalizar\n(comentario obligatorio)
```

| Estado | Significado |
|--------|-------------|
| `RADICADO` | Documento recién subido. Puede ser enviado o trasladado |
| `TRASLADADO` | El documento fue derivado a otro gestionador (cambió de responsable) |
| `ACEPTADO` | El responsable actual aceptó el documento para gestionarlo |
| `FINALIZADO` | El documento fue procesado y cerrado con un comentario de respuesta obligatorio |

---

### Tabla: `documentos_comentarios`

Tabla de doble propósito: actúa como **registro de auditoría** de todos los movimientos del documento y como **canal de comentarios** entre usuarios.

| Columna | Tipo | Nulo | Restricción | Descripción |
|---------|------|:----:|------------|-------------|
| `id` | INT | No | PK, AUTO_INCREMENT | Identificador único del registro |
| `documento_id` | INT | No | NOT NULL, FK → `documentos.id` | Documento al que pertenece el movimiento o comentario |
| `usuario_emisor` | INT | Sí | FK → `usuarios.id` | Usuario que realiza la acción (quien envía, traslada o finaliza) |
| `usuario_receptor` | INT | Sí | FK → `usuarios.id` | Usuario que recibe el documento o el comentario |
| `comentario` | TEXT | Sí | — | Texto del comentario. Es `NULL` en registros de rastreo (envío/traslado) y obligatorio en finalización |
| `fecha` | TIMESTAMP | — | DEFAULT CURRENT_TIMESTAMP | Fecha y hora del evento |

**Lógica de uso según operación:**

| Operación | `comentario` | Propósito del registro |
|-----------|:------------:|------------------------|
| `enviar` | NULL | Trazabilidad: saber quién envió a quién (para excluir ese remitente en futuros envíos) |
| `trasladar` | NULL | Trazabilidad: registrar el traslado entre gestionadores |
| `finalizar` | Texto obligatorio | Comunicación: respuesta formal del gestionador hacia quien le envió el documento |

**Patrón de consulta clave:** Al finalizar un documento, el sistema busca el **último registro con `comentario IS NULL`** donde el receptor es el usuario actual. Esto identifica quién le envió el documento para construir la respuesta correctamente.

---

### Diagrama Entidad-Relación

```mermaid
erDiagram
    sedes {
        int id PK
        varchar nombre
        varchar direccion
        varchar codigo_postal
        varchar ciudad
        varchar departamento
    }

    areas {
        int id PK
        varchar nombre
    }

    sedes_areas {
        int id_sede PK,FK
        int id_area PK,FK
    }

    usuarios {
        int id PK
        varchar nombre_completo
        varchar cedula UK
        varchar correo UK
        enum rol
        int sede_id FK
        int area_id FK
        boolean debe_seleccionar_area
        varchar password_hash
        boolean debe_cambiar_password
        timestamp fecha_creacion
    }

    documentos {
        int id PK
        varchar numero_radicado UK
        varchar nombre
        longblob archivo
        timestamp fecha_creacion
        timestamp fecha_ultima_gestion
        enum estado
        int usuario_radicador FK
        int usuario_responsable FK
    }

    documentos_comentarios {
        int id PK
        int documento_id FK
        int usuario_emisor FK
        int usuario_receptor FK
        text comentario
        timestamp fecha
    }

    sedes ||--o{ sedes_areas : "tiene"
    areas ||--o{ sedes_areas : "está en"
    sedes ||--o{ usuarios : "alberga"
    areas ||--o{ usuarios : "clasifica"
    usuarios ||--o{ documentos : "radica"
    usuarios ||--o{ documentos : "es responsable de"
    documentos ||--o{ documentos_comentarios : "tiene historial de"
    usuarios ||--o{ documentos_comentarios : "emite"
    usuarios ||--o{ documentos_comentarios : "recibe"
```

---

