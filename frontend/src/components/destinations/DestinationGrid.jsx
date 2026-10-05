import { Box, Typography } from "@mui/material";

import DestinationCard from "./DestinationCard";

function DestinationGrid({ destinations, onViewDetails }) {
  if (destinations.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 10,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          No destinations found
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          Try changing your search or filters.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
        },
        gap: 3,
      }}
    >
      {destinations.map((destination) => (
        <DestinationCard
          key={destination.id}
          destination={destination}
          onViewDetails={onViewDetails}
        />
      ))}
    </Box>
  );
}

export default DestinationGrid;