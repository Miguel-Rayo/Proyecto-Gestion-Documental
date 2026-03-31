import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Register from "./pages/Register"
import Login from "./pages/Login"
import ChangePassword from "./pages/ChangePassword"
import Dashboard from "./pages/Dashboard"
import SelectArea from "./pages/SelectArea"
import GestionUsuarios from "./pages/admin/GestionUsuarios"
import GestionSedes from "./pages/admin/GestionSedes"

import ProtectedRoute from "./components/ProtectedRoute"
import Repositorio from "./pages/Repositorio"

import BandejaEntrada from "./pages/BandejaEntrada"
import MiGestion from "./pages/MiGestion"
import Operacion from "./pages/Operacion";

function App() {

return (

<BrowserRouter>

<Routes>

<Route path="/" element={<Home/>} />

<Route path="/register" element={<Register/>} />

<Route path="/login" element={<Login/>} />

<Route
  path="/change-password"
  element={
    <ProtectedRoute>
      <ChangePassword/>
    </ProtectedRoute>
  }
/>

<Route
 path="/dashboard"
 element={
  <ProtectedRoute>
   <Dashboard/>
  </ProtectedRoute>
 }
/>

<Route path="/select-area" element={
  <ProtectedRoute>
    <SelectArea />
  </ProtectedRoute>
} />

<Route path="/admin/usuarios" element={
  <ProtectedRoute>
    <GestionUsuarios />
  </ProtectedRoute>
} />

<Route path="/admin/sedes" element={
  <ProtectedRoute>
    <GestionSedes />
  </ProtectedRoute>
} />





<Route
 path="/repositorio"
 element={
  <ProtectedRoute>
   <Repositorio/>
  </ProtectedRoute>
 }
/> 


<Route 
  path="/operacion" 
  element={<ProtectedRoute><Operacion /></ProtectedRoute>} 
/>
<Route path="/bandeja-entrada" element={<ProtectedRoute><BandejaEntrada/></ProtectedRoute>} />
<Route path="/mi-gestion" element={<ProtectedRoute><MiGestion/></ProtectedRoute>} />
      
</Routes>

</BrowserRouter>

)

}

export default App