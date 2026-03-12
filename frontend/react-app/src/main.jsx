import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <App />
  
  // <StrictMode> Esto sirve para detectar problemas potenciales en la aplicación, como componentes obsoletos o malas prácticas. Es recomendable usarlo durante el desarrollo, pero puede ser omitido en producción para mejorar el rendimiento.
  //   <App />
  // </StrictMode>,
)