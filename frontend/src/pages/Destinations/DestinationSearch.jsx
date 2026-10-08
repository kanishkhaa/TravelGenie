import { useCallback, useEffect, useState } from "react";
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Container,
  FormControl, InputLabel, MenuItem, Paper, Select, Tab, Tabs, TextField, Typography,
} from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import DestinationFilters from "../../components/destinations/DestinationFilters";
import DestinationGrid from "../../components/destinations/DestinationGrid";
import { getDestinations, getPersonalizedRecommendations } from "../../services/destinationService";
import FavoriteButton from "../../components/common/FavoriteButton";
import DestinationCover from "../../components/destinations/DestinationCover";

const seasons = ["Auto", "Winter", "Summer", "Monsoon", "Post-Monsoon"];
function RecommendationCard({ item, index, onOpen }) {
  const destination = item.destination || {};
  const interestTags = destination.trip_types || [];
  return <Card data-destination-card elevation={0} onClick={() => onOpen(destination)} sx={{ height: "100%", cursor: "pointer", overflow: "hidden", borderRadius: 5, border: "1px solid #e4eae6", boxShadow: "0 10px 30px rgba(27,45,38,.04)", transition: "transform .2s, box-shadow .2s", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 18px 38px rgba(27,45,38,.1)" } }}>
    <DestinationCover destinationName={destination.destination_name} height={155}>
      <Box sx={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", border: "1px solid rgba(255,255,255,.55)", right: -35, bottom: -95, boxShadow: "0 0 0 28px rgba(255,255,255,.15),0 0 0 60px rgba(255,255,255,.11)" }} />
      <Chip label={`#${index + 1} MATCH`} size="small" sx={{ bgcolor: "rgba(255,255,255,.76)", color: "#28584f", fontWeight: 800, letterSpacing: ".06em" }} />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, position: "relative" }}><Box sx={{ borderRadius: 2, bgcolor: "rgba(255,255,255,.78)", px: 1.2, py: .7, textAlign: "center" }}><Typography variant="h6" fontWeight={850} lineHeight={1}>{item.score}%</Typography><Typography variant="caption" color="text.secondary">FIT</Typography></Box><FavoriteButton destination={destination} /></Box>
    </DestinationCover>
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: .4, color: "text.secondary", mb: .5 }}><LocationOnOutlinedIcon sx={{ fontSize: 17 }} /><Typography variant="body2">{destination.district || destination.region}, {destination.state}</Typography></Box>
      <Typography variant="h5" fontWeight={850} letterSpacing="-.04em">{destination.destination_name}</Typography>
      <Box sx={{ display: "flex", gap: .65, flexWrap: "wrap", mt: 1.5, mb: 1.75 }}>{interestTags.slice(0, 3).map((tag) => <Chip key={tag} size="small" label={tag} variant="outlined" sx={{ borderColor: "#e1e8e3", color: "#50645b" }} />)}</Box>
      <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3, bgcolor: "#f3f7f4", minHeight: 103 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: .7, color: "#16776d", mb: .5 }}><AutoAwesomeRoundedIcon sx={{ fontSize: 17 }} /><Typography variant="caption" fontWeight={850} letterSpacing=".06em">WHY IT FITS YOU</Typography></Box>
        <Typography variant="body2" sx={{ lineHeight: 1.55, color: "#455851" }}>{item.why}</Typography>
      </Paper>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "end", mt: 1.7 }}>
        <Box><Typography variant="caption" color="text.secondary">EST. PER PERSON</Typography><Typography fontWeight={800} color={item.budget_fit ? "#2e6f50" : "#a46b34"}>₹{Number(item.estimated_per_person).toLocaleString("en-IN")}</Typography></Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: .35, color: "primary.main", fontWeight: 700, fontSize: ".85rem" }}>Explore <ArrowForwardRoundedIcon sx={{ fontSize: 17 }} /></Box>
      </Box>
    </CardContent>
  </Card>;
}

