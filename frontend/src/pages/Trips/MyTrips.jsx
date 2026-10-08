import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert, Box, Button, Chip, Container, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, MenuItem, Paper, Skeleton, Tabs, Tab, TextField, Typography, Collapse,
} from "@mui/material";
import AddLocationAltOutlinedIcon from "@mui/icons-material/AddLocationAltOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import LuggageOutlinedIcon from "@mui/icons-material/LuggageOutlined";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import DownloadForOfflineRoundedIcon from "@mui/icons-material/DownloadForOfflineRounded";
import { completeSavedPlan, createTripInvite, deleteSavedPlan, getSavedPlans, updateSavedPlan } from "../../services/plannerService";
import { downloadOfflineTripPack } from "../../services/offlineTripPackService";

const cardSx = { border: "1px solid #e6e9ed", borderRadius: "20px", background: "#fff", boxShadow: "0 8px 30px rgba(20, 35, 55, .04)" };
const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Dates not set";
const clone = (value) => JSON.parse(JSON.stringify(value));

function TripEditor({ trip, onClose, onSave, busy }) {
  const [draft, setDraft] = useState(() => clone(trip));
  const setForm = (name, value) => setDraft((current) => ({ ...current, form: { ...current.form, [name]: value } }));
  const setDay = (index, name, value) => setDraft((current) => {
    const itinerary = [...(current.result?.plan?.itinerary || [])];
    itinerary[index] = { ...itinerary[index], [name]: value };
    return { ...current, result: { ...current.result, plan: { ...current.result.plan, itinerary } } };
  });
  const listText = (values) => (values || []).join(", ");
  const parseList = (value) => value.split(",").map((item) => item.trim()).filter(Boolean);

  return <Dialog open onClose={onClose} fullWidth maxWidth="md" scroll="paper">
    <DialogTitle sx={{ fontWeight: 800, pb: 0.5 }}>Edit your itinerary</DialogTitle>
    <DialogContent dividers sx={{ bgcolor: "#f8faf9" }}>
      <Typography color="text.secondary" sx={{ mb: 2.5 }}>Personalize the trip details and day-by-day plan. Changes are saved to your account.</Typography>
      <Paper sx={{ ...cardSx, p: { xs: 2, sm: 3 }, mb: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>Trip details</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <TextField label="Trip name" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} fullWidth />
          <TextField select label="Travel pace" value={draft.form?.pace || "Balanced"} onChange={(event) => setForm("pace", event.target.value)} fullWidth>
            {["Relaxed", "Balanced", "Fast-paced"].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
          </TextField>
          <TextField label="Starting point" value={draft.form?.starting_location || ""} onChange={(event) => setForm("starting_location", event.target.value)} fullWidth />
          <TextField label="Destination" value={draft.form?.destination || ""} onChange={(event) => setForm("destination", event.target.value)} fullWidth />
          <TextField label="Start date" type="date" InputLabelProps={{ shrink: true }} value={draft.form?.start_date || ""} onChange={(event) => setForm("start_date", event.target.value)} fullWidth />
          <TextField label="End date" type="date" InputLabelProps={{ shrink: true }} value={draft.form?.end_date || ""} onChange={(event) => setForm("end_date", event.target.value)} fullWidth />
          <TextField label="Budget (₹)" type="number" value={draft.form?.max_budget || ""} onChange={(event) => setForm("max_budget", event.target.value)} fullWidth />
          <TextField label="Travelers" type="number" value={draft.form?.travelers || ""} onChange={(event) => setForm("travelers", event.target.value)} fullWidth />
          <TextField label="Notes for this trip" value={draft.notes || ""} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} multiline minRows={2} fullWidth sx={{ gridColumn: { sm: "1 / -1" } }} />
        </Box>
      </Paper>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>Day-by-day itinerary</Typography>
      {(draft.result?.plan?.itinerary || []).map((day, index) => <Paper key={`${day.date}-${index}`} sx={{ ...cardSx, p: { xs: 2, sm: 3 }, mb: 1.5 }}>
        <Typography variant="overline" color="primary" fontWeight={800}>DAY {index + 1}{day.date ? ` · ${day.date}` : ""}</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mt: 0.5 }}>
          <TextField label="Destination" value={day.destination || ""} onChange={(event) => setDay(index, "destination", event.target.value)} fullWidth />
          <TextField label="Day title" value={day.title || ""} onChange={(event) => setDay(index, "title", event.target.value)} fullWidth />
          <TextField label="Places (comma separated)" value={listText(day.places)} onChange={(event) => setDay(index, "places", parseList(event.target.value))} fullWidth />
          <TextField label="Activities (comma separated)" value={listText(day.activities)} onChange={(event) => setDay(index, "activities", parseList(event.target.value))} fullWidth />
        </Box>
      </Paper>)}
    </DialogContent>
    <DialogActions sx={{ p: 2, px: 3 }}>
      <Button onClick={onClose} sx={{ textTransform: "none", color: "text.secondary" }}>Cancel</Button>
      <Button variant="contained" disabled={busy || !draft.title.trim()} onClick={() => onSave(draft)} sx={{ textTransform: "none", borderRadius: 2, px: 3 }}>{busy ? "Saving…" : "Save changes"}</Button>
    </DialogActions>
  </Dialog>;
}

