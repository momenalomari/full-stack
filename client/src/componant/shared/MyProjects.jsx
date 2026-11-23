import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api.js";

const MyProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api
      .get("/project/mine")
      .then(({ data }) => {
        if (active) setProjects(data.projects || []);
      })
      .catch((requestError) => {
        if (active)
          setError(
            requestError.response?.data?.message ||
              "Could not load your projects",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const cancelProject = async () => {
    if (!selectedProject) return;

    try {
      await api.delete(`/project/delete/${selectedProject.id}`);
      setProjects((current) =>
        current.map((project) =>
          project.id === selectedProject.id
            ? { ...project, status: "cancelled" }
            : project,
        ),
      );
      toast.success("Project cancelled");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not cancel project",
      );
    } finally {
      setSelectedProject(null);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: { xs: 3, md: 6 },
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}
        >
          <Typography variant="h4" component="h1" fontWeight={700}>
            My projects
          </Typography>
          <Button variant="contained" onClick={() => navigate("/projects/new")}>
            Post a project
          </Button>
        </Stack>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Typography>Loading your projects...</Typography>
        ) : projects.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
            <Typography color="text.secondary">
              You have not posted a project yet.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={1.5}>
            {projects.map((project) => (
              <Paper
                key={project.id}
                component="article"
                variant="outlined"
                sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  sx={{
                    justifyContent: "space-between",
                    alignItems: { xs: "stretch", sm: "center" },
                  }}
                  gap={2}
                >
                  <Box>
                    <Typography variant="h6">{project.title}</Typography>
                    <Typography color="text.secondary">
                      {project.status} · $
                      {Number(project.budget).toLocaleString()}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      onClick={() =>
                        navigate(`/projects/${project.id}/proposals`)
                      }
                    >
                      Proposals
                    </Button>
                    {project.status === "open" && (
                      <Button
                        color="error"
                        variant="outlined"
                        onClick={() => setSelectedProject(project)}
                      >
                        Cancel
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Container>

      <Dialog
        open={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
      >
        <DialogTitle>Cancel this project?</DialogTitle>
        <DialogContent>
          <Typography>
            “{selectedProject?.title}” will be closed to new proposals. This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedProject(null)}>Keep project</Button>
          <Button color="error" onClick={cancelProject}>
            Cancel project
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyProjects;