function DestinationSearch({ onViewDetails, onNavigate }) {
  const [mode, setMode] = useState(localStorage.getItem("access_token") ? "for-you" : "explore");
  const [destinations, setDestinations] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [preferenceSummary, setPreferenceSummary] = useState(null);
  const [profileComplete, setProfileComplete] = useState(true);
  const [filters, setFilters] = useState({ season: "Auto", duration_days: "", budget: "", starting_location: "" });
  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [tripType, setTripType] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRecommendations = useCallback(async (nextFilters = filters) => {
    if (!localStorage.getItem("access_token")) { setError("Sign in to get destination recommendations based on your travel profile."); return; }
    setLoading(true); setError("");
    try {
      const payload = {};
      if (nextFilters.season && nextFilters.season !== "Auto") payload.season = nextFilters.season;
      if (nextFilters.duration_days) payload.duration_days = Number(nextFilters.duration_days);
      if (nextFilters.budget) payload.budget = Number(nextFilters.budget);
      if (nextFilters.starting_location) payload.starting_location = nextFilters.starting_location;
      const data = await getPersonalizedRecommendations(payload);
      setRecommendations(data.recommendations || []);
      setPreferenceSummary(data.preferences_used || null);
      setProfileComplete(Boolean(data.profile_complete));
    } catch (reason) { setError(reason.message || "Recommendations could not be loaded."); }
    finally { setLoading(false); }
  }, [filters]);

  const loadExplore = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await getDestinations({ search, state, tripType, budget });
      setDestinations(data.destinations || []);
    } catch { setError("Unable to load destinations. Please try again."); }
    finally { setLoading(false); }
  }, [search, state, tripType, budget]);

  useEffect(() => {
    if (mode === "for-you") loadRecommendations();
    else loadExplore();
  }, [mode]);

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  return <Box sx={{ minHeight: "calc(100vh - 72px)", bgcolor: "#f6f8f6", py: { xs: 3, md: 5 } }}>
    <Container maxWidth="xl">
      <Box sx={{ position: "relative", overflow: "hidden", borderRadius: { xs: 5, md: 7 }, p: { xs: 3, sm: 5, md: 6 }, mb: 3.5, color: "#fff", background: "radial-gradient(ellipse at 86% 10%,rgba(166,205,181,.27),transparent 36%),linear-gradient(120deg,#133e39,#1c6257)" }}>
        <Box sx={{ position: "absolute", right: { xs: -70, md: 70 }, bottom: -170, width: 360, height: 360, border: "1px solid rgba(255,255,255,.16)", borderRadius: "50%", boxShadow: "0 0 0 38px rgba(255,255,255,.04),0 0 0 78px rgba(255,255,255,.025)" }} />
        <Box sx={{ position: "relative", maxWidth: 700 }}><Chip icon={<TravelExploreRoundedIcon sx={{ color: "#f3c794 !important" }} />} label="A MORE PERSONAL WAY TO EXPLORE" sx={{ color: "#f4f8f5", bgcolor: "rgba(255,255,255,.1)", mb: 2.2, fontWeight: 700, letterSpacing: ".06em" }} /><Typography variant="h2" sx={{ fontWeight: 850, fontSize: { xs: "2.5rem", md: "3.6rem" }, letterSpacing: "-.06em", lineHeight: 1.06 }}>Find the places<br />that feel like yours.</Typography><Typography sx={{ mt: 2, color: "rgba(246,250,247,.76)", fontSize: "1.05rem", lineHeight: 1.75, maxWidth: 630 }}>Get thoughtful destination recommendations shaped around your budget, interests, the season, trip length, starting point, and places you’ve already explored.</Typography></Box>
      </Box>

      <Paper elevation={0} sx={{ border: "1px solid #e5eae6", borderRadius: 4, px: { xs: 1, sm: 2 }, mb: 2.5, boxShadow: "0 8px 26px rgba(25,45,35,.035)" }}>
        <Tabs value={mode} onChange={(_, value) => { setMode(value); setError(""); }} variant="scrollable" allowScrollButtonsMobile sx={{ minHeight: 58, "& .MuiTab-root": { textTransform: "none", fontWeight: 750, minHeight: 58 } }}>
          <Tab value="for-you" icon={<AutoAwesomeRoundedIcon />} iconPosition="start" label="Recommended for you" />
          <Tab value="explore" icon={<ExploreRoundedIcon />} iconPosition="start" label="Explore all destinations" />
        </Tabs>
      </Paper>

      {mode === "for-you" ? <Paper elevation={0} sx={{ border: "1px solid #e5eae6", borderRadius: 4, p: { xs: 2, md: 2.5 }, mb: 3 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "1.1fr .9fr 1fr 1.25fr auto" }, gap: 1.5, alignItems: "center" }}>
          <FormControl size="small"><InputLabel>Season</InputLabel><Select label="Season" value={filters.season} onChange={(e) => updateFilter("season", e.target.value)}>{seasons.map((item) => <MenuItem key={item} value={item}>{item === "Auto" ? `Auto${preferenceSummary?.season ? ` · ${preferenceSummary.season}` : ""}` : item}</MenuItem>)}</Select></FormControl>
          <TextField size="small" type="number" label="Trip length" value={filters.duration_days} placeholder={preferenceSummary?.duration_days || "Profile"} onChange={(e) => updateFilter("duration_days", e.target.value)} inputProps={{ min: 1, max: 30 }} />
          <TextField size="small" type="number" label="Budget / person ₹" value={filters.budget} placeholder={preferenceSummary?.budget_per_person || "Profile"} onChange={(e) => updateFilter("budget", e.target.value)} inputProps={{ min: 1000 }} />
          <TextField size="small" label="Starting city" value={filters.starting_location} placeholder={preferenceSummary?.starting_location || "Profile city"} onChange={(e) => updateFilter("starting_location", e.target.value)} />
          <Button variant="contained" onClick={() => loadRecommendations(filters)} disabled={loading} sx={{ minHeight: 40, textTransform: "none", fontWeight: 750, gridColumn: { xs: "1 / -1", md: "auto" } }}>Refresh matches</Button>
        </Box>
        {preferenceSummary && <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>Using {preferenceSummary.interests?.slice(0, 5).join(" · ") || "your profile"} · {preferenceSummary.duration_days} days · {preferenceSummary.season}{preferenceSummary.previous_trips_considered ? ` · ${preferenceSummary.previous_trips_considered} previous trip${preferenceSummary.previous_trips_considered > 1 ? "s" : ""} considered` : ""}</Typography>}
      </Paper> : <Paper elevation={0} sx={{ border: "1px solid #e5eae6", borderRadius: 4, p: { xs: 2, md: 2.5 }, mb: 3 }}>
        <TextField fullWidth label="Search destinations, states, or districts" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") loadExplore(); }} sx={{ mb: 2 }} />
        <DestinationFilters state={state} setState={setState} tripType={tripType} setTripType={setTripType} budget={budget} setBudget={setBudget} />
        <Button variant="contained" onClick={loadExplore} disabled={loading} sx={{ mt: 2, textTransform: "none" }}>Search destinations</Button>
      </Paper>}

      {mode === "for-you" && !profileComplete && !error && <Alert severity="info" action={<Button color="inherit" onClick={() => onNavigate?.("profileform")} sx={{ textTransform: "none" }}>Complete profile</Button>} sx={{ mb: 2.5, borderRadius: 3 }}>Add your preferred destinations, travel style, budget, and trip length to make these recommendations more personal.</Alert>}
      {error && <Alert severity={localStorage.getItem("access_token") ? "error" : "info"} action={!localStorage.getItem("access_token") ? <Button color="inherit" onClick={() => onNavigate?.("login")} sx={{ textTransform: "none" }}>Sign in</Button> : undefined} sx={{ mb: 2.5, borderRadius: 3 }}>{error}</Alert>}
      {loading ? <Box sx={{ display: "flex", justifyContent: "center", py: 9 }}><CircularProgress /></Box> : mode === "for-you" ? <>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "end", flexWrap: "wrap", gap: 1, mb: 2.5 }}><Box><Typography variant="h5" fontWeight={850} letterSpacing="-.035em">A few places to start dreaming</Typography><Typography color="text.secondary" sx={{ mt: .5 }}>Ranked by how well they fit your travel preferences.</Typography></Box><Typography variant="body2" color="text.secondary">{recommendations.length} personalized matches</Typography></Box>
        {recommendations.length ? <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" }, gap: 2 }}>{recommendations.map((item, index) => <RecommendationCard key={item.destination.id || item.destination.destination_name} item={item} index={index} onOpen={onViewDetails} />)}</Box> : !error && <Paper sx={{ p: 5, textAlign: "center", borderRadius: 4 }}><Typography fontWeight={750}>We couldn’t find a recommendation yet.</Typography><Typography color="text.secondary" sx={{ mt: .7 }}>Complete your travel preferences in your profile, then try again.</Typography><Button onClick={() => onNavigate?.("profileform")} sx={{ mt: 1.5, textTransform: "none" }}>Update travel profile</Button></Paper>}
      </> : <><Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "end", mb: 2.5 }}><Box><Typography variant="h5" fontWeight={850}>Explore India</Typography><Typography color="text.secondary" sx={{ mt: .5 }}>{destinations.length} places in your results</Typography></Box></Box><DestinationGrid destinations={destinations} onViewDetails={onViewDetails} /></>}
    </Container>
  </Box>;
}

export default DestinationSearch;
