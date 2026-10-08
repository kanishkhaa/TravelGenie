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

    function Login({ onNavigate, onAuthenticated }) {
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [loginError, setLoginError] = useState("");

    // Handle input changes
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData({
        ...formData,
        [name]: value,
        });

        // Clear error when user starts typing again
        if (loginError) {
        setLoginError("");
        }
    };

    // Handle login
    const handleSubmit = async (event) => {
    event.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
        setLoginError("Please enter your email and password.");
        return;
    }

    setLoginError("");

    try {
        const response = await fetch(
            "http://127.0.0.1:8000/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            }
        );

        const data = await response.json();

        // Login failed
        if (!response.ok) {
            setLoginError(
                data.detail || "Invalid email or password."
            );
            return;
        }

        // Login successful
console.log("Login successful:", data);

// Store logged-in user's information
localStorage.setItem("user_id", data.user_id);
localStorage.setItem("user_name", data.name);
localStorage.setItem("user_email", data.email);
localStorage.setItem("access_token", data.access_token);
onAuthenticated?.();

// Navigate to Explore page
onNavigate("explore");

    } catch (error) {
        console.error("Login error:", error);

        setLoginError(
            "Unable to connect to the server. Please try again."
        );
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
                Welcome back
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
                Log in to continue your personalized
                travel experience.
                </Typography>
            </Box>

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit}>
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
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                error={Boolean(loginError)}
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
                            setShowPassword(!showPassword)
                            }
                            edge="end"
                            aria-label={
                            showPassword
                                ? "Hide password"
                                : "Show password"
                            }
                            sx={{
                            color: "#0f766e",
                            visibility: "visible",
                            display: "flex",
                            }}
                        >
                            {showPassword ? (
                            <VisibilityOffIcon fontSize="medium" />
                            ) : (
                            <VisibilityIcon fontSize="medium" />
                            )}
                        </IconButton>
                        </InputAdornment>
                    ),
                    },
                }}
                />

                {/* Login Error */}
                {loginError && (
                <Typography
                    sx={{
                    color: "#dc2626",
                    fontSize: "0.82rem",
                    mt: -1.8,
                    mb: 2,
                    }}
                >
                    {loginError}
                </Typography>
                )}

                {/* Forgot Password */}
                <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mt: -1,
                    mb: 2.5,
                }}
                >
                <Button
                    type="button"
                    onClick={() =>
                    onNavigate && onNavigate("forgot-password")
                    }
                    sx={{
                    p: 0,
                    minWidth: "auto",
                    textTransform: "none",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#0f766e",

                    "&:hover": {
                        backgroundColor: "transparent",
                        color: "#115e59",
                    },
                    }}
                >
                    Forgot Password?
                </Button>
                </Box>

                {/* Login Button */}
                <Button
                fullWidth
                type="submit"
                variant="contained"
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
                Log In
                </Button>
            </Box>

            {/* Register */}
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
                Don't have an account?{" "}
                </Typography>

                <Button
                type="button"
                onClick={() =>
                    onNavigate && onNavigate("register")
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
                Register
                </Button>
            </Box>
            </Box>
        </Container>
        </Box>
    );
    }

    export default Login;
