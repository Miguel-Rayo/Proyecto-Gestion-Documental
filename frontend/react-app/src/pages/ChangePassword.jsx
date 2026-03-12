import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const validarPassword = (password) => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password)
  }
}

export default function ChangePassword() {
  const [password, setPassword] = useState("")
  const [confirmar, setConfirmar] = useState("")
  const [error, setError] = useState("")
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

    try {
      const user_id = localStorage.getItem("user_id")
      await axios.post("http://localhost:8000/auth/change-password", {
        user_id: parseInt(user_id),
        password
      })
			
      // navigate("/dashboard")

			// Limpiar todo el localStorage
			localStorage.clear()

			// Redirigir al login
			navigate("/login")

    } catch (error) {
      setError("Error al cambiar la contraseña")
    }
  }

  return (
    <div>
      <h2>Cambiar contraseña</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <ul>
          <li style={{ color: validacion.length ? "green" : "red" }}>
            Mínimo 8 caracteres
          </li>
          <li style={{ color: validacion.uppercase ? "green" : "red" }}>
            Al menos una mayúscula
          </li>
          <li style={{ color: validacion.lowercase ? "green" : "red" }}>
            Al menos una minúscula
          </li>
          <li style={{ color: validacion.number ? "green" : "red" }}>
            Al menos un número
          </li>
          <li style={{ color: validacion.symbol ? "green" : "red" }}>
            Al menos un símbolo
          </li>
        </ul>

        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={!passwordValida}>
          Cambiar contraseña
        </button>
      </form>
    </div>
  )
}