import { useState } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Stack, Tooltip, Typography } from "@mui/material";
import EmergencyRoundedIcon from "@mui/icons-material/EmergencyRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PhoneInTalkRoundedIcon from "@mui/icons-material/PhoneInTalkRounded";

export default function EmergencySOS() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [locating, setLocating] = useState(false);

  const shareLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Location sharing is not available in this browser.");
      return;
    }
    setLocating(true);
    setMessage("");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const mapLink = `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
      const text = `I may need help. Here is my current location: ${mapLink}`;
      try {
        if (navigator.share) await navigator.share({ title: "My location", text });
        else {
          await navigator.clipboard.writeText(text);
          setMessage("Location copied. Paste it into a message to someone you trust.");
        }
      } catch (error) {
        if (error.name !== "AbortError") setMessage("Could not share your location. You can still call emergency services.");
      } finally { setLocating(false); }
    }, (error) => {
      setLocating(false);
      setMessage(error.code === error.PERMISSION_DENIED ? "Location permission was denied. Enable it in your browser settings to share your location." : "Could not get your location. You can still call emergency services.");
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 15000 });
  };

  return <>
    <Tooltip title="Emergency help" placement="right">
      <Fab aria-label="Open emergency SOS options" variant="extended" onClick={() => setOpen(true)} sx={{ position: "fixed", zIndex: 1300, left: { xs: 14, sm: 26 }, bottom: { xs: 18, sm: 28 }, minHeight: 56, px: 2, gap: .8, color: "#fff", bgcolor: "#b63838", boxShadow: "0 8px 26px rgba(136,35,35,.3)", fontWeight: 850, letterSpacing: ".03em", "&:hover": { bgcolor: "#982d32" } }}>
        <EmergencyRoundedIcon /> SOS
      </Fab>
    </Tooltip>
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs" aria-labelledby="sos-dialog-title">
      <DialogTitle id="sos-dialog-title" sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 850 }}><Box sx={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 2, color: "#a83338", bgcolor: "#fff0ef" }}><EmergencyRoundedIcon /></Box>Emergency support</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2.5 }}>If you are in immediate danger in India, call 112 for emergency response.</Alert>
        <Stack spacing={1.2}>
          <Button component="a" href="tel:112" variant="contained" size="large" startIcon={<PhoneInTalkRoundedIcon />} sx={{ py: 1.35, borderRadius: 2.5, bgcolor: "#ae343a", fontWeight: 800, textTransform: "none", "&:hover": { bgcolor: "#962c32" } }}>Call emergency number 112</Button>
          <Button onClick={shareLocation} disabled={locating} variant="outlined" size="large" startIcon={<LocationOnRoundedIcon />} sx={{ py: 1.15, borderRadius: 2.5, fontWeight: 750, textTransform: "none" }}>{locating ? "Getting your location…" : "Share my current location"}</Button>
        </Stack>
        {message && <Alert severity="info" sx={{ mt: 1.5, borderRadius: 2.5 }}>{message}</Alert>}
        <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1.8, lineHeight: 1.6 }}>Location is shared only after you choose to share it. This button does not alert emergency services automatically. <a href="https://112.gov.in/" target="_blank" rel="noreferrer">Official India ERSS information</a></Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}><Button onClick={() => setOpen(false)} sx={{ textTransform: "none" }}>Close</Button></DialogActions>
    </Dialog>
  </>;
}
