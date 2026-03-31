import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import API from "../../services/api"
import {
  Box, Typography, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider,
  Checkbox, FormControlLabel, Alert, Chip
} from "@mui/material"
import {
  ArrowBackRounded, AddRounded, EditRounded, DeleteRounded,
  CorporateFareRounded, WarningAmberRounded, LocationOnRounded
} from "@mui/icons-material"

const CAMPOS = [
  { label: "Nombre", key: "nombre", required: true },
  { label: "Dirección", key: "direccion", required: true },
  { label: "Ciudad", key: "ciudad", required: true },
  { label: "Departamento", key: "departamento", required: true },
  { label: "Código postal", key: "codigo_postal", required: false },
]

export default function GestionSedes() {
  const navigate = useNavigate()
  const [sedes, setSedes] = useState([])
  const [todasAreas, setTodasAreas] = useState([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [sedeEditando, setSedeEditando] = useState(null)
  const [form, setForm] = useState({
    nombre: "", direccion: "", codigo_postal: "",
    ciudad: "", departamento: "", areas: []
  })
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    cargarSedes()
    API.get("/areas/todas").then(res => setTodasAreas(res.data))
  }, [])

  const cargarSedes = () => {
    API.get("/sedes/lista").then(res => setSedes(res.data))
  }

  const abrirCrear = () => {
    setSedeEditando(null)
    setForm({ nombre: "", direccion: "", codigo_postal: "", ciudad: "", departamento: "", areas: [] })
    setModalAbierto(true)
  }

  const abrirEditar = (sede) => {
    setSedeEditando(sede)
    API.get(`/sedes/${sede.id}/detalle`).then(res => {
      setForm({
        nombre: res.data.nombre,
        direccion: res.data.direccion,
        codigo_postal: res.data.codigo_postal || "",
        ciudad: res.data.ciudad,
        departamento: res.data.departamento,
        areas: res.data.areas.map(a => a.nombre)
      })
      setModalAbierto(true)
    })
  }

  const toggleArea = (nombre) => {
    setForm(f => ({
      ...f,
      areas: f.areas.includes(nombre)
        ? f.areas.filter(a => a !== nombre)
        : [...f.areas, nombre]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (sedeEditando) {
        await API.put(`/sedes/${sedeEditando.id}`, form)
        alert("Sede actualizada correctamente")
      } else {
        await API.post("/sedes/nueva", form)
        alert("Sede creada correctamente")
      }
      setModalAbierto(false)
      cargarSedes()
    } catch (err) {
      alert(err.response?.data?.detail || "Error al procesar")
    }
  }

  const handleEliminar = async (sede) => {
    try {
      const res = await API.delete(`/sedes/${sede.id}`)
      if (res.data.requiere_confirmacion) {
        setConfirmDelete({ sede, mensaje: res.data.mensaje })
      } else {
        cargarSedes()
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Error al eliminar")
    }
  }

  const confirmarEliminar = async () => {
    try {
      await API.delete(`/sedes/${confirmDelete.sede.id}?confirmar=true`)
      setConfirmDelete(null)
      cargarSedes()
    } catch (err) {
      alert(err.response?.data?.detail || "Error al eliminar")
    }
  }

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
            border: "1px solid rgba(255,255,255,0.4)",
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
            Gestión de Sedes
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
          Nueva sede
        </Button>
      </Box>

      {/* Table */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <Box sx={{ height: 5, background: "linear-gradient(90deg, #1a237e, #1565c0)" }} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: "#f5f7ff" }}>
                {["Nombre", "Ciudad", "Departamento", "Dirección", "Acciones"].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: "#1a237e", fontSize: 13, py: 2 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sedes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center", py: 6 }}>
                    <CorporateFareRounded sx={{ fontSize: 48, color: "#c5cae9", mb: 1, display: "block", mx: "auto" }} />
                    <Typography color="text.secondary" fontSize={14}>Sin sedes registradas</Typography>
                  </TableCell>
                </TableRow>
              ) : sedes.map(s => (
                <TableRow
                  key={s.id}
                  hover
                  sx={{ "&:hover": { background: "#f5f7ff" }, transition: "background 0.15s" }}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{
                        width: 32, height: 32, borderRadius: 1.5,
                        background: "linear-gradient(135deg, #e8eaf6, #c5cae9)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <CorporateFareRounded sx={{ fontSize: 16, color: "#1a237e" }} />
                      </Box>
                      <Typography fontWeight={600} fontSize={14}>{s.nombre}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <LocationOnRounded sx={{ fontSize: 15, color: "#1565c0" }} />
                      <Typography fontSize={13}>{s.ciudad}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={s.departamento}
                      size="small"
                      sx={{ background: "#e8eaf6", color: "#1a237e", fontWeight: 600, fontSize: 11 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, color: "text.secondary" }}>{s.direccion}</TableCell>
                  <TableCell>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => abrirEditar(s)}
                        sx={{ color: "#1565c0", "&:hover": { background: "#e3f2fd" } }}>
                        <EditRounded fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" onClick={() => handleEliminar(s)}
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
            <CorporateFareRounded sx={{ color: "white", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {sedeEditando ? "Editar sede" : "Nueva sede"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {sedeEditando ? "Modifica los datos de la sede" : "Completa el formulario para registrar una nueva sede"}
            </Typography>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          <form id="sede-form" onSubmit={handleSubmit}>
            {/* Fila nombre + código postal */}
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                required fullWidth label="Nombre"
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              />
              <TextField
                label="Código postal"
                value={form.codigo_postal}
                onChange={e => setForm(f => ({ ...f, codigo_postal: e.target.value }))}
                sx={{ minWidth: 140 }}
              />
            </Box>

            <TextField
              required fullWidth label="Dirección" sx={{ mb: 2 }}
              value={form.direccion}
              onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))}
            />

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                required fullWidth label="Ciudad"
                value={form.ciudad}
                onChange={e => setForm(f => ({ ...f, ciudad: e.target.value }))}
              />
              <TextField
                required fullWidth label="Departamento"
                value={form.departamento}
                onChange={e => setForm(f => ({ ...f, departamento: e.target.value }))}
              />
            </Box>

            {/* Áreas */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
                Áreas asignadas
              </Typography>
              {form.areas.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                  {form.areas.map(a => (
                    <Chip
                      key={a} label={a} size="small" onDelete={() => toggleArea(a)}
                      sx={{ background: "#e8eaf6", color: "#1a237e", fontWeight: 600, fontSize: 11 }}
                    />
                  ))}
                </Box>
              )}
              <Paper
                variant="outlined"
                sx={{
                  maxHeight: 200, overflowY: "auto", borderRadius: 2,
                  p: 1.5,
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 0.5,
                }}
              >
                {todasAreas.map(a => (
                  <FormControlLabel
                    key={a.id}
                    control={
                      <Checkbox
                        size="small"
                        checked={form.areas.includes(a.nombre)}
                        onChange={() => toggleArea(a.nombre)}
                        sx={{ color: "#1565c0", "&.Mui-checked": { color: "#1565c0" } }}
                      />
                    }
                    label={<Typography fontSize={13}>{a.nombre}</Typography>}
                    sx={{ m: 0 }}
                  />
                ))}
              </Paper>
            </Box>
          </form>
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setModalAbierto(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="sede-form"
            variant="contained"
            sx={{
              borderRadius: 2, fontWeight: 700, px: 3,
              background: "linear-gradient(135deg, #1a237e, #1565c0)",
              "&:hover": { background: "linear-gradient(135deg, #283593, #1976d2)" },
            }}
          >
            {sedeEditando ? "Guardar cambios" : "Crear sede"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Modal confirmar eliminación ── */}
      <Dialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
      >
        <Box sx={{ height: 5, background: "linear-gradient(90deg, #b71c1c, #c62828)" }} />
        <DialogContent sx={{ pt: 4, pb: 2, textAlign: "center" }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: "50%", mx: "auto", mb: 2,
            background: "#ffebee",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <WarningAmberRounded sx={{ color: "#c62828", fontSize: 36 }} />
          </Box>

          <Typography variant="h6" fontWeight={700} gutterBottom>
            Confirmar eliminación
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {confirmDelete?.mensaje}
          </Typography>

          <Alert severity="error" sx={{ textAlign: "left", fontSize: 12, borderRadius: 2 }}>
            Esta acción no se puede deshacer.
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1, justifyContent: "center" }}>
          <Button
            onClick={() => setConfirmDelete(null)}
            variant="outlined"
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmarEliminar}
            variant="contained"
            sx={{
              borderRadius: 2, fontWeight: 700, px: 3,
              background: "linear-gradient(135deg, #b71c1c, #c62828)",
              "&:hover": { background: "linear-gradient(135deg, #c62828, #d32f2f)" },
            }}
          >
            Sí, eliminar todo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}