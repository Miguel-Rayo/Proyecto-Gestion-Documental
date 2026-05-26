import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, Chip, Divider
} from '@mui/material';
import {
  CloudUploadRounded as UploadIcon,
  VisibilityRounded as ViewIcon,
  GetApp as DownloadIcon,
  EditRounded as EditIcon,
  DeleteRounded as DeleteIcon,
  FolderOpenRounded,
  ArrowBackRounded,
  InsertDriveFileRounded,
} from '@mui/icons-material';
import api from '../services/api';
import { useNavigate } from "react-router-dom";
import { FileDownloadRounded } from '@mui/icons-material';

const ESTADO_COLORS = {
  ACTIVO:    { bg: "#e8f5e9", color: "#2e7d32" },
  PENDIENTE: { bg: "#fff3e0", color: "#e65100" },
  ARCHIVADO: { bg: "#f3e5f5", color: "#6a1b9a" },
  ELIMINADO: { bg: "#ffebee", color: "#c62828" },
}

const Repositorio = () => {
  const navigate = useNavigate();
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openUpload, setOpenUpload] = useState(false);
  const [openRename, setOpenRename] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingDoc, setEditingDoc] = useState({ id: null, nombre: '' });

  useEffect(() => { fetchDocumentos(); }, []);

  const fetchDocumentos = async () => {
    try {
      const response = await api.get('/documentos/');
      setDocumentos(response.data);
    } catch (err) {
      setError("Error al cargar los documentos");
    } finally {
      setLoading(false);
    }
  };

  // Reemplaza solo la sección entre el error Alert y el Paper de la tabla,
