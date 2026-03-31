import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, InputAdornment, IconButton, CircularProgress
} from "@mui/material"
import { Visibility, VisibilityOff, LockOutlined, BadgeOutlined } from "@mui/icons-material"

export default function Login() {
  const [cedula, setCedula] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await axios.post("http://localhost:8000/auth/login", {
        cedula,
        password
      })

      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user_id", res.data.user_id)
      localStorage.setItem("rol", res.data.rol)
      localStorage.setItem("nombre", res.data.nombre)
      localStorage.setItem("sede_id", res.data.sede_id)

      if (res.data.debe_cambiar_password) {
        navigate("/change-password")
      } else if (res.data.debe_seleccionar_area) {
        navigate("/select-area")
      } else {
        navigate("/dashboard")
      }

    } catch (err) {
      setError("Cédula o contraseña incorrectos")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%)",
      p: 2
    }}>
      <Card sx={{
        width: "100%",
        maxWidth: 420,
        borderRadius: 3,
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>

          {/* Ícono y título */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Box sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1a237e, #1565c0)",
              mb: 2
            }}>
              <LockOutlined sx={{ color: "white", fontSize: 32 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              Gestión Documental
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Inicia sesión para continuar
            </Typography>
          </Box>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Formulario */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Cédula"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeOutlined color="action" />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: "1rem",
                background: "linear-gradient(135deg, #1a237e, #1565c0)",
                "&:hover": {
                  background: "linear-gradient(135deg, #0d1757, #0d47a1)",
                }
              }}
            >
              {loading
                ? <CircularProgress size={24} color="inherit" />
                : "Ingresar"
              }
            </Button>
          </Box>

          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <Button fullWidth variant="text" onClick={() => navigate("/")}>
                Home
              </Button>
              <Button fullWidth variant="text" onClick={() => navigate("/register")}>
                Registrarse
              </Button>
            </Box>

        </CardContent>
      </Card>
    </Box>
  )
}