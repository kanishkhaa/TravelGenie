import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

function DestinationFilters({
  state,
  setState,
  tripType,
  setTripType,
  budget,
  setBudget,
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(3, 1fr)",
        },
        gap: 2,
        width: "100%",
      }}
    >
      {/* State */}
      <FormControl fullWidth>
        <InputLabel>State</InputLabel>

        <Select
          value={state}
          label="State"
          onChange={(e) => setState(e.target.value)}
        >
          <MenuItem value="">All States</MenuItem>
          <MenuItem value="Goa">Goa</MenuItem>
          <MenuItem value="Kerala">Kerala</MenuItem>
          <MenuItem value="TamilNadu">Tamil Nadu</MenuItem>
          <MenuItem value="Rajasthan">Rajasthan</MenuItem>
          <MenuItem value="HimachalPradesh">
            HimachalPradesh
          </MenuItem>
        </Select>
      </FormControl>

      {/* Trip Type */}
      <FormControl fullWidth>
        <InputLabel>Travel Style</InputLabel>

        <Select
          value={tripType}
          label="Travel Style"
          onChange={(e) => setTripType(e.target.value)}
        >
          <MenuItem value="">All Experiences</MenuItem>
          <MenuItem value="Beach">Beach</MenuItem>
          <MenuItem value="Cultural">Cultural</MenuItem>
          <MenuItem value="Nature">Nature</MenuItem>
          <MenuItem value="Adventure">Adventure</MenuItem>
          <MenuItem value="Food">Food</MenuItem>
          <MenuItem value="Photography">Photography</MenuItem>
          <MenuItem value="Wellness">Wellness</MenuItem>
        </Select>
      </FormControl>

      {/* Budget */}
      <FormControl fullWidth>
        <InputLabel>Budget</InputLabel>

        <Select
          value={budget}
          label="Budget"
          onChange={(e) => setBudget(e.target.value)}
        >
          <MenuItem value="">Any Budget</MenuItem>
          <MenuItem value="Budget">Budget</MenuItem>
          <MenuItem value="Moderate">Moderate</MenuItem>
          <MenuItem value="Luxury">Luxury</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}

export default DestinationFilters;