// y agrega el estado/función necesarios arriba del return.

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin]       = useState('');
  const [loadingCsv, setLoadingCsv]   = useState(false);

  // 2. Agrega esta función junto a las otras funciones:
  const handleExportarCsv = async () => {
    if (!fechaInicio || !fechaFin) {
      alert("Por favor ingresa ambas fechas");
      return;
    }
    setLoadingCsv(true);
    try {
      const response = await api.get('/documentos/exportar-csv', {
        params: {
          fecha_inicio: `${fechaInicio}T00:00:00`,
          fecha_fin:    `${fechaFin}T23:59:59`,
        },
        responseType: 'blob', // <-- importante para archivos
      });

      // Crear URL temporal y disparar descarga automática
      const url      = window.URL.createObjectURL(new Blob([response.data]));
      const link     = document.createElement('a');
      link.href      = url;
      link.setAttribute('download', `reporte_documentos_${fechaInicio}_${fechaFin}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.detail || "Error al exportar el reporte");
      console.log(err)
    } finally {
      setLoadingCsv(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('archivo', selectedFile);
    try {
      await api.post('/documentos/subir', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setOpenUpload(false);
      setSelectedFile(null);
      fetchDocumentos();
    } catch (err) {
      alert(err.response?.data?.detail || "Error al subir archivo");
    }
  };

  const handleRename = async () => {
    try {
      await api.put(`/documentos/${editingDoc.id}`, { nombre: editingDoc.nombre });
      setOpenRename(false);
      fetchDocumentos();
    } catch (err) {
      alert("Error al renombrar");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este documento permanentemente?")) {
      try {
        await api.delete(`/documentos/${id}`);
        fetchDocumentos();
      } catch (err) {
        alert("Error al eliminar");
      }
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

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%)",
      p: { xs: 2, sm: 3, md: 4 },
    }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Button
          startIcon={<ArrowBackRounded />}
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
            Repositorio de Documentos
          </Typography>
        </Box>

        <Button
          startIcon={<UploadIcon />}
          onClick={() => setOpenUpload(true)}
          variant="contained"
          sx={{
            background: "white",
            color: "#1a237e",
            fontWeight: 700,
            borderRadius: 2,
            px: 2.5,
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            "&:hover": { background: "rgba(255,255,255,0.92)" },
          }}
        >
          Radicar Documento
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
      )}


      {/* ── Tarjeta Exportar CSV ── */}
      <Paper sx={{
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        mb: 2,
      }}>
        <Box sx={{ height: 4, background: "linear-gradient(90deg, #1b5e20, #2e7d32, #43a047)" }} />
        <Box sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: 3,
          py: 1.8,
          flexWrap: "wrap",
        }}>
          {/* Ícono + Título */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mr: 1 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: 2,
              background: "linear-gradient(135deg, #1b5e20, #43a047)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <FileDownloadRounded sx={{ color: "white", fontSize: 19 }} />
            </Box>
            <Box>
              <Typography fontSize={13} fontWeight={700} color="#1b5e20" lineHeight={1.2}>
                Exportar Reporte CSV
              </Typography>
              <Typography fontSize={11} color="text.secondary">
                Selecciona un rango de fechas
              </Typography>
            </Box>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 1, display: { xs: "none", sm: "block" } }} />

          {/* Inputs de fecha */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", flex: 1 }}>
            <TextField
              label="Fecha inicio"
              type="date"
              size="small"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />
            <Typography fontSize={13} color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
              —
            </Typography>
            <TextField
              label="Fecha fin"
              type="date"
              size="small"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />
          </Box>

          {/* Botón */}
          <Button
            onClick={handleExportarCsv}
            disabled={loadingCsv || !fechaInicio || !fechaFin}
            variant="contained"
            startIcon={loadingCsv
              ? <CircularProgress size={15} sx={{ color: "white" }} />
              : <FileDownloadRounded />
            }
            sx={{
              background: "linear-gradient(135deg, #1b5e20, #2e7d32)",
              borderRadius: 2,
              fontWeight: 700,
              fontSize: 13,
              px: 2.5,
              whiteSpace: "nowrap",
              "&:hover": { background: "linear-gradient(135deg, #2e7d32, #388e3c)" },
              "&.Mui-disabled": { background: "#e0e0e0" },
            }}
          >
            {loadingCsv ? "Generando..." : "Descargar CSV"}
          </Button>
        </Box>
      </Paper>


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
                  {["Radicado", "Nombre del Archivo", "Fecha", "Estado", "Acciones"].map(h => (
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
                      <FolderOpenRounded sx={{ fontSize: 48, color: "#c5cae9", mb: 1, display: "block", mx: "auto" }} />
                      <Typography color="text.secondary" fontSize={14}>No hay documentos registrados</Typography>
                    </TableCell>
                  </TableRow>
                ) : documentos.map((doc) => (
                  <TableRow key={doc.id} hover sx={{ "&:hover": { background: "#f5f7ff" }, transition: "background 0.15s" }}>
                    <TableCell>
                      <Typography
                        fontSize={12}
                        fontWeight={700}
                        sx={{
                          fontFamily: "monospace",
                          background: "#e8eaf6",
                          color: "#1a237e",
                          px: 1, py: 0.3,
                          borderRadius: 1,
                          display: "inline-block",
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
                          <InsertDriveFileRounded sx={{ fontSize: 16, color: "#1a237e" }} />
                        </Box>
                        <Typography fontSize={13} fontWeight={600}>{doc.nombre}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: "text.secondary" }}>
                      {new Date(doc.fecha_creacion).toLocaleDateString("es-CO", {
                        year: "numeric", month: "short", day: "numeric"
                      })}
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
                      <Tooltip title="Renombrar">
                        <IconButton size="small" onClick={() => {
                          setEditingDoc({ id: doc.id, nombre: doc.nombre });
                          setOpenRename(true);
                        }} sx={{ color: "#e65100", "&:hover": { background: "#fff3e0" } }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" onClick={() => handleDelete(doc.id)}
                          sx={{ color: "#c62828", "&:hover": { background: "#ffebee" } }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* ── Modal: Radicar documento ── */}
      <Dialog
        open={openUpload}
        onClose={() => setOpenUpload(false)}
        disableRestoreFocus
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
            <UploadIcon sx={{ color: "white", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>Radicar Nuevo Documento</Typography>
            <Typography variant="caption" color="text.secondary">Formatos permitidos: PDF, Word, Excel</Typography>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          <Paper
            variant="outlined"
            component="label"
            sx={{
              borderRadius: 2,
              borderStyle: "dashed",
              borderColor: selectedFile ? "#1565c0" : "#c5cae9",
              background: selectedFile ? "#e8eaf6" : "#fafafa",
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              display: "block",
              transition: "all 0.2s",
              "&:hover": { borderColor: "#1565c0", background: "#e8eaf6" },
            }}
          >
            <InsertDriveFileRounded sx={{ fontSize: 40, color: selectedFile ? "#1a237e" : "#9e9e9e", mb: 1 }} />
            <Typography fontSize={13} color={selectedFile ? "#1a237e" : "text.secondary"} fontWeight={selectedFile ? 700 : 400}>
              {selectedFile ? selectedFile.name : "Haz clic para seleccionar un archivo"}
            </Typography>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              hidden
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
          </Paper>
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => { setOpenUpload(false); setSelectedFile(null); }} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!selectedFile}
            sx={{
              borderRadius: 2, fontWeight: 700, px: 3,
              background: "linear-gradient(135deg, #1a237e, #1565c0)",
              "&:hover": { background: "linear-gradient(135deg, #283593, #1976d2)" },
              "&.Mui-disabled": { background: "#e0e0e0" },
            }}
          >
            Subir y Radicar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Modal: Renombrar ── */}
      <Dialog
        open={openRename}
        onClose={() => setOpenRename(false)}
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
            <EditIcon sx={{ color: "white", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>Renombrar Documento</Typography>
            <Typography variant="caption" color="text.secondary">Ingresa el nuevo nombre del archivo</Typography>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="Nuevo nombre"
            value={editingDoc.nombre}
            onChange={(e) => setEditingDoc({ ...editingDoc, nombre: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            autoFocus
          />
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setOpenRename(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button
            onClick={handleRename}
            variant="contained"
            sx={{
              borderRadius: 2, fontWeight: 700, px: 3,
              background: "linear-gradient(135deg, #1a237e, #1565c0)",
              "&:hover": { background: "linear-gradient(135deg, #283593, #1976d2)" },
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Repositorio;