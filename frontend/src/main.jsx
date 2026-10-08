import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

import App from "./App.jsx";
import "./index.css";

const theme = createTheme({
  palette: {
    primary: { main: "#16776d", dark: "#105e56", light: "#eaf4f1" },
    secondary: { main: "#c98352" },
    background: { default: "#f6f8f6", paper: "#ffffff" },
    text: { primary: "#1d2c28", secondary: "#687773" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
    button: { fontWeight: 700 },
    h1: { letterSpacing: "-.05em" },
    h2: { letterSpacing: "-.045em" },
    h3: { letterSpacing: "-.045em" },
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 10, boxShadow: "none" } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 12 } } },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);
