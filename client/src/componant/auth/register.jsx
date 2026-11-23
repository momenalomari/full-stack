import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../Hooks/useAuth.js";

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setUserData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    if (loading) return;

    const username = userData.username.trim();
    const email = userData.email.trim();
    const { password, confirmPassword } = userData;

    if (!username || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (username.length < 3 || username.length > 30) {
      toast.error("Full name must be between 3 and 30 characters");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (password.length < 6 || password.length > 30) {
      toast.error("Password must be between 6 and 30 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const result = await register({
        username,
        email,
        password,
        confirmPassword,
      });

      if (result) {
        navigate("/verify-email", {
          state: {
            email,
            deliveryMessage: result.message,
          },
        });
      }
    } catch (error) {
      toast.error(error?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const textFieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      backgroundColor: "#FFFFFF",

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
                display: "grid",
                placeItems: "center",
                mx: "auto",
                mb: 2,
                bgcolor: "primary.main",
                borderRadius: "16px 16px 16px 4px",
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
              Create Account
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Enter your details to get started
            </Typography>
          </Box>

          {/* Register Form */}
          <Box component="form" onSubmit={handleRegister} noValidate>
            {/* Full Name */}
            <TextField
              label="Full Name"
              name="username"
              value={userData.username}
              onChange={handleChange}
              autoComplete="name"
              fullWidth
              required
              margin="normal"
              sx={textFieldStyle}
            />

            {/* Email */}
            <TextField
              label="Email Address"
              name="email"
              type="email"
              value={userData.email}
              onChange={handleChange}
              autoComplete="email"
              fullWidth
              required
              margin="normal"
              sx={textFieldStyle}
            />

            {/* Password */}
            <TextField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={userData.password}
              onChange={handleChange}
              autoComplete="new-password"
              fullWidth
              required
              margin="normal"
              sx={textFieldStyle}
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
                          minWidth: 50,
                          textTransform: "none",
                        }}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </Button>
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Confirm Password */}
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={userData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              fullWidth
              required
              margin="normal"
              sx={textFieldStyle}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        type="button"
                        size="small"
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        sx={{
                          minWidth: 50,
                          textTransform: "none",
                        }}
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </Button>
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Submit Button */}
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
                fontSize: 16,
                fontWeight: 600,
                bgcolor: "primary.main",

                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Create Account"
              )}
            </Button>
          </Box>

          {/* Login Link */}
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?
            </Typography>

            <Button
              type="button"
              onClick={() => navigate("/login")}
              sx={{
                fontWeight: 700,
                textTransform: "none",
              }}
            >
              Sign in
            </Button>
            <Button
              type="button"
              onClick={() => navigate("/projects")}
              sx={{ display: "block", mx: "auto", textTransform: "none" }}
            >
              Browse open projects
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
