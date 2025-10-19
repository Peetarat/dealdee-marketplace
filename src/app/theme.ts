import { createTheme } from '@mui/material/styles';

// Define your color palette
const lightPalette = {
  primary: {
    main: '#00BCD4', // Main theme color
  },
  secondary: {
    main: '#ff9800', // Orange for highlights
  },
  background: {
    default: '#f4f6f8',
    paper: '#ffffff',
  },
};

const darkPalette = {
  primary: {
    main: '#4DD0E1', // Lighter theme color for dark mode
  },
  secondary: {
    main: '#ffa726', // Lighter Orange for dark mode
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  text: {
    primary: '#ffffff',
    secondary: '#b0bec5',
  }
};

export const getAppTheme = (mode: 'light' | 'dark') => createTheme({
  palette: mode === 'light' ? lightPalette : darkPalette,
  components: {
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.secondary, // Ensure label is always a theme-aware secondary text color
        }),
      },
    },
  },
});
