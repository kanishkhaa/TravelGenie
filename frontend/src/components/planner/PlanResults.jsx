import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  InputAdornment,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import RouteIcon from "@mui/icons-material/Route";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import UmbrellaRoundedIcon from "@mui/icons-material/UmbrellaRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import DirectionsTransitRoundedIcon from "@mui/icons-material/DirectionsTransitRounded";

function inr(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function Section({ title, icon, children }) {
  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        border: "1px solid #e2eae4",
        borderRadius: { xs: 4, md: 5 },
        p: { xs: 2.2, sm: 3, md: 3.5 },
        mb: 3,
        boxShadow: "0 12px 32px rgba(25,45,35,.035)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.2 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2.5, display: "grid", placeItems: "center", bgcolor: "#eaf3ed", color: "#176e61" }}>{icon}</Box>
        <Typography variant="h6" fontWeight={800}>
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  );
}

function PlanBody({ plan, onBudgetSave, budgetSaving = false }) {
  const initialCosts = {
    long_distance_transport: Number(plan?.costs?.long_distance_transport || 0),
    local_transport: Number(plan?.costs?.local_transport || 0),
    accommodation: Number(plan?.costs?.accommodation || 0),
    food: Number(plan?.costs?.food || 0),
    activities_and_entry: Number(plan?.costs?.activities_and_entry || 0),
  };
  const [costDraft, setCostDraft] = useState(initialCosts);
  const [budgetSaved, setBudgetSaved] = useState(false);
  if (!plan) return null;

  const estimateTotal = Object.values(costDraft).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
  const maxBudget = Number(plan.max_budget || 0);
  const originalCosts = plan.costs || {};
  const isCostAdjusted = Object.entries(initialCosts).some(([key, value]) => Number(costDraft[key]) !== value);
  const editableItems = [
    ["long_distance_transport", "Long-distance transport"],
    ["local_transport", "Local transport"],
    ["accommodation", "Accommodation"],
    ["food", "Food"],
    ["activities_and_entry", "Activities & entry"],
  ];
  const saveBudget = async () => {
    const costs = { ...originalCosts, ...costDraft, transportation: Number(costDraft.long_distance_transport || 0) + Number(costDraft.local_transport || 0), total: estimateTotal };
    await onBudgetSave?.(costs);
    setBudgetSaved(true);
  };

  return (
    <>
      <Alert
        severity={plan.fits_budget ? "success" : "warning"}
        sx={{ mb: 3, borderRadius: 3, border: "1px solid #dcebe0", alignItems: "center" }}
      >
        {plan.budget_message} Stay style: {plan.stay_style}. Mode:{" "}
        {plan.travel_mode}. Window: {plan.travel_window?.start} to{" "}
        {plan.travel_window?.end} ({plan.travel_window?.days} days).
      </Alert>

      <Section title="Recommended destinations" icon={<RouteIcon color="action" />}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          {(plan.recommended_destinations || []).map((dest, index) => (
            <Box
              key={dest.id || dest.name}
              sx={{
                position: "relative",
                overflow: "hidden",
                border: "1px solid #e2eae4",
                borderRadius: 4,
                p: { xs: 2, md: 2.5 },
                bgcolor: "#fcfdfc",
                transition: "transform .2s, box-shadow .2s",
                "&:hover": { transform: "translateY(-3px)", boxShadow: "0 14px 28px rgba(26,55,41,.08)" },
              }}
            >
              <Typography variant="overline" color="text.secondary" fontWeight={700}>
                <PlaceRoundedIcon sx={{ fontSize: 15, verticalAlign: "middle", mr: .35 }} /> STOP {index + 1} · {dest.days} DAY{dest.days > 1 ? "S" : ""}
              </Typography>
              <Typography variant="h5" fontWeight={850} letterSpacing="-.035em">
                {dest.name}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                {dest.state} · {dest.region}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mb: 1.5 }}>
                {(dest.trip_types || []).slice(0, 4).map((type) => (
                  <Chip key={type} size="small" label={type} variant="outlined" />
                ))}
              </Box>
              <Typography fontWeight={700} sx={{ mb: 0.5 }}>
                Places to visit
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                {(dest.places || []).join(", ") || "See day-wise itinerary"}
              </Typography>
              <Typography fontWeight={700} sx={{ mb: 0.5 }}>
                Suggested experiences
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                {(dest.activities || []).join(", ")}
              </Typography>
              {(dest.reasons || []).map((reason) => (
                <Typography key={reason} variant="body2" color="text.secondary">
                  • {reason}
                </Typography>
              ))}
            </Box>
          ))}
        </Box>
      </Section>

      <Section title="Efficient travel sequence" icon={<RouteIcon color="action" />}>
        {(plan.route || []).map((leg, index) => (
          <Box
            key={`${leg.from}-${leg.to}-${index}`}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              py: 1.2,
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <Typography fontWeight={600}>
              {index + 1}. {leg.from} → {leg.to}
            </Typography>
            <Typography color="text.secondary">
              {leg.distance_km} km · {leg.mode} · {inr(leg.estimated_cost)}
            </Typography>
          </Box>
        ))}
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          This order is chosen to reduce unnecessary backtracking from your
          starting point.
        </Typography>
      </Section>

      <Section title="Day-wise itinerary">
        {(plan.itinerary || []).map((day, index) => (
          <Box key={`${day.date}-${index}`} sx={{ mb: 2.5 }}>
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "stretch", mb: 1.5, p: { xs: 1.4, sm: 1.7 }, borderRadius: 3, bgcolor: "#f7faf8", border: "1px solid #edf1ee" }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}><Box sx={{ minWidth: 40, height: 40, px: .8, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: "#e2f0e8", color: "#176e61", fontWeight: 850 }}>{String(index + 1).padStart(2, "0")}</Box>{index < (plan.itinerary || []).length - 1 && <Box sx={{ width: 2, flex: 1, minHeight: 16, mt: .6, bgcolor: "#dce9e1" }} />}</Box>
              <Box sx={{ flex: 1, pb: .8 }}><Typography variant="caption" color="text.secondary" fontWeight={750} letterSpacing=".06em">{day.date} · {day.destination}</Typography><Typography variant="h6" fontWeight={820} sx={{ mt: .3 }}>{day.title}</Typography>
            {day.places?.length > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.7, lineHeight: 1.65 }}>
                <b>Places</b> · {day.places.join(" · ")}
              </Typography>
            )}
            {day.activities?.length > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: .35, lineHeight: 1.65 }}>
                <b>Experiences</b> · {day.activities.join(" · ")}
              </Typography>
            )}</Box></Box>
          </Box>
        ))}
      </Section>

      <Section
        title="Estimated trip cost"
        icon={<AccountBalanceWalletIcon color="action" />}
      >
        {onBudgetSave && <Alert severity="info" sx={{ mb: 2, borderRadius: 2.5 }}>Adjust these planning estimates to match your choices. They are estimates, not live booking quotes.</Alert>}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(3,1fr)" }, gap: 1.4 }}>
          {editableItems.map(([key, label]) => <Box key={key} sx={{ p: 1.5, border: "1px solid #e6ece8", borderRadius: 3, bgcolor: "#fbfdfb" }}>
            {onBudgetSave ? <TextField fullWidth size="small" type="number" label={label} value={costDraft[key]} onChange={(event) => { setCostDraft((current) => ({ ...current, [key]: event.target.value })); setBudgetSaved(false); }} inputProps={{ min: 0, step: 500 }} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} /> : <><Typography variant="body2" color="text.secondary">{label}</Typography><Typography variant="h6" fontWeight={800}>{inr(costDraft[key])}</Typography></>}
          </Box>)}
        </Box>
        <Box sx={{ mt: 2.2, p: { xs: 2, md: 2.5 }, borderRadius: 3.5, color: "white", background: "linear-gradient(110deg,#15584e,#1c7666)" }}><Typography variant="overline" sx={{ color: "rgba(255,255,255,.7)", fontWeight: 750, letterSpacing: ".08em" }}>ADJUSTED TRIP ESTIMATE</Typography><Typography variant="h4" fontWeight={850} sx={{ letterSpacing: "-.04em" }}>{inr(estimateTotal)}</Typography><Typography sx={{ color: "rgba(255,255,255,.78)", mt: .4 }}>Maximum budget: {inr(maxBudget)} · {estimateTotal <= maxBudget ? `${inr(maxBudget - estimateTotal)} remaining` : `${inr(estimateTotal - maxBudget)} over budget`}</Typography>
          {maxBudget > 0 && <LinearProgress variant="determinate" value={Math.min(100, estimateTotal / maxBudget * 100)} sx={{ height: 7, mt: 1.5, borderRadius: 5, bgcolor: "rgba(255,255,255,.22)", "& .MuiLinearProgress-bar": { bgcolor: estimateTotal > maxBudget ? "#ffc6a6" : "#f2c894", borderRadius: 5 } }} />}
        </Box>
        {onBudgetSave && <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap", mt: 1.5 }}><Typography variant="caption" color="text.secondary">Assumptions: per-trip totals based on your route, duration, and traveler count.</Typography><Button onClick={saveBudget} disabled={!isCostAdjusted || budgetSaving} startIcon={<CheckCircleRoundedIcon />} variant="contained" sx={{ borderRadius: 2, textTransform: "none", bgcolor: "#176e61" }}>{budgetSaving ? "Saving estimate…" : budgetSaved ? "Estimate saved" : "Save adjusted estimate"}</Button></Box>}
      </Section>

      <Section title="Weather & season suitability" icon={<WbSunnyIcon color="action" />}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)" }, gap: 1.5 }}>
          {(plan.weather || []).map((item) => (
            <Box key={item.destination} sx={{ p: { xs: 1.8, sm: 2.2 }, border: "1px solid #e5ece7", borderRadius: 3.5, background: "linear-gradient(145deg,#fbfdfb,#f5f9f6)" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, mb: 1.5 }}>
                <Typography variant="h6" fontWeight={850}>{item.destination}</Typography>
                <Chip size="small" icon={<WbSunnyIcon />} label="Season guide" sx={{ bgcolor: "#fff6df", color: "#8a681b", fontWeight: 700, "& .MuiChip-icon": { color: "#d99a27" } }} />
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 1.2 }}>
                <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: "white", border: "1px solid #edf1ee" }}><Typography variant="caption" color="text.secondary">TEMPERATURE</Typography><Typography variant="body2" fontWeight={750} sx={{ mt: .3 }}>{(item.temperatures || []).join(" · ") || "Check locally"}</Typography></Box>
                <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: "white", border: "1px solid #edf1ee" }}><Typography variant="caption" color="text.secondary">RAINFALL</Typography><Typography variant="body2" fontWeight={750} sx={{ mt: .3, display: "flex", alignItems: "center", gap: .4 }}><UmbrellaRoundedIcon sx={{ color: "#4383a2", fontSize: 17 }} />{item.rainfall || "Seasonal"}</Typography></Box>
              </Box>
              <Typography variant="body2" sx={{ mb: .5 }}><b>Best season</b> · {item.peak_season || "Varies by destination"}</Typography>
              <Typography variant="body2" color="text.secondary"><b>Quieter months</b> · {item.off_season || "Check local conditions"}</Typography>
              {(item.suitability || []).length > 0 && <Box sx={{ mt: 1.2, p: 1.2, borderRadius: 2.5, bgcolor: "#edf6ef", color: "#385e48" }}>{item.suitability.map((note) => <Typography key={note} variant="body2" sx={{ lineHeight: 1.6 }}>• {note}</Typography>)}</Box>}
            </Box>
          ))}
        </Box>
      </Section>

      <Section
        title="Safety information & precautions"
        icon={<HealthAndSafetyIcon color="action" />}
      >
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)" }, gap: 1.5 }}>
          {(plan.safety || []).map((item) => (
            <Box key={item.destination} sx={{ p: { xs: 1.8, sm: 2.2 }, border: "1px solid #e5ece7", borderRadius: 3.5, bgcolor: "#fcfdfc" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 1.3 }}>
                <Typography variant="h6" fontWeight={850}>{item.destination}</Typography>
                <Chip size="small" icon={<ShieldRoundedIcon />} label={`Safety ${item.safety_rating ?? "—"}/10`} sx={{ bgcolor: "#eaf4ed", color: "#356848", fontWeight: 800, "& .MuiChip-icon": { color: "#4d8b60" } }} />
              </Box>
              <Alert severity="info" icon={<HealthAndSafetyIcon />} sx={{ mb: 1.2, borderRadius: 2.5, bgcolor: "#f0f6f8", color: "#385965", border: "1px solid #e0ebee", "& .MuiAlert-icon": { color: "#4b8190" } }}>{item.safety_notes || "Review local guidance before departure and stay aware of your surroundings."}</Alert>
              {item.special_considerations && <Box sx={{ display: "flex", gap: 1, p: 1.2, mb: 1.2, borderRadius: 2.5, bgcolor: "#fff7e9", border: "1px solid #f1e4c9" }}><HealthAndSafetyIcon sx={{ color: "#ae7b29", fontSize: 19, mt: .15 }} /><Typography variant="body2" sx={{ color: "#674e25", lineHeight: 1.6 }}><b>Precaution</b> · {item.special_considerations}</Typography></Box>}
              <Box sx={{ display: "grid", gap: .7 }}>
                <Typography variant="body2" color="text.secondary"><b>Permits</b> · {item.permits_details || "Check requirements before travel"}</Typography>
                <Typography variant="body2" color="text.secondary"><b>Getting around</b> · {item.accessibility || "Access varies"} · Roads: {item.road_connectivity || "Check route conditions"}</Typography>
                {item.local_customs && <Typography variant="body2" color="text.secondary"><b>Local customs</b> · {item.local_customs}</Typography>}
              </Box>
            </Box>
          ))}
        </Box>
      </Section>
    </>
  );
}

