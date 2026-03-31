// import { useNavigate } from "react-router-dom"

// export default function Dashboard() {
//   const navigate = useNavigate()

//   const logout = () => {
//     localStorage.clear()
//     navigate("/login")
//   }

//   return (
//     <div>
//       <h1>Hola, {localStorage.getItem("nombre")}!</h1>
//       <p>Rol: {localStorage.getItem("rol")}</p>
//       <button onClick={logout}>Cerrar sesión</button>
//     </div>
//   )
// }

import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import {
  Box, Typography, Button, Avatar, Chip, Card, CardActionArea,
  CardContent, Divider, Paper, CircularProgress
} from "@mui/material"
import {
  LogoutRounded,
  PeopleAltRounded,
  CorporateFareRounded,
  FolderOpenRounded,
  MoveToInboxRounded,
  SettingsRounded,
  ManageAccountsRounded,
  ChatBubbleOutlineRounded,
  AccessTimeRounded,
  InsertDriveFileRounded,
  PersonOutlineRounded,
} from "@mui/icons-material"
import API from "../services/api"

const MODULE_CONFIG = {
  "/admin/usuarios": {
    icon: <PeopleAltRounded sx={{ fontSize: 32 }} />,
    label: "Gestión de Usuarios",
    description: "Crear, editar y eliminar usuarios",
    gradient: "linear-gradient(135deg, #1a237e 0%, #283593 100%)",
    roles: ["ADMIN_GENERAL", "ADMIN_LOCAL"],
  },
  "/admin/sedes": {
    icon: <CorporateFareRounded sx={{ fontSize: 32 }} />,
    label: "Gestión de Sedes",
    description: "Crear, editar y eliminar sedes",
    gradient: "linear-gradient(135deg, #1565c0 0%, #0277bd 100%)",
    roles: ["ADMIN_GENERAL"],
  },
  "/repositorio": {
    icon: <FolderOpenRounded sx={{ fontSize: 32 }} />,
    label: "Gestión de Archivos",
    description: "Crear, editar y eliminar archivos",
    gradient: "linear-gradient(135deg, #283593 0%, #1565c0 100%)",
    roles: ["ADMIN_GENERAL", "ADMIN_LOCAL", "RADICADOR"],
  },
  "/bandeja-entrada": {
    icon: <MoveToInboxRounded sx={{ fontSize: 32 }} />,
    label: "Bandeja de Entrada",
    description: "Gestionar documentos entrantes",
    gradient: "linear-gradient(135deg, #1a237e 0%, #1565c0 100%)",
    roles: ["ADMIN_GENERAL", "ADMIN_LOCAL", "GESTIONADOR"],
  },
  "/operacion": {
    icon: <SettingsRounded sx={{ fontSize: 32 }} />,
    label: "Operación",
    description: "Gestión y seguimiento operativo",
    gradient: "linear-gradient(135deg, #0d47a1 0%, #283593 100%)",
    roles: ["ADMIN_GENERAL", "ADMIN_LOCAL", "RADICADOR"],
  },
  "/mi-gestion": {
    icon: <ManageAccountsRounded sx={{ fontSize: 32 }} />,
    label: "Mi Gestión",
    description: "Tu espacio de trabajo personal",
    gradient: "linear-gradient(135deg, #1565c0 0%, #1a237e 100%)",
    roles: ["ADMIN_GENERAL", "ADMIN_LOCAL", "GESTIONADOR"],
  },
}

