// import { Button, Container, Typography } from "@mui/material";
// import { useNavigate } from "react-router-dom";

// export default function Home() {

//   const navigate = useNavigate();

//   return (
//     <Container style={{textAlign:"center", marginTop:"100px"}}>

//       <Typography variant="h4" gutterBottom>
//         Sistema de Gestión Documental
//       </Typography>

//       <Button
//         variant="contained"
//         style={{margin:10}}
//         onClick={()=>navigate("/login")}
//       >
//         Iniciar Sesión
//       </Button>

//       <Button
//         variant="outlined"
//         style={{margin:10}}
//         onClick={()=>navigate("/register")}
//       >
//         Registrarse
//       </Button>

//     </Container>
//   );
// }

import { useNavigate } from "react-router-dom"
import {
  Box, Button, Container, Typography, Grid,
  Card, CardContent
} from "@mui/material"
import {
  FolderOpenOutlined, SecurityOutlined, SpeedOutlined,
  CloudDoneOutlined, GroupsOutlined, VerifiedUserOutlined
} from "@mui/icons-material"

const features = [
  {
    icon: <FolderOpenOutlined sx={{ fontSize: 40, color: "#1565c0" }} />,
    title: "Gestión Centralizada",
    desc: "Organiza y accede a todos tus documentos desde un solo lugar, sin importar dónde estés."
  },
  {
    icon: <SecurityOutlined sx={{ fontSize: 40, color: "#1565c0" }} />,
    title: "Seguridad Garantizada",
    desc: "Cifrado de extremo a extremo, contraseñas hasheadas y autenticación JWT para proteger tu información."
  },
  {
    icon: <SpeedOutlined sx={{ fontSize: 40, color: "#1565c0" }} />,
    title: "Ágil y Eficiente",
    desc: "Reduce tiempos de búsqueda y elimina el papeleo. Más productividad para tu equipo."
  },
  {
    icon: <CloudDoneOutlined sx={{ fontSize: 40, color: "#1565c0" }} />,
    title: "Siempre Disponible",
    desc: "Acceso 24/7 a tus documentos con respaldo automático y alta disponibilidad."
  },
  {
    icon: <GroupsOutlined sx={{ fontSize: 40, color: "#1565c0" }} />,
    title: "Control por Roles",
    desc: "Administradores, gestores y radicadores con permisos diferenciados para mayor control."
  },
  {
    icon: <VerifiedUserOutlined sx={{ fontSize: 40, color: "#1565c0" }} />,
    title: "Trazabilidad Total",
    desc: "Registro completo de cada acción sobre los documentos. Auditoría en tiempo real."
  },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <Box>

      {/* Hero */}
      <Box sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 3,
        py: 8
      }}>
        <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.7)", letterSpacing: 4, mb: 1 }}>
          Bienvenido a
        </Typography>

        <Typography variant="h3" fontWeight={800} sx={{ color: "white", mb: 2, fontSize: { xs: "2rem", md: "3rem" } }}>
          Sistema de Gestión Documental
        </Typography>

        <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.8)", maxWidth: 600, mb: 5, fontWeight: 400, fontSize: { xs: "1rem", md: "1.25rem" } }}>
          Digitaliza, organiza y protege los documentos de tu empresa con total seguridad y control.
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/login")}
            sx={{
              px: 5, py: 1.5, borderRadius: 2, fontWeight: 700, fontSize: "1rem",
              bgcolor: "white", color: "#1a237e",
              "&:hover": { bgcolor: "rgba(255,255,255,0.9)" }
            }}
          >
            Iniciar Sesión
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate("/register")}
            sx={{
              px: 5, py: 1.5, borderRadius: 2, fontWeight: 700, fontSize: "1rem",
              borderColor: "white", color: "white",
              "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" }
            }}
          >
            Registrarse
          </Button>
        </Box>

      </Box>

      {/* Features */}
      <Box sx={{ bgcolor: "#f5f7fa", py: 10, px: 3 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} textAlign="center" mb={1} color="text.primary">
            ¿Por qué elegirnos?
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary" mb={6}>
            Una plataforma diseñada para empresas que valoran la organización y la seguridad.
          </Typography>

          <Grid container spacing={4}>
            {features.map((f, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{
                  height: "100%", borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box mb={2}>{f.icon}</Box>
                    <Typography variant="h6" fontWeight={700} mb={1}>{f.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA final */}
      <Box sx={{
        background: "linear-gradient(135deg, #1a237e, #1565c0)",
        py: 8, px: 3, textAlign: "center"
      }}>
        <Typography variant="h4" fontWeight={700} color="white" mb={2}>
          ¿Listo para empezar?
        </Typography>
        <Typography variant="body1" color="rgba(255,255,255,0.8)" mb={4}>
          Únete y transforma la manera en que tu empresa gestiona sus documentos.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/register")}
          sx={{
            px: 6, py: 1.5, borderRadius: 2, fontWeight: 700, fontSize: "1rem",
            bgcolor: "white", color: "#1a237e",
            "&:hover": { bgcolor: "rgba(255,255,255,0.9)" }
          }}
        >
          Comenzar ahora
        </Button>
      </Box>

    </Box>
  )
}