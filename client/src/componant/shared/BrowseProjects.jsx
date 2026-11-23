import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  InputAdornment,
  Paper,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import { useNavigate } from "react-router-dom";
import api from "../../api.js";
import ThemeModeButton from "./ThemeModeButton.jsx";

const BrowseProjects = ({ mode, setMode }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  useEffect(() => {
    let active = true;

    api
      .get("/project/projects", {
        params: {
          search: search.trim(),
          page,
          limit: 12,
        },
      })
      .then(({ data }) => {
        if (active) setProjects(data.projects || []);
        if (active) {
          setPagination(
            data.pagination || { page: 1, totalPages: 1, total: 0 },
          );
        }
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
  }, [search, page]);

  const browseProjects = () => {
    document.getElementById("open-projects")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  const visibleProjects = projects;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 8 }}>
      <Box
        component="header"
        sx={(theme) => ({
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.background.default, 0.8)
              : "rgba(243, 246, 241, 0.92)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid",
          borderColor: "divider",
        })}
      >
        <Container maxWidth="xl">
          <Stack
            direction="row"
            sx={{
              minHeight: 76,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "primary.main",
                  color: "common.white",
                  borderRadius: "12px 12px 12px 3px",
                }}
              >
                <WorkOutlineRoundedIcon fontSize="small" />
              </Box>
              <Typography fontWeight={800} letterSpacing="0.02em">
                SkillBridge
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={{ xs: 0.5, sm: 1.5 }}
              sx={{
                alignItems: "center",
                justifyContent: "flex-end",
                flex: 1,
                flexWrap: { xs: "wrap", sm: "nowrap" },
              }}
            >
              <ThemeModeButton mode={mode} setMode={setMode} />
              <Button
                color="inherit"
                onClick={browseProjects}
                sx={{ display: { xs: "none", sm: "inline-flex" } }}
              >
                Browse work
              </Button>
              <Button onClick={() => navigate("/login")}>Sign in</Button>
              <Button variant="contained" onClick={() => navigate("/register")}>
                Join free
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Box
        component="section"
        sx={(theme) => ({
          color: "common.white",
          overflow: "hidden",
          position: "relative",
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, #09151d 0%, #122534 48%, #1a2f40 100%)"
              : "linear-gradient(135deg, #103d31 0%, #155b45 52%, #1a6a52 100%)",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top left, rgba(207, 230, 138, 0.26), transparent 28%), radial-gradient(circle at bottom right, rgba(255,255,255,0.12), transparent 30%)",
            pointerEvents: "none",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0.12,
            backgroundImage:
              "linear-gradient(115deg, transparent 0 62%, #A5C94A 62% 62.2%, transparent 62.2%), linear-gradient(25deg, transparent 0 78%, #FFFFFF 78% 78.15%, transparent 78.15%)",
          },
        })}
      >
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            gap={{ xs: 5, md: 8 }}
            sx={{
              minHeight: { xs: 390, md: 450 },
              alignItems: "center",
              py: { xs: 6, md: 8 },
            }}
          >
            <Box sx={{ flex: 1, maxWidth: 760 }}>
              <Typography
                variant="overline"
                sx={{
                  color: "#CFE68A",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                }}
              >
                THE FREELANCE MARKETPLACE
              </Typography>
              <Typography
                variant="h1"
                sx={{ mt: 1.5, fontSize: { xs: 44, md: 68 }, maxWidth: 720 }}
              >
                Make room for
                <Box
                  component="span"
                  sx={{ display: "block", color: "#CFE68A" }}
                >
                  your next big thing.
                </Box>
              </Typography>
              <Typography
                sx={{
                  mt: 2,
                  maxWidth: 560,
                  color: "rgba(255,255,255,.76)",
                  fontSize: 17,
                  lineHeight: 1.7,
                }}
              >
                Find a project that fits your craft, share how you would build
                it, and get to work.
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ mt: 3.5 }}
              >
                <Button
                  variant="contained"
                  onClick={browseProjects}
                  endIcon={<ArrowOutwardRoundedIcon />}
                  sx={{
                    bgcolor: "#CFE68A",
                    color: "primary.dark",
                    px: 2.5,
                    py: 1.35,
                    borderRadius: "999px",
                    boxShadow: "0 18px 30px rgba(13, 21, 18, 0.18)",
                    "&:hover": { bgcolor: "#DDF1A5" },
                  }}
                >
                  Explore open projects
                </Button>
                <Button
                  variant="outlined"
                  onClick={() =>
                    navigate("/login", {
                      state: { from: { pathname: "/projects/new" } },
                    })
                  }
                  sx={{
                    color: "common.white",
                    borderColor: "rgba(255,255,255,.34)",
                    borderRadius: "999px",
                    px: 2.5,
                    py: 1.35,
                    "&:hover": {
                      borderColor: "common.white",
                      bgcolor: "rgba(255,255,255,.08)",
                    },
                  }}
                >
                  I have a project
                </Button>
              </Stack>
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ mt: 3.5, flexWrap: "wrap" }}
              >
                {["UX/UI", "Web Apps", "Branding", "Product Design"].map(
                  (item) => (
                    <Chip
                      key={item}
                      label={item}
                      sx={{
                        bgcolor: alpha("#ffffff", 0.1),
                        color: "common.white",
                        border: "1px solid rgba(255,255,255,0.15)",
                        fontWeight: 600,
                        borderRadius: "999px",
                      }}
                    />
                  ),
                )}
              </Stack>
            </Box>
            <Box
              sx={{
                width: { xs: "100%", md: 330 },
                flexShrink: 0,
                pl: { xs: 0, md: 4 },
                borderLeft: { xs: 0, md: "1px solid rgba(255,255,255,.24)" },
                borderTop: { xs: "1px solid rgba(255,255,255,.24)", md: 0 },
                pt: { xs: 3, md: 0 },
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2.25,
                  borderRadius: 3,
                  background: alpha("#ffffff", 0.08),
                  border: "1px solid rgba(255,255,255,0.18)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Typography
                  variant="overline"
                  sx={{ color: "rgba(255,255,255,.7)", letterSpacing: "0.1em" }}
                >
                  OPEN RIGHT NOW
                </Typography>
                <Typography
                  component="p"
                  sx={{
                    fontFamily: "Georgia, serif",
                    fontSize: 92,
                    lineHeight: 0.95,
                    color: "#CFE68A",
                    my: 0.75,
                  }}
                >
                  {String(projects.length).padStart(2, "0")}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,.78)" }}>
                  live projects waiting for a proposal
                </Typography>
              </Paper>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ pt: { xs: 5, md: 7 } }}>
        <Stack
          id="open-projects"
          direction={{ xs: "column", md: "row" }}
          gap={3}
          sx={{
            scrollMarginTop: 100,
            alignItems: { md: "end" },
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="overline"
              color="secondary.dark"
              fontWeight={800}
              letterSpacing="0.1em"
            >
              GOOD BRIEFS, BETTER WORK
            </Typography>
            <Typography
              variant="h2"
              sx={{ mt: 0.5, fontSize: { xs: 34, md: 44 } }}
            >
              Open projects
            </Typography>
          </Box>
          <TextField
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search titles and skills"
            sx={{ width: { xs: "100%", md: 360 } }}
            slotProps={{
              htmlInput: { "aria-label": "Search projects by title or skills" },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>

        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2.5,
          }}
        >
          <Typography color="text.secondary">
            {search
              ? `${visibleProjects.length} matches`
              : `${visibleProjects.length} projects available`}
          </Typography>
          <Chip
            size="small"
            label="Accepting proposals"
            sx={{
              bgcolor: "success.light",
              color: "success.dark",
              fontWeight: 700,
              borderRadius: "999px",
            }}
          />
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {loading ? (
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
            {[0, 1].map((item) => (
              <Paper
                key={item}
                variant="outlined"
                sx={{ p: 3, minHeight: 260, borderRadius: 3 }}
              >
                <Typography color="text.secondary">
                  Loading project brief...
                </Typography>
              </Paper>
            ))}
          </Box>
        ) : visibleProjects.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, textAlign: "center" }}
          >
            <Typography variant="h5" fontWeight={700}>
              {search ? "No projects found" : "A fresh brief is on its way"}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {search
                ? "Try a different title or skill."
                : "There are no open projects right now."}
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
            {visibleProjects.map((project, index) => (
              <Paper
                key={project.id}
                component="article"
                variant="outlined"
                sx={(theme) => ({
                  p: { xs: 2.5, sm: 3 },
                  minHeight: 285,
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 4,
                  background:
                    theme.palette.mode === "dark"
                      ? "linear-gradient(180deg, rgba(18,34,44,0.95), rgba(12,21,29,0.98))"
                      : "linear-gradient(180deg, #FFFFFF 0%, #F9FBF7 100%)",
                  border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "0 16px 32px rgba(4, 9, 12, 0.32)"
                      : "0 16px 40px rgba(21, 91, 69, 0.08)",
                  transition:
                    "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                  animation: "content-rise 420ms ease both",
                  animationDelay: `${index * 70}ms`,
                  "&:hover": {
                    transform: "translateY(-4px)",
                    borderColor: theme.palette.primary.main,
                    boxShadow:
                      theme.palette.mode === "dark"
                        ? "0 18px 40px rgba(8, 15, 20, 0.48)"
                        : "0 18px 40px rgba(21, 91, 69, 0.12)",
                  },
                })}
              >
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Chip
                    size="small"
                    label="OPEN"
                    sx={{
                      bgcolor: "success.light",
                      color: "success.dark",
                      fontSize: 11,
                      fontWeight: 800,
                      borderRadius: "999px",
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    #{String(project.id).padStart(4, "0")}
                  </Typography>
                </Stack>
                <Typography
                  variant="h3"
                  component="h3"
                  sx={{ fontFamily: "inherit", fontSize: 23, lineHeight: 1.25 }}
                >
                  {project.title}
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    lineHeight: 1.65,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {project.description}
                </Typography>
                <Stack
                  direction="row"
                  spacing={2.5}
                  sx={{
                    mt: "auto",
                    pt: 2.5,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      BUDGET
                    </Typography>
                    <Typography fontWeight={800} sx={{ fontSize: 18 }}>
                      ${Number(project.budget).toLocaleString()}
                    </Typography>
                  </Box>
                  <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{ alignItems: "center", color: "text.secondary" }}
                  >
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 15 }} />
                    <Typography variant="body2">
                      {String(project.deadline).slice(0, 10)}
                    </Typography>
                  </Stack>
                </Stack>
                <Stack
                  direction={{ xs: "column-reverse", sm: "row" }}
                  spacing={1}
                  sx={{ mt: 2.5 }}
                >
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate(`/projects/${project.id}`)}
                    sx={{
                      borderRadius: "999px",
                      fontWeight: 700,
                    }}
                  >
                    View details
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowOutwardRoundedIcon />}
                    onClick={() =>
                      navigate(`/projects/${project.id}#proposal-form`)
                    }
                    sx={{
                      borderRadius: "999px",
                      fontWeight: 700,
                    }}
                  >
                    Submit proposal
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Box>
        )}
        {pagination.totalPages > 1 && (
          <Stack sx={{ alignItems: "center", mt: 4 }}>
            <Pagination
              count={pagination.totalPages}
              page={page}
              onChange={(_event, nextPage) => setPage(nextPage)}
              color="primary"
            />
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default BrowseProjects;
