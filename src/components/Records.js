import React, { useState, useMemo } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, FilterList as FilterIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { pdf } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    fontSize: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  table: {
    display: 'table',
    width: 'auto',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    minHeight: 30,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    padding: 5,
  },
  totals: {
    marginTop: 20,
    fontSize: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
  },
});

function Records({ records, onRecordsChange, formatTimeForDisplay, currencySymbol }) {
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    minHours: '',
    maxHours: '',
  });
  const [filteredRecords, setFilteredRecords] = useState(records);

  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
    const startOfMonth = newMonth.startOf('month');
    const endOfMonth = newMonth.endOf('month');
    
    setFilters(prev => ({
      ...prev,
      startDate: startOfMonth,
      endDate: endOfMonth
    }));

    const filtered = records.filter(record => {
      const recordDate = dayjs(record.date);
      return recordDate.isSame(newMonth, 'month');
    });
    
    setFilteredRecords(filtered);
  };

  const handleFilterChange = (field) => (event) => {
    setFilters({
      ...filters,
      [field]: event.target.value,
    });
  };

  const handleDateFilterChange = (field) => (date) => {
    setFilters({
      ...filters,
      [field]: date,
    });
  };

  const resetFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      minHours: '',
      maxHours: '',
    });
  };

  const handleOpen = () => setFilterDialogOpen(true);
  const handleClose = () => setFilterDialogOpen(false);

  const handleSave = () => {
    const filtered = records.filter(record => {
      const recordDate = dayjs(record.date);
      
      // Filtre par plage de dates
      if (filters.startDate && recordDate.isBefore(filters.startDate, 'day')) {
        return false;
      }
      if (filters.endDate && recordDate.isAfter(filters.endDate, 'day')) {
        return false;
      }

      // Filtre par heures
      const hours = parseFloat(record.totalTime);
      if (filters.minHours && hours < parseFloat(filters.minHours)) {
        return false;
      }
      if (filters.maxHours && hours > parseFloat(filters.maxHours)) {
        return false;
      }

      return true;
    });
    
    setFilteredRecords(filtered);
    handleClose();
  };

  // Calcul des totaux
  const totals = filteredRecords.reduce((acc, record) => {
    acc.hours += parseFloat(record.totalTime);
    acc.amount += parseFloat(record.amount);
    return acc;
  }, { hours: 0, amount: 0 });

  const generatePDF = async () => {
    const monthYear = selectedMonth.format('MMMM YYYY');
    
    const MyDocument = () => (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Rapport des heures travaillées</Text>
          
          <View style={styles.header}>
            <Text style={styles.subtitle}>Mois : {monthYear}</Text>
          </View>

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Date</Text>
              <Text style={styles.tableCell}>Horaires</Text>
              <Text style={styles.tableCell}>Pauses</Text>
              <Text style={styles.tableCell}>Total</Text>
              <Text style={styles.tableCell}>Montant ({currencySymbol})</Text>
            </View>

            {filteredRecords.map((record, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>
                  {dayjs(record.date).format('DD/MM/YYYY')}
                </Text>
                <Text style={styles.tableCell}>
                  {record.timeRecords.map(time => 
                    `${time.startTime}-${time.endTime}`
                  ).join('\n')}
                </Text>
                <Text style={styles.tableCell}>{record.breaks}h</Text>
                <Text style={styles.tableCell}>{parseFloat(record.totalTime).toFixed(2)}h</Text>
                <Text style={styles.tableCell}>{parseFloat(record.amount).toFixed(2)}{currencySymbol}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totals}>
            <Text>Total Heures : {totals.hours.toFixed(2)}h</Text>
            <Text>Total Montant : {totals.amount.toFixed(2)}{currencySymbol}</Text>
          </View>
        </Page>
      </Document>
    );

    const blob = await pdf(<MyDocument />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport_heures_${selectedMonth.format('YYYY-MM')}.pdf`;
    link.click();
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5">
              Totaux
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                views={['month', 'year']}
                value={selectedMonth}
                onChange={handleMonthChange}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: { 
                      width: 200,
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'warning.main',
                        },
                        '&:hover fieldset': {
                          borderColor: 'warning.dark',
                        },
                      },
                    }
                  }
                }}
              />
            </LocalizationProvider>
          </Box>
          <Box>
            <Button 
              startIcon={<FilterIcon />} 
              onClick={handleOpen}
              sx={{ 
                mr: 1,
                color: 'warning.main',
                borderColor: 'warning.main',
                '&:hover': {
                  borderColor: 'warning.dark',
                  backgroundColor: 'warning.light',
                }
              }}
              variant="outlined"
            >
              Filtrer
            </Button>
            <Button 
              startIcon={<PdfIcon />} 
              onClick={generatePDF}
              variant="contained"
              sx={{ 
                bgcolor: 'warning.main',
                '&:hover': {
                  bgcolor: 'warning.dark',
                },
              }}
            >
              Export PDF
            </Button>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Heures totales : {totals.hours.toFixed(2)} h
          </Typography>
          <Typography variant="h6">
            Montant total : {totals.amount.toFixed(2)} {currencySymbol}
          </Typography>
        </Box>
      </Box>

      {/* Section des filtres */}
      <Dialog open={filterDialogOpen} onClose={handleClose}>
        <DialogTitle>
          Filtrer les enregistrements
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Date début"
                  value={filters.startDate}
                  onChange={handleDateFilterChange('startDate')}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Date fin"
                  value={filters.endDate}
                  onChange={handleDateFilterChange('endDate')}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Heures min"
                type="number"
                value={filters.minHours}
                onChange={handleFilterChange('minHours')}
                InputProps={{ inputProps: { min: 0, step: 0.5 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Heures max"
                type="number"
                value={filters.maxHours}
                onChange={handleFilterChange('maxHours')}
                InputProps={{ inputProps: { min: 0, step: 0.5 } }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button variant="outlined" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button onClick={handleSave} variant="contained">
            Appliquer les filtres
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tableau des enregistrements */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Début</TableCell>
              <TableCell>Fin</TableCell>
              <TableCell>Pauses (h)</TableCell>
              <TableCell>Total (h)</TableCell>
              <TableCell>Montant ({currencySymbol})</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.map((record, index) => (
              <TableRow key={index}>
                <TableCell>
                  {dayjs(record.date).format('DD/MM/YYYY')}
                </TableCell>
                <TableCell>
                  {record.timeRecords.map((time, i) => (
                    <div key={i}>{time.startTime}</div>
                  ))}
                </TableCell>
                <TableCell>
                  {record.timeRecords.map((time, i) => (
                    <div key={i}>{time.endTime}</div>
                  ))}
                </TableCell>
                <TableCell>{record.breaks}</TableCell>
                <TableCell>{parseFloat(record.totalTime).toFixed(2)}</TableCell>
                <TableCell>{parseFloat(record.amount).toFixed(2)}{currencySymbol}</TableCell>
                <TableCell>
                  <IconButton 
                    sx={{ 
                      color: 'warning.main',
                      '&:hover': {
                        bgcolor: 'warning.light',
                      }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    sx={{ 
                      color: 'warning.main',
                      '&:hover': {
                        bgcolor: 'warning.light',
                      }
                    }} 
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default Records;
