import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

function DestinationCard({ destination, onViewDetails }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid #e5e7eb",
        borderRadius: "18px",
        overflow: "hidden",
        transition: "all 0.25s ease",
        cursor: "pointer",

        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
          borderColor: "#d1d5db",
        },
      }}
      onClick={() => onViewDetails(destination)}
    >
      {/* Image Placeholder */}
      <Box
        sx={{
          height: 190,
          background:
            "linear-gradient(135deg, #e8eef5 0%, #f5f7fa 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={500}
        >
          Destination Image
        </Typography>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {/* Location */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            mb: 1,
          }}
        >
          <LocationOnOutlinedIcon
            sx={{ fontSize: 18, color: "text.secondary" }}
          />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {destination.district}, {destination.state}
          </Typography>
        </Box>

        {/* Name */}
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{
            mb: 1.5,
            color: "#111827",
          }}
        >
          {destination.destination_name}
        </Typography>

        {/* Trip Types */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.7,
            mb: 2,
          }}
        >
          {destination.trip_types
            ?.slice(0, 3)
            .map((type) => (
              <Chip
                key={type}
                label={type}
                size="small"
                variant="outlined"
                sx={{
                  borderRadius: "7px",
                  fontSize: "12px",
                }}
              />
            ))}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Information */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Ideal duration
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mt: 0.3,
              }}
            >
              <AccessTimeOutlinedIcon sx={{ fontSize: 16 }} />

              <Typography variant="body2" fontWeight={600}>
                {destination.ideal_days} days
              </Typography>
            </Box>
          </Box>

          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(destination);
            }}
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
            }}
          >
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}

export default DestinationCard;