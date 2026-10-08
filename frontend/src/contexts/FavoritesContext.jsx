import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { addFavorite, getFavorites, removeFavorite } from "../services/favoriteService";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children, isLoggedIn, onLoginRequired }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const reload = useCallback(async () => {
    if (!isLoggedIn) { setFavorites([]); return; }
    setLoading(true);
    try { setFavorites(await getFavorites()); } catch { setFavorites([]); }
    finally { setLoading(false); }
  }, [isLoggedIn]);
  useEffect(() => { reload(); }, [reload]);
  const isFavorite = useCallback((id) => favorites.some((item) => String(item.id) === String(id)), [favorites]);
  const toggle = useCallback(async (destination) => {
    if (!isLoggedIn) { onLoginRequired?.(); return; }
    if (isFavorite(destination.id)) {
      await removeFavorite(destination.id);
      setFavorites((items) => items.filter((item) => String(item.id) !== String(destination.id)));
    } else {
      await addFavorite(destination.id);
      setFavorites((items) => [...items, destination]);
    }
  }, [isLoggedIn, isFavorite, onLoginRequired]);
  const value = useMemo(() => ({ favorites, loading, reload, isFavorite, toggle }), [favorites, loading, reload, isFavorite, toggle]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used inside FavoritesProvider");
  return context;
}
