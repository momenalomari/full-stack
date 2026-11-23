import { useState } from "react";
import {
  Container,
  Paper,
  Box,
  TextField,
  Typography,
  Button,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";

import { useAuth } from "../Hooks/useAuth.js";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    const email = userData.email.trim();
    const password = userData.password;

    // Validation
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      const result = await login({
        email,
        password,
      });

      if (result?.verificationRequired) {
        navigate("/verify-email", { state: { email, deliveryMessage: "Verify your email before signing in. Check your inbox or request a new link." } });
        return;
      }
      if (result) {
        const returnLocation = location.state?.from;
        const destination = returnLocation
          ? `${returnLocation.pathname}${returnLocation.search || ""}${returnLocation.hash || ""}`
          : result.user.role === "admin"
            ? "/admin"
            : "/dashboard";
        navigate(destination, { replace: true });
      }
    } catch (error) {
      toast.error(error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      backgroundColor: "#FFFFFF",
      transition: "0.2s",

      "&:hover": {
        backgroundColor: "#FAFCF9",
      },

      "&.Mui-focused": {
        backgroundColor: "#FFFFFF",
      },
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        backgroundImage:
          "linear-gradient(rgba(21, 91, 69, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(21, 91, 69, 0.035) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        px: 2,
        py: 5,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            boxShadow: "0 18px 48px rgba(16, 61, 49, 0.09)",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                width: 58,
                height: 58,
                mx: "auto",
                mb: 2,
                borderRadius: "16px 16px 16px 4px",
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WorkOutlineRoundedIcon
                sx={{ color: "common.white", fontSize: 28 }}
              />
            </Box>

            <Typography
              variant="h4"
              component="h1"
              fontWeight={700}
              color="text.primary"
            >
              Welcome Back
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Sign in to continue to your account
            </Typography>
          </Box>

          {/* Login Form */}
          <Box component="form" onSubmit={handleLogin} noValidate>
            {/* Email */}
            <TextField
              label="Email Address"
              name="email"
              type="email"
              value={userData.email}
              onChange={handleChange}
              fullWidth
              required
              autoComplete="email"
              margin="normal"
              sx={inputStyles}
            />

            {/* Password */}
            <TextField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={userData.password}
              onChange={handleChange}
              fullWidth
              required
              autoComplete="current-password"
              margin="normal"
              sx={inputStyles}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        type="button"
                        size="small"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowPassword((prev) => !prev)}
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          minWidth: 48,
                        }}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </Button>
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Login Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 4,
                py: 1.6,
                borderRadius: 2.5,
                textTransform: "none",
                fontSize: "16px",
                fontWeight: 600,
                bgcolor: "primary.main",
                boxShadow: "0 8px 18px rgba(21,91,69,0.16)",

                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign In"
              )}
            </Button>
          </Box>

          {/* Register Link */}
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?
            </Typography>

            <Button
              type="button"
              onClick={() => navigate("/register")}
              sx={{
                mt: 0.5,
                color: "primary.main",
                fontWeight: 700,
                textTransform: "none",
              }}
            >
              Create an account
            </Button>
            <Button onClick={() => navigate("/verify-email", { state: { email: userData.email } })}>
              Resend verification email
            </Button>
            <Button
              type="button"
              onClick={() => navigate("/projects")}
              sx={{
                display: "block",
                mx: "auto",
                mt: 1,
                textTransform: "none",
              }}
            >
              Browse open projects
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
