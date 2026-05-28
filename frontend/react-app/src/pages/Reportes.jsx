import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper, TextField,
  CircularProgress, Divider
} from '@mui/material';
import {
  ArrowBackRounded,
  FileDownloadRounded,
  AssessmentRounded,
} from '@mui/icons-material';
import api from '../services/api';
import { useNavigate } from "react-router-dom";
import PreviewReportDialog from '../components/PreviewReportDialog';

const Reportes = () => {
  const navigate = useNavigate();

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const handleGenerarReporte = async () => {
    if (!fechaInicio || !fechaFin) {
      alert("Por favor ingresa ambas fechas");
      return;
    }
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      alert("La fecha de inicio no puede ser posterior a la fecha fin");
      return;
    }
    setLoadingPreview(true);
    setOpenPreview(true);
    try {
      const response = await api.get('/documentos/preview-reporte', {
        params: {
          fecha_inicio: `${fechaInicio}T00:00:00`,
          fecha_fin: `${fechaFin}T23:59:59`,
        },
      });
      setPreviewData(response.data);
    } catch (err) {
      alert(err.response?.data?.detail || "Error al generar la vista previa del reporte");
      setOpenPreview(false);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleConfirmDownload = async () => {
    setDownloading(true);
    try {
      const response = await api.get('/documentos/exportar-csv', {
        params: {
          fecha_inicio: `${fechaInicio}T00:00:00`,
          fecha_fin: `${fechaFin}T23:59:59`,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_documentos_${fechaInicio}_${fechaFin}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setOpenPreview(false);
    } catch (err) {
      if (err.response?.status === 204) {
        alert("No hay documentos para exportar en ese rango de fechas.");
      } else {
        alert("Error al descargar el reporte CSV");
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleClosePreview = () => {
    setOpenPreview(false);
    setPreviewData(null);
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #43a047 100%)",
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
            Reportes
          </Typography>
          <Typography variant="h5" fontWeight={800} sx={{ color: "white", lineHeight: 1.2 }}>
            Generación de Reportes
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mt: 0.5 }}>
            Genera y descarga reportes de documentos en formato CSV
          </Typography>
        </Box>
      </Box>

      {/* Tarjeta Generar Reporte */}
      <Paper sx={{
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        maxWidth: 900,
        mx: "auto",
      }}>
        <Box sx={{ height: 5, background: "linear-gradient(90deg, #1b5e20, #2e7d32, #43a047)" }} />
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Box sx={{
              width: 48, height: 48, borderRadius: 2,
              background: "linear-gradient(135deg, #1b5e20, #43a047)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <AssessmentRounded sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography fontSize={16} fontWeight={700} color="#1b5e20" lineHeight={1.2}>
                Reporte de Documentos
              </Typography>
              <Typography fontSize={13} color="text.secondary">
                Selecciona un rango de fechas para previsualizar y descargar
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", mb: 3 }}>
            <TextField
              label="Fecha inicio"
              type="date"
              size="small"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />
            <Typography fontSize={14} color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
              —
            </Typography>
            <TextField
              label="Fecha fin"
              type="date"
              size="small"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />
          </Box>

          <Button
            onClick={handleGenerarReporte}
            disabled={loadingPreview || !fechaInicio || !fechaFin}
            variant="contained"
            size="large"
            startIcon={loadingPreview
              ? <CircularProgress size={18} sx={{ color: "white" }} />
              : <FileDownloadRounded />
            }
            sx={{
              background: "linear-gradient(135deg, #1b5e20, #2e7d32)",
              borderRadius: 2,
              fontWeight: 700,
              fontSize: 14,
              px: 4,
              py: 1.5,
              whiteSpace: "nowrap",
              "&:hover": { background: "linear-gradient(135deg, #2e7d32, #388e3c)" },
              "&.Mui-disabled": { background: "#e0e0e0" },
            }}
          >
            {loadingPreview ? "Cargando..." : "Generar Reporte"}
          </Button>
        </Box>
      </Paper>

      {/* Previsualizador de Reporte */}
      <PreviewReportDialog
        open={openPreview}
        onClose={handleClosePreview}
        data={previewData}
        loading={loadingPreview}
        onConfirmDownload={handleConfirmDownload}
        downloading={downloading}
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
      />
    </Box>
  );
};

export default Reportes;
