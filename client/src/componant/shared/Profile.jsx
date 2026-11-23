import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api.js";
import { useAuthContext } from "../Hooks/useAuthContext.js";

export default function Profile() {
  const { user, setUser } = useAuthContext();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/auth/profile")
      .then(({ data }) => setForm({
        username: data.user.username || "",
        email: data.user.email || "",
      }))
      .catch((error) => {
        toast.error(error.response?.data?.message || "Could not load profile");
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch("/auth/profile", form);
      if (!data.user.email_verified) {
        setUser(null);
        toast.success("Email changed. Request a verification link for your new address.");
        navigate("/verify-email", { replace: true, state: { email: data.user.email } });
        return;
      }
      setUser(data.user);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Typography variant="h4" fontWeight={800}>My profile</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          Manage your public account information.
        </Typography>
        {!form.email && <Alert severity="error">Profile data is unavailable</Alert>}
        <Box component="form" onSubmit={save}>
          <Stack spacing={2}>
            <TextField
              label="Full name"
              value={form.username}
              onChange={(event) =>
                setForm((current) => ({ ...current, username: event.target.value }))
              }
              required
            />
            <TextField
              label="Email address"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              required
            />
            <Alert severity="info">
              Account role: <strong>{user?.role}</strong>
            </Alert>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
