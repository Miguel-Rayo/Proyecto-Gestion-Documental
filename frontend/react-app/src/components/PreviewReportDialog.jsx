import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  FileDownloadRounded,
  CloseRounded,
  AssessmentRounded,
  FolderOpenRounded,
} from '@mui/icons-material';

const ESTADO_COLORS = {
  RADICADO:   { bg: "#e3f2fd", color: "#1565c0" },
  TRASLADADO: { bg: "#fff3e0", color: "#e65100" },
  ACEPTADO:   { bg: "#e8f5e9", color: "#2e7d32" },
  FINALIZADO: { bg: "#f3e5f5", color: "#6a1b9a" },
};

const ROL_COLORS = {
  ADMIN_GENERAL: { bg: "#ffebee", color: "#c62828" },
  ADMIN_LOCAL:   { bg: "#e3f2fd", color: "#1565c0" },
  GESTIONADOR:   { bg: "#e8f5e9", color: "#2e7d32" },
  RADICADOR:     { bg: "#fff3e0", color: "#e65100" },
  DESCONOCIDO:   { bg: "#f5f5f5", color: "#757575" },
};

const formatFecha = (fechaStr) => {
  if (!fechaStr) return "N/A";
  const d = new Date(fechaStr);
  return d.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const PreviewReportDialog = ({
  open,
  onClose,
  data,
  loading,
  onConfirmDownload,
  downloading,
  fechaInicio,
  fechaFin,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const documentos = data?.documentos ?? [];
  const total = data?.total ?? 0;

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedDocs = documentos.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Dialog
      open={open}
      onClose={downloading ? undefined : onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          maxHeight: "85vh",
        },
      }}
    >
      {/* Header */}
      <Box sx={{ height: 5, background: "linear-gradient(90deg, #1b5e20, #2e7d32, #43a047)" }} />
      <DialogTitle
        sx={{
          pb: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              background: "linear-gradient(135deg, #1b5e20, #43a047)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <AssessmentRounded sx={{ color: "white", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} color="#1b5e20" lineHeight={1.2}>
              Vista Previa del Reporte
            </Typography>
            <Typography variant="caption" color="text.secondary" fontSize={12}>
              Rango: {fechaInicio} — {fechaFin} &middot; {total} documento{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
            </Typography>
          </Box>
        </Box>
        <Button
          onClick={onClose}
          disabled={downloading}
          size="small"
          sx={{
            minWidth: "auto",
            color: "text.secondary",
            "&:hover": { background: "#f5f5f5" },
          }}
        >
          <CloseRounded />
        </Button>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 8,
            }}
          >
            <CircularProgress sx={{ color: "#2e7d32" }} />
          </Box>
        ) : total === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              py: 8,
              gap: 1.5,
            }}
          >
            <FolderOpenRounded sx={{ fontSize: 56, color: "#c8e6c9" }} />
            <Typography color="text.secondary" fontSize={14} fontWeight={500}>
              No se encontraron documentos en el rango de fechas seleccionado
            </Typography>
          </Box>
        ) : (
          <Box>
            <TableContainer sx={{ maxHeight: "calc(85vh - 260px)" }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {[
                      "# Radicado",
                      "Documento",
                      "Fecha Ultima Gestion",
                      "Estado",
                      "Cedula",
                      "Nombre Responsable",
                      "Rol",
                      "Sede",
                    ].map((header) => (
                      <TableCell
                        key={header}
                        sx={{
                          fontWeight: 700,
                          color: "#1b5e20",
                          fontSize: 12,
                          py: 1.5,
                          background: "#f1f8e9",
                          borderBottom: "2px solid #c8e6c9",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedDocs.map((doc, idx) => {
                    const estadoStyle = ESTADO_COLORS[doc.estado] ?? {
                      bg: "#f5f5f5",
                      color: "#333",
                    };
                    const rolStyle = ROL_COLORS[doc.responsable?.rol] ?? {
                      bg: "#f5f5f5",
                      color: "#333",
                    };

                    return (
                      <TableRow
                        key={`${doc.numero_radicado}-${idx}`}
                        hover
                        sx={{
                          "&:hover": { background: "#f9fbe7" },
                          transition: "background 0.15s",
                        }}
                      >
                        <TableCell>
                          <Typography
                            fontSize={11}
                            fontWeight={700}
                            sx={{
                              fontFamily: "monospace",
                              background: "#e8f5e9",
                              color: "#1b5e20",
                              px: 1,
                              py: 0.3,
                              borderRadius: 1,
                              display: "inline-block",
                            }}
                          >
                            {doc.numero_radicado}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: 12, fontWeight: 500, maxWidth: 180 }}>
                          <Tooltip title={doc.nombre_documento ?? "N/A"} arrow placement="top">
                            <Typography
                              fontSize={12}
                              fontWeight={500}
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: 180,
                              }}
                            >
                              {doc.nombre_documento ?? "N/A"}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ fontSize: 12, color: "text.secondary", whiteSpace: "nowrap" }}>
                          {formatFecha(doc.fecha_ultima_gestion)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={doc.estado}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: 10,
                              background: estadoStyle.bg,
                              color: estadoStyle.color,
                              height: 22,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: 12, fontWeight: 600, fontFamily: "monospace", whiteSpace: "nowrap" }}>
                          {doc.responsable?.cedula ?? "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>
                          {doc.responsable?.nombre ?? "N/A"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={doc.responsable?.rol ?? "N/A"}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: 10,
                              background: rolStyle.bg,
                              color: rolStyle.color,
                              height: 22,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: 12, color: "text.secondary" }}>
                          {doc.responsable?.sede ?? "N/A"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 25, 50]}
              labelRowsPerPage="Filas por pagina:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count}`
              }
              sx={{
                borderTop: "1px solid #e0e0e0",
                "& .MuiTablePagination-toolbar": { minHeight: 48 },
              }}
            />
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={downloading}
          variant="outlined"
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          Cancelar
        </Button>
        <Button
          onClick={onConfirmDownload}
          disabled={downloading || total === 0}
          variant="contained"
          startIcon={
            downloading ? (
              <CircularProgress size={15} sx={{ color: "white" }} />
            ) : (
              <FileDownloadRounded />
            )
          }
          sx={{
            background: "linear-gradient(135deg, #1b5e20, #2e7d32)",
            borderRadius: 2,
            fontWeight: 700,
            fontSize: 13,
            px: 3,
            "&:hover": {
              background: "linear-gradient(135deg, #2e7d32, #388e3c)",
            },
            "&.Mui-disabled": { background: "#e0e0e0" },
          }}
        >
          {downloading ? "Descargando..." : "Descargar CSV"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PreviewReportDialog;
