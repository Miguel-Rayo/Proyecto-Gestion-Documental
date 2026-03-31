import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../services/api"

export default function SelectArea() {
    const [areas, setAreas] = useState([])
    const [areaSeleccionada, setAreaSeleccionada] = useState("")
    const navigate = useNavigate()

    const rol = localStorage.getItem("rol")
    const sede_id = localStorage.getItem("sede_id")
    const user_id = localStorage.getItem("user_id")

    useEffect(() => {
        API.get(`/areas/por-rol/${rol}/${sede_id ?? "none"}`)
            .then(res => setAreas(res.data))
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!areaSeleccionada) return

        await API.post("/usuarios/seleccionar-area", {
            user_id: parseInt(user_id),
            nombre_area: areaSeleccionada
        })

        navigate("/dashboard")
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Selecciona tu área</h2>
            <select value={areaSeleccionada} onChange={(e) => setAreaSeleccionada(e.target.value)}>
                <option value="">-- Selecciona --</option>
                {areas.map(a => (
                    <option key={a.id} value={a.nombre}>{a.nombre}</option>
                ))}
            </select>
            <button type="submit" disabled={!areaSeleccionada}>Continuar</button>
        </form>
    )
}