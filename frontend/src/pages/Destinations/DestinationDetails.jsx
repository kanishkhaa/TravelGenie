import { Box, Button, Chip, Container, Divider, Paper, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AttractionsOutlinedIcon from "@mui/icons-material/AttractionsOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import DirectionsOutlinedIcon from "@mui/icons-material/DirectionsOutlined";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import SmartphoneOutlinedIcon from "@mui/icons-material/SmartphoneOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import FavoriteButton from "../../components/common/FavoriteButton";
import DestinationCover from "../../components/destinations/DestinationCover";

const panelSx = { border: "1px solid #e5ebe7", borderRadius: 4, bgcolor: "#fff", boxShadow: "0 10px 28px rgba(30,55,43,.04)" };

function list(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => typeof item === "string" ? item : Object.values(item || {}).filter(Boolean).join(" · ")).filter(Boolean);
  return [String(value)];
}

function text(value) {
  if (value === null || value === undefined || value === "") return "Details coming soon";
  if (Array.isArray(value)) return value.join(" · ");
  if (typeof value === "object") return Object.entries(value).map(([key, val]) => `${key.replaceAll("_", " ")}: ${text(val)}`).join(" · ");
  return String(value);
}

function range(value) {
  if (!Array.isArray(value) || value.length < 2) return "Budget range varies";
  return `₹${Number(value[0]).toLocaleString("en-IN")} – ₹${Number(value[1]).toLocaleString("en-IN")}`;
}

function Section({ title, icon, eyebrow, children, action }) {
  return <Paper elevation={0} sx={{ ...panelSx, p: { xs: 2, sm: 2.7, md: 3 } }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, mb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}><Box sx={{ width: 40, height: 40, borderRadius: 2.5, display: "grid", placeItems: "center", bgcolor: "#edf5ef", color: "#246a5b" }}>{icon}</Box><Box>{eyebrow && <Typography variant="overline" color="text.secondary" fontWeight={750} letterSpacing=".08em">{eyebrow}</Typography>}<Typography variant="h6" fontWeight={850} letterSpacing="-.025em" lineHeight={1.2}>{title}</Typography></Box></Box>
      {action}
    </Box>
    {children}
  </Paper>;
}

function DetailRow({ label, value, icon }) {
  if (!value || value === "Details coming soon") return null;
  return <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", py: 1.15, borderBottom: "1px solid #edf1ee", "&:last-child": { borderBottom: 0, pb: 0 } }}>
    {icon && <Box sx={{ mt: .15, color: "#648077", display: "flex" }}>{icon}</Box>}
    <Box sx={{ minWidth: 0 }}><Typography variant="caption" color="text.secondary" fontWeight={650}>{label}</Typography><Typography variant="body2" fontWeight={700} sx={{ mt: .25, lineHeight: 1.55 }}>{text(value)}</Typography></Box>
  </Box>;
}

