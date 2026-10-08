import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Chip, CircularProgress, Container, Paper, Typography } from "@mui/material";
import AddLocationAltOutlinedIcon from "@mui/icons-material/AddLocationAltOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import LuggageOutlinedIcon from "@mui/icons-material/LuggageOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import RouteRoundedIcon from "@mui/icons-material/RouteRounded";
import { getSavedPlans } from "../services/plannerService";
import WeatherAlertPanel from "../components/trips/WeatherAlertPanel";

const surfaceSx = { border: "1px solid #e5ebe7", borderRadius: 4, bgcolor: "#fff", boxShadow: "0 10px 30px rgba(30,55,43,.045)" };
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const formatDate = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Dates are flexible";

export default function Dashboard({ onNavigate }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("access_token")));
  const [error, setError] = useState("");
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  });
  const name = (localStorage.getItem("user_name") || "traveller").trim().split(/\s+/)[0];

  useEffect(() => {
    if (!localStorage.getItem("access_token")) return;
    let active = true;
    getSavedPlans().then((saved) => { if (active) setTrips(saved); })
      .catch((reason) => { if (active) setError(reason.message || "Your travel overview could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const planned = useMemo(() => trips.filter((trip) => trip.status !== "completed").sort((a, b) => {
    const first = a.form?.start_date || "9999-99-99";
    const second = b.form?.start_date || "9999-99-99";
    return first.localeCompare(second);
  }), [trips]);
  const completed = trips.filter((trip) => trip.status === "completed");
  const nextTrip = planned[0];
  const destinationCount = new Set(trips.flatMap((trip) => (trip.result?.plan?.recommended_destinations || []).map((item) => item.name).filter(Boolean))).size;
  const nextDestinations = (nextTrip?.result?.plan?.recommended_destinations || []).map((item) => item.name);
  return <Box sx={{ minHeight: "calc(100vh - 72px)", py: { xs: 2.5, md: 4 }, bgcolor: "#f5f8f6", background: "linear-gradient(180deg,#edf4f0 0,#f6f8f6 420px,#f5f8f6 100%)" }}>
    <Container maxWidth="xl">
      <Box sx={{ position: "relative", overflow: "hidden", mb: 3, p: { xs: 2.8, sm: 4, md: 5 }, borderRadius: { xs: 4, md: 6 }, color: "white", background: "radial-gradient(ellipse at 82% 5%,rgba(199,226,205,.22),transparent 34%),linear-gradient(116deg,#123e38,#1e6b5d)" }}>
        <Box sx={{ position: "absolute", width: 300, height: 300, right: -70, bottom: -210, border: "1px solid rgba(255,255,255,.16)", borderRadius: "50%", boxShadow: "0 0 0 34px rgba(255,255,255,.035),0 0 0 70px rgba(255,255,255,.025)" }} />
        <Box sx={{ position: "relative", display: "flex", alignItems: { sm: "flex-end" }, justifyContent: "space-between", gap: 2.5, flexWrap: "wrap" }}>
          <Box><Chip icon={<ExploreRoundedIcon sx={{ color: "#f2c894 !important" }} />} label="YOUR TRAVEL OVERVIEW" sx={{ mb: 1.7, color: "white", bgcolor: "rgba(255,255,255,.12)", fontWeight: 750, letterSpacing: ".06em" }} /><Typography variant="h2" sx={{ fontSize: { xs: "2.35rem", md: "3.5rem" }, lineHeight: 1.05, fontWeight: 850, letterSpacing: "-.06em" }}>{greeting}, {name}.</Typography><Typography sx={{ mt: 1.2, maxWidth: 620, color: "rgba(255,255,255,.78)", lineHeight: 1.7 }}>Your next journey, saved places, and travel milestones at a glance.</Typography></Box>
          <Button variant="contained" onClick={() => onNavigate("planner")} startIcon={<AddLocationAltOutlinedIcon />} sx={{ position: "relative", py: 1.25, px: 2.3, borderRadius: 2.5, bgcolor: "#f2c894", color: "#204a40", fontWeight: 800, textTransform: "none", "&:hover": { bgcolor: "#f6d7b2" } }}>Plan a new trip</Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      {!localStorage.getItem("access_token") ? <Paper sx={{ ...surfaceSx, p: { xs: 3, md: 5 }, textAlign: "center" }}><LuggageOutlinedIcon sx={{ color: "#176e61", fontSize: 38 }} /><Typography variant="h5" fontWeight={850} sx={{ mt: 1 }}>Make this space yours</Typography><Typography color="text.secondary" sx={{ mt: .6, mb: 2 }}>Sign in to see your upcoming trips, saved places, and travel history.</Typography><Button variant="contained" onClick={() => onNavigate("login")} sx={{ textTransform: "none", borderRadius: 2 }}>Sign in</Button></Paper> : loading ? <Box sx={{ display: "grid", placeItems: "center", minHeight: 300 }}><CircularProgress /></Box> : <>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4,1fr)" }, gap: 1.4, mb: 2.5 }}>
          {[["Upcoming trips", planned.length, <CalendarMonthRoundedIcon key="upcoming" />, "#e8f2ec"], ["Places on your routes", destinationCount, <PlaceOutlinedIcon key="places" />, "#edf2f8"], ["Journeys completed", completed.length, <CheckCircleOutlineRoundedIcon key="completed" />, "#f1eee7"], ["All saved plans", trips.length, <RouteRoundedIcon key="plans" />, "#f4edf4"]].map(([label, value, icon, tint]) => <Paper key={label} sx={{ ...surfaceSx, p: { xs: 1.5, sm: 2 }, display: "flex", alignItems: "center", gap: 1.4 }}><Box sx={{ width: 42, height: 42, display: { xs: "none", sm: "grid" }, placeItems: "center", borderRadius: 2.5, bgcolor: tint, color: "#286757" }}>{icon}</Box><Box><Typography variant="h4" fontWeight={850} letterSpacing="-.04em">{value}</Typography><Typography variant="body2" color="text.secondary">{label}</Typography></Box></Paper>)}
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0,1.65fr) minmax(280px,.8fr)" }, gap: 2.2, alignItems: "start" }}>
          <Paper sx={{ ...surfaceSx, overflow: "hidden" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, p: { xs: 2, sm: 2.6 }, borderBottom: "1px solid #edf1ee" }}><Box><Typography variant="overline" color="primary" fontWeight={800} letterSpacing=".08em">UP NEXT</Typography><Typography variant="h5" fontWeight={850}>Your next journey</Typography></Box><Button onClick={() => onNavigate("trips")} endIcon={<ArrowForwardRoundedIcon />} sx={{ textTransform: "none", fontWeight: 750, whiteSpace: "nowrap" }}>All trips</Button></Box>
            {nextTrip ? <Box sx={{ p: { xs: 2, sm: 2.6 } }}>
              <Box sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3.5, color: "white", background: "linear-gradient(120deg,#1e665a,#2b8372)" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}><Box><Chip size="small" label="PLANNED JOURNEY" sx={{ color: "white", bgcolor: "rgba(255,255,255,.13)", fontWeight: 750, mb: 1 }} /><Typography variant="h4" fontWeight={850} letterSpacing="-.04em">{nextTrip.title || nextDestinations.join(" · ") || "Your next getaway"}</Typography><Typography sx={{ mt: .6, color: "rgba(255,255,255,.77)" }}>{nextTrip.form?.starting_location || "Starting point"} <ArrowForwardRoundedIcon sx={{ mx: .5, verticalAlign: "middle", fontSize: 16 }} /> {nextDestinations.join(" · ") || nextTrip.form?.destination || "Destination to be decided"}</Typography></Box><LuggageOutlinedIcon sx={{ display: { xs: "none", sm: "block" }, fontSize: 40, color: "#f2c894" }} /></Box>
                <Box sx={{ display: "flex", gap: { xs: 2, sm: 4 }, flexWrap: "wrap", mt: 2.5, pt: 2, borderTop: "1px solid rgba(255,255,255,.15)" }}><Box><Typography variant="caption" sx={{ color: "rgba(255,255,255,.67)" }}>DATES</Typography><Typography fontWeight={750}>{formatDate(nextTrip.form?.start_date)}{nextTrip.form?.end_date ? ` – ${formatDate(nextTrip.form.end_date)}` : ""}</Typography></Box><Box><Typography variant="caption" sx={{ color: "rgba(255,255,255,.67)" }}>DURATION</Typography><Typography fontWeight={750}>{nextTrip.form?.duration_days || nextTrip.result?.plan?.travel_window?.days || "—"} days</Typography></Box><Box><Typography variant="caption" sx={{ color: "rgba(255,255,255,.67)" }}>ESTIMATED COST</Typography><Typography fontWeight={750}>{money(nextTrip.result?.plan?.costs?.total)}</Typography></Box></Box>
              </Box>
              {nextTrip.result?.plan?.itinerary?.length > 0 && <Box sx={{ mt: 2 }}><Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>First stops in your itinerary</Typography><Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3,1fr)" }, gap: 1 }}>
                {nextTrip.result.plan.itinerary.slice(0, 3).map((day, index) => <Box key={`${day.date}-${index}`} sx={{ p: 1.4, borderRadius: 2.5, bgcolor: "#f7f9f7", border: "1px solid #edf1ee" }}><Typography variant="caption" color="primary" fontWeight={800}>DAY {index + 1}</Typography><Typography variant="body2" fontWeight={800} sx={{ mt: .3 }}>{day.title || day.destination || "Explore"}</Typography><Typography variant="caption" color="text.secondary">{day.destination || "On your route"}</Typography></Box>)}
              </Box></Box>}
              <Button onClick={() => onNavigate("trips")} variant="outlined" endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 2, borderRadius: 2, textTransform: "none", fontWeight: 750 }}>View itinerary details</Button>
              <WeatherAlertPanel trip={nextTrip} />
            </Box> : <Box sx={{ p: { xs: 3, md: 5 }, textAlign: "center" }}><CalendarMonthRoundedIcon sx={{ fontSize: 36, color: "#8aaca0" }} /><Typography variant="h6" fontWeight={800} sx={{ mt: .8 }}>Your next trip starts with an idea</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5, mb: 1.8 }}>Build a personalized route around the places and experiences you love.</Typography><Button variant="contained" onClick={() => onNavigate("planner")} sx={{ textTransform: "none", borderRadius: 2 }}>Open Smart Planner</Button></Box>}
          </Paper>

          <Box sx={{ display: "grid", gap: 2.2 }}>
            <Paper sx={{ ...surfaceSx, p: { xs: 2, sm: 2.5 } }}><Chip size="small" label="YOUR TRAVEL STORY" sx={{ mb: 1.2, bgcolor: "#edf5ef", color: "#35694b", fontWeight: 750 }} /><Typography variant="h6" fontWeight={850}>Keep discovering</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5, lineHeight: 1.7 }}>Explore new corners of India, save the ones that speak to you, then turn your wishlist into a thoughtful itinerary.</Typography><Box sx={{ display: "grid", gap: 1, mt: 1.8 }}><Button fullWidth variant="outlined" startIcon={<FavoriteBorderRoundedIcon />} onClick={() => onNavigate("favorites")} sx={{ justifyContent: "flex-start", textTransform: "none", borderRadius: 2, py: 1 }}>Open saved places</Button><Button fullWidth variant="outlined" startIcon={<ExploreRoundedIcon />} onClick={() => onNavigate("explore")} sx={{ justifyContent: "flex-start", textTransform: "none", borderRadius: 2, py: 1 }}>Explore destinations</Button></Box></Paper>
            <Paper sx={{ ...surfaceSx, p: { xs: 2, sm: 2.5 }, background: "linear-gradient(145deg,#fbf5ec,#fffdf9)" }}><Box sx={{ width: 40, height: 40, borderRadius: 2.5, display: "grid", placeItems: "center", bgcolor: "#f5e8d3", color: "#8b6335" }}><CheckCircleOutlineRoundedIcon /></Box><Typography variant="subtitle1" fontWeight={850} sx={{ mt: 1.2 }}>A little progress goes a long way</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .4 }}>You’ve completed {completed.length} {completed.length === 1 ? "journey" : "journeys"} so far. Every trip becomes part of your travel history.</Typography>{completed.length > 0 && <Button onClick={() => onNavigate("trips")} sx={{ px: 0, mt: .6, textTransform: "none", fontWeight: 750 }}>See your travel history <ArrowForwardRoundedIcon sx={{ ml: .5, fontSize: 17 }} /></Button>}</Paper>
          </Box>
        </Box>
      </>}
    </Container>
  </Box>;
}
