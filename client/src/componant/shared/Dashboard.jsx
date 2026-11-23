import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import toast from "react-hot-toast";
import api from "../../api.js";
import { useAuthContext } from "../Hooks/useAuthContext.js";
import ThemeModeButton from "./ThemeModeButton.jsx";

const Dashboard = ({ mode, setMode }) => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api
      .get("/project/projects")
      .then(({ data }) => {
        if (active) setProjects(data.projects || []);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message || "Could not load projects",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      toast.error("Could not complete sign out");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 8 }}>
      <Container maxWidth="xl">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          gap={2}
          sx={{
            py: 2,
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.main",
                color: "common.white",
                borderRadius: "12px 12px 12px 3px",
              }}
            >
              <Typography fontWeight={800}>S</Typography>
            </Box>
            <Typography fontWeight={800}>SkillBridge</Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ flexWrap: "wrap", alignItems: "center" }}
          >
            <Button component={Link} to="/projects/mine" color="inherit">
              My projects
            </Button>
            <Button component={Link} to="/proposals/mine" color="inherit">
              My proposals
            </Button>
            <Button component={Link} to="/assistant" color="inherit">
              AI assistant
            </Button>
            <Button component={Link} to="/feedback" color="inherit">
              Feedback
            </Button>
            <Button component={Link} to="/profile" color="inherit">
              Profile
            </Button>
            <Button component={Link} to="/change-password" color="inherit">
              Password
            </Button>
            {["moderator", "admin"].includes(user?.role) && (
              <Button component={Link} to="/moderator" color="inherit">
                Moderator
              </Button>
            )}
            <ThemeModeButton mode={mode} setMode={setMode} />
            <Button onClick={handleLogout} color="inherit">
              Sign out
            </Button>
          </Stack>
        </Stack>

        <Paper
          component="section"
          sx={{
            mt: 4,
            mb: 5,
            p: { xs: 3, md: 4.5 },
            borderRadius: 3,
            bgcolor: "primary.dark",
            color: "common.white",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 3,
            alignItems: { sm: "center" },
            justifyContent: "space-between",
            backgroundImage:
              "linear-gradient(120deg, rgba(255,255,255,.035) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{ color: "#CFE68A", fontWeight: 800, letterSpacing: "0.1em" }}
            >
              YOUR WORKSPACE
            </Typography>
            <Typography
              variant="h2"
              component="h1"
              sx={{ fontSize: { xs: 34, md: 44 }, mt: 0.5 }}
            >
              Welcome, {user?.username}
            </Typography>
            <Typography sx={{ mt: 1, color: "rgba(255,255,255,.74)" }}>
              Find a project to pitch, or post a brief and meet your next
              collaborator.
            </Typography>
          </Box>
          <Button
            variant="contained"
            endIcon={<ArrowOutwardRoundedIcon />}
            onClick={() => navigate("/projects/new")}
            sx={{
              flexShrink: 0,
              bgcolor: "#CFE68A",
              color: "primary.dark",
              "&:hover": { bgcolor: "#DDF1A5" },
            }}
          >
            Post a project
          </Button>
        </Paper>

        <Stack
          direction="row"
          sx={{ alignItems: "end", justifyContent: "space-between", mb: 2.5 }}
        >
          <Box>
            <Typography
              variant="overline"
              color="secondary.dark"
              fontWeight={800}
              letterSpacing="0.1em"
            >
              START WITH A GOOD BRIEF
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              sx={{ fontSize: { xs: 32, md: 40 }, mt: 0.5 }}
            >
              Open projects
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/projects"
            endIcon={<ArrowOutwardRoundedIcon />}
            sx={{ display: { xs: "none", sm: "inline-flex" } }}
          >
            Browse all
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
            <CircularProgress aria-label="Loading open projects" />
          </Box>
        ) : projects.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
            <Typography color="text.secondary">
              No open projects are available right now.
            </Typography>
          </Paper>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {projects.map((project) => (
              <Paper
                key={project.id}
                variant="outlined"
                component="article"
                sx={{ p: 2.5, borderRadius: 3 }}
              >
                <Stack
                  direction="row"
                  sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1.5,
                  }}
                >
                  <Chip
                    size="small"
                    label="OPEN"
                    sx={{
                      bgcolor: "success.light",
                      color: "success.dark",
                      fontWeight: 800,
                    }}
                  />
                  <Typography fontWeight={800}>
                    ${Number(project.budget).toLocaleString()}
                  </Typography>
                </Stack>
                <Button
                  component={Link}
                  to={`/projects/${project.id}`}
                  variant="text"
                  sx={{
                    p: 0,
                    fontSize: 20,
                    fontWeight: 800,
                    textTransform: "none",
                    textAlign: "left",
                  }}
                >
                  {project.title}
                </Button>
                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    lineHeight: 1.65,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {project.description}
                </Typography>
                <Button
                  component={Link}
                  to={`/projects/${project.id}#proposal-form`}
                  endIcon={<ArrowOutwardRoundedIcon />}
                  sx={{ mt: 1.5, px: 0 }}
                >
                  View and apply
                </Button>
              </Paper>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;
