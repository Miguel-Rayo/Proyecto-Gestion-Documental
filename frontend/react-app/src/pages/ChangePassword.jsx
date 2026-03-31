import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, InputAdornment, IconButton,
  CircularProgress, List, ListItem, ListItemIcon, ListItemText
} from "@mui/material"
import {
  LockOutlined, Visibility, VisibilityOff,
  CheckCircleOutlined, RadioButtonUncheckedOutlined, LockResetOutlined
} from "@mui/icons-material"

const validarPassword = (password) => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password)
  }
}

const requisitos = [
  { key: "length",    label: "Mínimo 8 caracteres" },
  { key: "uppercase", label: "Al menos una mayúscula" },
  { key: "lowercase", label: "Al menos una minúscula" },
  { key: "number",    label: "Al menos un número" },
  { key: "symbol",    label: "Al menos un símbolo" },
]

export default function ChangePassword() {
  const [password, setPassword] = useState("")
  const [confirmar, setConfirmar] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validacion = validarPassword(password)
  const passwordValida = Object.values(validacion).every(Boolean)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!passwordValida) {
      setError("La contraseña no cumple los requisitos")
      return
    }

    if (password !== confirmar) {
      setError("Las contraseñas no coinciden")
      return
    }

    setLoading(true)
    try {
      const user_id = localStorage.getItem("user_id")
      await axios.post("http://localhost:8000/auth/change-password", {
        user_id: parseInt(user_id),
        password
      })

      localStorage.clear()
      navigate("/login")

    } catch (err) {
      setError("Error al cambiar la contraseña")
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
        maxWidth: 440,
        borderRadius: 3,
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>

          {/* Encabezado */}
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
              <LockResetOutlined sx={{ color: "white", fontSize: 32 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              Cambiar contraseña
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Crea una contraseña segura para continuar
            </Typography>
          </Box>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>

            {/* Nueva contraseña */}
            <TextField
              fullWidth
              label="Nueva contraseña"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 2 }}
              slotProps={{
                input: {
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
                }
              }}
            />

            {/* Requisitos en tiempo real */}
            <Box sx={{
              bgcolor: "grey.50",
              borderRadius: 2,
              px: 1,
              mb: 2,
              border: "1px solid",
              borderColor: "grey.200"
            }}>
              <List dense disablePadding>
                {requisitos.map(({ key, label }) => (
                  <ListItem key={key} disablePadding sx={{ py: 0.3 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {validacion[key]
                        ? <CheckCircleOutlined sx={{ color: "success.main", fontSize: 18 }} />
                        : <RadioButtonUncheckedOutlined sx={{ color: "error.main", fontSize: 18 }} />
                      }
                    </ListItemIcon>
                    <ListItemText
                      primary={label}
                      slotProps={{
                        primary: {
                          variant: "body2",
                          color: validacion[key] ? "success.main" : "error.main",
                          fontWeight: validacion[key] ? 600 : 400
                        }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Confirmar contraseña */}
            <TextField
              fullWidth
              label="Confirmar contraseña"
              type={showConfirmar ? "text" : "password"}
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
              sx={{ mb: 3 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmar(!showConfirmar)} edge="end">
                        {showConfirmar ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={!passwordValida || loading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: "1rem",
                background: "linear-gradient(135deg, #1a237e, #1565c0)",
                "&:hover": {
                  background: "linear-gradient(135deg, #0d1757, #0d47a1)",
                },
                "&.Mui-disabled": {
                  background: "grey.300",
                }
              }}
            >
              {loading
                ? <CircularProgress size={24} color="inherit" />
                : "Cambiar contraseña"
              }
            </Button>

          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}