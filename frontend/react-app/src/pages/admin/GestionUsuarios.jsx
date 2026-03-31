import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import API from "../../services/api"
import {
  Box, Typography, Button, TextField, Select, MenuItem,
  FormControl, InputLabel, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, InputAdornment, Tooltip, Divider, FormHelperText
} from "@mui/material"
import {
  ArrowBackRounded, AddRounded, SearchRounded, EditRounded,
  DeleteRounded, CheckCircleRounded, HourglassEmptyRounded,
  PersonAddRounded, PeopleAltRounded, ContentCopyRounded
} from "@mui/icons-material"

const ROL_COLORS = {
  ADMIN_GENERAL: { bg: "#e8eaf6", color: "#1a237e" },
  ADMIN_LOCAL:   { bg: "#e3f2fd", color: "#1565c0" },
  GESTIONADOR:   { bg: "#e8f5e9", color: "#2e7d32" },
  RADICADOR:     { bg: "#fff3e0", color: "#e65100" },
}

export default function GestionUsuarios() {
  const navigate = useNavigate()
  const rolEditor = localStorage.getItem("rol")
  const sedeEditor = parseInt(localStorage.getItem("sede_id"))

  const [usuarios, setUsuarios] = useState([])
  const [filtroSede, setFiltroSede] = useState("")
  const [filtroRol, setFiltroRol] = useState("")
  const [filtroCedula, setFiltroCedula] = useState("")
  const [todasSedes, setTodasSedes] = useState([])

  const [modalAbierto, setModalAbierto] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState(null)

  const [form, setForm] = useState({
    nombre_completo: "", cedula: "", correo: "",
    rol: "", sede_id: null, area_nombre: ""
  })

  const [departamentos, setDepartamentos] = useState([])
  const [ciudades, setCiudades] = useState([])
  const [sedesDisponibles, setSedesDisponibles] = useState([])
  const [deptoSeleccionado, setDeptoSeleccionado] = useState("")
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState("")
  const [areasGestionador, setAreasGestionador] = useState([])
  const [passwordModal, setPasswordModal] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    cargarUsuarios()
    API.get("/sedes/departamentos").then(res => setDepartamentos(res.data))
    if (rolEditor === "ADMIN_GENERAL") {
      API.get("/sedes/lista").then(res => setTodasSedes(res.data)).catch(() => {})
    }
  }, [])

  const cargarUsuarios = () => {
    const params = new URLSearchParams()
    if (filtroSede) params.append("sede_id", filtroSede)
    if (filtroRol) params.append("rol", filtroRol)
    if (filtroCedula) params.append("cedula", filtroCedula)
    API.get(`/usuarios?${params.toString()}`).then(res => setUsuarios(res.data))
  }

  const onDepartamento = (dep) => {
    setDeptoSeleccionado(dep)
    setCiudadSeleccionada("")
    setSedesDisponibles([])
    setForm(f => ({ ...f, sede_id: null, area_nombre: "" }))
    API.get(`/sedes/ciudades/${dep}`).then(res => setCiudades(res.data))
  }

  const onCiudad = (ciudad) => {
    setCiudadSeleccionada(ciudad)
    setForm(f => ({ ...f, sede_id: null, area_nombre: "" }))
    API.get(`/sedes/${ciudad}`).then(res => setSedesDisponibles(res.data))
  }

  const onSedeChange = (sede_id) => {
    const id = parseInt(sede_id)
    setForm(f => ({ ...f, sede_id: id, area_nombre: "" }))
    if (form.rol === "GESTIONADOR") cargarAreasGestionador(id)
  }

  const onRolChange = (rol) => {
    setForm(f => ({ ...f, rol, area_nombre: "" }))
    setAreasGestionador([])
    const sedeActual = rolEditor === "ADMIN_LOCAL" ? sedeEditor : form.sede_id
    if (rol === "GESTIONADOR" && sedeActual) cargarAreasGestionador(sedeActual)
  }

  const cargarAreasGestionador = (sede_id) => {
    API.get(`/areas/por-rol/GESTIONADOR/${sede_id}`)
      .then(res => setAreasGestionador(res.data))
      .catch(() => setAreasGestionador([]))
  }

  const abrirCrear = () => {
    setUsuarioEditando(null)
    setDeptoSeleccionado("")
    setCiudadSeleccionada("")
    setSedesDisponibles([])
    setAreasGestionador([])
    const sede_id = rolEditor === "ADMIN_LOCAL" ? sedeEditor : null
    setForm({ nombre_completo: "", cedula: "", correo: "", rol: "", sede_id, area_nombre: "" })
    setModalAbierto(true)
  }

  const abrirEditar = (usuario) => {
    setUsuarioEditando(usuario)
    setAreasGestionador([])
    setDeptoSeleccionado("")
    setCiudadSeleccionada("")
    setSedesDisponibles([])
    setForm({
      nombre_completo: usuario.nombre_completo,
      cedula: usuario.cedula,
      correo: usuario.correo,
      rol: usuario.rol,
      sede_id: usuario.sede_id,
      area_nombre: ""
    })
    if (usuario.rol === "GESTIONADOR" && usuario.sede_id) cargarAreasGestionador(usuario.sede_id)
    setModalAbierto(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (usuarioEditando) {
        await API.put(`/usuarios/${usuarioEditando.id}`, form)
        alert("Usuario actualizado correctamente")
        setModalAbierto(false)
        cargarUsuarios()
      } else {
        const res = await API.post("/usuarios", form)
        setModalAbierto(false)
        setPasswordModal({ cedula: res.data.cedula, password: res.data.password_temporal })
        cargarUsuarios()
      }
    } catch (err) {
      const detail = err.response?.data?.detail
      if (detail === "REQUIERE_SELECCION_AREA") {
        const sedeActual = rolEditor === "ADMIN_LOCAL" ? sedeEditor : form.sede_id
        if (sedeActual) cargarAreasGestionador(sedeActual)
        alert("Este cambio de rol requiere seleccionar un área. Elige una de la lista y vuelve a guardar.")
      } else {
        alert(detail || "Error al procesar la solicitud")
      }
    }
  }

  const handleEliminar = async (usuario) => {
    if (!confirm(`¿Deseas eliminar al usuario ${usuario.nombre_completo}?`)) return
    try {
      await API.delete(`/usuarios/${usuario.id}`)
      cargarUsuarios()
    } catch (err) {
      alert(err.response?.data?.detail || "Error al eliminar")
    }
  }

  const copiarPassword = () => {
    navigator.clipboard.writeText(passwordModal.password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const ROLES_DISPONIBLES = rolEditor === "ADMIN_LOCAL"
    ? ["GESTIONADOR", "RADICADOR"]
    : ["ADMIN_LOCAL", "GESTIONADOR", "RADICADOR"]

  // ─── Shared field sx ────────────────────────────────────────────────
  const fieldSx = { mb: 2 }

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%)",
      p: { xs: 2, sm: 3, md: 4 },
    }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate("/dashboard")}
          sx={{
            color: "white",
            borderColor: "rgba(255,255,255,0.4)",
            border: "1px solid",
            borderRadius: 2,
            px: 2,
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
            "&:hover": { background: "rgba(255,255,255,0.16)", borderColor: "rgba(255,255,255,0.8)" },
          }}
        >
          Volver al panel
        </Button>

        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", letterSpacing: 1.5, textTransform: "uppercase", fontSize: 11 }}>
            Administración
          </Typography>
          <Typography variant="h5" fontWeight={800} sx={{ color: "white", lineHeight: 1.2 }}>
            Gestión de Usuarios
          </Typography>
        </Box>

        <Button
          startIcon={<AddRounded />}
          onClick={abrirCrear}
          variant="contained"
          sx={{
            background: "white",
            color: "#1a237e",
            fontWeight: 700,
            borderRadius: 2,
            px: 2.5,
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            "&:hover": { background: "rgba(255,255,255,0.92)" },
          }}
        >
          Crear usuario
        </Button>
      </Box>

      {/* Filters card */}
      <Paper sx={{ borderRadius: 3, p: 2.5, mb: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 2 }}>
          Filtros de búsqueda
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-end" }}>
          {rolEditor === "ADMIN_GENERAL" && (
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Sede</InputLabel>
              <Select value={filtroSede} label="Sede" onChange={e => setFiltroSede(e.target.value)}>
                <MenuItem value="">Todas las sedes</MenuItem>
                {todasSedes.map(s => <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>)}
              </Select>
            </FormControl>
          )}

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Rol</InputLabel>
            <Select value={filtroRol} label="Rol" onChange={e => setFiltroRol(e.target.value)}>
              <MenuItem value="">Todos los roles</MenuItem>
              <MenuItem value="ADMIN_LOCAL">ADMIN_LOCAL</MenuItem>
              <MenuItem value="GESTIONADOR">GESTIONADOR</MenuItem>
              <MenuItem value="RADICADOR">RADICADOR</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Buscar por cédula"
            value={filtroCedula}
            onChange={e => setFiltroCedula(e.target.value)}
            onKeyDown={e => e.key === "Enter" && cargarUsuarios()}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" sx={{ color: "text.secondary" }} /></InputAdornment>
            }}
            sx={{ minWidth: 200 }}
          />

          <Button
            onClick={cargarUsuarios}
            variant="contained"
            startIcon={<SearchRounded />}
            sx={{
              background: "linear-gradient(135deg, #1a237e, #1565c0)",
              borderRadius: 2,
              fontWeight: 600,
              px: 2.5,
              "&:hover": { background: "linear-gradient(135deg, #283593, #1976d2)" },
            }}
          >
            Buscar
          </Button>
        </Box>
      </Paper>

      {/* Table */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <Box sx={{ height: 5, background: "linear-gradient(90deg, #1a237e, #1565c0)" }} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: "#f5f7ff" }}>
                {["Nombre", "Cédula", "Correo", "Rol", "Sede", "Contraseña", "Acciones"].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: "#1a237e", fontSize: 13, py: 2 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {usuarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center", py: 6 }}>
                    <PeopleAltRounded sx={{ fontSize: 48, color: "#c5cae9", mb: 1, display: "block", mx: "auto" }} />
                    <Typography color="text.secondary" fontSize={14}>Sin resultados</Typography>
                  </TableCell>
                </TableRow>
              ) : usuarios.map(u => (
                <TableRow
                  key={u.id}
                  hover
                  sx={{ "&:hover": { background: "#f5f7ff" }, transition: "background 0.15s" }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>{u.nombre_completo}</TableCell>
                  <TableCell sx={{ fontFamily: "monospace", fontSize: 13 }}>{u.cedula}</TableCell>
                  <TableCell sx={{ fontSize: 13, color: "text.secondary" }}>{u.correo}</TableCell>
                  <TableCell>
                    <Chip
                      label={u.rol}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: 11,
                        background: ROL_COLORS[u.rol]?.bg ?? "#f0f0f0",
                        color: ROL_COLORS[u.rol]?.color ?? "#333",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{u.sede_id ?? "—"}</TableCell>
                  <TableCell>
                    {u.debe_cambiar_password ? (
                      <Chip icon={<HourglassEmptyRounded />} label="Temporal" size="small"
                        sx={{ background: "#fff3e0", color: "#e65100", fontWeight: 600, fontSize: 11 }} />
                    ) : (
                      <Chip icon={<CheckCircleRounded />} label="Cambiada" size="small"
                        sx={{ background: "#e8f5e9", color: "#2e7d32", fontWeight: 600, fontSize: 11 }} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => abrirEditar(u)}
                        sx={{ color: "#1565c0", "&:hover": { background: "#e3f2fd" } }}>
                        <EditRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" onClick={() => handleEliminar(u)}
                        sx={{ color: "#c62828", "&:hover": { background: "#ffebee" } }}>
                        <DeleteRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ── Modal crear / editar ── */}
      <Dialog
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
      >
        <Box sx={{ height: 5, background: "linear-gradient(90deg, #1a237e, #1565c0)" }} />
        <DialogTitle sx={{ pt: 3, pb: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: 2,
            background: "linear-gradient(135deg, #1a237e, #1565c0)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <PersonAddRounded sx={{ color: "white", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {usuarioEditando ? "Editar usuario" : "Crear usuario"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {usuarioEditando ? "Modifica los datos del usuario" : "Completa el formulario para registrar un nuevo usuario"}
            </Typography>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          <form id="user-form" onSubmit={handleSubmit}>
            <TextField
              required fullWidth label="Nombre completo" sx={fieldSx}
              value={form.nombre_completo}
              onChange={e => setForm(f => ({ ...f, nombre_completo: e.target.value }))}
            />
            <TextField
              required fullWidth label="Cédula" sx={fieldSx}
              value={form.cedula}
              onChange={e => setForm(f => ({ ...f, cedula: e.target.value }))}
            />
            <TextField
              required fullWidth label="Correo electrónico" type="email" sx={fieldSx}
              value={form.correo}
              onChange={e => setForm(f => ({ ...f, correo: e.target.value }))}
            />

            <FormControl required fullWidth sx={fieldSx}>
              <InputLabel>Rol</InputLabel>
              <Select value={form.rol} label="Rol" onChange={e => onRolChange(e.target.value)}>
                <MenuItem value="" disabled>-- Selecciona --</MenuItem>
                {ROLES_DISPONIBLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </Select>
            </FormControl>

            {/* Cascada sede — solo ADMIN_GENERAL al crear */}
            {rolEditor === "ADMIN_GENERAL" && !usuarioEditando && (
              <>
                <FormControl fullWidth sx={fieldSx}>
                  <InputLabel>Departamento</InputLabel>
                  <Select value={deptoSeleccionado} label="Departamento" onChange={e => onDepartamento(e.target.value)}>
                    <MenuItem value="" disabled>-- Selecciona --</MenuItem>
                    {departamentos.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={fieldSx} disabled={!deptoSeleccionado}>
                  <InputLabel>Ciudad</InputLabel>
                  <Select value={ciudadSeleccionada} label="Ciudad" onChange={e => onCiudad(e.target.value)}>
                    <MenuItem value="" disabled>-- Selecciona --</MenuItem>
                    {ciudades.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={fieldSx} disabled={!ciudadSeleccionada}>
                  <InputLabel>Sede</InputLabel>
                  <Select value={form.sede_id ?? ""} label="Sede" onChange={e => onSedeChange(e.target.value)}>
                    <MenuItem value="" disabled>-- Selecciona --</MenuItem>
                    {sedesDisponibles.map(s => <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>)}
                  </Select>
                </FormControl>
              </>
            )}

            {/* Sede al editar — ADMIN_GENERAL */}
            {rolEditor === "ADMIN_GENERAL" && usuarioEditando && (
              <FormControl fullWidth sx={fieldSx}>
                <InputLabel>Sede</InputLabel>
                <Select
                  value={form.sede_id ?? ""}
                  label="Sede"
                  onChange={e => {
                    const id = parseInt(e.target.value)
                    setForm(f => ({ ...f, sede_id: id, area_nombre: "" }))
                    if (form.rol === "GESTIONADOR") cargarAreasGestionador(id)
                  }}
                >
                  <MenuItem value="">-- Sin sede --</MenuItem>
                  {todasSedes.map(s => <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>)}
                </Select>
              </FormControl>
            )}

            {/* Área — solo GESTIONADOR */}
            {form.rol === "GESTIONADOR" && (
              <FormControl required fullWidth sx={fieldSx}>
                <InputLabel>Área</InputLabel>
                <Select
                  value={form.area_nombre}
                  label="Área"
                  onChange={e => setForm(f => ({ ...f, area_nombre: e.target.value }))}
                >
                  <MenuItem value="" disabled>-- Selecciona --</MenuItem>
                  {areasGestionador.map(a => <MenuItem key={a.id} value={a.nombre}>{a.nombre}</MenuItem>)}
                </Select>
                {areasGestionador.length === 0 && (form.sede_id || rolEditor === "ADMIN_LOCAL") && (
                  <FormHelperText error>Esta sede no tiene áreas disponibles para GESTIONADOR</FormHelperText>
                )}
              </FormControl>
            )}
          </form>
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setModalAbierto(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="user-form"
            variant="contained"
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              background: "linear-gradient(135deg, #1a237e, #1565c0)",
              px: 3,
              "&:hover": { background: "linear-gradient(135deg, #283593, #1976d2)" },
            }}
          >
            {usuarioEditando ? "Guardar cambios" : "Crear usuario"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Modal contraseña temporal ── */}
      <Dialog
        open={!!passwordModal}
        onClose={() => setPasswordModal(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
      >
        <Box sx={{ height: 5, background: "linear-gradient(90deg, #2e7d32, #43a047)" }} />
        <DialogContent sx={{ pt: 4, pb: 3, textAlign: "center" }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: "50%", mx: "auto", mb: 2,
            background: "linear-gradient(135deg, #2e7d32, #43a047)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <CheckCircleRounded sx={{ color: "white", fontSize: 34 }} />
          </Box>

          <Typography variant="h6" fontWeight={700} gutterBottom>
            ¡Usuario creado!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Comparte estas credenciales con el nuevo usuario
          </Typography>

          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2, mb: 2, textAlign: "left" }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>CÉDULA</Typography>
            <Typography variant="body1" fontWeight={700} sx={{ fontFamily: "monospace", mb: 1.5 }}>
              {passwordModal?.cedula}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>CONTRASEÑA TEMPORAL</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
              <Typography variant="h5" fontWeight={800} sx={{
                fontFamily: "monospace", letterSpacing: 3,
                background: "linear-gradient(135deg, #1a237e, #1565c0)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                flex: 1,
              }}>
                {passwordModal?.password}
              </Typography>
              <Tooltip title={copied ? "¡Copiado!" : "Copiar"}>
                <IconButton onClick={copiarPassword} size="small"
                  sx={{ color: copied ? "#2e7d32" : "#1565c0" }}>
                  <ContentCopyRounded fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>

          <Alert severity="info" sx={{ textAlign: "left", fontSize: 12, borderRadius: 2 }}>
            El usuario deberá cambiarla en su primer ingreso.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: "center" }}>
          <Button
            onClick={() => setPasswordModal(null)}
            variant="contained"
            sx={{
              borderRadius: 2, fontWeight: 700, px: 4,
              background: "linear-gradient(135deg, #1a237e, #1565c0)",
              "&:hover": { background: "linear-gradient(135deg, #283593, #1976d2)" },
            }}
          >
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}