function DestinationDetails({ destination, onBack, onNavigate }) {
  if (!destination) return null;
  const attractions = list(destination.primary_attractions);
  const activities = list(destination.activities_available);
  const experiences = list(destination.unique_experiences);
  const hiddenGems = list(destination.hidden_gems);
  const cuisines = list(destination.local_cuisine_must_try);
  const bestSeasons = list(destination.best_seasons);
  const avoidSeasons = list(destination.avoid_seasons);
  const coordinates = destination.coordinates;
  const mapUrl = coordinates?.latitude && coordinates?.longitude
    ? `https://www.openstreetmap.org/?mlat=${coordinates.latitude}&mlon=${coordinates.longitude}#map=11/${coordinates.latitude}/${coordinates.longitude}`
    : null;

  const planFromHere = () => {
    try {
      localStorage.setItem("travelgenie_planner_destination", JSON.stringify({ id: destination.id, name: destination.destination_name }));
    } catch { /* Navigation still works when storage is unavailable. */ }
    onNavigate?.("planner");
  };

  return <Box sx={{ minHeight: "calc(100vh - 72px)", pb: { xs: 4, md: 7 }, bgcolor: "#f5f8f6", background: "linear-gradient(180deg,#edf4f0 0,#f6f8f6 520px,#f5f8f6 100%)" }}>
    <Container maxWidth="xl" sx={{ pt: { xs: 2, md: 3 } }}>
      <DestinationCover destinationName={destination.destination_name} height={{ xs: 380, sm: 440, md: 510 }}>
        <Box sx={{ position: "absolute", inset: 0, p: { xs: 2, sm: 2.5, md: 3 }, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "stretch" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Button startIcon={<ArrowBackRoundedIcon />} onClick={onBack} sx={{ px: 1.5, color: "#20382f", bgcolor: "rgba(255,255,255,.93)", borderRadius: 2.5, textTransform: "none", fontWeight: 750, "&:hover": { bgcolor: "white" } }}>Back to explore</Button>
            <FavoriteButton destination={destination} size="large" />
          </Box>
          <Box sx={{ maxWidth: 820, pb: { xs: 1, md: 2 }, color: "white" }}>
            <Chip label={`${destination.region || "Discover India"}  ·  DESTINATION GUIDE`} sx={{ mb: 1.4, color: "white", bgcolor: "rgba(15,49,39,.52)", fontWeight: 750, letterSpacing: ".06em", backdropFilter: "blur(8px)" }} />
            <Typography variant="h1" sx={{ fontSize: { xs: "2.75rem", sm: "3.5rem", md: "5rem" }, fontWeight: 900, lineHeight: .98, letterSpacing: "-.065em", textShadow: "0 3px 22px rgba(0,0,0,.2)" }}>{destination.destination_name}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: .5, mt: 1.3, color: "rgba(255,255,255,.91)" }}><LocationOnOutlinedIcon sx={{ fontSize: 19 }} /><Typography fontWeight={650}>{[destination.district, destination.state].filter(Boolean).join(", ")}</Typography></Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: .7, mt: 1.5 }}>{list(destination.trip_types).slice(0, 5).map((type) => <Chip key={type} size="small" label={type} sx={{ color: "white", bgcolor: "rgba(255,255,255,.17)", border: "1px solid rgba(255,255,255,.24)", fontWeight: 650, backdropFilter: "blur(8px)" }} />)}</Box>
          </Box>
        </Box>
      </DestinationCover>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4,1fr)" }, gap: 1.2, mt: 1.5, mb: 2.3 }}>
        {[
          [<AccessTimeRoundedIcon key="duration" />, "IDEAL DURATION", `${destination.ideal_days || destination.minimum_days || "Flexible"} ${destination.ideal_days || destination.minimum_days ? "days" : ""}`],
          [<AccountBalanceWalletOutlinedIcon key="budget" />, "DAILY BUDGET", range(destination.budget_category?.total_daily_range)],
          [<HealthAndSafetyOutlinedIcon key="safety" />, "SAFETY GUIDE", destination.safety_rating ? `${destination.safety_rating}/10` : "See local guidance"],
          [<WbSunnyOutlinedIcon key="season" />, "BEST SEASON", bestSeasons.slice(0, 2).join(" · ") || "Varies by year"],
        ].map(([icon, label, value]) => <Paper key={label} elevation={0} sx={{ ...panelSx, p: { xs: 1.4, sm: 1.8 }, display: "flex", gap: 1, alignItems: "center" }}><Box sx={{ width: 36, height: 36, flexShrink: 0, display: { xs: "none", sm: "grid" }, placeItems: "center", borderRadius: 2, bgcolor: "#edf5ef", color: "#286d5c" }}>{icon}</Box><Box sx={{ minWidth: 0 }}><Typography variant="caption" color="text.secondary" fontWeight={750} letterSpacing=".035em">{label}</Typography><Typography variant="body2" fontWeight={850} sx={{ mt: .25, overflowWrap: "anywhere" }}>{value}</Typography></Box></Paper>)}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0,1.65fr) minmax(300px,.8fr)" }, alignItems: "start", gap: 2.2 }}>
        <Box sx={{ display: "grid", gap: 2.2 }}>
          <Section eyebrow="THE FEEL OF THE PLACE" title="Why it belongs on your list" icon={<LightbulbOutlinedIcon />}>
            <Typography color="text.secondary" sx={{ lineHeight: 1.85, fontSize: { xs: ".98rem", md: "1.04rem" } }}>{text(destination.ideal_for_why)}</Typography>
            {experiences.length > 0 && <Box sx={{ mt: 1.7, p: 1.7, borderRadius: 3, bgcolor: "#f3f7f4", border: "1px solid #e7eee9" }}><Typography variant="caption" color="primary" fontWeight={800} letterSpacing=".07em">A SIGNATURE EXPERIENCE</Typography><Typography variant="body2" sx={{ mt: .5, lineHeight: 1.65 }}>{experiences.join(" · ")}</Typography></Box>}
          </Section>

          {attractions.length > 0 && <Section eyebrow="START WITH THE HIGHLIGHTS" title="Places to see" icon={<AttractionsOutlinedIcon />}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
              {attractions.map((attraction, index) => <Box key={attraction} sx={{ display: "flex", alignItems: "flex-start", gap: 1.1, p: 1.35, borderRadius: 2.7, bgcolor: "#f8faf8", border: "1px solid #edf1ee" }}><Box sx={{ width: 27, height: 27, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: "50%", color: "#287160", bgcolor: "#e6f0e9", fontSize: ".73rem", fontWeight: 850 }}>{String(index + 1).padStart(2, "0")}</Box><Typography variant="body2" fontWeight={700} sx={{ pt: .45, lineHeight: 1.5 }}>{attraction}</Typography></Box>)}
            </Box>
          </Section>}

          {activities.length > 0 && <Section eyebrow="MAKE THE MOST OF YOUR TIME" title="Experiences to try" icon={<ExploreRoundedIcon />}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: .8 }}>{activities.map((activity) => <Chip key={activity} label={activity} variant="outlined" sx={{ bgcolor: "#fbfdfb", borderColor: "#dfe9e2", color: "#466257", fontWeight: 650 }} />)}</Box>
          </Section>}

          {(hiddenGems.length > 0 || cuisines.length > 0) && <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.2 }}>
            {hiddenGems.length > 0 && <Section eyebrow="A LITTLE LESS EXPECTED" title="Quieter finds" icon={<LocationOnOutlinedIcon />}><Box sx={{ display: "grid", gap: .8 }}>{hiddenGems.slice(0, 6).map((place) => <Box key={place} sx={{ display: "flex", gap: .8, alignItems: "center", color: "#476358" }}><CheckCircleOutlineRoundedIcon sx={{ fontSize: 17, color: "#5e9070" }} /><Typography variant="body2">{place}</Typography></Box>)}</Box></Section>}
            {cuisines.length > 0 && <Section eyebrow="TASTE THE REGION" title="Local food to look for" icon={<RestaurantOutlinedIcon />}><Box sx={{ display: "flex", flexWrap: "wrap", gap: .8 }}>{cuisines.map((food) => <Chip key={food} label={food} size="small" sx={{ bgcolor: "#fbf3e8", color: "#765a35", fontWeight: 650 }} />)}</Box></Section>}
          </Box>}
        </Box>

        <Box sx={{ display: "grid", gap: 2.2, position: { lg: "sticky" }, top: { lg: 20 } }}>
          <Paper elevation={0} sx={{ ...panelSx, overflow: "hidden" }}>
            <Box sx={{ p: 2.4, color: "white", background: "linear-gradient(120deg,#15584e,#1e7565)" }}><Typography variant="overline" sx={{ color: "rgba(255,255,255,.7)", fontWeight: 750, letterSpacing: ".08em" }}>READY WHEN YOU ARE</Typography><Typography variant="h5" fontWeight={850} letterSpacing="-.03em" sx={{ mt: .4 }}>Make this your next trip</Typography><Typography variant="body2" sx={{ mt: .6, color: "rgba(255,255,255,.77)", lineHeight: 1.6 }}>Build a personalized itinerary with {destination.destination_name} in mind.</Typography><Button fullWidth variant="contained" onClick={planFromHere} endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 1.8, py: 1.2, color: "#245345", bgcolor: "#f2c894", fontWeight: 800, textTransform: "none", borderRadius: 2.5, "&:hover": { bgcolor: "#f6d7b2" } }}>Plan with this destination</Button></Box>
            <Box sx={{ p: 2.2 }}>
              <Typography variant="subtitle2" fontWeight={850} sx={{ mb: .3 }}>Plan your visit</Typography>
              <DetailRow label="Best time to visit" value={bestSeasons.join(", ")} icon={<CalendarMonthOutlinedIcon fontSize="small" />} />
              <DetailRow label="Peak season" value={destination.peak_tourist_season} />
              <DetailRow label="Quieter months" value={destination.off_season} />
              {avoidSeasons.length > 0 && <Box sx={{ mt: 1.1, p: 1.2, borderRadius: 2.5, color: "#79582b", bgcolor: "#fff7e9", border: "1px solid #f0e3c9" }}><Typography variant="caption" fontWeight={800}>SEASONS TO PLAN AROUND</Typography><Typography variant="body2" sx={{ mt: .3 }}>{avoidSeasons.join(" · ")}</Typography></Box>}
            </Box>
          </Paper>

          <Section eyebrow="TRAVEL WITH CONFIDENCE" title="Safety & access" icon={<HealthAndSafetyOutlinedIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.1, p: 1.25, borderRadius: 2.5, bgcolor: "#f0f6f1" }}><HealthAndSafetyOutlinedIcon sx={{ color: "#397451" }} /><Typography variant="body2" fontWeight={800}>Guide rating: {destination.safety_rating ? `${destination.safety_rating} / 10` : "Not rated"}</Typography></Box>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65, mb: 1.1 }}>{text(destination.safety_notes)}</Typography>
            <Divider sx={{ mb: .5 }} />
            <DetailRow label="Road access" value={destination.road_connectivity} icon={<DirectionsOutlinedIcon fontSize="small" />} />
            <DetailRow label="Mobile network" value={destination.mobile_network} icon={<SmartphoneOutlinedIcon fontSize="small" />} />
            <DetailRow label="Permits" value={destination.permits_details || destination.permits_required} />
            <DetailRow label="Special considerations" value={destination.special_considerations} />
          </Section>

          <Section eyebrow="GETTING THERE" title="Transport links" icon={<DirectionsOutlinedIcon />}>
            <DetailRow label="Nearest airport" value={destination.nearest_airport} />
            <DetailRow label="Nearest railway station" value={destination.nearest_railway_station} />
            <DetailRow label="Nearest major city" value={destination.nearest_major_city} />
            {mapUrl && <Button component="a" href={mapUrl} target="_blank" rel="noreferrer" startIcon={<LocationOnOutlinedIcon />} endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 1.5, px: 0, textTransform: "none", fontWeight: 750 }}>View on OpenStreetMap</Button>}
          </Section>

          {(destination.local_customs || destination.local_culture || destination.sustainability_notes) && <Section eyebrow="BE A THOUGHTFUL VISITOR" title="Local notes" icon={<LightbulbOutlinedIcon />}>
            <DetailRow label="Culture & customs" value={destination.local_customs || destination.local_culture} />
            <DetailRow label="Sustainability" value={destination.sustainability_notes} />
          </Section>}
        </Box>
      </Box>
    </Container>
  </Box>;
}

export default DestinationDetails;
