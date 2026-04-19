import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../services/api"
import {
  Box, Card, CardContent, Typography, Button,
  FormControl, InputLabel, Select, MenuItem, CircularProgress
} from "@mui/material"
import { AccountTreeRounded, ArrowForwardRounded } from "@mui/icons-material"

export default function SelectArea() {
  const [areas, setAreas] = useState([])
  const [areaSeleccionada, setAreaSeleccionada] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const rol = localStorage.getItem("rol")
  const sede_id = localStorage.getItem("sede_id")
  const user_id = localStorage.getItem("user_id")

  useEffect(() => {
    API.get(`/areas/por-rol/${rol}/${sede_id ?? "none"}`)
      .then(res => setAreas(res.data))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!areaSeleccionada) return

    setSubmitting(true)
    await API.post("/usuarios/seleccionar-area", {
      user_id: parseInt(user_id),
      nombre_area: areaSeleccionada
    })

    navigate("/dashboard")
  }

  return (
    <Box sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%)",
      p: 2,
    }}>
      <Card sx={{
        width: "100%",
        maxWidth: 420,
        borderRadius: 3,
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>

          {/* Ícono y título */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64, height: 64,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1a237e, #1565c0)",
              mb: 2,
              boxShadow: "0 4px 20px rgba(21,69,192,0.35)",
            }}>
              <AccountTreeRounded sx={{ color: "white", fontSize: 32 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              Selecciona tu área
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Elige el área en la que trabajarás para continuar
            </Typography>
          </Box>

          {/* Formulario */}
          <Box component="form" onSubmit={handleSubmit}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress sx={{ color: "#1565c0" }} size={32} />
              </Box>
            ) : (
              <FormControl fullWidth required sx={{ mb: 3 }}>
                <InputLabel>Área</InputLabel>
                <Select
                  value={areaSeleccionada}
                  label="Área"
                  onChange={(e) => setAreaSeleccionada(e.target.value)}
                  sx={{
                    borderRadius: 2,
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1565c0" },
                  }}
                >
                  <MenuItem value="" disabled>-- Selecciona --</MenuItem>
                  {areas.map(a => (
                    <MenuItem key={a.id} value={a.nombre}>{a.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={!areaSeleccionada || submitting}
              endIcon={submitting ? <CircularProgress size={18} sx={{ color: "white" }} /> : <ArrowForwardRounded />}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: 15,
                background: "linear-gradient(135deg, #1a237e, #1565c0)",
                boxShadow: "0 4px 16px rgba(21,69,192,0.4)",
                "&:hover": {
                  background: "linear-gradient(135deg, #283593, #1976d2)",
                  boxShadow: "0 6px 20px rgba(21,69,192,0.5)",
                },
                "&.Mui-disabled": { background: "#e0e0e0", boxShadow: "none" },
                transition: "all 0.2s ease",
              }}
            >
              {submitting ? "Guardando..." : "Continuar"}
            </Button>
          </Box>

        </CardContent>
      </Card>
    </Box>
  )
}