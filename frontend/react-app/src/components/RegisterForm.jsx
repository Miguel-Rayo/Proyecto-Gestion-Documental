import { useState, useEffect } from "react"
import API from "../services/api"
import { useNavigate } from "react-router-dom"
import {
  Box, Card, CardContent, TextField, Button,
  MenuItem, Typography, Grid, Alert, CircularProgress,
  InputAdornment
} from "@mui/material"
import {
  PersonOutlined, BadgeOutlined, EmailOutlined,
  LocationCityOutlined, MapOutlined, BusinessOutlined,
  WorkOutlined, AppRegistrationOutlined
} from "@mui/icons-material"

export default function RegisterForm() {

  const [nombre, setNombre] = useState("")
  const [cedula, setCedula] = useState("")
  const [correo, setCorreo] = useState("")

  const [departamentos, setDepartamentos] = useState([])
  const [ciudades, setCiudades] = useState([])
  const [sedes, setSedes] = useState([])

  const [departamento, setDepartamento] = useState("")
  const [ciudad, setCiudad] = useState("")
  const [sede, setSede] = useState("")

  const [roles, setRoles] = useState([])
  const [rol, setRol] = useState("")

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    API.get("/sedes/departamentos")
      .then(res => setDepartamentos(res.data))
  }, [])

  useEffect(() => {
    API.get("/usuarios/existe-admin-general")
      .then(res => {
        if (res.data.existe) {
          setRoles(["ADMIN_LOCAL", "GESTIONADOR", "RADICADOR"])
        } else {
          setRoles(["ADMIN_GENERAL", "ADMIN_LOCAL", "GESTIONADOR", "RADICADOR"])
        }
      })
  }, [])

  useEffect(() => {
    if (!sede) return
    API.get(`/usuarios/admin-local/${sede}`)
      .then(res => {
        if (res.data.existe) {
          setRoles(prev => prev.filter(r => r !== "ADMIN_LOCAL"))
        }
      })
  }, [sede])

  useEffect(() => {
    if (rol === "ADMIN_GENERAL") {
      setDepartamento("")
      setCiudad("")
      setSede("")
    }
  }, [rol])

  const cargarCiudades = (dep) => {
    setDepartamento(dep)
    API.get(`/sedes/ciudades/${dep}`)
      .then(res => setCiudades(res.data))
  }

  const cargarSedes = (city) => {
    setCiudad(city)
    API.get(`/sedes/${city}`)
      .then(res => setSedes(res.data))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!/^[a-zA-Z\s]+$/.test(nombre)) {
      setError("El nombre solo debe contener letras")
      return
    }
    if (!/^[0-9]+$/.test(cedula)) {
      setError("La cédula solo debe contener números")
      return
    }
    if (!/\S+@\S+\.\S+/.test(correo)) {
      setError("Correo electrónico inválido")
      return
    }
    if (rol !== "ADMIN_GENERAL" && !sede) {
      setError("Debe seleccionar una sede")
      return
    }

    const data = {
      nombre_completo: nombre,
      cedula: cedula,
      correo: correo,
      rol: rol,
      sede_id: rol === "ADMIN_GENERAL" ? null : sede
    }

    setLoading(true)
    try {
      const res = await API.post("/auth/register", data)
      alert("Usuario creado. Contraseña temporal: " + res.data.password_temporal)
      navigate("/login")
    } catch (err) {
      if (err.response && err.response.data.detail) {
        setError(err.response.data.detail)
      } else {
        setError("Error inesperado del servidor")
      }
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
      p: 2,
      py: 5
    }}>
      <Card sx={{
        width: "100%",
        maxWidth: 680,
        borderRadius: 3,
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>

          {/* Encabezado */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
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
              <AppRegistrationOutlined sx={{ color: "white", fontSize: 32 }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              Registro de Usuario
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Completa el formulario para crear una cuenta
            </Typography>
          </Box>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Nombre completo"
                  fullWidth
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlined color="action" />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Cédula"
                  fullWidth
                  required
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeOutlined color="action" />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Correo electrónico"
                  type="email"
                  fullWidth
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlined color="action" />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </Grid>

              {rol !== "ADMIN_GENERAL" && (
                <>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      label="Departamento"
                      fullWidth
                      required
                      value={departamento}
                      onChange={(e) => cargarCiudades(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <MapOutlined color="action" />
                            </InputAdornment>
                          )
                        }
                      }}
                    >
                      {departamentos.map(dep => (
                        <MenuItem key={dep} value={dep}>{dep}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      label="Ciudad"
                      fullWidth
                      required
                      value={ciudad}
                      onChange={(e) => cargarSedes(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationCityOutlined color="action" />
                            </InputAdornment>
                          )
                        }
                      }}
                    >
                      {ciudades.map(city => (
                        <MenuItem key={city} value={city}>{city}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      label="Sede"
                      fullWidth
                      required
                      value={sede}
                      onChange={(e) => setSede(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <BusinessOutlined color="action" />
                            </InputAdornment>
                          )
                        }
                      }}
                    >
                      {sedes.map(s => (
                        <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </>
              )}

              <Grid size={{ xs: 12 }}>
                <TextField
                  select
                  label="Rol"
                  fullWidth
                  required
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <WorkOutlined color="action" />
                        </InputAdornment>
                      )
                    }
                  }}
                >
                  {roles.map(r => (
                    <MenuItem key={r} value={r}>{r}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: "1rem",
                    mt: 1,
                    background: "linear-gradient(135deg, #1a237e, #1565c0)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #0d1757, #0d47a1)",
                    }
                  }}
                >
                  {loading
                    ? <CircularProgress size={24} color="inherit" />
                    : "Registrar Usuario"
                  }
                </Button>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button fullWidth variant="text" onClick={() => navigate("/login")}>
                    Iniciar Sesión
                  </Button>
                  <Button fullWidth variant="text" onClick={() => navigate("/")}>
                    Home
                  </Button>
                </Box>
              </Grid>

            </Grid>
          </Box>

        </CardContent>
      </Card>
    </Box>
  )
}