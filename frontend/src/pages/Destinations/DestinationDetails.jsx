import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

function formatValue(value) {
  if (value === null || value === undefined) {
    return "Not available";
  }

  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, val]) => `${key}: ${formatValue(val)}`)
      .join(" • ");
  }

  return String(value);
}

function DestinationDetails({ destination, onBack }) {
  if (!destination) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#fafafa",
        py: 5,
      }}
    >
      <Container maxWidth="lg">

        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{
            textTransform: "none",
            color: "text.secondary",
            mb: 4,
          }}
        >
          Back to destinations
        </Button>

        {/* Main Card */}
        <Box
          sx={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "20px",
            p: { xs: 3, md: 5 },
          }}
        >

          {/* Header */}
          <Typography
            variant="overline"
            color="text.secondary"
            fontWeight={700}
          >
            DESTINATION
          </Typography>

          <Typography
            variant="h3"
            fontWeight={800}
            sx={{
              mt: 1,
              fontSize: { xs: "2rem", md: "3rem" },
            }}
          >
            {formatValue(destination.destination_name)}
          </Typography>

          {/* Location */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              mt: 1.5,
            }}
          >
            <LocationOnOutlinedIcon sx={{ fontSize: 20 }} />

            <Typography color="text.secondary">
              {formatValue(destination.district)},{" "}
              {formatValue(destination.state)}
            </Typography>
          </Box>

          {/* Trip Types */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              mt: 3,
            }}
          >
            {Array.isArray(destination.trip_types) &&
              destination.trip_types.map((type, index) => (
                <Chip
                  key={index}
                  label={formatValue(type)}
                  variant="outlined"
                />
              ))}
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Why Visit */}
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ mb: 1 }}
          >
            Why visit?
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              lineHeight: 1.8,
              maxWidth: 850,
            }}
          >
            {formatValue(destination.ideal_for_why)}
          </Typography>

          {/* Top Attractions */}
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              mt: 5,
              mb: 2,
            }}
          >
            Top attractions
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, 1fr)",
              },
              gap: 1.5,
            }}
          >
            {Array.isArray(destination.primary_attractions) &&
              destination.primary_attractions.map(
                (attraction, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      backgroundColor: "#f9fafb",
                      borderRadius: "10px",
                    }}
                  >
                    <Typography variant="body2">
                      {formatValue(attraction)}
                    </Typography>
                  </Box>
                )
              )}
          </Box>

          {/* Activities */}
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              mt: 5,
              mb: 2,
            }}
          >
            Experiences & activities
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {Array.isArray(destination.activities_available) &&
              destination.activities_available.map(
                (activity, index) => (
                  <Chip
                    key={index}
                    label={formatValue(activity)}
                  />
                )
              )}
          </Box>

          {/* Travel Information */}
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              mt: 5,
              mb: 2,
            }}
          >
            Travel information
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 2,
            }}
          >
            <InfoItem
              label="Ideal duration"
              value={`${formatValue(destination.ideal_days)} days`}
            />

            <InfoItem
              label="Budget"
              value={destination.budget_category}
            />

            <InfoItem
              label="Safety rating"
              value={destination.safety_rating}
            />

            <InfoItem
              label="Best season"
              value={destination.best_seasons}
            />

            <InfoItem
              label="Nearest airport"
              value={destination.nearest_airport}
            />

            <InfoItem
              label="Nearest railway"
              value={destination.nearest_railway_station}
            />
          </Box>

        </Box>
      </Container>
    </Box>
  );
}


function InfoItem({ label, value }) {
  return (
    <Box
      sx={{
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        p: 2,
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={600}
        sx={{ mt: 0.5 }}
      >
        {formatValue(value)}
      </Typography>
    </Box>
  );
}


export default DestinationDetails;