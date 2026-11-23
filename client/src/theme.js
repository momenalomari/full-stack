import { createTheme } from "@mui/material/styles";

const getTheme = (mode = "light") =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "dark" ? "#7AE0B5" : "#155B45",
        dark: mode === "dark" ? "#5CD09F" : "#103D31",
        light: mode === "dark" ? "#D3F7E5" : "#DCECE4",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: "#E8785B",
        dark: "#B84D36",
        light: "#FCE4DB",
        contrastText: "#FFFFFF",
      },
      success: {
        main: "#A5C94A",
        dark: "#59731C",
        light: "#EEF5D8",
      },
      background: {
        default: mode === "dark" ? "#0E1720" : "#F3F6F1",
        paper: mode === "dark" ? "#162534" : "#FFFFFF",
      },
      text: {
        primary: mode === "dark" ? "#EAF1EE" : "#1C3028",
        secondary: mode === "dark" ? "#AABBB3" : "#62736B",
      },
      divider: mode === "dark" ? "#2C3D4E" : "#DDE5DE",
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: '"Aptos", "Segoe UI", sans-serif',
      h1: {
        fontFamily:
          '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif',
        fontWeight: 700,
        lineHeight: 1.04,
      },
      h2: {
        fontFamily:
          '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif',
        fontWeight: 700,
        lineHeight: 1.08,
      },
      h3: {
        fontFamily:
          '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif',
        fontWeight: 700,
        lineHeight: 1.1,
      },
      button: {
        fontWeight: 700,
        textTransform: "none",
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            minHeight: 42,
            borderRadius: 10,
            boxShadow: "none",
            paddingInline: 18,
          },
          containedPrimary: {
            "&:hover": {
              boxShadow: "none",
              backgroundColor: "#103D31",
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: mode === "dark" ? "#1B2B38" : "#FFFFFF",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          outlined: {
            borderColor: mode === "dark" ? "#2C3D4E" : "#DDE5DE",
          },
        },
      },
    },
  });

export default getTheme;
