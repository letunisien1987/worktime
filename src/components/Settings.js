import React, { useState } from 'react';
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
  Grid,
} from '@mui/material';

const currencies = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'Dollar américain' },
  { code: 'GBP', symbol: '£', name: 'Livre sterling' },
  { code: 'CHF', symbol: 'CHF', name: 'Franc suisse' },
  { code: 'CAD', symbol: '$', name: 'Dollar canadien' },
  { code: 'TND', symbol: 'DT', name: 'Dinar tunisien' },
  { code: 'MAD', symbol: 'DH', name: 'Dirham marocain' },
  { code: 'DZD', symbol: 'DA', name: 'Dinar algérien' },
];

function Settings({ settings, onSettingsChange }) {
  const [currency, setCurrency] = useState(settings.currency || 'EUR');

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    onSettingsChange({
      ...settings,
      [field]: value,
    });
  };

  const handleCurrencyChange = (event) => {
    setCurrency(event.target.value);
    onSettingsChange({
      ...settings,
      currency: event.target.value,
    });
  };

  const selectedCurrency = currencies.find(c => c.code === currency) || currencies[0];

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

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tarif horaire par défaut"
              type="number"
              value={settings.defaultRate}
              onChange={handleChange('defaultRate')}
              InputProps={{
                endAdornment: <Typography>{selectedCurrency.symbol}/h</Typography>,
                inputProps: { min: 0, step: 0.5 }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Devise</InputLabel>
              <Select
                value={currency}
                onChange={handleCurrencyChange}
                label="Devise"
              >
                {currencies.map((currency) => (
                  <MenuItem key={currency.code} value={currency.code}>
                    {currency.name} ({currency.symbol})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

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
