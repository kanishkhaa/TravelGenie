import { useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import { useFavorites } from "../../contexts/FavoritesContext";

export default function FavoriteButton({ destination, size = "medium" }) {
  const { isFavorite, toggle } = useFavorites();
  const [busy, setBusy] = useState(false);
  const active = isFavorite(destination?.id);
  const handleClick = async (event) => {
    event.stopPropagation();
    if (busy || !destination?.id) return;
    setBusy(true);
    try { await toggle(destination); } catch { /* Keep the current state when the API is unavailable. */ }
    finally { setBusy(false); }
  };
  return <Tooltip title={active ? "Remove from saved places" : "Save destination"}>
    <span><IconButton aria-label={active ? "Remove from saved destinations" : "Save destination"} onClick={handleClick} disabled={busy} size={size} sx={{ bgcolor: "rgba(255,255,255,.92)", color: active ? "#d64d63" : "#465850", "&:hover": { bgcolor: "#fff", color: "#d64d63" } }}>
      {active ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
    </IconButton></span>
  </Tooltip>;
}
