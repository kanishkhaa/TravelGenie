import {
  Box,
  Button,
  Container,
  Typography,
} from "@mui/material";

import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function ComingSoon({ feature, onBack }) {
  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 72px)",
        backgroundColor: "#fafafa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 8,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: "center",
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "24px",
            p: {
              xs: 4,
              md: 6,
            },
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "20px",
              backgroundColor: "#f0fdfa",
              color: "#0f766e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <ConstructionOutlinedIcon
              sx={{ fontSize: 34 }}
            />
          </Box>

          <Typography
            variant="overline"
            sx={{
              fontWeight: 700,
              letterSpacing: "1.5px",
              color: "#0f766e",
            }}
          >
            UNDER DEVELOPMENT
          </Typography>

          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              mt: 1,
              color: "#111827",
            }}
          >
            {feature}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 2,
              lineHeight: 1.8,
              maxWidth: 480,
              mx: "auto",
            }}
          >
            We're working on this feature to make your
            travel planning experience smarter, easier and
            more personalized.
          </Typography>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{
              mt: 4,
              textTransform: "none",
              borderRadius: "10px",
              px: 3,
              py: 1.2,
              fontWeight: 600,
            }}
          >
            Back to Explore
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default ComingSoon;