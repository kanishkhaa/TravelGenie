import {
  Autocomplete,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const DEFAULT_INTERESTS = [
  "Beach",
  "Cultural",
  "Heritage",
  "Food",
  "Adventure",
  "Nature",
  "Wildlife",
  "Wellness",
  "Spiritual",
  "Photography",
  "Trekking",
  "Nightlife",
];

function PlannerForm({
  form,
  setForm,
  options,
  loading,
  onSubmit,
  history,
}) {
  const destinationChoices = [
    "Anywhere in India",
    ...(options.regions || []),
    ...(options.states || []),
    ...(options.destinations || []),
  ];

  const interestChoices =
    options.interests?.length > 0 ? options.interests : DEFAULT_INTERESTS;

  const update = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        backgroundColor: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "20px",
        p: { xs: 3, md: 4 },
      }}
    >
      <Typography variant="h6" fontWeight={800}>
        Tell us about your trip
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
        The planner uses destination data, weather, safety, distance and your
        past trips to build a full itinerary.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2.2,
        }}
      >
        <Autocomplete
          freeSolo
          options={options.starting_cities || []}
          value={form.starting_location}
          onInputChange={(_, value) => update("starting_location", value)}
          renderInput={(params) => (
            <TextField {...params} label="Starting location" required />
          )}
        />

        <Autocomplete
          freeSolo
          options={destinationChoices}
          value={form.destination}
          onInputChange={(_, value) => update("destination", value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Destination / region"
              helperText='Use a place, a region, or “Anywhere in India”'
            />
          )}
        />

        <TextField
          type="date"
          label="Start date"
          InputLabelProps={{ shrink: true }}
          value={form.start_date}
          onChange={(e) => update("start_date", e.target.value)}
        />

        <TextField
          type="date"
          label="End date"
          InputLabelProps={{ shrink: true }}
          value={form.end_date}
          onChange={(e) => update("end_date", e.target.value)}
        />

        <TextField
          type="number"
          label="Duration (days) — if no dates"
          value={form.duration_days}
          onChange={(e) => update("duration_days", e.target.value)}
          inputProps={{ min: 1, max: 30 }}
        />

        <TextField
          type="number"
          label="Maximum budget (₹)"
          required
          value={form.max_budget}
          onChange={(e) => update("max_budget", e.target.value)}
          inputProps={{ min: 1000 }}
        />

        <TextField
          type="number"
          label="Number of travelers"
          required
          value={form.travelers}
          onChange={(e) => update("travelers", e.target.value)}
          inputProps={{ min: 1, max: 12 }}
        />

        <FormControl fullWidth>
          <InputLabel>Preferred travel mode</InputLabel>
          <Select
            value={form.travel_mode}
            label="Preferred travel mode"
            onChange={(e) => update("travel_mode", e.target.value)}
          >
            <MenuItem value="Mixed">Mixed (recommended)</MenuItem>
            <MenuItem value="Train">Train</MenuItem>
            <MenuItem value="Flight">Flight</MenuItem>
            <MenuItem value="Bus">Bus</MenuItem>
            <MenuItem value="Self-drive">Self-drive</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Travel pace</InputLabel>
          <Select
            value={form.pace}
            label="Travel pace"
            onChange={(e) => update("pace", e.target.value)}
          >
            <MenuItem value="Relaxed">Relaxed</MenuItem>
            <MenuItem value="Balanced">Balanced</MenuItem>
            <MenuItem value="Packed">Packed</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Stay style</InputLabel>
          <Select
            value={form.stay_style}
            label="Stay style"
            onChange={(e) => update("stay_style", e.target.value)}
          >
            <MenuItem value="Budget">Budget</MenuItem>
            <MenuItem value="Mid-range">Mid-range</MenuItem>
            <MenuItem value="Luxury">Luxury</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Group type</InputLabel>
          <Select
            value={form.group_type}
            label="Group type"
            onChange={(e) => update("group_type", e.target.value)}
          >
            <MenuItem value="Solo">Solo</MenuItem>
            <MenuItem value="Couple">Couple</MenuItem>
            <MenuItem value="Family">Family</MenuItem>
            <MenuItem value="Friends">Friends</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Crowd preference</InputLabel>
          <Select
            value={form.crowd_preference}
            label="Crowd preference"
            onChange={(e) => update("crowd_preference", e.target.value)}
          >
            <MenuItem value="Popular">Popular places</MenuItem>
            <MenuItem value="Mix">Mix</MenuItem>
            <MenuItem value="Offbeat">Offbeat / quieter</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography fontWeight={700} sx={{ mb: 1 }}>
          Interests
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {interestChoices.slice(0, 18).map((interest) => {
            const selected = form.interests.includes(interest);
            return (
              <Chip
                key={interest}
                label={interest}
                clickable
                color={selected ? "primary" : "default"}
                variant={selected ? "filled" : "outlined"}
                onClick={() => {
                  update(
                    "interests",
                    selected
                      ? form.interests.filter((item) => item !== interest)
                      : [...form.interests, interest]
                  );
                }}
                sx={
                  selected
                    ? { backgroundColor: "#0f766e" }
                    : undefined
                }
              />
            );
          })}
        </Box>
      </Box>

      {history.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography fontWeight={700} sx={{ mb: 1 }}>
            Previous trips used for personalization
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {history.slice(0, 6).map((trip, index) => (
              <Chip
                key={index}
                variant="outlined"
                label={(trip.destination_names || []).join(", ") || trip.destination}
              />
            ))}
          </Box>
        </Box>
      )}

      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        startIcon={<AutoAwesomeIcon />}
        sx={{
          mt: 4,
          px: 3,
          py: 1.4,
          borderRadius: "11px",
          textTransform: "none",
          fontWeight: 700,
          backgroundColor: "#0f766e",
          "&:hover": { backgroundColor: "#115e59" },
        }}
      >
        {loading ? "Building your plan…" : "Generate personalized plan"}
      </Button>
    </Box>
  );
}

export default PlannerForm;
