import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl, InputLabel, Select,
  MenuItem, Alert, CircularProgress, Chip, Divider, IconButton, Tooltip
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ForwardToInboxRoundedIcon from '@mui/icons-material/ForwardToInboxRounded';
import MoveToInboxRoundedIcon from '@mui/icons-material/MoveToInboxRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import { operacionService } from '../services/operacionService';
import { useNavigate } from 'react-router-dom';

const ESTADO_COLORS = {
  PENDIENTE:  { bg: "#fff3e0", color: "#e65100" },
  EN_GESTION: { bg: "#e3f2fd", color: "#1565c0" },
  TRASLADADO: { bg: "#f3e5f5", color: "#6a1b9a" },
  ACTIVO:     { bg: "#e8f5e9", color: "#2e7d32" },
}

export default function BandejaEntrada() {
  const navigate = useNavigate();
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const rol = localStorage.getItem('rol');

  const [openTraslado, setOpenTraslado] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [destinatarios, setDestinatarios] = useState([]);
  const [filtros, setFiltros] = useState({ sede: '', area: '', persona: '' });
  const [error, setError] = useState('');

  useEffect(() => { cargarBandeja(); }, []);

  const cargarBandeja = async () => {
    try {
      const res = await operacionService.getBandejaEntrada();
      setDocumentos(res.data);
    } catch (err) {
      console.error("Error al cargar bandeja", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAceptar = async (id) => {
    try {
      await operacionService.aceptar(id);
      alert("Documento aceptado exitosamente. Ahora está en 'Mi Gestión'.");
      cargarBandeja();
    } catch (err) {
      alert(err.response?.data?.detail || "Error al aceptar el documento");
    }
  };

  const handleOpenTraslado = async (doc) => {
    setSelectedDoc(doc);
    setError('');
    try {
      const res = await operacionService.getDestinatarios(doc.id);
      setDestinatarios(res.data);
      setOpenTraslado(true);
    } catch (err) {
      setError("No se pudieron cargar los destinatarios");
    }
  };

  const handleConfirmarTraslado = async () => {
    if (!filtros.persona) return setError("Debes seleccionar una persona");
    try {
      await operacionService.trasladar({
        documento_id: selectedDoc.id,
        usuario_destinatario_id: filtros.persona
      });
      setOpenTraslado(false);
      setFiltros({ sede: '', area: '', persona: '' });
      alert("Documento trasladado correctamente.");
      cargarBandeja();
    } catch (err) {
      setError(err.response?.data?.detail || "Error al trasladar");
    }
  };

  const sedesDisponibles = [...new Set(destinatarios.map(d => d.sede_nombre))];
  const areasDisponibles = destinatarios
    .filter(d => d.sede_nombre === filtros.sede)
    .map(d => d.area_nombre)
    .filter((v, i, a) => a.indexOf(v) === i);
  const personasDisponibles = destinatarios
    .filter(d => d.sede_nombre === filtros.sede && d.area_nombre === filtros.area);

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%)",
      p: { xs: 2, sm: 3, md: 4 },
    }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate("/dashboard")}
          sx={{
            color: "white",
            border: "1px solid rgba(255,255,255,0.4)",
            borderRadius: 2,
            px: 2,
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
            "&:hover": { background: "rgba(255,255,255,0.16)", borderColor: "rgba(255,255,255,0.8)" },
          }}
        >
          Volver al panel
        </Button>

        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", letterSpacing: 1.5, textTransform: "uppercase", fontSize: 11 }}>
            Documentos
          </Typography>
          <Typography variant="h5" fontWeight={800} sx={{ color: "white", lineHeight: 1.2 }}>
            Bandeja de Entrada
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mt: 0.5 }}>
            Documentos pendientes por tu revisión. Puedes aceptarlos o trasladarlos.
          </Typography>
        </Box>
      </Box>

      {/* Table */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <Box sx={{ height: 5, background: "linear-gradient(90deg, #1a237e, #1565c0)" }} />

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#1565c0" }} />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: "#f5f7ff" }}>
                  {["Radicado", "Nombre del Archivo", "Estado Actual", "Acciones"].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: "#1a237e", fontSize: 13, py: 2 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {documentos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: "center", py: 6 }}>
                      <MoveToInboxRoundedIcon sx={{ fontSize: 48, color: "#c5cae9", mb: 1, display: "block", mx: "auto" }} />
                      <Typography color="text.secondary" fontSize={14}>No hay documentos pendientes</Typography>
                    </TableCell>
                  </TableRow>
                ) : documentos.map((doc) => (
                  <TableRow key={doc.id} hover sx={{ "&:hover": { background: "#f5f7ff" }, transition: "background 0.15s" }}>
                    <TableCell>
                      <Typography
                        fontSize={12} fontWeight={700}
                        sx={{
                          fontFamily: "monospace",
                          background: "#e8eaf6", color: "#1a237e",
                          px: 1, py: 0.3, borderRadius: 1, display: "inline-block",
                        }}
                      >
                        {doc.numero_radicado}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{
                          width: 32, height: 32, borderRadius: 1.5, flexShrink: 0,
                          background: "linear-gradient(135deg, #e8eaf6, #c5cae9)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <InsertDriveFileRoundedIcon sx={{ fontSize: 16, color: "#1a237e" }} />
                        </Box>
                        <Typography fontSize={13} fontWeight={600}>{doc.nombre}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={doc.estado}
                        size="small"
                        sx={{
                          fontWeight: 700, fontSize: 11,
                          background: ESTADO_COLORS[doc.estado]?.bg ?? "#f0f0f0",
                          color: ESTADO_COLORS[doc.estado]?.color ?? "#333",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CheckCircleRoundedIcon />}
                          onClick={() => handleAceptar(doc.id)}
                          sx={{
                            borderRadius: 2, fontWeight: 700, fontSize: 12,
                            background: "linear-gradient(135deg, #2e7d32, #43a047)",
                            "&:hover": { background: "linear-gradient(135deg, #1b5e20, #2e7d32)" },
                            boxShadow: "none",
                          }}
                        >
                          Aceptar
                        </Button>
                        {rol !== "ADMIN_LOCAL" && (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<ForwardToInboxRoundedIcon />}
                            onClick={() => handleOpenTraslado(doc)}
                            sx={{
                              borderRadius: 2, fontWeight: 700, fontSize: 12,
                              background: "linear-gradient(135deg, #1a237e, #1565c0)",
                              "&:hover": { background: "linear-gradient(135deg, #283593, #1976d2)" },
                              boxShadow: "none",
                            }}
                          >
                            Trasladar
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* ── Modal de Traslado ── */}
      <Dialog
        open={openTraslado}
        onClose={() => { setOpenTraslado(false); setFiltros({ sede: '', area: '', persona: '' }); setError(''); }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
      >
        <Box sx={{ height: 5, background: "linear-gradient(90deg, #1a237e, #1565c0)" }} />
        <DialogTitle sx={{ pt: 3, pb: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: 2,
            background: "linear-gradient(135deg, #1a237e, #1565c0)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ForwardToInboxRoundedIcon sx={{ color: "white", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>Trasladar Documento</Typography>
            {selectedDoc && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {selectedDoc.nombre}
              </Typography>
            )}
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

          <FormControl fullWidth size="small">
            <InputLabel>1. Sede Destino</InputLabel>
            <Select
              value={filtros.sede}
              label="1. Sede Destino"
              onChange={(e) => setFiltros({ sede: e.target.value, area: '', persona: '' })}
            >
              {sedesDisponibles.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" disabled={!filtros.sede}>
            <InputLabel>2. Área Destino</InputLabel>
            <Select
              value={filtros.area}
              label="2. Área Destino"
              onChange={(e) => setFiltros(f => ({ ...f, area: e.target.value, persona: '' }))}
            >
              {areasDisponibles.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" disabled={!filtros.area}>
            <InputLabel>3. Funcionario</InputLabel>
            <Select
              value={filtros.persona}
              label="3. Funcionario"
              onChange={(e) => setFiltros(f => ({ ...f, persona: e.target.value }))}
            >
              {personasDisponibles.map(p => (
                <MenuItem key={p.id} value={p.id}>
                  <Box>
                    <Typography fontSize={13} fontWeight={600}>{p.nombre_completo}</Typography>
                    <Typography fontSize={11} color="text.secondary">{p.rol}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => { setOpenTraslado(false); setFiltros({ sede: '', area: '', persona: '' }); setError(''); }}
            variant="outlined"
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarTraslado}
            variant="contained"
            disabled={!filtros.persona}
            sx={{
              borderRadius: 2, fontWeight: 700, px: 3,
              background: "linear-gradient(135deg, #1a237e, #1565c0)",
              "&:hover": { background: "linear-gradient(135deg, #283593, #1976d2)" },
              "&.Mui-disabled": { background: "#e0e0e0" },
            }}
          >
            Confirmar Traslado
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}