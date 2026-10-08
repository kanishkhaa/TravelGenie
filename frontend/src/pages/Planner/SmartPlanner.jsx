import { useEffect, useRef, useState } from "react";

import { Alert, Box, Chip, Container, Typography } from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import RouteRoundedIcon from "@mui/icons-material/RouteRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";

import PlannerForm from "../../components/planner/PlannerForm";
import PlanResults from "../../components/planner/PlanResults";
import {
  generateTravelPlan,
  getPlannerOptions,
  getPlannerDraft,
  getSavedPlans,
  savePlannerDraft,
  saveFullPlan,
  updateSavedPlan,
} from "../../services/plannerService";
import { getFavorites } from "../../services/favoriteService";

const INITIAL_FORM = {
  starting_location: "Delhi",
  destination: "Anywhere in India",
  start_date: "",
  end_date: "",
  duration_days: "6",
  max_budget: "60000",
  travelers: "2",
  interests: ["Nature", "Cultural"],
  pace: "Balanced",
  stay_style: "Mid-range",
  group_type: "Friends",
  crowd_preference: "Mix",
  travel_mode: "Mixed",
  preferred_destinations: [],
};

const dateToIso = (value) => {
  if (!value) return null;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return date.getUTCFullYear() === Number(year) && date.getUTCMonth() === Number(month) - 1 && date.getUTCDate() === Number(day)
    ? `${year}-${month}-${day}`
    : null;
};

const dateToDisplay = (value) => {
  if (!value) return "";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
};

