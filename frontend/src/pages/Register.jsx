import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { useState } from "react";

function Register({ onNavigate, onAuthenticated }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    const updatedFormData = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedFormData);
    setServerError("");

    // Check password match while typing
    if (name === "password" || name === "confirmPassword") {
      if (
        updatedFormData.confirmPassword &&
        updatedFormData.password !==
          updatedFormData.confirmPassword
      ) {
        setPasswordError(
          "Password does not match with current password."
        );
      } else {
        setPasswordError("");
      }
    }
  };

  // Handle form submission
 const handleSubmit = async (event) => {
  event.preventDefault();

  // Clear previous password error
  setPasswordError("");

  // Check password match
  if (formData.password !== formData.confirmPassword) {
    setPasswordError(
      "Password does not match with current password."
    );
    return;
  }

  if (formData.password.length < 8) {
    setPasswordError("Use at least 8 characters for your password.");
    return;
  }

  try {
    setSubmitting(true);
    const response = await fetch(
      "http://127.0.0.1:8000/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    const data = await response.json();

    // Backend error
    if (!response.ok) {
      setServerError(data.detail || "Registration failed. Please try again.");
      return;
    }

    // Registration successful
    console.log("Registration successful:", data);

    // ------------------------------------
    // Store newly registered user's ID
    // ------------------------------------
    localStorage.setItem("user_id", data.user_id);
    localStorage.setItem("access_token", data.access_token);

    // Optional: store basic user information
    localStorage.setItem("user_name", formData.name);
    localStorage.setItem("user_email", formData.email);
    onAuthenticated?.();

    // ------------------------------------
    // Go directly to Profile Form
    // ------------------------------------
    onNavigate("profileform");

  } catch (error) {
    console.error("Registration error:", error);

    setServerError("We couldn’t reach the server. Please try again in a moment.");
  } finally {
    setSubmitting(false);
  }
};

  // Common input styling
  const inputStyle = {
    mb: 2.5,

    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "#f9fafb",

      "& fieldset": {
        borderColor: "#e5e7eb",
      },

      "&:hover fieldset": {
        borderColor: "#0f766e",
      },

      "&.Mui-focused": {
        backgroundColor: "#ffffff",
      },

      "&.Mui-focused fieldset": {
        borderColor: "#0f766e",
        borderWidth: "2px",
      },
    },

    "& .MuiInputBase-input": {
      py: 1.6,
    },
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 72px)",
        background:
          "linear-gradient(135deg, #f0fdfa 0%, #fafafa 45%, #f8fafc 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: {
          xs: 4,
          sm: 6,
        },
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            px: {
              xs: 3,
              sm: 5,
            },
            py: {
              xs: 4,
              sm: 5,
            },
            boxShadow:
              "0 20px 60px rgba(15, 118, 110, 0.10)",
            border: "1px solid rgba(15, 118, 110, 0.08)",
          }}
        >
          {/* Heading */}
          <Box
            sx={{
              textAlign: "center",
              mb: 4,
            }}
          >
            {/* TravelGenie Logo */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.2,
                mb: 2,
              }}
            >
              {/* TG Logo */}
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: "13px",
                  backgroundColor: "#ccfbf1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: "#0f766e",
                  }}
                >
                  TG
                </Typography>
              </Box>

              {/* TravelGenie Text */}
              <Typography
                sx={{
                  fontWeight: 800,
                  letterSpacing: "1.5px",
                  color: "#0f766e",
                  fontSize: {
                    xs: "1rem",
                    sm: "1.1rem",
                  },
                }}
              >
                TRAVELGENIE
              </Typography>
            </Box>

            {/* Main Heading */}
            <Typography
              variant="h4"
              sx={{
                mt: 1,
                fontWeight: 800,
                color: "#111827",
                letterSpacing: "-0.5px",
                fontSize: {
                  xs: "1.8rem",
                  sm: "2.1rem",
                },
              }}
            >
              Create your account
            </Typography>

            {/* Description */}
            <Typography
              sx={{
                mt: 1,
                color: "#6b7280",
                fontSize: "0.95rem",
                lineHeight: 1.6,
                maxWidth: 420,
                mx: "auto",
              }}
            >
              Create your account and start discovering
              personalized travel experiences.
            </Typography>
          </Box>

          {/* Registration Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {serverError && <Typography role="alert" sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: "#fef2f2", color: "#b91c1c", fontSize: ".9rem" }}>{serverError}</Typography>}
            {/* Full Name */}
            <Typography
              sx={{
                mb: 0.8,
                fontWeight: 600,
                color: "#374151",
                fontSize: "0.9rem",
              }}
            >
              Full Name
            </Typography>

            <TextField
              fullWidth
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
              sx={inputStyle}
            />

            {/* Email */}
            <Typography
              sx={{
                mb: 0.8,
                fontWeight: 600,
                color: "#374151",
                fontSize: "0.9rem",
              }}
            >
              Email Address
            </Typography>

            <TextField
              fullWidth
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              required
              sx={inputStyle}
            />

            {/* Password */}
            <Typography
              sx={{
                mb: 0.8,
                fontWeight: 600,
                color: "#374151",
                fontSize: "0.9rem",
              }}
            >
              Password
            </Typography>

            <TextField
  fullWidth
  type={showPassword ? "text" : "password"}
  name="password"
  placeholder="Create a password"
  value={formData.password}
  onChange={handleChange}
  required
  sx={inputStyle}
  slotProps={{
    input: {
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            edge="end"
            sx={{
              color: "#0f766e",
              display: "flex",
            }}
          >
            {showPassword ? (
              <VisibilityOffIcon />
            ) : (
              <VisibilityIcon />
            )}
          </IconButton>
        </InputAdornment>
      ),
    },
  }}
