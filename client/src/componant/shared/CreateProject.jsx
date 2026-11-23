import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api.js";

const CreateProject = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [image, setImage] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    category_id: "",
    deadline: "",
  });

  useEffect(() => {
    let active = true;

    api
      .get("/categories")
      .then(({ data }) => {
        if (active) setCategories(data.categories || []);
      })
      .catch((requestError) => {
        if (active)
          setError(
            requestError.response?.data?.message || "Could not load categories",
          );
      })
      .finally(() => {
        if (active) setLoadingCategories(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const projectData = new FormData();
      projectData.append("title", form.title);
      projectData.append("description", form.description);
      projectData.append("budget", form.budget);
      projectData.append("category_id", form.category_id);
      projectData.append("deadline", form.deadline);
      if (image) projectData.append("image", image);

      const { data } = await api.post("/project/create", projectData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Project published");
      navigate(`/projects/${data.project.id}`, { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.errors?.join(". ") ||
          requestError.response?.data?.message ||
          "Could not publish project",
      );
    } finally {
      setSubmitting(false);
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
      <Container maxWidth="lg">
        <Button onClick={() => navigate("/dashboard")} sx={{ mb: 2 }}>
          Back to projects
        </Button>
        <Paper
          component="form"
          onSubmit={handleSubmit}
          variant="outlined"
          sx={{
            p: { xs: 2.5, sm: 4.5 },
            borderRadius: 3,
            maxWidth: 860,
            mx: "auto",
          }}
        >
          <Typography
            variant="overline"
            color="secondary.dark"
            fontWeight={800}
            letterSpacing="0.1em"
          >
            CLIENT WORKSPACE
          </Typography>
          <Typography
            variant="h2"
            component="h1"
            sx={{ fontSize: { xs: 34, md: 44 }, mt: 0.5 }}
          >
            Post a project
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mt: 1, mb: 3.5, maxWidth: 620, lineHeight: 1.7 }}
          >
            Add a clear scope, budget, and deadline so freelancers can send
            focused proposals.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={2}>
            <TextField
              name="title"
              label="Project title"
              value={form.title}
              onChange={handleChange}
              required
              slotProps={{ htmlInput: { minLength: 5, maxLength: 150 } }}
            />
            <TextField
              name="description"
              label="Description and requirements"
              value={form.description}
              onChange={handleChange}
              required
              multiline
              minRows={5}
              slotProps={{ htmlInput: { minLength: 20 } }}
            />
            <Stack direction="row" spacing={2} alignItems="center">
              <Button component="label" variant="outlined">
                Choose project image
                <input
                  hidden
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    setImage(event.target.files?.[0] ?? null)
                  }
                />
              </Button>
              <Typography color="text.secondary" variant="body2">
                {image?.name || "Optional, up to 5 MB"}
              </Typography>
            </Stack>
            <TextField
              select
              name="category_id"
              label="Category"
              value={form.category_id}
              onChange={handleChange}
              required
              disabled={loadingCategories || categories.length === 0}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            {!loadingCategories && categories.length === 0 && !error && (
              <Alert severity="info">There are no active categories yet.</Alert>
            )}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                name="budget"
                label="Budget"
                type="number"
                value={form.budget}
                onChange={handleChange}
                required
                slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
                fullWidth
              />
              <TextField
                name="deadline"
                label="Deadline"
                type="date"
                value={form.deadline}
                onChange={handleChange}
                required
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
            </Stack>
            <Box>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={
                  submitting || loadingCategories || categories.length === 0
                }
              >
                {submitting ? "Publishing..." : "Publish project"}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default CreateProject;