function TripCard({ trip, onEdit, onDelete, onComplete, onShare, onDownload, busy }) {
  const [expanded, setExpanded] = useState(false);
  const plan = trip.result?.plan;
  const destinations = (plan?.recommended_destinations || []).map((item) => item.name);
  const total = plan?.costs?.total;
  return <Paper sx={{ ...cardSx, overflow: "hidden" }}>
    <Box sx={{ height: 7, background: trip.status === "completed" ? "linear-gradient(90deg,#7c9b75,#b5c9aa)" : "linear-gradient(90deg,#0e766e,#55a79a)" }} />
    <Box sx={{ p: { xs: 2.5, md: 3 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "flex-start", flexWrap: "wrap" }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap", mb: 0.8 }}>
            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: "-.03em" }}>{trip.title || destinations.join(" · ") || "India getaway"}</Typography>
            <Chip size="small" icon={trip.status === "completed" ? <CheckCircleOutlineRoundedIcon /> : <LuggageOutlinedIcon />} label={trip.status === "completed" ? "Travel history" : "Planned"} sx={{ bgcolor: trip.status === "completed" ? "#eef5ec" : "#e9f5f3", color: trip.status === "completed" ? "#55734d" : "#0e766e", fontWeight: 700 }} />
            {trip.shared_with_me && <Chip size="small" label="Shared with you" sx={{ bgcolor: "#f0edf7", color: "#68548d", fontWeight: 700 }} />}
            {!trip.shared_with_me && trip.collaborator_count > 0 && <Chip size="small" label={`${trip.collaborator_count} collaborator${trip.collaborator_count === 1 ? "" : "s"}`} sx={{ bgcolor: "#f0edf7", color: "#68548d", fontWeight: 700 }} />}
          </Box>
          <Typography color="text.secondary">{trip.form?.starting_location || "Starting point"} <ArrowForwardRoundedIcon sx={{ fontSize: 15, verticalAlign: "middle", mx: .4 }} /> {destinations.join(" · ") || trip.form?.destination || "Destination"}</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">Saved {formatDate(trip.saved_at)}</Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 2, sm: 4 } }}>
        <Box><Typography variant="caption" color="text.secondary">TRAVEL DATES</Typography><Typography fontWeight={700}>{trip.form?.start_date ? formatDate(trip.form.start_date) : "Flexible"}{trip.form?.end_date ? ` – ${formatDate(trip.form.end_date)}` : ""}</Typography></Box>
        <Box><Typography variant="caption" color="text.secondary">TRAVELERS</Typography><Typography fontWeight={700}>{trip.form?.travelers || 1} people</Typography></Box>
        <Box><Typography variant="caption" color="text.secondary">ESTIMATED COST</Typography><Typography fontWeight={700}>{money(total)} <Typography component="span" variant="caption" color="text.secondary">of {money(trip.form?.max_budget)}</Typography></Typography></Box>
        <Box><Typography variant="caption" color="text.secondary">DURATION</Typography><Typography fontWeight={700}>{trip.form?.duration_days || plan?.travel_window?.days || "—"} days</Typography></Box>
      </Box>
      {trip.notes && <Typography sx={{ mt: 2, color: "text.secondary" }}>{trip.notes}</Typography>}
      {plan?.itinerary?.length > 0 && <Box sx={{ display: "flex", flexWrap: "wrap", gap: .75, mt: 2 }}>{plan.itinerary.slice(0, 5).map((day, index) => <Chip key={`${day.date}-${index}`} size="small" variant="outlined" label={`Day ${index + 1} · ${day.destination || "Explore"}`} sx={{ borderColor: "#e3e8e6", color: "#53635f" }} />)}{plan.itinerary.length > 5 && <Chip size="small" label={`+${plan.itinerary.length - 5} days`} />}</Box>}
      {plan?.itinerary?.length > 0 && <>
        <Button onClick={() => setExpanded((value) => !value)} endIcon={<ExpandMoreRoundedIcon sx={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform .2s" }} />} sx={{ mt: 1, px: 0, textTransform: "none", fontWeight: 700 }}> {expanded ? "Hide full itinerary" : "View full itinerary"}</Button>
        <Collapse in={expanded}>
          <Box sx={{ mt: 1.5, p: { xs: 1.5, sm: 2.5 }, borderRadius: 3, bgcolor: "#f7f9f8" }}>
            {plan.itinerary.map((day, index) => <Box key={`${day.date}-${index}`} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "90px 1fr" }, gap: 1.5, py: 1.5, borderBottom: index < plan.itinerary.length - 1 ? "1px solid #e7ece9" : "none" }}>
              <Typography variant="overline" color="primary" fontWeight={800}>DAY {index + 1}{day.date ? ` · ${day.date}` : ""}</Typography>
              <Box><Typography fontWeight={800}>{day.title || day.destination || "Explore"}</Typography><Typography variant="body2" color="text.secondary">{[day.destination, ...(day.places || [])].filter(Boolean).join(" · ")}</Typography>{day.activities?.length > 0 && <Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Experiences: {day.activities.join(", ")}</Typography>}</Box>
            </Box>)}
          </Box>
        </Collapse>
      </>}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2.5 }}>
        <Button startIcon={<DownloadForOfflineRoundedIcon />} onClick={() => onDownload(trip)} sx={{ textTransform: "none", borderRadius: 2, color: "#426a58" }}>Offline trip pack</Button>
        {!trip.shared_with_me && trip.status !== "completed" && <Button startIcon={<ShareRoundedIcon />} onClick={() => onShare(trip)} disabled={busy} sx={{ textTransform: "none", borderRadius: 2, color: "#5e5681" }}>Invite collaborators</Button>}
        {trip.status !== "completed" && <Button startIcon={<EditOutlinedIcon />} variant="outlined" onClick={() => onEdit(trip)} sx={{ textTransform: "none", borderRadius: 2 }}>Edit itinerary</Button>}
        {trip.status !== "completed" && <Button startIcon={<CheckCircleOutlineRoundedIcon />} onClick={() => onComplete(trip)} disabled={busy} sx={{ textTransform: "none", borderRadius: 2, color: "#55734d" }}>Mark completed</Button>}
        {!trip.shared_with_me && <Button startIcon={<DeleteOutlineRoundedIcon />} onClick={() => onDelete(trip)} disabled={busy} sx={{ textTransform: "none", borderRadius: 2, color: "#9a5e58", ml: { sm: "auto" } }}>Delete</Button>}
      </Box>
    </Box>
  </Paper>;
}

