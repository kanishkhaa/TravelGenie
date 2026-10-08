import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";

import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useState } from "react";

function Navbar({ currentPage, onNavigate, isLoggedIn, onLogout }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const navItems = [
    {
      label: "Home",
      page: "home",
    },
    {
      label: "Explore",
      page: "explore",
    },
    {
      label: "My Trips",
      page: "trips",
    },
    {
      label: "Dashboard",
      page: "dashboard",
    },
    {
      label: "Smart Planner",
      page: "planner",
    },
    { label: "Saved places", page: "favorites" },
    { label: "Safety map", page: "safety" },
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        color: "#111827",
        borderBottom: "1px solid rgba(226,232,229,.9)",
        backdropFilter: "blur(18px)",
        backgroundColor: "rgba(255,255,255,.94)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            minHeight: "72px",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Box
            onClick={() => onNavigate("home")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "11px",
                backgroundColor: "#0f766e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <ExploreOutlinedIcon />
            </Box>

            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "1.2rem",
                letterSpacing: "-0.3px",
              }}
            >
              TravelGenie
            </Typography>
          </Box>

          {/* Navigation */}
          <Box
            sx={{
              display: {
                xs: "none",
                lg: "flex",
              },
              alignItems: "center",
              gap: 0.5,
              ml: 4,
            }}
          >
            {navItems.map((item) => (
              <Button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                sx={{
                  textTransform: "none",
                  fontSize: "0.9rem",
                  fontWeight:
                    currentPage === item.page ? 700 : 500,
                  color:
                    currentPage === item.page
                      ? "#0f766e"
                      : "#4b5563",
                  px: 1.5,
                  py: 1,
                  borderRadius: "9px",

                  "&:hover": {
                    backgroundColor: "#f0fdfa",
                    color: "#0f766e",
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
          <IconButton aria-label="Open navigation" onClick={(event) => setMenuAnchor(event.currentTarget)} sx={{ display: { xs: "inline-flex", lg: "none" }, ml: "auto", mr: 1, color: "#34544d" }}>
            {menuAnchor ? <CloseRoundedIcon /> : <MenuRoundedIcon />}
          </IconButton>
          {isLoggedIn ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 } }}>
              <Button variant="outlined" onClick={() => onNavigate("profile")} sx={{ textTransform: "none", borderColor: "#d1d5db", color: "#374151", borderRadius: "9px", px: 2, fontWeight: 600, "&:hover": { borderColor: "#0f766e", color: "#0f766e" } }}>My profile</Button>
              <Button onClick={onLogout} sx={{ textTransform: "none", fontWeight: 600, color: "#64748b" }}>Sign out</Button>
            </Box>
          ) : (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
    <Button
      onClick={() => onNavigate("register")}
      sx={{
        textTransform: "none",
        fontWeight: 600,
        color: "#0f766e",
      }}
    >
      Register
    </Button>

    <Button
      onClick={() => onNavigate("login")}
      sx={{
        textTransform: "none",
        fontWeight: 600,
        color: "#0f766e",
      }}
    >
      Login
    </Button>
  </Box>
)}
 
        </Toolbar>
      </Container>
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)} sx={{ display: { lg: "none" } }} PaperProps={{ sx: { mt: 1, minWidth: 220, borderRadius: 3, border: "1px solid #e6eae7", boxShadow: "0 16px 45px rgba(20,35,55,.12)" } }}>
        {navItems.map((item) => <MenuItem key={item.page} selected={currentPage === item.page} onClick={() => { onNavigate(item.page); setMenuAnchor(null); }} sx={{ py: 1.25, fontWeight: currentPage === item.page ? 800 : 600 }}>{item.label}</MenuItem>)}
      </Menu>
    </AppBar>
  );
}

export default Navbar;
