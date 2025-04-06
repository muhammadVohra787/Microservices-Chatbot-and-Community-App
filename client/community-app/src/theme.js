import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',  // You can change to 'dark' for dark mode
    primary: {
      main: '#3f51b5',  // A richer blue for primary elements
    },
    secondary: {
      main: '#f50057',  // A vibrant pink for secondary elements
    },
    error: {
      main: '#f44336',  // Red for errors
    },
    warning: {
      main: '#ff9800',  // Orange for warnings
    },
    info: {
      main: '#2196f3',  // Lighter blue for informational elements
    },
    success: {
      main: '#4caf50',  // Green for success messages
    },
    background: {
      default: '#fafafa',  // Slightly grayish background for a softer look
      paper: '#ffffff',  // Paper background for cards or modal components
    },
    text: {
      primary: '#212121',  // Dark gray for main text
      secondary: '#757575',  // Lighter gray for secondary text
    },
    action: {
      active: '#3f51b5',  // Active color for icons
      hover: '#e0e0e0',  // Lighter gray for hover states
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h1: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: 700,
      fontSize: '2.5rem',
      color: '#212121',
    },
    h2: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: 600,
      fontSize: '2rem',
      color: '#212121',
    },
    h3: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: 500,
      fontSize: '1.75rem',
      color: '#212121',
    },
    body1: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: 400,
      fontSize: '1rem',
      color: '#212121',
    },
    body2: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: 300,
      fontSize: '0.875rem',
      color: '#757575',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: '600',
          textTransform: 'none',
          padding: '8px 16px',
          transition: 'background-color 0.3s ease',
        },
        containedPrimary: {
          backgroundColor: '#3f51b5',  // Richer primary blue for buttons
          '&:hover': {
            backgroundColor: '#303f9f',  // Darker blue on hover
          },
        },
        containedSecondary: {
          backgroundColor: '#f50057',  // Vibrant pink for secondary buttons
          '&:hover': {
            backgroundColor: '#c51162',  // Darker pink on hover
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',  // Elevated effect with softer shadow
          backgroundColor: '#ffffff',  // Clean white background for cards
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          backgroundColor: '#fff',
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            '& fieldset': {
              borderColor: '#3f51b5',  // Richer blue border
            },
            '&:hover fieldset': {
              borderColor: '#303f9f',  // Darker blue on hover
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3f51b5',  // Rich blue when focused
            },
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#212121',  // Ensure typography is easy to read
        },
      },
    },
  },
});

export default theme;
