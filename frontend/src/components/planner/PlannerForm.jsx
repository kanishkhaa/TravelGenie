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
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";

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
  favoriteDestinations = [],
}) {
  const destinationChoices = [
    "Anywhere in India",
    ...(options.regions || []),
    ...(options.states || []),
    ...(options.destinations || []),
  ];

  const interestChoices =
    [...new Set([...(options.interests?.length > 0 ? options.interests : DEFAULT_INTERESTS), ...form.interests])];

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
        border: "1px solid #e2eae4",
        borderRadius: { xs: 4, md: 6 },
        p: { xs: 2, sm: 3, md: 4 },
        boxShadow: "0 18px 48px rgba(25,45,35,.055)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3.5 }}>
        <Box sx={{ width: 46, height: 46, borderRadius: 3, display: "grid", placeItems: "center", color: "#16776d", bgcolor: "#e8f2ec" }}><ExploreRoundedIcon /></Box>
        <Box><Typography variant="h5" fontWeight={850} letterSpacing="-.035em">Shape your journey</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .25 }}>A few thoughtful details help us build a more practical plan.</Typography></Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.7 }}><Box sx={{ width: 25, height: 25, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: "#176e61", color: "white", fontSize: 12, fontWeight: 800 }}>1</Box><Typography fontWeight={800}>Where and when</Typography><Box sx={{ height: 1, flex: 1, bgcolor: "#e5ece7", ml: 1 }} /></Box>
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
          onChange={(_, value) => update("starting_location", value || "")}
          renderInput={(params) => (
            <TextField {...params} label="Starting location" required />
          )}
        />

        <Autocomplete
          freeSolo
          options={destinationChoices}
          value={form.destination}
          onInputChange={(_, value) => update("destination", value)}
          onChange={(_, value) => update("destination", value || "")}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Destination / region"
              helperText='Use a place, a region, or “Anywhere in India”'
            />
          )}
        />

        <Box sx={{ gridColumn: "1 / -1", p: { xs: 1.5, sm: 2 }, borderRadius: 3.5, border: "1px solid #e2ebe5", background: "linear-gradient(135deg,#f8fbf8,#f2f7f3)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Box sx={{ width: 34, height: 34, borderRadius: 2.2, display: "grid", placeItems: "center", bgcolor: "#e5f1e9", color: "#176e61" }}><CalendarMonthRoundedIcon fontSize="small" /></Box>
            <Box><Typography fontWeight={800}>Travel dates</Typography><Typography variant="caption" color="text.secondary">Choose a date range, or enter a duration below.</Typography></Box>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
            <TextField
              type="text"
              label="Start date"
              InputLabelProps={{ shrink: true }}
              placeholder="DD/MM/YYYY"
              helperText="DD/MM/YYYY"
              inputProps={{ inputMode: "numeric", maxLength: 10 }}
              value={form.start_date}
              onChange={(e) => update("start_date", e.target.value)}
              sx={{ bgcolor: "white", borderRadius: 2 }}
            />
            <TextField
              type="text"
              label="End date"
              InputLabelProps={{ shrink: true }}
              placeholder="DD/MM/YYYY"
              helperText="DD/MM/YYYY"
              inputProps={{ inputMode: "numeric", maxLength: 10 }}
              value={form.end_date}
              onChange={(e) => update("end_date", e.target.value)}
              sx={{ bgcolor: "white", borderRadius: 2 }}
            />
          </Box>
        </Box>

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

        <Box sx={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 1, mt: 1 }}><Box sx={{ width: 25, height: 25, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: "#176e61", color: "white", fontSize: 12, fontWeight: 800 }}>2</Box><Typography fontWeight={800}>How you like to travel</Typography><Box sx={{ height: 1, flex: 1, bgcolor: "#e5ece7", ml: 1 }} /></Box>

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

      <Box sx={{ mt: 3, p: { xs: 1.5, sm: 2.2 }, bgcolor: "#f6f9f7", border: "1px solid #e7eee9", borderRadius: 3.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: .8, mb: 1 }}><TuneRoundedIcon sx={{ color: "#16776d", fontSize: 19 }} /><Typography fontWeight={750}>Choose your interests</Typography></Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Select as many as you like. We’ll use these to rank the places and experiences.</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {interestChoices.map((interest) => {
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
                    ? { backgroundColor: "#16776d", fontWeight: 750 }
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

      {favoriteDestinations.length > 0 && (
        <Box sx={{ mt: 3, p: { xs: 1.5, sm: 2 }, bgcolor: "#f7f9f7", borderRadius: 3 }}>
          <Typography fontWeight={700} sx={{ mb: .5 }}>Start with your saved places</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.2 }}>Selected wishlist destinations get priority in your route recommendations.</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {favoriteDestinations.map((destination) => {
              const name = destination.destination_name;
              const selected = (form.preferred_destinations || []).includes(name);
              return <Chip key={destination.id} label={name} clickable color={selected ? "primary" : "default"} variant={selected ? "filled" : "outlined"} onClick={() => update("preferred_destinations", selected ? form.preferred_destinations.filter((item) => item !== name) : [...form.preferred_destinations, name])} sx={selected ? { bgcolor: "#16776d", fontWeight: 750 } : undefined} />;
            })}
          </Box>
        </Box>
      )}

      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        startIcon={<AutoAwesomeIcon />}
        sx={{
          mt: 3,
          px: 3.5,
          py: 1.5,
          borderRadius: "13px",
          textTransform: "none",
          fontWeight: 700,
          background: "linear-gradient(120deg,#176e61,#12554c)",
          boxShadow: "0 8px 18px rgba(23,110,97,.2)",
          "&:hover": { background: "linear-gradient(120deg,#155f54,#10483f)" },
        }}
      >
        {loading ? "Building your plan…" : "Generate personalized plan"}
      </Button>
    </Box>
  );
}

export default PlannerForm;
