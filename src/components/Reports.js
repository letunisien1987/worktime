import React from 'react';
import {
  Paper,
  Button,
  Grid,
  Typography,
  Box,
} from '@mui/material';
import { PictureAsPdf, TableChart } from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

function Reports({ settings }) {
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Rapport WorkTime', 20, 10);
    // Ajoutez ici la logique pour générer le contenu du PDF
    doc.save('worktime-report.pdf');
  };

  const generateExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([
      // Ajoutez ici vos données
    ]);
    XLSX.utils.book_append_sheet(wb, ws, 'Rapport');
    XLSX.writeFile(wb, 'worktime-report.xlsx');
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Rapports
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6}>
          <Box sx={{ p: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Rapport PDF
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Générez un rapport détaillé au format PDF incluant toutes vos heures de travail.
            </Typography>
            <Button
              variant="contained"
              startIcon={<PictureAsPdf />}
              onClick={generatePDF}
              fullWidth
            >
              Générer PDF
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Box sx={{ p: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Rapport Excel
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Exportez vos données au format Excel pour une analyse détaillée.
            </Typography>
            <Button
              variant="contained"
              startIcon={<TableChart />}
              onClick={generateExcel}
              fullWidth
            >
              Générer Excel
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default Reports;
