import { useEffect, useMemo, useState } from "react";
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Chip, CircularProgress,
  Container, Paper, Skeleton, Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FlightTakeoffRoundedIcon from "@mui/icons-material/FlightTakeoffRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";

const panelSx = { border: "1px solid #e4eae6", borderRadius: 4, bgcolor: "#fff", boxShadow: "0 8px 28px rgba(27,45,38,.035)" };

function PreferenceGroup({ label, value, accent = false }) {
  const values = Array.isArray(value) ? value.filter(Boolean) : value ? [value] : [];
  return <Box><Typography variant="caption" color="text.secondary" fontWeight={800} letterSpacing=".08em">{label.toUpperCase()}</Typography>{values.length ? <Box sx={{ display: "flex", flexWrap: "wrap", gap: .8, mt: .85 }}>{values.map((item) => <Chip key={item} label={item} size="small" sx={{ bgcolor: accent ? "#eaf4f1" : "#f2f4f2", color: accent ? "#176c62" : "#52615a", fontWeight: 700, borderRadius: 2 }} />)}</Box> : <Typography color="text.disabled" sx={{ mt: .6 }}>Add your preferences</Typography>}</Box>;
}

function DetailSection({ title, icon, fields }) {
  return <Accordion disableGutters elevation={0} sx={{ ...panelSx, "&:before": { display: "none" }, mb: 1.2 }}>
    <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: { xs: 2, sm: 3 }, minHeight: 68, "& .MuiAccordionSummary-content": { alignItems: "center", gap: 1.4, my: 1.5 } }}>
      <Box sx={{ width: 38, height: 38, borderRadius: 2.5, display: "grid", placeItems: "center", bgcolor: "#eaf4f1", color: "primary.main" }}>{icon}</Box>
      <Typography fontWeight={800}>{title}</Typography>
    </AccordionSummary>
    <AccordionDetails sx={{ px: { xs: 2, sm: 3 }, pt: 0, pb: 3 }}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)" }, gap: 2.2 }}>
        {fields.map(([label, value]) => <Box key={label}><Typography variant="caption" color="text.secondary" fontWeight={800} letterSpacing=".07em">{label.toUpperCase()}</Typography>{Array.isArray(value) ? <Box sx={{ display: "flex", flexWrap: "wrap", gap: .65, mt: .75 }}>{value.length ? value.map((entry) => <Chip key={entry} label={entry} size="small" variant="outlined" sx={{ borderColor: "#e3e9e4" }} />) : <Typography color="text.disabled">Not added</Typography>}</Box> : <Typography sx={{ mt: .45, fontWeight: 650, color: value ? "text.primary" : "text.disabled" }}>{value || "Not added"}</Typography>}</Box>)}
      </Box>
    </AccordionDetails>
  </Accordion>;
}

