import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api.js";
import { useAuthContext } from "../Hooks/useAuthContext.js";

const ProjectDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthContext();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [proposal, setProposal] = useState({
    price: "",
    delivery_days: "",
    technologies: "",
    cover_letter: "",
  });

  useEffect(() => {
    let active = true;

    api
      .get(`/project/projects/${id}`)
      .then(({ data }) => {
        if (active) setProject(data.project);
      })
      .catch((requestError) => {
        if (active)
          setError(
            requestError.response?.data?.message || "Could not load project",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (location.hash === "#proposal-form" && !loading) {
      document
        .getElementById("proposal-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash, loading, project, authLoading]);

  const handleChange = (event) => {
    setProposal((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api.post(`/proposal/projects/${id}`, {
        ...proposal,
        price: Number(proposal.price),
        delivery_days: Number(proposal.delivery_days),
      });
      toast.success("Proposal submitted");
      navigate("/proposals/mine");
    } catch (requestError) {
      setError(
        requestError.response?.data?.errors?.join(". ") ||
          requestError.response?.data?.message ||
          "Could not submit proposal",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isOwner = project && String(project.client_id) === String(user?.id);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: { xs: 3, md: 6 },
      }}
    >
      <Container maxWidth="xl">
        <Button onClick={() => navigate("/projects")} sx={{ mb: 2 }}>
          All projects
        </Button>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Typography>Loading project...</Typography>
        ) : project ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                md: "minmax(0, 1.15fr) minmax(340px, 0.85fr)",
              },
              gap: { xs: 2, md: 3 },
              alignItems: "start",
            }}
          >
            <Paper
              component="article"
              variant="outlined"
              sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3 }}
            >
              <Chip
                size="small"
                label="OPEN PROJECT"
                sx={{
                  bgcolor: "success.light",
                  color: "success.dark",
                  fontWeight: 800,
                  mb: 2,
                }}
              />
              <Typography
                variant="h2"
                component="h1"
                sx={{ fontSize: { xs: 34, md: 46 } }}
              >
                {project.title}
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ whiteSpace: "pre-wrap", mt: 2.5, lineHeight: 1.8 }}
              >
                {project.description}
              </Typography>
            </Paper>

            <Stack
              spacing={2}
              sx={{ position: { md: "sticky" }, top: { md: 96 } }}
            >
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  fontWeight={800}
                >
                  PROJECT BUDGET
                </Typography>
                <Typography variant="h2" sx={{ fontSize: 38, mt: 0.5 }}>
                  ${Number(project.budget).toLocaleString()}
                </Typography>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    mt: 2.5,
                    pt: 2,
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography color="text.secondary">Deadline</Typography>
                  <Typography fontWeight={700}>
                    {String(project.deadline).slice(0, 10)}
                  </Typography>
                </Stack>
              </Paper>

              {isOwner ? (
                <Alert id="proposal-form" severity="info">
                  This is your project. You cannot submit a proposal to your own
                  project.
                </Alert>
              ) : authLoading ? (
                <Paper
                  id="proposal-form"
                  variant="outlined"
                  sx={{ p: 3, borderRadius: 3 }}
                >
                  <Typography color="text.secondary">
                    Checking your account...
                  </Typography>
                </Paper>
              ) : !user ? (
                <Paper
                  id="proposal-form"
                  variant="outlined"
                  sx={{ p: 3, borderRadius: 3 }}
                >
                  <Typography variant="h5" component="h2" fontWeight={700}>
                    Send a proposal
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    Sign in to share your price, timeline, and approach with the
                    client.
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() =>
                      navigate("/login", {
                        state: {
                          from: {
                            pathname: `/projects/${id}`,
                            hash: "#proposal-form",
                          },
                        },
                      })
                    }
                  >
                    Sign in to apply
                  </Button>
                </Paper>
              ) : (
                <Paper
                  id="proposal-form"
                  component="form"
                  onSubmit={handleSubmit}
                  variant="outlined"
                  sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3 }}
                >
                  <Typography
                    variant="overline"
                    color="secondary.dark"
                    fontWeight={800}
                  >
                    YOUR OFFER
                  </Typography>
                  <Typography
                    variant="h5"
                    component="h2"
                    fontWeight={700}
                    sx={{ mb: 2 }}
                  >
                    Send a proposal
                  </Typography>
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}
                  <Stack spacing={1.5}>
                    <TextField
                      name="price"
                      label="Your price"
                      type="number"
                      value={proposal.price}
                      onChange={handleChange}
                      required
                      slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
                      fullWidth
                    />
                    <TextField
                      name="delivery_days"
                      label="Delivery time (days)"
                      type="number"
                      value={proposal.delivery_days}
                      onChange={handleChange}
                      required
                      slotProps={{ htmlInput: { min: 1, step: 1 } }}
                      fullWidth
                    />
                    <TextField
                      name="technologies"
                      label="Skills or technologies"
                      value={proposal.technologies}
                      onChange={handleChange}
                      placeholder="React, PostgreSQL, UX"
                    />
                    <TextField
                      name="cover_letter"
                      label="Cover letter and approach"
                      value={proposal.cover_letter}
                      onChange={handleChange}
                      required
                      multiline
                      minRows={4}
                      slotProps={{ htmlInput: { minLength: 20 } }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={submitting}
                      fullWidth
                    >
                      {submitting ? "Sending..." : "Submit proposal"}
                    </Button>
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Box>
        ) : null}
      </Container>
    </Box>
  );
};

export default ProjectDetails;
