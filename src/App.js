import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Container } from '@mui/material';
import Calculator from './components/Calculator';
import Records from './components/Records';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Navigation from './components/Navigation';

// Liste des devises disponibles
export const currencies = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'Dollar américain' },
  { code: 'GBP', symbol: '£', name: 'Livre sterling' },
  { code: 'CHF', symbol: 'CHF', name: 'Franc suisse' },
  { code: 'CAD', symbol: '$', name: 'Dollar canadien' },
  { code: 'TND', symbol: 'DT', name: 'Dinar tunisien' },
  { code: 'MAD', symbol: 'DH', name: 'Dirham marocain' },
  { code: 'DZD', symbol: 'DA', name: 'Dinar algérien' },
];

const theme = createTheme({
  palette: {
    primary: {
      main: '#ffd700', // Jaune
    },
    secondary: {
      main: '#ffffff', // Blanc
    },
    background: {
      default: '#ffffff',
      paper: '#fafafa',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

function App() {
  const [currentTab, setCurrentTab] = useState(0);
  const [settings, setSettings] = useState({
    timeFormat: '24h',
    defaultRate: 25,
    projectManagement: false,
    currency: localStorage.getItem('currency') || 'EUR',
  });
  const [records, setRecords] = useState([]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleAddRecord = (newRecord) => {
    const formattedRecord = {
      ...newRecord,
      timeRecords: newRecord.timeRecords.map(timeRecord => ({
        startTime: timeRecord.startTime,
        endTime: timeRecord.endTime
      }))
    };
    setRecords(prevRecords => [...prevRecords, formattedRecord]);
  };

  const formatTimeForDisplay = (timeRecords) => {
    if (timeRecords && timeRecords.length > 0) {
      const times = timeRecords.map(record => `${record.startTime}-${record.endTime}`);
      return times.join(', ');
    }
    return '';
  };

  const getCurrentCurrencySymbol = () => {
    const currentCurrency = currencies.find(c => c.code === settings.currency);
    return currentCurrency ? currentCurrency.symbol : '€';
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ minHeight: '100vh', py: 4 }}>
          <Navigation currentTab={currentTab} onTabChange={handleTabChange} />
          
          {currentTab === 0 && (
            <Calculator 
              settings={settings} 
              onSave={handleAddRecord}
              records={records}
              currencySymbol={getCurrentCurrencySymbol()}
            />
          )}
          {currentTab === 1 && (
            <Records 
              settings={settings} 
              records={records}
              onRecordsChange={setRecords}
              formatTimeForDisplay={formatTimeForDisplay}
              currencySymbol={getCurrentCurrencySymbol()}
            />
          )}
          {currentTab === 2 && (
            <Reports 
              settings={settings}
              records={records}
              currencySymbol={getCurrentCurrencySymbol()}
            />
          )}
          {currentTab === 3 && (
            <Settings 
              settings={settings} 
              onSettingsChange={setSettings}
              currencies={currencies}
            />
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
