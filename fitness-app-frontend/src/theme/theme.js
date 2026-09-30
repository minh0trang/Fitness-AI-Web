import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#16A34A",
      dark: "#15803D",
      light: "#DCFCE7",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#0284C7",
      light: "#E0F2FE",
      dark: "#0369A1",
    },
    background: {
      default: "#F7F8FA",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1F2937",
      secondary: "#6B7280",
    },
    divider: "#E5E7EB",
    error: {
      main: "#DC2626",
    },
    success: {
      main: "#16A34A",
    },
    warning: {
      main: "#F59E0B",
    },
    info: {
      main: "#2563EB",
    },
  },
  typography: {
    fontFamily: [
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      "sans-serif",
    ].join(","),
    h4: {
      fontWeight: 700,
      color: "#1F2937",
    },
    h5: {
      fontWeight: 600,
      color: "#1F2937",
    },
    h6: {
      fontWeight: 600,
      color: "#1F2937",
    },
    subtitle1: {
      color: "#6B7280",
    },
    subtitle2: {
      color: "#6B7280",
      fontWeight: 500,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
          border: "1px solid #E5E7EB",
          backgroundColor: "#FFFFFF",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        containedPrimary: {
          backgroundColor: "#16A34A",
          "&:hover": {
            backgroundColor: "#15803D",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 6,
        },
      },
    },
  },
});

export default theme;
