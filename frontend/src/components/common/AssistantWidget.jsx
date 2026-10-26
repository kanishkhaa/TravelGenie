import { useEffect, useRef, useState } from "react";
import { Alert, Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, Fab, IconButton, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import { chatWithAssistant } from "../../services/assistantService";

const starters = ["Plan a 4-day Kerala getaway", "When should I visit Goa?", "Suggest a budget-friendly trip"];
const welcome = { role: "assistant", content: "Welcome to TravelGenie. I can help you explore Indian destinations, choose the right season, and shape practical trip ideas." };

export default function AssistantWidget({ onLoginRequired }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([welcome]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, busy, error]);

  const reset = () => { setMessages([welcome]); setInput(""); setError(""); };
  const send = async (text = input) => {
    const message = text.trim();
    if (!message || busy) return;
    if (!localStorage.getItem("access_token")) { setOpen(false); onLoginRequired?.(); return; }
    setMessages((current) => [...current, { role: "user", content: message }]);
    setInput(""); setBusy(true); setError("");
    try {
      const result = await chatWithAssistant(message);
      setMessages((current) => [...current, { role: "assistant", content: result.reply, sources: result.sources || [] }]);
    } catch (reason) { setError(reason.message || "Travel chat could not respond."); }
    finally { setBusy(false); }
  };

  return <>
    <Tooltip title="Plan with TravelGenie" placement="left"><Fab aria-label="Open TravelGenie chat" onClick={() => setOpen(true)} sx={{ position: "fixed", zIndex: 1300, right: { xs: 18, sm: 28 }, bottom: { xs: 18, sm: 28 }, width: 58, height: 58, color: "white", background: "linear-gradient(135deg,#176e61,#0e4b43)", boxShadow: "0 14px 30px rgba(14,75,67,.32)", "&:hover": { background: "linear-gradient(135deg,#125e53,#0a3d37)" } }}><AutoAwesomeRoundedIcon /></Fab></Tooltip>
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { position: "fixed", m: { xs: 1, sm: 2 }, right: { sm: 22 }, bottom: { sm: 88 }, width: { xs: "calc(100% - 16px)", sm: 520 }, height: { xs: "min(78vh,720px)", sm: 660 }, borderRadius: 4, overflow: "hidden", boxShadow: "0 24px 80px rgba(15,50,43,.26)" } } }}>
      <DialogTitle sx={{ px: 2.25, py: 1.75, color: "white", background: "linear-gradient(115deg,#0e3e38,#1c675a)", display: "flex", alignItems: "center", gap: 1.2 }}>
        <Avatar sx={{ width: 40, height: 40, bgcolor: "rgba(255,255,255,.16)" }}><TravelExploreRoundedIcon /></Avatar>
        <Box sx={{ flex: 1 }}><Typography fontWeight={800}>TravelGenie assistant</Typography><Stack direction="row" alignItems="center" spacing={.6}><Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#8ee2b8" }} /><Typography variant="caption" sx={{ color: "rgba(255,255,255,.8)" }}>India travel guide · Online</Typography></Stack></Box>
        <Tooltip title="New conversation"><IconButton aria-label="Start a new conversation" onClick={reset} sx={{ color: "white" }}><RestartAltRoundedIcon /></IconButton></Tooltip><IconButton aria-label="Close travel chat" onClick={() => setOpen(false)} sx={{ color: "white" }}><CloseRoundedIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <Box ref={scrollRef} sx={{ flex: 1, px: 2, py: 2.25, overflowY: "auto", bgcolor: "#f7faf8" }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", letterSpacing: ".05em", mb: 2 }}>TRAVEL PLANNING, SIMPLIFIED</Typography>
          {messages.map((item, index) => <Box key={`${item.role}-${index}`} sx={{ display: "flex", gap: 1, justifyContent: item.role === "user" ? "flex-end" : "flex-start", mb: 2 }}>
            {item.role === "assistant" && <Avatar sx={{ width: 28, height: 28, mt: .2, bgcolor: "#d9eee4", color: "#146253" }}><AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} /></Avatar>}
            <Box sx={{ maxWidth: "82%" }}><Paper elevation={0} sx={{ px: 1.6, py: 1.3, borderRadius: item.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px", bgcolor: item.role === "user" ? "#176e61" : "#fff", color: item.role === "user" ? "white" : "#213a32", border: item.role === "assistant" ? "1px solid #e2ece6" : "none" }}><Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.65 }}>{item.content}</Typography></Paper>{item.sources?.length > 0 && <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: .55, px: .25 }}>Based on: {item.sources.slice(0, 3).join(" · ")}</Typography>}</Box>
          </Box>)}
          {busy && <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: .3, color: "text.secondary" }}><CircularProgress size={16} thickness={5} /><Typography variant="body2">Preparing a helpful answer…</Typography></Box>}
          {error && <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2.5 }}>{error}</Alert>}
          {messages.length === 1 && <Box sx={{ ml: 4.5, mt: -.5 }}><Typography variant="caption" color="text.secondary">Try one of these</Typography><Stack spacing={.75} sx={{ mt: .75 }}>{starters.map((starter) => <Button key={starter} onClick={() => send(starter)} variant="outlined" size="small" sx={{ justifyContent: "flex-start", textAlign: "left", textTransform: "none", borderRadius: 2, borderColor: "#d6e6dc", color: "#245d51", bgcolor: "#fff" }}>{starter}</Button>)}</Stack></Box>}
        </Box>
        <Divider />
        <Box sx={{ p: 1.4, bgcolor: "#fff" }}><TextField fullWidth multiline maxRows={4} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} placeholder="Ask about a destination, season, or itinerary…" slotProps={{ htmlInput: { maxLength: 2000, "aria-label": "Message TravelGenie" }, input: { endAdornment: <IconButton aria-label="Send message" onClick={() => send()} disabled={!input.trim() || busy} sx={{ alignSelf: "flex-end", mb: -.4, mr: -.5, color: "white", bgcolor: "#176e61", "&:hover": { bgcolor: "#12574e" }, "&.Mui-disabled": { bgcolor: "#dce8e1", color: "#fff" } }}><SendRoundedIcon fontSize="small" /></IconButton> } }} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "#f8fbf9", pr: .7 } }} /><Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: .8, px: .4 }}>Press Enter to send · Shift + Enter for a new line</Typography></Box>
      </DialogContent>
    </Dialog>
  </>;
}
