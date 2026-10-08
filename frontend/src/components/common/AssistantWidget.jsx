import { useEffect, useRef, useState } from "react";
import { Alert, Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogContent, DialogTitle, Fab, IconButton, MenuItem, Paper, Select, TextField, Tooltip, Typography } from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import AddCommentOutlinedIcon from "@mui/icons-material/AddCommentOutlined";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import { applyAssistantItinerary, chatWithAssistant, getAssistantConversations, getAssistantHistory } from "../../services/assistantService";
import { getSavedPlans } from "../../services/plannerService";

const suggestions = ["What can I do in Kerala for 4 days?", "Suggest places under ₹15,000.", "Which season is best for Goa?"];

export default function AssistantWidget({ onLoginRequired }) {
  const [open, setOpen] = useState(false);
  const [trips, setTrips] = useState([]);
  const [tripId, setTripId] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [conversations, setConversations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", content: "Hello! Ask me about destinations, activities, budgets, or a saved itinerary. My suggestions are grounded in the TravelGenie tourism guide." }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [proposal, setProposal] = useState(null);
  const [applying, setApplying] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && localStorage.getItem("access_token")) {
      getSavedPlans().then(setTrips).catch(() => {});
      getAssistantConversations().then(setConversations).catch(() => {});
    }
  }, [open]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, busy]);

  const send = async (text = input) => {
    const content = text.trim();
    if (!content || busy) return;
    if (!localStorage.getItem("access_token")) { setOpen(false); onLoginRequired?.(); return; }
    const activeConversationId = conversationId || globalThis.crypto?.randomUUID?.() || `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    if (!conversationId) setConversationId(activeConversationId);
    const next = [...messages, { role: "user", content }];
    setMessages(next); setInput(""); setBusy(true); setError(""); setProposal(null);
    try {
      const result = await chatWithAssistant(next.slice(-24).map(({ role, content: message }) => ({ role, content: message })), tripId, activeConversationId);
      setMessages([...next, { role: "assistant", content: result.reply, sources: result.sources || [], modelUsed: result.model_used }]);
      setConversationId(result.conversation_id || activeConversationId);
      getAssistantConversations().then(setConversations).catch(() => {});
      if (result.updated_itinerary) setProposal(result.updated_itinerary);
    } catch (reason) { setMessages(next); setError(reason.message || "The assistant could not respond."); }
    finally { setBusy(false); }
  };

  const startNewChat = () => {
    setConversationId("");
    setMessages([{ role: "assistant", content: "Hello! Ask me about destinations, activities, budgets, or a saved itinerary. My suggestions are grounded in the TravelGenie tourism guide." }]);
    setInput("");
    setTripId("");
    setProposal(null);
    setError("");
    setShowHistory(false);
  };

  const openConversation = async (conversation) => {
    setBusy(true);
    setError("");
    try {
      const history = await getAssistantHistory(conversation.id);
      setConversationId(conversation.id);
      setMessages(history.map((message) => ({ ...message, modelUsed: message.modelUsed || message.model_used })));
      setShowHistory(false);
      setProposal(null);
    } catch (reason) {
      setError(reason.message || "Could not open this conversation.");
    } finally { setBusy(false); }
  };

  const applyProposal = async () => {
    if (!proposal || !tripId) return;
    setApplying(true); setError("");
    try {
      await applyAssistantItinerary(tripId, proposal);
      setProposal(null);
      setMessages((current) => [...current, { role: "assistant", content: "Your saved itinerary is updated. You can review it in My Trips." }]);
    } catch (reason) { setError(reason.message || "Could not apply these itinerary changes."); }
    finally { setApplying(false); }
  };

  return <>
    <Tooltip title="Ask the TravelGenie assistant" placement="left">
      <Fab aria-label="Open travel assistant" onClick={() => setOpen(true)} sx={{ position: "fixed", zIndex: 1300, right: { xs: 18, sm: 28 }, bottom: { xs: 18, sm: 28 }, width: 60, height: 60, color: "white", background: "linear-gradient(135deg,#1b7568,#124d45)", boxShadow: "0 12px 30px rgba(17,79,68,.3)", "&:hover": { background: "linear-gradient(135deg,#17685d,#103f39)" } }}><AutoAwesomeRoundedIcon /></Fab>
    </Tooltip>
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { position: "fixed", m: { xs: 1, sm: 2 }, right: { sm: 22 }, bottom: { sm: 88 }, width: { xs: "calc(100% - 16px)", sm: 520 }, maxWidth: "calc(100% - 16px)", height: { xs: "min(78vh,720px)", sm: 680 }, maxHeight: "calc(100% - 32px)", borderRadius: 5, overflow: "hidden", boxShadow: "0 24px 80px rgba(21,44,34,.25)" } }}>
      <DialogTitle sx={{ px: 2, py: 1.5, color: "white", background: "linear-gradient(115deg,#123e38,#1c675a)", display: "flex", alignItems: "center", gap: 1.2 }}>
        <Avatar sx={{ width: 38, height: 38, color: "#fff", bgcolor: "rgba(255,255,255,.16)" }}><TravelExploreRoundedIcon /></Avatar>
        <Box sx={{ flex: 1 }}><Typography fontWeight={800}>TravelGenie assistant</Typography><Typography variant="caption" sx={{ color: "rgba(255,255,255,.76)" }}>Travel ideas grounded in your guide</Typography></Box>
        <IconButton aria-label="Close assistant" onClick={() => setOpen(false)} sx={{ color: "white" }}><CloseRoundedIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <Box sx={{ px: 2, py: 1.2, borderBottom: "1px solid #e7ede8", display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="caption" fontWeight={750} color="text.secondary" sx={{ flexShrink: 0 }}>TRIP CONTEXT</Typography>
          <Select size="small" fullWidth value={tripId} displayEmpty onChange={(event) => { setTripId(event.target.value); setProposal(null); }} sx={{ borderRadius: 2, fontSize: ".88rem" }}>
            <MenuItem value="">Ask without a trip</MenuItem>
            {trips.filter((trip) => trip.status === "planned").map((trip) => <MenuItem key={trip.id} value={trip.id}>{trip.title}</MenuItem>)}
          </Select>
        </Box>
        <Box sx={{ px: 1.5, py: .7, borderBottom: "1px solid #e7ede8", display: "flex", gap: .8 }}>
          <Button size="small" startIcon={<AddCommentOutlinedIcon />} onClick={startNewChat} sx={{ textTransform: "none", fontWeight: 750 }}>New chat</Button>
          <Button size="small" startIcon={<HistoryRoundedIcon />} onClick={() => setShowHistory((value) => !value)} sx={{ textTransform: "none", fontWeight: 750 }}>{showHistory ? "Back to chat" : `History${conversations.length ? ` · ${conversations.length}` : ""}`}</Button>
        </Box>
        <Box ref={scrollRef} sx={{ flex: 1, p: 2, overflowY: "auto", bgcolor: "#fbfcfb" }}>
          {showHistory ? <Box>
            <Typography variant="subtitle1" fontWeight={850} sx={{ mb: 1 }}>Your conversations</Typography>
            {conversations.length ? conversations.map((conversation) => <Paper key={conversation.id} variant="outlined" onClick={() => openConversation(conversation)} sx={{ p: 1.4, mb: 1, borderRadius: 2.5, cursor: "pointer", borderColor: "#e3eae5", "&:hover": { bgcolor: "#f0f6f2", borderColor: "#a9c8b5" } }}><Typography variant="body2" fontWeight={750} noWrap>{conversation.title}</Typography><Typography variant="caption" color="text.secondary">{conversation.message_count || 0} messages{conversation.updated_at ? ` · ${new Date(conversation.updated_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}` : ""}</Typography></Paper>) : <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>Your saved conversations will appear here.</Typography>}
          </Box> : <>
          {messages.map((message, index) => <Box key={`${index}-${message.role}`} sx={{ display: "flex", justifyContent: message.role === "user" ? "flex-end" : "flex-start", mb: 1.5 }}><Box sx={{ maxWidth: "88%" }}><Paper elevation={0} sx={{ px: 1.6, py: 1.2, borderRadius: message.role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px", bgcolor: message.role === "user" ? "#176e61" : "#eef4f0", color: message.role === "user" ? "white" : "#263d34" }}><Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{message.content}</Typography></Paper>{message.modelUsed && <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: .4 }}>{message.modelUsed === "tourism-guide" ? "Travel guide · tourism database" : `Groq · ${message.modelUsed === "openai/gpt-oss-20b" ? "GPT-OSS 20B" : message.modelUsed}`}</Typography>}{message.sources?.length > 0 && <Box sx={{ display: "flex", gap: .5, flexWrap: "wrap", mt: .6 }}>{message.sources.map((source) => <Chip key={source} size="small" label={`Guide · ${source}`} variant="outlined" sx={{ fontSize: ".68rem", borderColor: "#d9e6de" }} />)}</Box>}</Box></Box>)}
          {busy && <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary", mb: 1.5 }}><CircularProgress size={16} /><Typography variant="body2">Checking your travel guide…</Typography></Box>}
          {proposal && <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3, border: "1px solid #d6e6dc", bgcolor: "#f4faf6", mb: 1.5 }}><Typography variant="body2" fontWeight={800} sx={{ mb: .7 }}>Proposed itinerary changes</Typography>{proposal.map((day, index) => <Box key={`${day.date}-${index}`} sx={{ py: .65, borderTop: index ? "1px solid #e4eee7" : "none" }}><Typography variant="body2" fontWeight={700}>Day {index + 1} · {day.title || day.destination}</Typography><Typography variant="caption" color="text.secondary">{[...(day.places || []), ...(day.activities || [])].join(" · ")}</Typography></Box>)}<Button size="small" variant="contained" onClick={applyProposal} disabled={applying} sx={{ mt: 1, textTransform: "none", bgcolor: "#176e61" }}>{applying ? "Saving…" : "Apply to saved trip"}</Button></Paper>}
          {error && <Alert severity="error" sx={{ mb: 1.2, borderRadius: 2 }}>{error}</Alert>}
          {messages.length === 1 && <Box sx={{ display: "flex", flexWrap: "wrap", gap: .7, mt: 1 }}>{suggestions.map((suggestion) => <Chip key={suggestion} clickable label={suggestion} onClick={() => send(suggestion)} sx={{ bgcolor: "white", border: "1px solid #e1e9e3", height: "auto", py: .5, "& .MuiChip-label": { whiteSpace: "normal" } }} />)}</Box>}
          </>}
        </Box>
        {!showHistory && <Box sx={{ p: 1.3, display: "flex", alignItems: "flex-end", gap: .8, borderTop: "1px solid #e7ede8", bgcolor: "white" }}>
          <TextField fullWidth size="small" multiline maxRows={4} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} placeholder="Ask about a destination…" inputProps={{ maxLength: 2000 }} />
          <IconButton aria-label="Send message" onClick={() => send()} disabled={!input.trim() || busy} sx={{ width: 40, height: 40, flexShrink: 0, color: "white", bgcolor: "#176e61", "&:hover": { bgcolor: "#12574e" } }}><SendRoundedIcon fontSize="small" /></IconButton>
        </Box>}
      </DialogContent>
    </Dialog>
  </>;
}