/>
<Typography
              sx={{
                mb: 0.8,
                fontWeight: 600,
                color: "#374151",
                fontSize: "0.9rem",
              }}
            >
              Confirm Password
            </Typography>
            <TextField
  fullWidth
  type={showConfirmPassword ? "text" : "password"}
  name="confirmPassword"
  placeholder="Re-enter your password"
  value={formData.confirmPassword}
  onChange={handleChange}
  required
  error={Boolean(passwordError)}
  helperText={passwordError}
  sx={{
    ...inputStyle,
    "& .MuiFormHelperText-root": {
      marginLeft: 0,
      marginTop: 0.8,
      fontSize: "0.8rem",
    },
  }}
  slotProps={{
    input: {
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            type="button"
            onClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            edge="end"
            sx={{
              color: "#0f766e",
              display: "flex",
            }}
          >
            {showConfirmPassword ? (
              <VisibilityOffIcon />
            ) : (
              <VisibilityIcon />
            )}
          </IconButton>
        </InputAdornment>
      ),
    },
  }}
/>

            {/* Create Account Button */}
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                py: 1.55,
                borderRadius: "12px",
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 700,
                backgroundColor: "#0f766e",
                boxShadow:
                  "0 8px 20px rgba(15, 118, 110, 0.20)",

                "&:hover": {
                  backgroundColor: "#115e59",
                  boxShadow:
                    "0 10px 24px rgba(15, 118, 110, 0.25)",
                },
              }}
            >
              {submitting ? "Creating your account…" : "Create Account"}
            </Button>
          </Box>

          {/* Login */}
          <Box
            sx={{
              mt: 3.5,
              pt: 2.5,
              borderTop: "1px solid #f0f0f0",
              textAlign: "center",
            }}
          >
            <Typography
              component="span"
              sx={{
                color: "#6b7280",
                fontSize: "0.9rem",
              }}
            >
              Already have an account?{" "}
            </Typography>

            <Button
              type="button"
              onClick={() =>
                onNavigate && onNavigate("login")
              }
              sx={{
                p: 0,
                minWidth: "auto",
                textTransform: "none",
                fontWeight: 700,
                color: "#0f766e",
                fontSize: "0.9rem",

                "&:hover": {
                  backgroundColor: "transparent",
                  color: "#115e59",
                },
              }}
            >
              Log in
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Register;
