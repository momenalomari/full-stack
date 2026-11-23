import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api.js";
import { useAuthContext } from "../Hooks/useAuthContext.js";

const assistantModes = [
  {
    value: "project_brief",
    label: "Project brief",
    description: "Turn an idea into a clear scope and deliverables.",
    placeholder:
      "Describe the project idea, who it is for, and what success looks like...",
  },
  {
    value: "proposal",
    label: "Proposal",
    description: "Prepare an honest pitch for an open project.",
    placeholder:
      "What makes your approach a good fit? Mention relevant experience without exaggeration...",
  },
  {
    value: "marketplace_support",
    label: "Platform help",
    description: "Ask how SkillBridge workflows work.",
    placeholder:
      "Ask about publishing, proposals, project states, or account features...",
  },
  {
    value: "admin_insights",
    label: "Admin insights",
    description: "Ask about aggregate platform activity.",
    placeholder: "Ask for a summary of current project or proposal activity...",
    adminOnly: true,
  },
];

const AiAssistant = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const availableModes = assistantModes.filter(
    (mode) => !mode.adminOnly || user?.role === "admin",
  );
  const [mode, setMode] = useState(
    user?.role === "admin" ? "admin_insights" : "project_brief",
  );
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [skills, setSkills] = useState("");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const selectedMode =
    availableModes.find((item) => item.value === mode) || availableModes[0];

  const projectContext = useMemo(
    () => projects.find((project) => String(project.id) === String(projectId)),
    [projects, projectId],
  );

  const handleModeChange = (_event, nextMode) => {
    if (!nextMode) return;
    setMode(nextMode);
    setReply("");
    setError("");

    if (nextMode === "proposal") {
      setLoadingProjects(true);
      api
        .get("/project/projects")
        .then(({ data }) => {
          const eligibleProjects = (data.projects || []).filter(
            (project) => String(project.client_id) !== String(user?.id),
          );
          setProjects(eligibleProjects);
          setProjectId((current) =>
            eligibleProjects.some(
              (project) => String(project.id) === String(current),
            )
              ? current
              : String(eligibleProjects[0]?.id || ""),
          );
        })
        .catch((requestError) => {
          setError(
            requestError.response?.data?.message ||
              "Could not load open projects",
          );
        })
        .finally(() => setLoadingProjects(false));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSending(true);
    setError("");
    setReply("");

    try {
      const { data } = await api.post("/agent", {
        mode,
        message,
        project_id: mode === "proposal" ? Number(projectId) : undefined,
        skills: mode === "proposal" ? skills : undefined,
      });
      setReply(data.reply);
    } catch (requestError) {
      const errorCode = requestError.response?.data?.message;
      const messages = {
        AI_NOT_CONFIGURED:
          "Gemini is not configured on the server. Add GEMINI_API_KEY to server/.env.",
        PROJECT_NOT_FOUND: "That project is no longer available.",
        SELF_PROPOSAL: "You cannot prepare a proposal for your own project.",
        PROJECT_NOT_OPEN: "This project is no longer accepting proposals.",
        AI_PROVIDER_ERROR:
          "Gemini could not complete the request. Try again shortly.",
      };
      setError(
        messages[errorCode] ||
          errorCode ||
          "Could not get an assistant response.",
      );
    } finally {
      setSending(false);
    }
  };

  const copyReply = async () => {
    try {
      await navigator.clipboard.writeText(reply);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy the response");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 8 }}>
      <Container maxWidth="xl" sx={{ pt: { xs: 3, md: 5 } }}>
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() =>
            navigate(user?.role === "admin" ? "/admin" : "/dashboard")
          }
          sx={{ mb: 2 }}
        >
          Back to workspace
        </Button>

        <Paper
          component="section"
          sx={{
            p: { xs: 3, md: 4.5 },
            mb: 3,
            borderRadius: 3,
            bgcolor: "primary.dark",
            color: "common.white",
            backgroundImage:
              "linear-gradient(120deg, rgba(255,255,255,.035) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            gap={2}
            sx={{
              justifyContent: "space-between",
              alignItems: { sm: "center" },
            }}
          >
            <Box>
              <Typography
                variant="overline"
                sx={{
                  color: "#CFE68A",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                }}
              >
                SKILLBRIDGE AI
              </Typography>
              <Typography
                variant="h1"
                sx={{ fontSize: { xs: 38, md: 54 }, mt: 0.75 }}
              >
                Your freelance copilot.
              </Typography>
              <Typography
                sx={{ mt: 1.25, color: "rgba(255,255,255,.75)", maxWidth: 720 }}
              >
                Draft a brief, shape a proposal, or get help with the
                marketplace. You review every suggestion before using it.
              </Typography>
            </Box>
            <Chip
              icon={<AutoAwesomeRoundedIcon />}
              label="Suggestions only · no automatic changes"
              sx={{
                bgcolor: "rgba(255,255,255,.12)",
                color: "common.white",
                alignSelf: { xs: "flex-start", sm: "center" },
                "& .MuiChip-icon": { color: "#CFE68A" },
              }}
            />
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0, .9fr) minmax(0, 1.1fr)",
            },
            gap: 2,
            alignItems: "start",
          }}
        >
          <Paper
            component="form"
            onSubmit={handleSubmit}
            variant="outlined"
            sx={{ borderRadius: 3, overflow: "hidden" }}
          >
            <Tabs
              value={mode}
              onChange={handleModeChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="Assistant modes"
              sx={{ px: 1.5, pt: 1 }}
            >
              {availableModes.map((item) => (
                <Tab key={item.value} value={item.value} label={item.label} />
              ))}
            </Tabs>
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h3" component="h2" sx={{ fontSize: 28 }}>
                {selectedMode.label}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2.5 }}>
                {selectedMode.description}
              </Typography>

              {mode === "proposal" && (
                <Stack spacing={2} sx={{ mb: 2 }}>
                  <FormControl
                    fullWidth
                    disabled={loadingProjects || projects.length === 0}
                  >
                    <InputLabel id="assistant-project-label">
                      Open project
                    </InputLabel>
                    <Select
                      labelId="assistant-project-label"
                      value={projectId}
                      label="Open project"
                      onChange={(event) => setProjectId(event.target.value)}
                    >
                      {projects.map((project) => (
                        <MenuItem key={project.id} value={String(project.id)}>
                          {project.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {projectContext && (
                    <Paper
                      variant="outlined"
                      sx={{ p: 1.5, borderRadius: 2, bgcolor: "#F8FAF7" }}
                    >
                      <Stack
                        direction="row"
                        sx={{
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="body2" fontWeight={700}>
                          {projectContext.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ${Number(projectContext.budget).toLocaleString()}
                        </Typography>
                      </Stack>
                    </Paper>
                  )}
                  <TextField
                    label="Your skills and relevant experience"
                    value={skills}
                    onChange={(event) => setSkills(event.target.value)}
                    placeholder="React, PostgreSQL, accessibility..."
                    multiline
                    minRows={2}
                  />
                </Stack>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {mode === "proposal" &&
                !loadingProjects &&
                projects.length === 0 && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    No other open projects are available for proposals.
                  </Alert>
                )}
              <TextField
                label={
                  mode === "proposal"
                    ? "What should the proposal emphasize?"
                    : "What do you need help with?"
                }
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={selectedMode.placeholder}
                multiline
                minRows={5}
                maxRows={12}
                fullWidth
                required
                slotProps={{ htmlInput: { maxLength: 4000 } }}
                helperText={`${message.length}/4000`}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                endIcon={
                  sending ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <SendRoundedIcon />
                  )
                }
                disabled={
                  sending ||
                  !message.trim() ||
                  (mode === "proposal" && (!projectId || loadingProjects))
                }
                sx={{ mt: 2 }}
              >
                {sending ? "Thinking..." : "Ask SkillBridge AI"}
              </Button>
            </Box>
          </Paper>

          <Paper
            variant="outlined"
            sx={{ minHeight: 420, borderRadius: 3, overflow: "hidden" }}
          >
            <Stack
              direction="row"
              sx={{
                px: 2.5,
                py: 2,
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <AutoAwesomeRoundedIcon color="secondary" />
                <Typography fontWeight={800}>Assistant response</Typography>
              </Stack>
              {reply && (
                <Button
                  size="small"
                  startIcon={<ContentCopyRoundedIcon />}
                  onClick={copyReply}
                >
                  Copy
                </Button>
              )}
            </Stack>
            <Box sx={{ p: { xs: 2.5, md: 3 }, minHeight: 340 }}>
              {sending ? (
                <Stack
                  spacing={2}
                  sx={{
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 280,
                    color: "text.secondary",
                  }}
                >
                  <CircularProgress />
                  <Typography>Reviewing your request...</Typography>
                </Stack>
              ) : reply ? (
                <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
                  {reply}
                </Typography>
              ) : (
                <Stack
                  spacing={1.5}
                  sx={{
                    minHeight: 280,
                    justifyContent: "center",
                    color: "text.secondary",
                  }}
                >
                  <Typography
                    variant="h5"
                    color="text.primary"
                    fontWeight={700}
                  >
                    Ready when you are.
                  </Typography>
                  <Typography>
                    Choose a mode, add context, and your draft will appear here.
                    Review it carefully before sharing it with a client.
                  </Typography>
                </Stack>
              )}
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default AiAssistant;