function SmartPlanner() {
  const [destinationFromExplore] = useState(() => {
    try {
      const selected = JSON.parse(localStorage.getItem("travelgenie_planner_destination") || "null");
      localStorage.removeItem("travelgenie_planner_destination");
      return selected;
    } catch { return null; }
  });
  const [form, setForm] = useState(() => destinationFromExplore?.name ? {
    ...INITIAL_FORM,
    destination: destinationFromExplore.name,
    preferred_destinations: [destinationFromExplore.name],
  } : INITIAL_FORM);
  const [options, setOptions] = useState({});
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [savedTrip, setSavedTrip] = useState(null);
  const [budgetSaving, setBudgetSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileContext, setProfileContext] = useState(null);
  const [favoriteDestinations, setFavoriteDestinations] = useState([]);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftError, setDraftError] = useState("");
  const draftTimer = useRef(null);

  useEffect(() => {
    let active = true;
    const loadPreferences = async () => {
      const [plannerOptions] = await Promise.allSettled([getPlannerOptions()]);
      if (!active) return;
      setOptions(plannerOptions.status === "fulfilled" ? plannerOptions.value : {});
      let combinedHistory = [];
      const token = localStorage.getItem("access_token");
      if (token) {
        const [profileRequest, tripsRequest, favoritesRequest, draftRequest] = await Promise.allSettled([
          fetch("http://127.0.0.1:8000/profile/me", { headers: { Authorization: `Bearer ${token}` } }),
          getSavedPlans(),
          getFavorites(),
          getPlannerDraft(),
        ]);
        if (!active) return;
        if (favoritesRequest.status === "fulfilled") {
          setFavoriteDestinations(favoritesRequest.value);
          setForm((current) => ({ ...current, preferred_destinations: favoritesRequest.value.map((item) => item.destination_name) }));
        }
        if (profileRequest.status === "fulfilled") {
          const profileResponse = profileRequest.value;
          const profileData = await profileResponse.json().catch(() => ({}));
          if (profileResponse.ok && profileData.profile) {
            const profile = profileData.profile;
            setProfileContext(profile);
            const range = (profile.duration || "").match(/\d+/g) || [];
            const days = range.length ? Math.round(range.slice(0, 2).map(Number).reduce((sum, value) => sum + value, 0) / Math.min(range.length, 2)) : 6;
            const amounts = (profile.budget || "").match(/\d[\d,]*/g) || [];
            const amountValues = amounts.map((value) => Number(value.replaceAll(",", "")));
            let perPersonBudget = amountValues.length > 1 ? (amountValues[0] + amountValues[1]) / 2 : amountValues[0] || 30000;
            if (/below/i.test(profile.budget || "")) perPersonBudget *= .8;
            if (/above/i.test(profile.budget || "")) perPersonBudget *= 1.25;
            const travelers = (profile.travelTypes || []).some((value) => value.toLowerCase() === "solo") ? 1 : (profile.travelTypes || []).some((value) => value.toLowerCase() === "family") ? 4 : (profile.travelTypes || []).some((value) => value.toLowerCase().includes("couple")) ? 2 : 2;
            const interests = [...new Set([...(profile.travelStyle || []), ...(profile.destinations || []), ...(profile.activities || [])])];
            setForm((current) => ({
              ...current,
              starting_location: profile.city || current.starting_location,
              duration_days: String(days),
              max_budget: String(Math.round(perPersonBudget * travelers)),
              travelers: String(travelers),
              interests: interests.length ? interests : current.interests,
              group_type: travelers === 1 ? "Solo" : travelers === 4 ? "Family" : (profile.travelTypes || []).some((value) => value.toLowerCase().includes("couple")) ? "Couple" : "Friends",
              stay_style: (profile.accommodationBudget || "").toLowerCase().includes("luxury") || (profile.travelStyle || []).some((value) => value.toLowerCase() === "luxury") ? "Luxury" : (profile.accommodationBudget || "").toLowerCase().includes("budget") || (profile.travelStyle || []).some((value) => value.toLowerCase() === "budget") ? "Budget" : current.stay_style,
              travel_mode: (profile.transportation || []).some((value) => value.toLowerCase().includes("flight")) ? "Flight" : (profile.transportation || []).some((value) => value.toLowerCase().includes("train")) ? "Train" : current.travel_mode,
            }));
          }
        }
        if (tripsRequest.status === "fulfilled") {
          const pastTrips = tripsRequest.value.filter((trip) => trip.status === "completed").map((trip) => ({
            destination_names: (trip.result?.plan?.recommended_destinations || []).map((item) => item.name),
            destination_ids: (trip.result?.plan?.recommended_destinations || []).map((item) => item.id),
            interests: trip.form?.interests || [],
          }));
          combinedHistory = [...pastTrips, ...combinedHistory].slice(0, 20);
        }
        if (draftRequest.status === "fulfilled" && draftRequest.value) {
          const draft = draftRequest.value;
          setForm((current) => ({ ...current, ...draft, ...(destinationFromExplore?.name ? { destination: destinationFromExplore.name, preferred_destinations: [...new Set([...(draft.preferred_destinations || []), destinationFromExplore.name])] } : {}), start_date: dateToDisplay(draft.start_date), end_date: dateToDisplay(draft.end_date) }));
        }
      }
      if (active) {
        setHistory(combinedHistory);
        setDraftLoaded(true);
      }
    };
    loadPreferences();
    return () => { active = false; };
  }, [destinationFromExplore]);

  useEffect(() => {
    if (!draftLoaded || !localStorage.getItem("access_token")) return undefined;
    clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      savePlannerDraft(form).then(() => setDraftError("")).catch(() => setDraftError("Your planner changes could not be synced. They’ll retry when you edit again."));
    }, 650);
    return () => clearTimeout(draftTimer.current);
  }, [form, draftLoaded]);

  useEffect(() => () => clearTimeout(draftTimer.current), []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);
    setSavedTrip(null);
    setSaveError("");
    setResult(null);

    const startDate = dateToIso(form.start_date);
    const endDate = dateToIso(form.end_date);
    if ((form.start_date && !startDate) || (form.end_date && !endDate)) {
      setError("Enter travel dates in DD/MM/YYYY format, for example 08/10/2026.");
      setLoading(false);
      return;
    }
    if (startDate && endDate && endDate < startDate) {
      setError("Your return date must be on or after your departure date.");
      setLoading(false);
      return;
    }
    if (!Number.isFinite(Number(form.max_budget)) || Number(form.max_budget) <= 0 || !Number.isFinite(Number(form.travelers)) || Number(form.travelers) < 1) {
      setError("Enter a valid trip budget and at least one traveler.");
      setLoading(false);
      return;
    }

    const payload = {
      starting_location: form.starting_location,
      destination: form.destination || "Anywhere in India",
      start_date: startDate,
      end_date: endDate,
      duration_days: form.duration_days ? Number(form.duration_days) : null,
      max_budget: Number(form.max_budget),
      travelers: Number(form.travelers),
      interests: form.interests,
      pace: form.pace,
      stay_style: form.stay_style,
      group_type: form.group_type,
      crowd_preference: form.crowd_preference,
      travel_mode: form.travel_mode,
      previous_trips: history,
      preferred_destinations: form.preferred_destinations,
    };

    try {
      const data = await generateTravelPlan(payload);
      setResult(data);
      try {
        const trip = await saveFullPlan(data, { ...form, start_date: startDate, end_date: endDate });
        setSavedTrip(trip);
        setSaved(true);
        setSaveError("");
      } catch (saveReason) {
        setSaveError(saveReason.message || "The plan was generated, but could not be saved to your account.");
      }
    } catch (reason) {
      setError(reason.message || "We couldn’t build this itinerary. Check the trip details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 72px)",
        background: "linear-gradient(180deg,#edf4f0 0%,#f7f9f7 390px,#f5f8f6 100%)",
        py: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ position: "relative", overflow: "hidden", mb: 3.5, p: { xs: 3, sm: 4, md: 5.5 }, borderRadius: { xs: 5, md: 7 }, color: "#fff", background: "radial-gradient(ellipse at 88% 3%,rgba(183,220,196,.28),transparent 34%),linear-gradient(120deg,#123e38,#1d675a)" }}>
          <Box sx={{ position: "absolute", right: { xs: -100, md: 80 }, bottom: -220, width: 410, height: 410, border: "1px solid rgba(255,255,255,.15)", borderRadius: "50%", boxShadow: "0 0 0 38px rgba(255,255,255,.035),0 0 0 82px rgba(255,255,255,.025)" }} />
          <Box sx={{ position: "relative", maxWidth: 790 }}>
            <Chip icon={<AutoAwesomeRoundedIcon sx={{ color: "#f2c894 !important" }} />} label="YOUR NEXT GETAWAY" sx={{ color: "#f4f8f5", bgcolor: "rgba(255,255,255,.11)", mb: 2.2, fontWeight: 750, letterSpacing: ".06em" }} />
            <Typography variant="h2" fontWeight={850} sx={{ letterSpacing: "-.06em", lineHeight: 1.05, fontSize: { xs: "2.45rem", md: "3.7rem" } }}>Make a trip<br />that feels like you.</Typography>
            <Typography sx={{ mt: 1.8, maxWidth: 670, color: "rgba(248,251,249,.78)", fontSize: { xs: ".98rem", md: "1.06rem" }, lineHeight: 1.75 }}>Bring your budget, travel style, and favorite places. We’ll map out a considered itinerary with destinations, day plans, estimated costs, weather, and safety notes.</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2.5 }}>
              <Chip icon={<RouteRoundedIcon sx={{ color: "#f3c794 !important" }} />} label={`${form.duration_days || 6} day journey`} sx={{ bgcolor: "rgba(255,255,255,.1)", color: "white", fontWeight: 650 }} />
              <Chip icon={<AccountBalanceWalletRoundedIcon sx={{ color: "#f3c794 !important" }} />} label={`₹${Number(form.max_budget || 0).toLocaleString("en-IN")} budget`} sx={{ bgcolor: "rgba(255,255,255,.1)", color: "white", fontWeight: 650 }} />
              {profileContext && <Chip label={`Personalized${profileContext.city ? ` · ${profileContext.city}` : " from your profile"}`} sx={{ bgcolor: "rgba(255,255,255,.1)", color: "white", fontWeight: 650 }} />}
            </Box>
          </Box>
        </Box>

        <PlannerForm
          form={form}
          setForm={setForm}
          options={options}
          loading={loading}
          onSubmit={handleSubmit}
          history={history}
          favoriteDestinations={favoriteDestinations}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 3, borderRadius: "12px" }}>
            {error}
          </Alert>
        )}

        {result && (
          <Box sx={{ mt: { xs: 4, md: 6 } }}>
            <PlanResults
              result={result}
              saved={saved}
              saving={saving}
              onSave={async () => {
                setSaving(true);
                setSaveError("");
                try {
                  const trip = await saveFullPlan(result, { ...form, start_date: dateToIso(form.start_date), end_date: dateToIso(form.end_date) });
                  setSavedTrip(trip);
                  setSaved(true);
                } catch (reason) {
                  setSaveError(reason.message || "Your plan could not be saved.");
                } finally {
                  setSaving(false);
                }
              }}
              budgetSaving={budgetSaving}
              onBudgetSave={async (costs) => {
                setBudgetSaving(true);
                setSaveError("");
                const adjustedResult = { ...result, plan: { ...result.plan, costs } };
                try {
                  const trip = savedTrip
                    ? await updateSavedPlan({ ...savedTrip, result: adjustedResult })
                    : await saveFullPlan(adjustedResult, { ...form, start_date: dateToIso(form.start_date), end_date: dateToIso(form.end_date) });
                  setResult(adjustedResult);
                  setSavedTrip(trip);
                  setSaved(true);
                } catch (reason) {
                  setSaveError(reason.message || "The adjusted estimate could not be saved.");
                  throw reason;
                } finally {
                  setBudgetSaving(false);
                }
              }}
            />
            {saveError && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{saveError}</Alert>}
            {draftError && <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>{draftError}</Alert>}
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default SmartPlanner;
