import API from './api'; // Ajusta la ruta dependiendo de dónde esté tu api.js

export const operacionService = {
    // Obtener lista de posibles destinatarios (El docId es opcional, lo manejamos con un operador ternario)
    getDestinatarios: (docId) => API.get(`/operacion/destinatarios${docId ? `?documento_id=${docId}` : ''}`),
    
    // Acciones de envío y flujo
    enviar: (data) => API.post('/operacion/enviar', data),
    trasladar: (data) => API.post('/operacion/trasladar', data),
    aceptar: (id) => API.post(`/operacion/aceptar/${id}`),
    finalizar: (data) => API.post('/operacion/finalizar', data),

    // Listados de bandejas
    getBandejaEntrada: () => API.get('/operacion/bandeja-entrada'),
    getMiGestion: () => API.get('/operacion/mi-gestion'),
};