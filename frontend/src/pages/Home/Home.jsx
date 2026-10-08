import { Box, Button, Chip, Container, Paper, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import LuggageRoundedIcon from "@mui/icons-material/LuggageRounded";
import RouteRoundedIcon from "@mui/icons-material/RouteRounded";
import WbSunnyRoundedIcon from "@mui/icons-material/WbSunnyRounded";

const highlights = [
  { icon: <ExploreRoundedIcon />, title: "Find your place", text: "Explore handpicked destinations across India, filtered to your kind of trip." },
  { icon: <AutoAwesomeRoundedIcon />, title: "Plan with purpose", text: "Build a thoughtful itinerary around your budget, interests, and pace." },
  { icon: <LuggageRoundedIcon />, title: "Keep every detail", text: "Save, refine, and revisit your plans whenever inspiration strikes." },
];

function Home({ onNavigate }) {
  return <Box sx={{ bgcolor: "#f6f8f6", minHeight: "calc(100vh - 72px)", pb: { xs: 6, md: 10 } }}>
    <Container maxWidth="xl" sx={{ pt: { xs: 2.5, md: 4 } }}>
      <Box sx={{ overflow: "hidden", position: "relative", borderRadius: { xs: 5, md: 8 }, minHeight: { xs: 660, md: 590 }, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.05fr .95fr" }, alignItems: "center", px: { xs: 3, sm: 5, md: 8 }, py: { xs: 5, md: 7 }, color: "#fff", background: "radial-gradient(ellipse at 83% 18%, rgba(112,180,154,.33), transparent 35%), radial-gradient(ellipse at 73% 88%, rgba(19,99,86,.42), transparent 45%), linear-gradient(120deg,#103d38 0%,#14564d 58%,#23695c 100%)" }}>
        <Box sx={{ position: "absolute", width: 470, height: 470, right: { xs: -150, md: "22%" }, top: { xs: 295, md: 50 }, borderRadius: "50%", border: "1px solid rgba(255,255,255,.12)", boxShadow: "0 0 0 48px rgba(255,255,255,.025), 0 0 0 100px rgba(255,255,255,.02)", pointerEvents: "none" }} />
        <Box sx={{ position: "relative", zIndex: 1, maxWidth: 650 }}>
          <Chip icon={<AutoAwesomeRoundedIcon sx={{ color: "#f3c794 !important", fontSize: 18 }} />} label="YOUR NEXT JOURNEY, WELL PLANNED" sx={{ bgcolor: "rgba(255,255,255,.1)", color: "#edf6f1", border: "1px solid rgba(255,255,255,.14)", letterSpacing: ".07em", fontWeight: 700, fontSize: ".68rem", mb: 3 }} />
          <Typography variant="h1" sx={{ fontSize: { xs: "3.15rem", sm: "4rem", md: "4.5rem" }, lineHeight: 1.03, fontWeight: 850, letterSpacing: "-.065em", maxWidth: 690 }}>Go beyond the usual.</Typography>
          <Typography sx={{ mt: 2.5, maxWidth: 560, color: "rgba(243,249,245,.78)", fontSize: { xs: "1.05rem", md: "1.15rem" }, lineHeight: 1.8 }}>Discover India at your own pace. Find places that fit your style, then turn inspiration into an itinerary you can actually use.</Typography>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 4 }}>
            <Button variant="contained" endIcon={<ArrowForwardRoundedIcon />} onClick={() => onNavigate("explore")} sx={{ bgcolor: "#f3c794", color: "#1c443d", px: 2.7, py: 1.35, borderRadius: 2.5, fontWeight: 800, textTransform: "none", boxShadow: "0 8px 24px rgba(4,28,23,.16)", "&:hover": { bgcolor: "#f8d6ad" } }}>Explore destinations</Button>
            <Button variant="outlined" startIcon={<RouteRoundedIcon />} onClick={() => onNavigate("planner")} sx={{ color: "#f7fbf8", borderColor: "rgba(255,255,255,.34)", px: 2.5, py: 1.3, borderRadius: 2.5, fontWeight: 700, textTransform: "none", "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,.08)" } }}>Open trip planner</Button>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 4, color: "rgba(243,249,245,.65)" }}><WbSunnyRoundedIcon sx={{ fontSize: 19, color: "#f3c794" }} /><Typography variant="body2">Made for thoughtful travel across India</Typography></Box>
        </Box>
        <Box sx={{ position: "relative", zIndex: 1, display: "flex", justifyContent: { xs: "center", md: "flex-end" }, mt: { xs: 4, md: 0 } }}>
          <Paper elevation={0} sx={{ width: "min(100%, 390px)", p: 2.5, borderRadius: 5, bgcolor: "rgba(250,252,249,.97)", color: "#203630", transform: { md: "rotate(2deg)" }, boxShadow: "0 28px 80px rgba(4,27,23,.28)" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Box><Typography variant="overline" color="text.secondary" fontWeight={800} letterSpacing=".12em">A LITTLE INSPIRATION</Typography><Typography variant="h5" fontWeight={850} letterSpacing="-.04em">The mountain loop</Typography></Box><Box sx={{ width: 44, height: 44, borderRadius: 3, display: "grid", placeItems: "center", bgcolor: "#eaf2e7", color: "#537960" }}><RouteRoundedIcon /></Box></Box>
            <Box sx={{ mt: 2.5, p: 2, borderRadius: 3, background: "linear-gradient(135deg,#dcebe2,#ecede1 55%,#f1dfc9)" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}><Box sx={{ display: "grid", gap: 1, justifyItems: "center" }}><Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: "#1b7565" }} /><Box sx={{ width: 2, height: 28, bgcolor: "#8aab9d" }} /><Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: "#cc8b55" }} /></Box><Box sx={{ flex: 1 }}><Typography fontWeight={800}>Delhi <Typography component="span" variant="body2" color="text.secondary">Start</Typography></Typography><Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>A scenic rail journey</Typography><Typography fontWeight={800}>Manali <Typography component="span" variant="body2" color="text.secondary">Days 1–4</Typography></Typography></Box></Box>
              <Box sx={{ display: "flex", gap: 1, mt: 2.5 }}><Chip size="small" label="5 days" sx={{ bgcolor: "rgba(255,255,255,.72)", fontWeight: 700 }} /><Chip size="small" label="Nature · Culture" sx={{ bgcolor: "rgba(255,255,255,.72)", fontWeight: 700 }} /></Box>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2.5 }}><Typography variant="body2" color="text.secondary">Thoughtfully planned, yours to shape</Typography><ArrowForwardRoundedIcon color="primary" /></Box>
          </Paper>
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: { sm: "flex-end" }, gap: 2, flexWrap: "wrap", mt: { xs: 6, md: 9 }, mb: 3.5 }}>
        <Box><Typography variant="overline" color="primary" fontWeight={800} letterSpacing=".15em">A BETTER WAY TO GET AWAY</Typography><Typography variant="h4" fontWeight={850} letterSpacing="-.045em" sx={{ mt: .6 }}>From first idea to the open road.</Typography></Box>
        <Typography color="text.secondary" sx={{ maxWidth: 410 }}></Typography>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3,1fr)" }, gap: 2 }}>
        {highlights.map((item, index) => <Paper key={item.title} elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 4, border: "1px solid #e6eae7", bgcolor: "#fff" }}><Box sx={{ width: 48, height: 48, borderRadius: 3, display: "grid", placeItems: "center", bgcolor: index === 1 ? "#f8efe4" : "#eaf4f1", color: index === 1 ? "#a56e3f" : "#16776d", mb: 2.3 }}>{item.icon}</Box><Typography variant="h6" fontWeight={800}>{item.title}</Typography><Typography color="text.secondary" sx={{ mt: .8, lineHeight: 1.7 }}>{item.text}</Typography></Paper>)}
      </Box>
    </Container>
  </Box>;
}

export default Home;
