import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Container, Typography } from "@mui/material";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import FavoriteButton from "../components/common/FavoriteButton";
import DestinationCover from "../components/destinations/DestinationCover";
import { useFavorites } from "../contexts/FavoritesContext";

export default function Favorites({ onNavigate, onViewDetails }) {
  const { favorites, loading } = useFavorites();
  return <Box sx={{ minHeight: "calc(100vh - 72px)", bgcolor: "#f5f8f6", py: { xs: 3, md: 5 } }}><Container maxWidth="xl">
    <Box sx={{ p: { xs: 3, md: 5 }, mb: 3, color: "white", borderRadius: 6, background: "radial-gradient(ellipse at 88% 4%,rgba(190,225,204,.25),transparent 34%),linear-gradient(120deg,#123e38,#1c675a)" }}>
      <Chip icon={<FavoriteBorderRoundedIcon sx={{ color: "#f2c894 !important" }} />} label="YOUR TRAVEL WISHLIST" sx={{ bgcolor: "rgba(255,255,255,.12)", color: "white", fontWeight: 750, mb: 2 }} />
      <Typography variant="h2" sx={{ fontWeight: 850, letterSpacing: "-.055em", fontSize: { xs: "2.4rem", md: "3.4rem" } }}>Places worth dreaming about.</Typography>
      <Typography sx={{ mt: 1.2, color: "rgba(255,255,255,.78)", maxWidth: 620 }}>Keep your favorite destinations close. Use them as inspiration when you build your next trip.</Typography>
    </Box>
    {!localStorage.getItem("access_token") ? <Alert severity="info" action={<Button onClick={() => onNavigate("login")} sx={{ textTransform: "none" }}>Sign in</Button>}>Sign in to save and revisit your wishlist.</Alert> : loading ? <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}><CircularProgress /></Box> : favorites.length ? <>
      <Typography variant="h5" fontWeight={850} sx={{ mb: 2 }}>{favorites.length} saved {favorites.length === 1 ? "destination" : "destinations"}</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3,1fr)" }, gap: 2 }}>{favorites.map((destination) => <Card key={destination.id} onClick={() => onViewDetails(destination)} sx={{ overflow: "hidden", borderRadius: 5, border: "1px solid #e4eae6", cursor: "pointer", transition: ".2s", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 16px 34px rgba(20,50,39,.1)" } }}>
      <DestinationCover destinationName={destination.destination_name} height={175}><Chip label={destination.region || "India"} sx={{ bgcolor: "rgba(255,255,255,.86)", fontWeight: 700 }} /><FavoriteButton destination={destination} /></DestinationCover>
        <CardContent sx={{ p: 2.5 }}><Typography variant="body2" color="text.secondary">{destination.district || destination.region}, {destination.state}</Typography><Typography variant="h5" fontWeight={850} sx={{ mt: .35 }}>{destination.destination_name}</Typography><Box sx={{ display: "flex", gap: .7, mt: 1.3, flexWrap: "wrap" }}>{(destination.trip_types || []).slice(0, 3).map((type) => <Chip key={type} size="small" label={type} variant="outlined" />)}</Box><Button onClick={(event) => { event.stopPropagation(); onViewDetails(destination); }} sx={{ mt: 1.5, textTransform: "none", fontWeight: 750, px: 0 }}>Explore destination <ExploreRoundedIcon sx={{ ml: .7, fontSize: 18 }} /></Button></CardContent>
      </Card>)}</Box>
    </> : <Card sx={{ textAlign: "center", py: 7, borderRadius: 5, border: "1px solid #e4eae6", boxShadow: "none" }}><CardContent><FavoriteBorderRoundedIcon sx={{ fontSize: 42, color: "#16776d" }} /><Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>Your wishlist is ready for its first place</Typography><Typography color="text.secondary" sx={{ mt: .7 }}>Browse destinations and tap the heart to save one for later.</Typography><Button variant="contained" onClick={() => onNavigate("explore")} sx={{ mt: 2, textTransform: "none", bgcolor: "#16776d" }}>Explore destinations</Button></CardContent></Card>}
  </Container></Box>;
}

