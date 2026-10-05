import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";

import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";

function Navbar({ currentPage, onNavigate }) {
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
      label: "Recommendations",
      page: "recommendations",
    },
    {
      label: "Travel Assistant",
      page: "assistant",
    },
    {
      label: "My Trips",
      page: "trips",
    },
    {
      label: "Favorites",
      page: "favorites",
    },
    {
      label: "Dashboard",
      page: "dashboard",
    },
    {
      label: "Smart Planner",
      page: "planner",
    },
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "#ffffff",
        color: "#111827",
        borderBottom: "1px solid #e5e7eb",
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

          {/* Profile / Login placeholder */}
          <Button
            variant="outlined"
            onClick={() => onNavigate("profile")}
            sx={{
              display: {
                xs: "none",
                sm: "flex",
              },
              textTransform: "none",
              borderColor: "#d1d5db",
              color: "#374151",
              borderRadius: "9px",
              px: 2,
              fontWeight: 600,

              "&:hover": {
                borderColor: "#0f766e",
                color: "#0f766e",
              },
            }}
          >
            Profile
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;