function PlanResults({ result, onSave, saved, saving = false, onBudgetSave, budgetSaving = false }) {
  if (!result || result.error) {
    return result?.error ? (
      <Alert severity="error" sx={{ borderRadius: "12px" }}>
        {result.error}
      </Alert>
    ) : null;
  }

  const { analysis, plan, alternatives, emergency_contacts } = result;

  return (
    <Box>
      <Box sx={{ position: "relative", overflow: "hidden", mb: 3, p: { xs: 2.5, sm: 3.5, md: 4.5 }, borderRadius: { xs: 4, md: 6 }, color: "white", background: "radial-gradient(ellipse at 92% 2%,rgba(192,225,204,.22),transparent 34%),linear-gradient(120deg,#123e38,#1d675a)" }}>
        <Box sx={{ position: "absolute", right: -85, bottom: -190, width: 340, height: 340, border: "1px solid rgba(255,255,255,.14)", borderRadius: "50%", boxShadow: "0 0 0 34px rgba(255,255,255,.035),0 0 0 70px rgba(255,255,255,.025)" }} />
        <Box sx={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ maxWidth: 650 }}><Chip icon={<CheckCircleRoundedIcon sx={{ color: "#f2c894 !important" }} />} label="YOUR PLAN IS READY" size="small" sx={{ mb: 1.6, color: "white", bgcolor: "rgba(255,255,255,.12)", fontWeight: 750, letterSpacing: ".07em" }} /><Typography variant="h3" fontWeight={850} sx={{ fontSize: { xs: "2rem", md: "2.8rem" }, letterSpacing: "-.05em", lineHeight: 1.08 }}>Your personalized journey</Typography><Typography sx={{ mt: .9, color: "rgba(255,255,255,.76)" }}>A route and itinerary shaped around your travel brief.</Typography></Box>
          <Button variant="contained" onClick={onSave} disabled={saved || saving} startIcon={saved ? <CheckCircleRoundedIcon /> : <AutoAwesomeRoundedIcon />} sx={{ position: "relative", textTransform: "none", borderRadius: 3, px: 2.3, py: 1.2, fontWeight: 800, color: "#185448", bgcolor: "#fff", boxShadow: "0 8px 22px rgba(0,0,0,.12)", "&:hover": { bgcolor: "#f0f7f2" }, "&.Mui-disabled": { color: "#55756a", bgcolor: "#e9f1ec" } }}>{saved ? "Saved to My Trips" : saving ? "Saving your trip…" : "Save this trip"}</Button>
        </Box>
        <Box sx={{ position: "relative", display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3,1fr)" }, gap: 1.2, mt: 3.2, maxWidth: 750 }}>
          {[[<CalendarMonthRoundedIcon key="duration-icon" />, `${plan.travel_window?.days || 0} days`, "Travel duration"], [<PlaceRoundedIcon key="route-icon" />, `${(plan.recommended_destinations || []).length} stops`, "Recommended route"], [<AccountBalanceWalletIcon key="cost-icon" />, inr(plan.costs?.total), "Estimated total"]].map(([icon, value, label]) => <Box key={label} sx={{ p: 1.5, borderRadius: 3, bgcolor: "rgba(255,255,255,.095)", border: "1px solid rgba(255,255,255,.1)" }}><Box sx={{ display: "flex", alignItems: "center", gap: .7, color: "#f2c894", mb: .7 }}>{icon}<Typography variant="caption" sx={{ color: "rgba(255,255,255,.72)" }}>{label}</Typography></Box><Typography variant="h6" fontWeight={850}>{value}</Typography></Box>)}
        </Box>
      </Box>

      {analysis?.notes && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: "12px" }}>
          {(analysis.notes || []).join(" ")}
          {analysis.history_used ? " Previous travel history was included." : ""}
        </Alert>
      )}

      <PlanBody plan={plan} onBudgetSave={onBudgetSave} budgetSaving={budgetSaving} />

      {(!plan?.fits_budget ||
        alternatives?.destinations?.length > 0 ||
        alternatives?.budget_fit_plan) && (
        <Section title="Alternatives if this exceeds your budget" icon={<SavingsRoundedIcon />}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.6 }}>A few flexible swaps can bring the estimate closer to your budget while keeping the spirit of the trip.</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)" }, gap: 1.2 }}>
          {(alternatives?.travel_options || []).map((option) => (
            <Box key={option.title} sx={{ display: "flex", gap: 1.2, p: 1.6, border: "1px solid #e5ece7", borderRadius: 3, bgcolor: "#fbfdfb" }}>
              <Box sx={{ width: 34, height: 34, flexShrink: 0, borderRadius: 2, display: "grid", placeItems: "center", bgcolor: "#edf5ef", color: "#477552" }}><DirectionsTransitRoundedIcon fontSize="small" /></Box>
              <Box><Typography fontWeight={800}>{option.title}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .3 }}>{option.detail}</Typography></Box>
            </Box>
          ))}
          {(alternatives?.activities || []).map((item) => (
            <Box key={item.destination} sx={{ p: 1.6, border: "1px solid #e5ece7", borderRadius: 3, bgcolor: "#fbfdfb" }}><Typography fontWeight={800}>{item.destination}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .3 }}>Try this lower-cost swap · {item.swap}</Typography></Box>
          ))}
          </Box>
          {alternatives?.destinations?.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography fontWeight={700} sx={{ mb: 1 }}>
                Alternative destinations
              </Typography>
              {alternatives.destinations.map((dest) => (
                <Typography key={dest.id || dest.name} sx={{ mb: 0.8 }}>
                  {dest.name} ({dest.state}) — {(dest.reasons || [])[0] || dest.why}
                </Typography>
              ))}
            </Box>
          )}
        </Section>
      )}

      {alternatives?.budget_fit_plan && (
        <>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
            Budget-fit alternative plan
          </Typography>
          <PlanBody plan={alternatives.budget_fit_plan} />
        </>
      )}

      <Section title="Emergency & contact information" icon={<HealthAndSafetyIcon />}>
        <Alert severity="warning" icon={<HealthAndSafetyIcon />} sx={{ mb: 2, borderRadius: 3, bgcolor: "#fff7e9", color: "#694a1b", border: "1px solid #f1e0bd", "& .MuiAlert-icon": { color: "#b57c2e" } }}>Save these local and national support numbers before you set out. Availability can vary by area.</Alert>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3,1fr)" }, gap: 1.2 }}>
          {(emergency_contacts || []).map((contact, index) => (
            <Box key={contact.number} sx={{ p: { xs: 1.6, md: 1.9 }, borderRadius: 3.2, border: index === 0 ? "1px solid #f0d5d3" : "1px solid #e6ece8", bgcolor: index === 0 ? "#fff8f7" : "#fbfcfb" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={750} letterSpacing=".04em">{contact.name}</Typography>
              <Typography variant="h4" fontWeight={900} letterSpacing="-.04em" sx={{ my: .5, color: index === 0 ? "#b64540" : "#185a4e" }}>{contact.number}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40, lineHeight: 1.5 }}>{contact.when}</Typography>
              <Button component="a" href={`tel:${String(contact.number).replace(/[^\d+]/g, "")}`} size="small" startIcon={<CallRoundedIcon />} sx={{ mt: .8, px: 0, textTransform: "none", fontWeight: 750, color: index === 0 ? "#a54440" : "#176e61" }}>Call {contact.number}</Button>
            </Box>
          ))}
        </Box>
      </Section>
    </Box>
  );
}

export default PlanResults;
