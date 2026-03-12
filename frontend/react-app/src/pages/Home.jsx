import { Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Home() {

  const navigate = useNavigate();

  return (
    <Container style={{textAlign:"center", marginTop:"100px"}}>

      <Typography variant="h4" gutterBottom>
        Sistema de Gestión Documental
      </Typography>

      <Button
        variant="contained"
        style={{margin:10}}
        onClick={()=>navigate("/login")}
      >
        Iniciar Sesión
      </Button>

      <Button
        variant="outlined"
        style={{margin:10}}
        onClick={()=>navigate("/register")}
      >
        Registrarse
      </Button>

    </Container>
  );
}