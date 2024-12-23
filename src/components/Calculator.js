import React, { useState, useRef } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  CalendarMonth as CalendarIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

const emptyTimeSlot = {
  startHours: '',
  startMinutes: '',
  endHours: '',
  endMinutes: '',
};

function Calculator({ settings, onSave, records }) {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [timeSlots, setTimeSlots] = useState([{ ...emptyTimeSlot }]);
  const [rate, setRate] = useState(settings.defaultRate.toString());
  const [breaks, setBreaks] = useState('0');
  const [result, setResult] = useState({ hours: 0, minutes: 0, amount: 0 });
  const [isCalculated, setIsCalculated] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Initialiser les références pour le premier créneau
  const startHoursRefs = useRef([React.createRef()]);
  const startMinutesRefs = useRef([React.createRef()]);
  const endHoursRefs = useRef([React.createRef()]);
  const endMinutesRefs = useRef([React.createRef()]);

  const checkTimeOverlapWithExistingRecords = (timeSlots, selectedDate, records = []) => {
    if (!records || !Array.isArray(records)) return false;
    
    // Convertir les créneaux actuels en minutes depuis minuit
    const currentSlots = timeSlots.filter(slot => isTimeSlotComplete(slot)).map(slot => ({
      start: getMinutesFromTime(slot.startHours, slot.startMinutes),
      end: getMinutesFromTime(slot.endHours, slot.endMinutes)
    }));

    // Vérifier les chevauchements avec les enregistrements existants
    for (const record of records) {
      const recordDate = dayjs(record.date);
      // Si c'est le même jour
      if (recordDate.isSame(selectedDate, 'day')) {
        for (const timeRecord of record.timeRecords) {
          const [startHours, startMinutes] = timeRecord.startTime.split(':');
          const [endHours, endMinutes] = timeRecord.endTime.split(':');
          const existingStart = parseInt(startHours) * 60 + parseInt(startMinutes);
          const existingEnd = parseInt(endHours) * 60 + parseInt(endMinutes);

          // Vérifier le chevauchement avec chaque créneau actuel
          for (const slot of currentSlots) {
            if (!(slot.end <= existingStart || slot.start >= existingEnd)) {
              return true; // Il y a un chevauchement
            }
          }
        }
      }
    }
    return false; // Pas de chevauchement
  };

  const handleTimeInput = (value, slotIndex, field, maxValue, nextRef) => {
    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= maxValue)) {
      const newValue = value;
      
      setTimeSlots(slots => {
        const newSlots = [...slots];
        const currentSlot = { ...newSlots[slotIndex] };
        currentSlot[field] = newValue;
        
        // Vérifier si le créneau est valide
        if (isTimeSlotComplete(currentSlot)) {
          const currentStart = getMinutesFromTime(currentSlot.startHours, currentSlot.startMinutes);
          const currentEnd = getMinutesFromTime(currentSlot.endHours, currentSlot.endMinutes);
          
          // Vérifier si la fin est après le début
          if (currentEnd <= currentStart) {
            alert("L'heure de fin doit être après l'heure de début");
            return newSlots;
          }
          
          // Vérifier le chevauchement avec les autres créneaux du même jour
          const hasOverlap = newSlots.some((slot, idx) => {
            if (idx === slotIndex || !isTimeSlotComplete(slot)) return false;
            
            const slotStart = getMinutesFromTime(slot.startHours, slot.startMinutes);
            const slotEnd = getMinutesFromTime(slot.endHours, slot.endMinutes);
            
            return (currentStart < slotEnd && currentEnd > slotStart);
          });
          
          if (hasOverlap) {
            alert("Ce créneau chevauche un autre créneau existant");
            return newSlots;
          }
        }
        
        newSlots[slotIndex] = currentSlot;
        return newSlots;
      });
      
      if (value.length === 2 && nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  // Fonction utilitaire pour vérifier si un créneau est complet
  const isTimeSlotComplete = (slot) => {
    return slot.startHours && slot.startMinutes && 
           slot.endHours && slot.endMinutes;
  };

  // Fonction utilitaire pour convertir les heures et minutes en minutes totales
  const getMinutesFromTime = (hours, minutes) => {
    return parseInt(hours) * 60 + parseInt(minutes);
  };

  const addTimeSlot = () => {
    // Vérifier si le dernier créneau est complet avant d'en ajouter un nouveau
    const lastSlot = timeSlots[timeSlots.length - 1];
    if (!isTimeSlotComplete(lastSlot)) {
      alert("Veuillez compléter le créneau actuel avant d'en ajouter un nouveau");
      return;
    }
    
    setTimeSlots(slots => [...slots, { ...emptyTimeSlot }]);
    startHoursRefs.current.push(React.createRef());
    startMinutesRefs.current.push(React.createRef());
    endHoursRefs.current.push(React.createRef());
    endMinutesRefs.current.push(React.createRef());
  };

  const removeTimeSlot = (index) => {
    if (index > 0) {
      setTimeSlots(slots => slots.filter((_, i) => i !== index));
      // Supprimer les références du créneau supprimé
      startHoursRefs.current.splice(index, 1);
      startMinutesRefs.current.splice(index, 1);
      endHoursRefs.current.splice(index, 1);
      endMinutesRefs.current.splice(index, 1);
    }
  };

  const handlePreviousDay = () => {
    setSelectedDate(selectedDate.subtract(1, 'day'));
  };

  const handleNextDay = () => {
    setSelectedDate(selectedDate.add(1, 'day'));
  };

  const calculateTime = () => {
    let totalMinutes = 0;

    // Calcul pour chaque créneau horaire
    timeSlots.forEach(slot => {
      if (slot.startHours && slot.startMinutes && slot.endHours && slot.endMinutes) {
        const startMinutes = parseInt(slot.startHours) * 60 + parseInt(slot.startMinutes);
        const endMinutes = parseInt(slot.endHours) * 60 + parseInt(slot.endMinutes);
        const diffMinutes = endMinutes - startMinutes;
        
        if (diffMinutes > 0) {
          totalMinutes += diffMinutes;
        }
      }
    });

    // Soustraction des pauses
    totalMinutes -= parseInt(breaks) * 60;

    if (totalMinutes > 0) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const amount = ((totalMinutes / 60) * parseFloat(rate)).toFixed(2);
      
      setResult({
        hours,
        minutes,
        totalMinutes,
        amount
      });
      setIsCalculated(true);
    }
  };

  const handleSave = () => {
    // Vérifier les chevauchements avec les enregistrements existants
    if (checkTimeOverlapWithExistingRecords(timeSlots, selectedDate, records)) {
      alert("Il y a un conflit d'horaires avec des créneaux déjà enregistrés pour cette journée");
      return;
    }

    const timeRecords = timeSlots.map(slot => {
      const startHours = slot.startHours.padStart(2, '0');
      const startMinutes = slot.startMinutes.padStart(2, '0');
      const endHours = slot.endHours.padStart(2, '0');
      const endMinutes = slot.endMinutes.padStart(2, '0');

      return {
        startTime: `${startHours}:${startMinutes}`,
        endTime: `${endHours}:${endMinutes}`
      };
    });

    // Recalculer le temps total et le montant
    const totalMinutes = result.totalMinutes;
    const totalHours = totalMinutes / 60;
    const amount = (totalHours * parseFloat(rate)).toFixed(2);

    const newRecord = {
      date: selectedDate.toDate(),
      timeRecords,
      breaks,
      totalTime: totalHours.toFixed(2),
      rate,
      amount
    };

    onSave(newRecord);
    resetForm();
  };

  const resetForm = () => {
    setTimeSlots([{ ...emptyTimeSlot }]);
    setBreaks('0');
    setResult({ hours: 0, minutes: 0, amount: 0 });
    setIsCalculated(false);
    startHoursRefs.current[0].current.focus();
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Card sx={{ bgcolor: 'primary.light', mb: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="h6">
                  Temps: {result.hours.toString().padStart(2, '0')}:{result.minutes.toString().padStart(2, '0')}
                </Typography>
                <Typography>
                  Minutes: {result.totalMinutes || 0}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h4" color="success.main" align="right">
                  {result.amount || '0.00'}€
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={handlePreviousDay}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
              <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowDatePicker(true)}>
                <Typography variant="h6" sx={{ mr: 1 }}>
                  {selectedDate.format('dddd DD/MM/YYYY')}
                </Typography>
                <CalendarIcon />
              </Box>
              {showDatePicker && (
                <DatePicker
                  open={showDatePicker}
                  onClose={() => setShowDatePicker(false)}
                  value={selectedDate}
                  onChange={(newDate) => {
                    setSelectedDate(newDate);
                    setShowDatePicker(false);
                  }}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      style: { display: 'none' }
                    }
                  }}
                />
              )}
            </LocalizationProvider>
          </Box>
          <IconButton onClick={handleNextDay}>
            <ArrowForwardIcon />
          </IconButton>
        </Box>

        {timeSlots.map((slot, index) => (
          <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
            <Grid item xs={5} sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Début
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <TextField
                  inputRef={startHoursRefs.current[index]}
                  value={slot.startHours}
                  onChange={(e) => handleTimeInput(e.target.value, index, 'startHours', 23, startMinutesRefs.current[index])}
                  placeholder="HH"
                  inputProps={{
                    maxLength: 2,
                    style: { textAlign: 'center' },
                    inputMode: 'numeric'
                  }}
                  sx={{ width: '45%' }}
                />
                <Typography variant="h5">:</Typography>
                <TextField
                  inputRef={startMinutesRefs.current[index]}
                  value={slot.startMinutes}
                  onChange={(e) => handleTimeInput(e.target.value, index, 'startMinutes', 59, endHoursRefs.current[index])}
                  placeholder="MM"
                  inputProps={{
                    maxLength: 2,
                    style: { textAlign: 'center' },
                    inputMode: 'numeric'
                  }}
                  sx={{ width: '45%' }}
                />
              </Box>
            </Grid>

            <Grid item xs={5} sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Fin
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <TextField
                  inputRef={endHoursRefs.current[index]}
                  value={slot.endHours}
                  onChange={(e) => handleTimeInput(e.target.value, index, 'endHours', 23, endMinutesRefs.current[index])}
                  placeholder="HH"
                  inputProps={{
                    maxLength: 2,
                    style: { textAlign: 'center' },
                    inputMode: 'numeric'
                  }}
                  sx={{ width: '45%' }}
                />
                <Typography variant="h5">:</Typography>
                <TextField
                  inputRef={endMinutesRefs.current[index]}
                  value={slot.endMinutes}
                  onChange={(e) => handleTimeInput(e.target.value, index, 'endMinutes', 59)}
                  placeholder="MM"
                  inputProps={{
                    maxLength: 2,
                    style: { textAlign: 'center' },
                    inputMode: 'numeric'
                  }}
                  sx={{ width: '45%' }}
                />
              </Box>
            </Grid>

            <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {index > 0 && (
                <IconButton color="error" onClick={() => removeTimeSlot(index)}>
                  <DeleteIcon />
                </IconButton>
              )}
            </Grid>
          </Grid>
        ))}

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addTimeSlot}
          fullWidth
          sx={{ mb: 2, color: 'warning.main', borderColor: 'warning.main', '&:hover': { borderColor: 'warning.dark', backgroundColor: 'warning.light' } }}
        >
          Ajouter un créneau
        </Button>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Temps de pause (h)"
              type="number"
              value={breaks}
              onChange={(e) => setBreaks(e.target.value)}
              InputProps={{ inputProps: { min: 0, step: 0.5 } }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Prix par heure (€)"
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              InputProps={{ inputProps: { min: 0, step: 0.5 } }}
            />
          </Grid>
        </Grid>

        <Button
          variant="contained"
          fullWidth
          onClick={isCalculated ? handleSave : calculateTime}
          sx={{ mt: 3 }}
        >
          {isCalculated ? 'Enregistrer' : 'Calculer'}
        </Button>
      </Box>
    </Paper>
  );
}

export default Calculator;
