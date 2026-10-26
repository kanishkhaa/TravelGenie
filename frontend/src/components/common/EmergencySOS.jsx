import { useEffect, useState } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Stack, Tooltip, Typography } from "@mui/material";
import EmergencyRoundedIcon from "@mui/icons-material/EmergencyRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PhoneInTalkRoundedIcon from "@mui/icons-material/PhoneInTalkRounded";
import SmsRoundedIcon from "@mui/icons-material/SmsRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";

const API = "http://127.0.0.1:8000";

export default function EmergencySOS({ onConfigureContact }) {
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [locating, setLocating] = useState(false);
  const [contact, setContact] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (!open || !localStorage.getItem("access_token")) return;
    fetch(`${API}/profile/me`, { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        const profile = data?.profile;
        setContact(profile?.emergencyPhone ? { name: profile.emergencyName || "Emergency contact", phone: profile.emergencyPhone } : null);
      }).catch(() => setContact(null));
  }, [open]);

  const getLocation = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error("Location sharing is not available in this browser.")); return; }
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const current = { latitude: coords.latitude, longitude: coords.longitude, link: `https://maps.google.com/?q=${coords.latitude},${coords.longitude}` };
      setLocation(current); resolve(current);
    }, (error) => reject(error), { enableHighAccuracy: true, timeout: 12000, maximumAge: 15000 });
  });

  const locate = async () => {
    setLocating(true); setNotice("");
    try { await getLocation(); setNotice("Location is ready to share."); }
    catch (error) { setNotice(error.code === error.PERMISSION_DENIED ? "Location permission was denied. Enable it in browser settings and try again." : error.message || "We could not get your location. You can still call 112."); }
    finally { setLocating(false); }
  };

  const locationText = (current) => `SOS: I may need help. My current location is ${current.link}`;
  const shareLocation = async () => {
    const current = location || await locate().then(() => null);
    if (!current) return;
    const text = locationText(current);
    try {
      if (navigator.share) await navigator.share({ title: "TravelGenie SOS location", text, url: current.link });
      else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); setNotice("Location copied. Paste it into a message to someone you trust."); }
      else setNotice(`Copy this location: ${current.link}`);
    } catch (error) { if (error.name !== "AbortError") setNotice("Could not open sharing. You can still copy your location or call 112."); }
  };

  const sendSms = async () => {
    if (!contact) return;
    setLocating(true); setNotice("");
    try {
      const current = location || await getLocation();
      const number = contact.phone.replace(/[^+\d]/g, "");
      window.location.href = `sms:${number}?body=${encodeURIComponent(locationText(current))}`;
      setNotice(`Opening a message to ${contact.name}. Review and send it from your messaging app.`);
    } catch (error) { setNotice(error.code === error.PERMISSION_DENIED ? "Location permission was denied. You can still call 112." : "Could not get your location. You can still call 112."); }
    finally { setLocating(false); }
  };

  return <>
    <Tooltip title="Emergency help" placement="right"><Fab aria-label="Open emergency SOS options" variant="extended" onClick={() => setOpen(true)} sx={{ position: "fixed", zIndex: 1300, left: { xs: 14, sm: 26 }, bottom: { xs: 18, sm: 28 }, minHeight: 54, px: 2, gap: .8, color: "#fff", bgcolor: "#b63838", boxShadow: "0 8px 26px rgba(136,35,35,.3)", fontWeight: 850, letterSpacing: ".03em", "&:hover": { bgcolor: "#982d32" } }}><EmergencyRoundedIcon /> SOS</Fab></Tooltip>
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs" aria-labelledby="sos-dialog-title">
      <DialogTitle id="sos-dialog-title" sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 850 }}><Box sx={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 2, color: "#a83338", bgcolor: "#fff0ef" }}><EmergencyRoundedIcon /></Box>Emergency support</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2.5 }}>For immediate danger in India, call 112 now. This is the fastest way to reach emergency response.</Alert>
        <Stack spacing={1.15}>
          <Button component="a" href="tel:112" variant="contained" size="large" startIcon={<PhoneInTalkRoundedIcon />} sx={{ py: 1.3, borderRadius: 2.5, bgcolor: "#ae343a", fontWeight: 800, textTransform: "none", "&:hover": { bgcolor: "#962c32" } }}>Call emergency number 112</Button>
          <Button onClick={shareLocation} disabled={locating} variant="outlined" size="large" startIcon={<LocationOnRoundedIcon />} sx={{ py: 1.1, borderRadius: 2.5, fontWeight: 750, textTransform: "none" }}>{locating ? "Getting your location…" : location ? "Share current location" : "Get and share my location"}</Button>
          {contact ? <Button onClick={sendSms} disabled={locating} variant="outlined" size="large" startIcon={<SmsRoundedIcon />} sx={{ py: 1.1, borderRadius: 2.5, fontWeight: 750, textTransform: "none" }}>Text SOS to {contact.name}</Button> : <Button onClick={() => { setOpen(false); onConfigureContact?.(); }} variant="text" startIcon={<PersonAddAlt1RoundedIcon />} sx={{ textTransform: "none", alignSelf: "center" }}>Add an emergency contact</Button>}
        </Stack>
        {notice && <Alert severity="info" sx={{ mt: 1.5, borderRadius: 2.5 }}>{notice}</Alert>}
        <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1.8, lineHeight: 1.6 }}>Your location is accessed only when you choose an SOS action. TravelGenie cannot dispatch emergency services or send messages automatically; review and send the prepared SMS yourself.</Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}><Button onClick={() => setOpen(false)} sx={{ textTransform: "none" }}>Close</Button></DialogActions>
    </Dialog>
  </>;
}
