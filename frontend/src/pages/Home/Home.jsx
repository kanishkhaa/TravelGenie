import {
  Box,
  Button,
  Container,
  Typography,
} from "@mui/material";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

function Home({ onNavigate }) {
  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 72px)",
        backgroundColor: "#fafafa",
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            minHeight: "calc(100vh - 72px)",
            display: "flex",
            alignItems: "center",
            py: 8,
          }}
        >
          <Box
            sx={{
              maxWidth: 780,
            }}
          >
            <Typography
              variant="overline"
              sx={{
                fontWeight: 700,
                letterSpacing: "2px",
                color: "#0f766e",
              }}
            >
              TRAVELGENIE
            </Typography>

            <Typography
              variant="h1"
              sx={{
                mt: 2,
                fontWeight: 800,
                letterSpacing: "-2px",
                color: "#111827",
                fontSize: {
                  xs: "2.8rem",
                  md: "4.5rem",
                },
                lineHeight: 1.05,
              }}
            >
              Discover places
              <br />
              worth travelling to.
            </Typography>

            <Typography
              sx={{
                mt: 3,
                maxWidth: 650,
                fontSize: "1.15rem",
                lineHeight: 1.8,
                color: "#6b7280",
              }}
            >
              Explore destinations across India and
              discover travel experiences based on your
              interests, travel style and budget.
            </Typography>

            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => onNavigate("explore")}
              sx={{
                mt: 4,
                px: 3,
                py: 1.5,
                borderRadius: "11px",
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 700,
                backgroundColor: "#0f766e",

                "&:hover": {
                  backgroundColor: "#115e59",
                },
              }}
            >
              Explore destinations
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Home;