export default function Profile({ onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch("http://127.0.0.1:8000/profile/me", { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.detail || "We couldn’t load your profile.");
        setProfile(data.profile);
      } catch (reason) { setError(reason.message || "Unable to connect to your profile."); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const completion = useMemo(() => {
    if (!profile) return 0;
    const fields = [profile.name, profile.age, profile.duration, profile.budget, profile.travelStyle?.length, profile.destinations?.length, profile.travelTypes?.length];
    return Math.round(fields.filter(Boolean).length / fields.length * 100);
  }, [profile]);

  if (loading) return <Box sx={{ minHeight: "calc(100vh - 72px)", bgcolor: "#f5f8f6", py: 5 }}><Container maxWidth="xl"><Skeleton height={250} sx={{ borderRadius: 6 }} /><Skeleton height={240} sx={{ mt: 2, borderRadius: 5 }} /></Container></Box>;
  if (error) return <Box sx={{ minHeight: "calc(100vh - 72px)", bgcolor: "#f5f8f6", py: 5 }}><Container maxWidth="xl"><Alert severity="info" action={<Button onClick={() => onNavigate("profileform")} sx={{ textTransform: "none" }}>Complete profile</Button>} sx={{ borderRadius: 3 }}>{error}</Alert></Container></Box>;

  const name = profile?.name || localStorage.getItem("user_name") || "Traveler";
  const interestCount = (profile?.travelStyle || []).length + (profile?.destinations || []).length;

  return <Box sx={{ minHeight: "calc(100vh - 72px)", bgcolor: "#f5f8f6", py: { xs: 2.5, md: 4.5 }, background: "linear-gradient(180deg,#edf4f0 0%,#f7f9f7 410px,#f5f8f6 100%)" }}>
    <Container maxWidth="xl">
      <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => onNavigate("explore")} sx={{ mb: 2, textTransform: "none", color: "#53645d", fontWeight: 700 }}>Back to exploring</Button>
      <Paper elevation={0} sx={{ ...panelSx, position: "relative", overflow: "hidden", p: { xs: 2.5, sm: 4, md: 5 }, mb: 2.5, color: "#fff", background: "radial-gradient(ellipse at 90% 0%,rgba(180,218,193,.28),transparent 38%),linear-gradient(120deg,#143f39,#1b6559)" }}>
        <Box sx={{ position: "absolute", right: -40, bottom: -160, width: 360, height: 360, border: "1px solid rgba(255,255,255,.14)", borderRadius: "50%", boxShadow: "0 0 0 42px rgba(255,255,255,.03),0 0 0 90px rgba(255,255,255,.025)" }} />
        <Box sx={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.2 }}>
            <Box sx={{ width: { xs: 60, sm: 76 }, height: { xs: 60, sm: 76 }, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: "27px", bgcolor: "#f3c794", color: "#294c42", fontSize: { xs: 27, sm: 34 }, fontWeight: 900, boxShadow: "0 10px 28px rgba(5,28,22,.18)" }}>{name.charAt(0).toUpperCase()}</Box>
            <Box><Typography variant="overline" sx={{ color: "rgba(244,249,245,.7)", fontWeight: 800, letterSpacing: ".15em" }}>YOUR TRAVEL PROFILE</Typography><Typography variant="h3" sx={{ fontWeight: 850, letterSpacing: "-.055em", lineHeight: 1.1, fontSize: { xs: "2rem", md: "2.8rem" } }}>Hello, {name.split(" ")[0]}.</Typography><Typography sx={{ color: "rgba(244,249,245,.75)", mt: .7 }}>{profile?.email || localStorage.getItem("user_email") || "Your personal travel blueprint"}</Typography></Box>
          </Box>
          <Button variant="contained" startIcon={<EditOutlinedIcon />} onClick={() => onNavigate("profileform")} sx={{ position: "relative", bgcolor: "rgba(255,255,255,.13)", border: "1px solid rgba(255,255,255,.28)", color: "#fff", px: 2.2, py: 1.2, textTransform: "none", "&:hover": { bgcolor: "rgba(255,255,255,.2)" } }}>Edit profile</Button>
        </Box>
        <Box sx={{ position: "relative", mt: 3.5, display: "flex", alignItems: "center", gap: 1.2 }}><CircularProgress variant="determinate" value={completion} size={38} thickness={5} sx={{ color: "#f3c794", "& .MuiCircularProgress-circleDeterminate": { strokeLinecap: "round" } }} /><Typography variant="body2" sx={{ color: "rgba(244,249,245,.82)" }}><b>{completion}% complete</b> · {interestCount ? `${interestCount} preference signals help personalize your matches` : "Add travel preferences to improve your matches"}</Typography></Box>
      </Paper>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4,1fr)" }, gap: 1.4, mb: 2.5 }}>
        {[["Your budget", profile?.budget || "Add budget"], ["Trip length", profile?.duration || "Choose a duration"], ["Starting from", profile?.city || "Add your city"], ["Travel mood", profile?.travelStyle?.[0] || "Set your style"]].map(([label, value]) => <Paper key={label} elevation={0} sx={{ ...panelSx, p: { xs: 1.6, sm: 2.2 } }}><Typography variant="caption" color="text.secondary" fontWeight={800} letterSpacing=".06em">{label.toUpperCase()}</Typography><Typography sx={{ mt: .45, fontWeight: 800, fontSize: { xs: ".95rem", sm: "1.05rem" } }}>{value}</Typography></Paper>)}
      </Box>

      <Paper elevation={0} sx={{ ...panelSx, p: { xs: 2.5, md: 3.5 }, mb: 2.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap", mb: 3 }}><Box><Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "primary.main" }}><FlightTakeoffRoundedIcon /><Typography variant="overline" fontWeight={850} letterSpacing=".13em">THE WAY YOU LIKE TO TRAVEL</Typography></Box><Typography variant="h5" fontWeight={850} letterSpacing="-.035em" sx={{ mt: .5 }}>Your travel blueprint</Typography></Box><Button endIcon={<ArrowForwardRoundedIcon />} onClick={() => onNavigate("explore")} sx={{ textTransform: "none", fontWeight: 750 }}>See your recommendations</Button></Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
          <PreferenceGroup label="Travel style" value={profile?.travelStyle} accent />
          <PreferenceGroup label="Places you love" value={profile?.destinations} accent />
          <PreferenceGroup label="Travel with" value={profile?.travelTypes} />
          <PreferenceGroup label="Ideal duration & budget" value={[profile?.duration, profile?.budget].filter(Boolean)} />
        </Box>
      </Paper>

      <Typography variant="overline" color="text.secondary" fontWeight={850} letterSpacing=".13em" sx={{ display: "block", mb: 1.2, ml: .5 }}>YOUR PROFILE DETAILS</Typography>
      <DetailSection title="Personal details" icon={<PersonOutlineRoundedIcon />} fields={[["Full name", profile?.name], ["Age", profile?.age ? `${profile.age} years` : ""], ["Date of birth", profile?.dateOfBirth], ["Gender", profile?.gender], ["Email address", profile?.email], ["Phone", profile?.phone]]} />
      <DetailSection title="Home & emergency contact" icon={<LocationOnOutlinedIcon />} fields={[["City", profile?.city], ["State", profile?.state], ["Address", profile?.address], ["Pincode", profile?.pincode], ["Emergency contact", profile?.emergencyName], ["Emergency number", profile?.emergencyPhone]]} />
      <DetailSection title="Stay, food & getting around" icon={<RestaurantOutlinedIcon />} fields={[["Accommodation", profile?.accommodation], ["Accommodation budget", profile?.accommodationBudget], ["Transport preferences", profile?.transportation], ["Food preferences", profile?.foodPreference], ["Favorite cuisines", profile?.cuisines], ["Activities", profile?.activities]]} />
      <DetailSection title="Safety & accessibility" icon={<SecurityOutlinedIcon />} fields={[["Preferred safety level", profile?.safetyLevel], ["Accessibility", profile?.accessibility], ["Additional preferences", profile?.otherPreferences]]} />
    </Container>
  </Box>;
}
