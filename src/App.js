import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Container } from '@mui/material';
import Calculator from './components/Calculator';
import Records from './components/Records';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Navigation from './components/Navigation';

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
            />
          )}
          {currentTab === 1 && (
            <Records 
              settings={settings} 
              records={records}
              onRecordsChange={setRecords}
              formatTimeForDisplay={formatTimeForDisplay}
            />
          )}
          {currentTab === 2 && (
            <Reports 
              settings={settings}
              records={records}
            />
          )}
          {currentTab === 3 && (
            <Settings 
              settings={settings} 
              onSettingsChange={setSettings}
            />
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
