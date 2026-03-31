import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, CircularProgress,
  Chip, Divider, Tooltip, IconButton
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import { operacionService } from '../services/operacionService';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ViewIcon from '@mui/icons-material/VisibilityRounded';
import DownloadIcon from '@mui/icons-material/GetAppRounded';

const ESTADO_COLORS = {
  ACEPTADO:   { bg: "#e3f2fd", color: "#1565c0" },
  FINALIZADO: { bg: "#e8f5e9", color: "#2e7d32" },
}

export default function MiGestion() {
  const navigate = useNavigate();
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openFinalizar, setOpenFinalizar] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { cargarMiGestion(); }, []);

  const cargarMiGestion = async () => {
    try {
      const res = await operacionService.getMiGestion();
      setDocumentos(res.data);
    } catch (err) {
      console.error("Error al cargar mi gestión", err);
    } finally {
      setLoading(false);
    }
  };

	const handleAction = (id, mode) => {
		const baseUrl = api.defaults.baseURL;
		const url = `${baseUrl}/documentos/${id}/${mode}`;
		if (mode === 'ver') {
			window.open(url, '_blank');
		} else {
			window.location.href = url;
		}
	};

  const handleOpenFinalizar = (doc) => {
    setSelectedDoc(doc);
    setComentario('');
    setError('');
    setOpenFinalizar(true);
  };

  const handleConfirmarFinalizacion = async () => {
    if (!comentario.trim()) {
      setError("El comentario es estrictamente obligatorio para finalizar.");
      return;
    }
    try {
      await operacionService.finalizar({
        documento_id: selectedDoc.id,
        comentario: comentario
      });
      setOpenFinalizar(false);
      alert("Ha finalizado la operación correctamente");
      cargarMiGestion();
    } catch (err) {
      setError(err.response?.data?.detail || "Error al finalizar");
    }
  };

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
            Módulo
          </Typography>
          <Typography variant="h5" fontWeight={800} sx={{ color: "white", lineHeight: 1.2 }}>
            Mi Gestión
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mt: 0.5 }}>
            Documentos que has aceptado o finalizado. Recuerda finalizar las operaciones pendientes.
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
                  {["Radicado", "Nombre del Archivo", "Estado", "Acciones", "Opciones"].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: "#1a237e", fontSize: 13, py: 2 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {documentos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: "center", py: 6 }}>
                      <ManageAccountsRoundedIcon sx={{ fontSize: 48, color: "#c5cae9", mb: 1, display: "block", mx: "auto" }} />
                      <Typography color="text.secondary" fontSize={14}>No tienes documentos en gestión</Typography>
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
                        icon={doc.estado === 'FINALIZADO'
                          ? <TaskAltRoundedIcon style={{ fontSize: 14 }} />
                          : <CheckCircleRoundedIcon style={{ fontSize: 14 }} />
                        }
                        sx={{
                          fontWeight: 700, fontSize: 11,
                          background: ESTADO_COLORS[doc.estado]?.bg ?? "#f0f0f0",
                          color: ESTADO_COLORS[doc.estado]?.color ?? "#333",
                          "& .MuiChip-icon": { color: ESTADO_COLORS[doc.estado]?.color ?? "#333" },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {doc.estado === 'ACEPTADO' && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CheckCircleRoundedIcon />}
                          onClick={() => handleOpenFinalizar(doc)}
                          sx={{
                            borderRadius: 2, fontWeight: 700, fontSize: 12,
                            background: "linear-gradient(135deg, #2e7d32, #43a047)",
                            "&:hover": { background: "linear-gradient(135deg, #1b5e20, #2e7d32)" },
                            boxShadow: "none",
                          }}
                        >
                          Finalizar Operación
                        </Button>
                      )}
                    </TableCell>






										<TableCell>
											<Box sx={{ display: "flex", gap: 0.5 }}>
												<Tooltip title="Ver / Abrir">
													<IconButton size="small" onClick={() => handleAction(doc.id, 'ver')}
														sx={{ color: "#1565c0", "&:hover": { background: "#e3f2fd" } }}>
														<ViewIcon fontSize="small" />
													</IconButton>
												</Tooltip>
												<Tooltip title="Descargar">
													<IconButton size="small" onClick={() => handleAction(doc.id, 'descargar')}
														sx={{ color: "#2e7d32", "&:hover": { background: "#e8f5e9" } }}>
														<DownloadIcon fontSize="small" />
													</IconButton>
												</Tooltip>
											</Box>
										</TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* ── Modal de Finalizar ── */}
      <Dialog
        open={openFinalizar}
        onClose={() => setOpenFinalizar(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
      >
        <Box sx={{ height: 5, background: "linear-gradient(90deg, #2e7d32, #43a047)" }} />
        <DialogTitle sx={{ pt: 3, pb: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: 2,
            background: "linear-gradient(135deg, #2e7d32, #43a047)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <TaskAltRoundedIcon sx={{ color: "white", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>Finalizar Operación</Typography>
            {selectedDoc && (
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", maxWidth: 340 }}>
                {selectedDoc.nombre}
              </Typography>
            )}
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 2.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Escribe un comentario. Este será enviado como respuesta a la persona que te remitió el documento.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comentario de finalización"
            variant="outlined"
            required
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": { borderColor: "#2e7d32" },
              },
              "& .MuiInputLabel-root.Mui-focused": { color: "#2e7d32" },
            }}
          />
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setOpenFinalizar(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarFinalizacion}
            variant="contained"
            disabled={!comentario.trim()}
            startIcon={<TaskAltRoundedIcon />}
            sx={{
              borderRadius: 2, fontWeight: 700, px: 3,
              background: "linear-gradient(135deg, #2e7d32, #43a047)",
              "&:hover": { background: "linear-gradient(135deg, #1b5e20, #2e7d32)" },
              "&.Mui-disabled": { background: "#e0e0e0" },
            }}
          >
            Finalizar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}