import React from 'react';
import {
  Paper,
  FormControl,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
  Box,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';

function Settings({ settings, onSettingsChange }) {
  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    onSettingsChange({
      ...settings,
      [field]: value,
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Paramètres
      </Typography>

      <Box sx={{ mt: 3 }}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Format d'heure</InputLabel>
          <Select
            value={settings.timeFormat}
            onChange={handleChange('timeFormat')}
            label="Format d'heure"
          >
            <MenuItem value="24h">24 heures</MenuItem>
            <MenuItem value="12h">12 heures (AM/PM)</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Tarif horaire par défaut (€)"
          type="number"
          value={settings.defaultRate}
          onChange={handleChange('defaultRate')}
          sx={{ mb: 3 }}
          InputProps={{
            inputProps: { min: 0, step: 0.01 }
          }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={settings.projectManagement}
              onChange={handleChange('projectManagement')}
              color="primary"
            />
          }
          label="Activer la gestion des projets"
        />
      </Box>
    </Paper>
  );
}

export default Settings;
