import React from 'react';
import { Tabs, Tab, Paper } from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';

function Navigation({ currentTab, onTabChange }) {
  return (
    <Paper 
      elevation={3}
      sx={{ 
        mb: 4,
        backgroundColor: 'primary.main',
        '& .MuiTab-root': {
          color: 'text.primary',
          '&.Mui-selected': {
            color: 'white',
          },
        },
      }}
    >
      <Tabs
        value={currentTab}
        onChange={onTabChange}
        variant="fullWidth"
        indicatorColor="secondary"
      >
        <Tab icon={<CalculateIcon />} label="Calculateur" />
        <Tab icon={<ListAltIcon />} label="Enregistrements" />
        <Tab icon={<AssessmentIcon />} label="Rapports" />
        <Tab icon={<SettingsIcon />} label="Paramètres" />
      </Tabs>
    </Paper>
  );
}

export default Navigation;
