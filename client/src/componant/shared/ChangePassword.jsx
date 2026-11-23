import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../Hooks/useAuthContext.js";
import api from "../../api.js";

export default function ChangePassword() {
  const navigate = useNavigate();
  const { setUser } = useAuthContext();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setSaving(true);
    try {
      await api.post("/auth/change-password", form);
      setUser(null);
      toast.success("Password changed. Sign in again on your devices.");
      navigate("/login", { replace: true });
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Typography variant="h4" fontWeight={800}>
          Change password
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          Use a strong password that you do not use elsewhere.
        </Typography>
        <Box component="form" onSubmit={submit}>
          <Stack spacing={2}>
            {[
              ["currentPassword", "Current password"],
              ["newPassword", "New password"],
              ["confirmPassword", "Confirm new password"],
            ].map(([name, label]) => (
              <TextField
                key={name}
                label={label}
                type="password"
                value={form[name]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [name]: event.target.value,
                  }))
                }
                required
                autoComplete={
                  name === "currentPassword" ? "current-password" : "new-password"
                }
              />
            ))}
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Updating..." : "Update password"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
