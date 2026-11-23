import { Button } from "@mui/material";

const ThemeModeButton = ({ mode, setMode, floating = false }) => {
  const nextMode = mode === "light" ? "dark" : "light";

  return (
    <Button
      variant="outlined"
      onClick={() => setMode(nextMode)}
      sx={{
        borderRadius: "999px",
        px: 2,
        py: 1,
        borderColor: "divider",
        backgroundColor: "background.paper",
        color: "text.primary",
        ...(floating && {
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 1300,
        }),
        "&:hover": {
          borderColor: "primary.main",
          backgroundColor: "action.hover",
        },
      }}
    >
      <span className="theme-mode-label-wide">
        {nextMode === "dark" ? "Dark mode" : "Light mode"}
      </span>
      <span className="theme-mode-label-compact">
        {nextMode === "dark" ? "Dark" : "Light"}
      </span>
    </Button>
  );
};

export default ThemeModeButton;