function formatFecha(fechaStr) {
  return new Date(fechaStr).toLocaleDateString("es-CO", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

export default function Dashboard() {
  const navigate = useNavigate()
  const nombre = localStorage.getItem("nombre")
  const rol = localStorage.getItem("rol")

  const [comentarios, setComentarios] = useState([])
  const [loadingComentarios, setLoadingComentarios] = useState(true)

  const logout = () => {
    localStorage.clear()
    navigate("/login")
  }

  useEffect(() => {
    API.get("/comentarios/mis-comentarios")
      .then(res => setComentarios(res.data))
      .catch(() => {})
      .finally(() => setLoadingComentarios(false))
  }, [])

  const visibleModules = Object.entries(MODULE_CONFIG).filter(([, config]) =>
    config.roles.includes(rol)
  )

  const initials = nombre
    ? nombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?"

  const rolLabel = {
    ADMIN_GENERAL: "Administrador General",
    ADMIN_LOCAL: "Administrador Local",
    RADICADOR: "Radicador",
    GESTIONADOR: "Gestionador",
  }[rol] || rol

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%)",
        p: { xs: 2, sm: 3, md: 4 },
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              width: 56, height: 56,
              background: "rgba(255,255,255,0.15)",
              border: "2px solid rgba(255,255,255,0.3)",
              backdropFilter: "blur(8px)",
              fontSize: 20, fontWeight: 700, color: "white",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            {initials}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: "white", lineHeight: 1.2 }}>
              Hola, {nombre}!
            </Typography>
            <Chip
              label={rolLabel}
              size="small"
              sx={{
                mt: 0.5,
                background: "rgba(255,255,255,0.15)",
                color: "white", fontSize: 11, fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.25)",
                backdropFilter: "blur(4px)",
              }}
            />
          </Box>
        </Box>

        <Button
          onClick={logout}
          startIcon={<LogoutRounded />}
          variant="outlined"
          sx={{
            color: "white", borderColor: "rgba(255,255,255,0.4)",
            borderRadius: 2, px: 2.5, py: 1, fontWeight: 600, fontSize: 13,
            backdropFilter: "blur(8px)", background: "rgba(255,255,255,0.08)",
            "&:hover": { borderColor: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.16)" },
            transition: "all 0.2s ease",
          }}
        >
          Cerrar sesión
        </Button>
      </Box>

      {/* ── Título ── */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase", fontSize: 11, mb: 0.5 }}>
          Panel Principal
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ color: "white", lineHeight: 1.2 }}>
          Gestión Documental
        </Typography>
      </Box>

      {/* ── Módulos ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
          gap: 2.5,
          mb: 5,
        }}
      >
        {visibleModules.map(([path, config]) => (
          <Card
            key={path}
            sx={{
              borderRadius: 3, overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              border: "1px solid rgba(255,255,255,0.1)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": { transform: "translateY(-4px)", boxShadow: "0 16px 48px rgba(0,0,0,0.35)" },
            }}
          >
            <CardActionArea onClick={() => navigate(path)} sx={{ background: "white", height: "100%", p: 0 }}>
              <Box sx={{ height: 6, background: config.gradient }} />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 56, height: 56, borderRadius: 2.5,
                  background: config.gradient, mb: 2,
                  boxShadow: "0 4px 16px rgba(21,69,192,0.3)", color: "white",
                }}>
                  {config.icon}
                </Box>
                <Typography variant="subtitle1" fontWeight={700} color="text.primary" gutterBottom>
                  {config.label}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontSize={13}>
                  {config.description}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>

      {/* ── Mis Comentarios Enviados ── */}
      <Box sx={{ mb: 2 }}>
        {/* Encabezado sección */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 2,
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.2)",
          }}>
            <ChatBubbleOutlineRounded sx={{ color: "white", fontSize: 20 }} />
          </Box>
          <Typography variant="h6" fontWeight={700} sx={{ color: "white", flex: 1 }}>
            Mis Comentarios Recibidos
          </Typography>
          {!loadingComentarios && comentarios.length > 0 && (
            <Chip
              label={`${comentarios.length} comentario${comentarios.length !== 1 ? "s" : ""}`}
              size="small"
              sx={{
                background: "rgba(255,255,255,0.2)",
                color: "white", fontWeight: 700, fontSize: 11,
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            />
          )}
        </Box>

        {/* Estados: cargando / vacío / lista */}
        {loadingComentarios ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress sx={{ color: "rgba(255,255,255,0.7)" }} size={32} />
          </Box>
        ) : comentarios.length === 0 ? (
          <Paper sx={{
            borderRadius: 3, p: 4, textAlign: "center",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
          }}>
            <ChatBubbleOutlineRounded sx={{ fontSize: 40, color: "rgba(255,255,255,0.3)", mb: 1 }} />
            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
              Aún no has enviado ningún comentario
            </Typography>
          </Paper>
        ) : (
          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            gap: 1.5,
          }}>
            {comentarios.map((c) => (
              <Paper
                key={c.id}
                sx={{
                  borderRadius: 2.5,
                  overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                  background: "white",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(0,0,0,0.18)" },
                }}
              >
                {/* Franja superior */}
                <Box sx={{ height: 4, background: "linear-gradient(90deg, #1a237e, #1565c0)" }} />

                <Box sx={{ p: 2.5 }}>
                  {/* Documento */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                    <Box sx={{
                      width: 30, height: 30, borderRadius: 1.5, flexShrink: 0,
                      background: "linear-gradient(135deg, #e8eaf6, #c5cae9)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <InsertDriveFileRounded sx={{ fontSize: 15, color: "#1a237e" }} />
                    </Box>
                    <Typography fontWeight={700} fontSize={13} color="text.primary" noWrap sx={{ flex: 1 }}>
                      {c.nombre_documento}
                    </Typography>
                  </Box>

                  {/* Comentario */}
                  <Typography
                    fontSize={13}
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      lineHeight: 1.6,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {c.comentario ?? "Sin comentario"}
                  </Typography>

                  <Divider sx={{ mb: 1.5 }} />

                  {/* Footer: receptor + fecha */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                      <PersonOutlineRounded sx={{ fontSize: 14, color: "#1565c0" }} />
                      <Typography fontSize={12} fontWeight={600} color="#1565c0">
                        De:
                      </Typography>
                      <Typography fontSize={12} color="text.secondary">
                        {c.nombre_receptor}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <AccessTimeRounded sx={{ fontSize: 13, color: "text.disabled" }} />
                      <Typography fontSize={11} color="text.disabled">
                        {formatFecha(c.fecha)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Box>

      {/* ── Footer ── */}
      <Box sx={{ mt: "auto", pt: 4, textAlign: "center" }}>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)" }}>
          © {new Date().getFullYear()} Gestión Documental · Todos los derechos reservados
        </Typography>
      </Box>
    </Box>
  )
}