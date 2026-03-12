import { useNavigate } from "react-router-dom"

export default function Dashboard() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.clear()
    navigate("/login")
  }

  return (
    <div>
      <h1>Hola, {localStorage.getItem("nombre")}!</h1>
      <p>Rol: {localStorage.getItem("rol")}</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  )
}