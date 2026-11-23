import { useState } from "react";
import { Box, Button, Container, Paper, TextField, Typography } from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api.js";

export default function EmailVerification() {
  const { token: linkToken } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = linkToken;
  const [message, setMessage] = useState(location.state?.deliveryMessage || "");
  const [email, setEmail] = useState(location.state?.email || "");
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await api.post(`/auth/verify-email/${token}`);
      toast.success("Email verified");
      navigate("/login", { replace: true });
    } catch (error) {
      if (error.response?.status === 400) {
        const detail = "This link expired or was already used. Sign in if you already verified, or request a new link.";
        navigate("/verify-email", { replace: true, state: { email, deliveryMessage: detail } });
        setMessage(detail);
      } else {
        toast.error("Verification is temporarily unavailable. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resend = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/verify-email/resend", { email });
      setMessage(data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not resend verification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Typography variant="h4" fontWeight={800}>
          Email verification
        </Typography>
        {message && (
          <Typography sx={{ mt: 2 }}>{message}</Typography>
        )}
        {token ? (
          <Box sx={{ mt: 3 }}>
            <Typography sx={{ mb: 2 }}>
              Confirm that this account email belongs to you.
            </Typography>
            <Button variant="contained" onClick={verify} disabled={loading}>
              Verify email
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={resend} sx={{ mt: 3 }}>
            <TextField
              label="Email address"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              fullWidth
              required
            />
            <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={loading}>
              Resend verification
            </Button>
          </Box>
        )}
        <Button sx={{ mt: 2 }} onClick={() => navigate("/login")}>Sign in</Button>
      </Paper>
    </Container>
  );
}