export default function MyTrips({ onNavigate }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("access_token")));
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [editorTrip, setEditorTrip] = useState(null);
  const [tab, setTab] = useState("planned");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [shareTrip, setShareTrip] = useState(null);
  const [shareBusy, setShareBusy] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [inviteNotice, setInviteNotice] = useState(() => sessionStorage.getItem("trip_invite_notice") || "");
  const refresh = useCallback(async () => {
    try { setPlans(await getSavedPlans()); }
    catch (reason) { setError(reason.message || "Your trips could not be loaded."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    if (!localStorage.getItem("access_token")) return undefined;
    let active = true;
    getSavedPlans().then((savedPlans) => { if (active) setPlans(savedPlans); })
      .catch((reason) => { if (active) setError(reason.message || "Your trips could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const isAuthenticated = Boolean(localStorage.getItem("access_token"));

  const counts = useMemo(() => ({ planned: plans.filter((trip) => trip.status !== "completed").length, completed: plans.filter((trip) => trip.status === "completed").length }), [plans]);
  const shownPlans = plans.filter((trip) => tab === "all" || (tab === "history" ? trip.status === "completed" : trip.status !== "completed"));

  const handleSave = async (draft) => {
    setError("");
    setBusyId(draft.id);
    try { await updateSavedPlan(draft); setEditorTrip(null); await refresh(); }
    catch (reason) { setError(reason.message); }
    finally { setBusyId(""); }
  };
  const handleComplete = async (trip) => {
    setError("");
    setBusyId(trip.id);
    try { await completeSavedPlan(trip.id); await refresh(); }
    catch (reason) { setError(reason.message); }
    finally { setBusyId(""); }
  };
  const handleDelete = async () => {
    if (!confirmDelete) return;
    setError("");
    setBusyId(confirmDelete.id);
    try { await deleteSavedPlan(confirmDelete.id); setConfirmDelete(null); await refresh(); }
    catch (reason) { setError(reason.message); }
    finally { setBusyId(""); }
  };

  const handleCreateInvite = async (trip) => {
    setInviteEmail("");
    setShareMessage("");
    setShareTrip(trip);
  };

  const sendInvite = async () => {
    if (!shareTrip || !inviteEmail.trim()) return;
    const configuredAppUrl = import.meta.env.VITE_APP_URL?.trim();
    const appUrl = configuredAppUrl || (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "" : window.location.origin);
    if (!appUrl) {
      setShareMessage("Set VITE_APP_URL to your deployed TravelGenie website before creating an invitation from localhost.");
      return;
    }
    let deployedUrl;
    try {
      deployedUrl = new URL(appUrl);
      if (!/^https?:$/.test(deployedUrl.protocol) || ["localhost", "127.0.0.1", "::1"].includes(deployedUrl.hostname)) throw new Error();
    } catch {
      setShareMessage("VITE_APP_URL must be the deployed TravelGenie website address, not localhost.");
      return;
    }
    setShareBusy(true);
    setShareMessage("");
    try {
      const result = await createTripInvite(shareTrip.id, inviteEmail.trim());
      deployedUrl.searchParams.set("invite", result.token);
      const subject = `You're invited to plan ${result.trip_title} with TravelGenie`;
      const body = `${localStorage.getItem("user_name") || "A TravelGenie user"} invited you to collaborate on ${result.trip_title}.\n\nOpen the deployed TravelGenie app and sign in as ${result.email} to join:\n${deployedUrl.toString()}\n\nThis invitation expires in seven days and can be claimed once.`;
      window.location.href = `mailto:${encodeURIComponent(result.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setShareMessage("Your email app is opening with the invitation. Send the draft to deliver it.");
    } catch (reason) {
      setShareMessage(reason.message || "The invitation email could not be prepared.");
    } finally { setShareBusy(false); }
  };

  return <Box sx={{ minHeight: "calc(100vh - 72px)", bgcolor: "#f4f8f5", py: { xs: 2.5, md: 4.5 }, background: "linear-gradient(180deg,#edf4f0 0%,#f7f9f7 420px,#f5f8f6 100%)" }}>
    <Container maxWidth="xl">
      <Box sx={{ position: "relative", overflow: "hidden", display: "flex", justifyContent: "space-between", alignItems: { sm: "flex-end" }, gap: 3, flexWrap: "wrap", mb: 3.5, p: { xs: 3, sm: 4, md: 5 }, borderRadius: { xs: 5, md: 7 }, color: "white", background: "radial-gradient(ellipse at 90% 5%,rgba(180,220,194,.27),transparent 37%),linear-gradient(120deg,#123e38,#1d675a)" }}>
        <Box sx={{ position: "absolute", width: 360, height: 360, right: { xs: -120, md: 105 }, bottom: -190, border: "1px solid rgba(255,255,255,.14)", borderRadius: "50%", boxShadow: "0 0 0 36px rgba(255,255,255,.03),0 0 0 78px rgba(255,255,255,.02)" }} />
        <Box sx={{ position: "relative", maxWidth: 760 }}>
          <Chip icon={<LuggageOutlinedIcon sx={{ color: "#f2c894 !important" }} />} label="YOUR TRIP LIBRARY" sx={{ color: "#f4f8f5", bgcolor: "rgba(255,255,255,.11)", mb: 1.8, fontWeight: 750, letterSpacing: ".06em" }} />
          <Typography variant="h2" sx={{ fontWeight: 850, letterSpacing: "-.06em", lineHeight: 1.04, fontSize: { xs: "2.45rem", md: "3.6rem" } }}>Trips, organized for the way you travel.</Typography>
          <Typography sx={{ mt: 1.4, maxWidth: 660, color: "rgba(246,250,247,.78)", fontSize: { xs: ".98rem", md: "1.05rem" }, lineHeight: 1.75 }}>Review your plans, refine an itinerary, or move a finished journey into your travel history.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddLocationAltOutlinedIcon />} onClick={() => onNavigate?.("planner")} sx={{ position: "relative", borderRadius: 2.5, px: 2.5, py: 1.35, textTransform: "none", fontWeight: 800, color: "#204a40", bgcolor: "#f2c894", boxShadow: "0 8px 22px rgba(14,55,44,.2)", "&:hover": { bgcolor: "#f6d7b2" } }}>Plan a new trip</Button>
      </Box>

      {inviteNotice && <Alert severity={inviteNotice.toLowerCase().includes("collaborating") ? "success" : "info"} onClose={() => { setInviteNotice(""); sessionStorage.removeItem("trip_invite_notice"); }} sx={{ mb: 2.5, borderRadius: 2 }}>{inviteNotice}</Alert>}
      {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" }, gap: 1.5, mb: 3 }}>
        {[["All saved journeys", plans.length, <LuggageOutlinedIcon key="all-icon" />], ["Still to come", counts.planned, <AddLocationAltOutlinedIcon key="planned-icon" />], ["Travel history", counts.completed, <HistoryRoundedIcon key="history-icon" />]].map(([label, value, icon]) => <Paper key={label} sx={{ ...cardSx, p: { xs: 1.5, sm: 2 }, display: "flex", alignItems: "center", gap: 1.5 }}><Box sx={{ width: 42, height: 42, display: { xs: "none", sm: "grid" }, placeItems: "center", bgcolor: "#eaf5f2", color: "primary.main", borderRadius: 2 }}>{icon}</Box><Box><Typography variant="h5" fontWeight={800}>{value}</Typography><Typography variant="body2" color="text.secondary">{label}</Typography></Box></Paper>)}
      </Box>
      <Paper sx={{ ...cardSx, px: { xs: 1, sm: 2 }, mb: 2.5, overflow: "hidden" }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" allowScrollButtonsMobile sx={{ minHeight: 58, "& .MuiTab-root": { minHeight: 58, textTransform: "none", fontWeight: 700 } }}>
          <Tab value="all" label={`All trips · ${plans.length}`} />
          <Tab value="planned" label={`Planned · ${counts.planned}`} />
          <Tab value="history" icon={<HistoryRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Travel history · ${counts.completed}`} />
        </Tabs>
      </Paper>

      {loading ? <Box sx={{ display: "grid", gap: 2 }}>{[0, 1].map((item) => <Skeleton key={item} variant="rounded" height={220} sx={{ borderRadius: 5 }} />)}</Box> : shownPlans.length ? <Box sx={{ display: "grid", gap: 2 }}>{shownPlans.map((trip) => <TripCard key={trip.id} trip={trip} onEdit={setEditorTrip} onDelete={setConfirmDelete} onComplete={handleComplete} onShare={handleCreateInvite} onDownload={downloadOfflineTripPack} busy={busyId === trip.id || shareBusy} />)}</Box> : !error && <Paper sx={{ ...cardSx, p: { xs: 4, md: 7 }, textAlign: "center" }}>
        <Box sx={{ width: 64, height: 64, mx: "auto", mb: 2, borderRadius: "22px", display: "grid", placeItems: "center", bgcolor: "#eaf5f2", color: "primary.main" }}>{tab === "history" ? <HistoryRoundedIcon sx={{ fontSize: 30 }} /> : <LuggageOutlinedIcon sx={{ fontSize: 30 }} />}</Box>
        <Typography variant="h5" fontWeight={800}>{!isAuthenticated ? "Sign in to keep your trips together" : tab === "history" ? "Your travel story starts here" : "A blank page for your next journey"}</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 2.5 }}>{!isAuthenticated ? "Your saved plans and travel history are kept with your account." : tab === "history" ? "Completed trips will be collected here, ready to revisit." : "Save an itinerary from Smart Planner and it will be waiting for you here."}</Typography>
        {(!isAuthenticated || tab !== "history") && <Button variant="contained" onClick={() => onNavigate?.(isAuthenticated ? "planner" : "login")} sx={{ textTransform: "none", borderRadius: 2 }}>{isAuthenticated ? "Open Smart Planner" : "Sign in"}</Button>}
      </Paper>}
    </Container>
    {editorTrip && <TripEditor trip={editorTrip} onClose={() => setEditorTrip(null)} onSave={handleSave} busy={busyId === editorTrip.id} />}
    <Dialog open={Boolean(shareTrip)} onClose={() => setShareTrip(null)} fullWidth maxWidth="sm">
      <DialogTitle fontWeight={850}>Invite someone to plan this trip</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" sx={{ mb: 2 }}>We’ll open your default email app with a secure invitation addressed to them. They’ll need to sign in with that email address to join.</Typography>
        <TextField fullWidth autoFocus type="email" label="Collaborator email" placeholder="name@example.com" value={inviteEmail} onChange={(event) => { setInviteEmail(event.target.value); setShareMessage(""); }} onKeyDown={(event) => { if (event.key === "Enter") sendInvite(); }} />
        {shareMessage && <Alert severity={shareMessage.toLowerCase().includes("opening") ? "success" : "error"} sx={{ mt: 1.5 }}>{shareMessage}</Alert>}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}><Button onClick={() => setShareTrip(null)} sx={{ textTransform: "none" }}>Close</Button><Button onClick={sendInvite} disabled={!inviteEmail.trim() || shareBusy} startIcon={<MailOutlineRoundedIcon />} variant="contained" sx={{ textTransform: "none" }}>{shareBusy ? "Preparing…" : "Open email invite"}</Button></DialogActions>
    </Dialog>
    <Dialog open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)}>
      <DialogTitle fontWeight={800}>Delete this trip?</DialogTitle>
      <DialogContent><Typography color="text.secondary">“{confirmDelete?.title}” will be permanently removed from your trip library.</Typography></DialogContent>
      <DialogActions sx={{ p: 2 }}><Button onClick={() => setConfirmDelete(null)} sx={{ textTransform: "none" }}>Keep trip</Button><Button color="error" variant="contained" onClick={handleDelete} disabled={Boolean(busyId)} sx={{ textTransform: "none" }}>Delete trip</Button></DialogActions>
    </Dialog>
  </Box>;
}
