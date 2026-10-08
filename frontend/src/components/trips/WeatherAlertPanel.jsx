import { useEffect, useState } from "react";
import { Alert, Box, Chip, CircularProgress, Paper, Typography } from "@mui/material";
import AirRoundedIcon from "@mui/icons-material/AirRounded";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import UmbrellaRoundedIcon from "@mui/icons-material/UmbrellaRounded";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import { forecastAdvisory, getDestinationForecast, weatherDescription } from "../../services/weatherService";

const asDate = (value) => {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? new Date(`${value.slice(0, 10)}T00:00:00`) : null;
};

export default function WeatherAlertPanel({ trip }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const plan = trip?.result?.plan;
  const destinations = (plan?.recommended_destinations || []).slice(0, 3);
  const startValue = trip?.form?.start_date || plan?.travel_window?.start || "";
  const endValue = trip?.form?.end_date || plan?.travel_window?.end || "";
  const destinationsKey = JSON.stringify(destinations.map(({ name, coordinates }) => [name, coordinates]));

  useEffect(() => {
    let active = true;
    const load = async () => {
      const startDate = asDate(startValue);
      const endDate = asDate(endValue) || startDate;
      const forecastDestinations = JSON.parse(destinationsKey).map(([name, coordinates]) => ({ name, coordinates }));
      setLoading(true);
      setError("");
      try {
        const forecasts = await Promise.all(forecastDestinations.map(async (destination) => {
          const forecast = await getDestinationForecast(destination.name, destination.coordinates);
          const daily = forecast.daily || {};
          return (daily.time || []).map((date, index) => ({
            destination: destination.name,
            date,
            weather_code: daily.weather_code?.[index],
            temperature_2m_max: daily.temperature_2m_max?.[index],
            temperature_2m_min: daily.temperature_2m_min?.[index],
            precipitation_probability_max: daily.precipitation_probability_max?.[index],
            precipitation_sum: daily.precipitation_sum?.[index],
            wind_speed_10m_max: daily.wind_speed_10m_max?.[index],
          }));
        }));
        if (!active) return;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const forecastLimit = new Date(today); forecastLimit.setDate(forecastLimit.getDate() + 16);
        const tripIsInForecast = !startDate || (startDate <= forecastLimit && (!endDate || endDate >= today));
        if (!tripIsInForecast) {
          setRows([]);
          setError("Forecasts for these trip dates are not available yet. Check again within 16 days of departure.");
          return;
        }
        const selected = forecasts.flat().filter((day) => {
          const date = asDate(day.date);
          return date && (!startDate || date >= startDate) && (!endDate || date <= endDate);
        });
        setRows(selected.slice(0, 8));
      } catch (reason) {
        if (active) setError(reason.message || "Live forecast could not be loaded right now.");
      } finally { if (active) setLoading(false); }
    };
    if (destinationsKey !== "[]") load();
    return () => { active = false; };
  }, [trip?.id, destinationsKey, startValue, endValue]);

  if (!trip || !destinations.length) return null;
  return <Paper elevation={0} sx={{ mt: 2, p: { xs: 1.8, sm: 2.2 }, border: "1px solid #e3ebe5", borderRadius: 3.5, bgcolor: "#fbfdfb" }}>
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap", mb: 1.2 }}><Box sx={{ display: "flex", alignItems: "center", gap: .8, color: "#286957" }}><CloudOutlinedIcon /><Box><Typography variant="subtitle2" fontWeight={850}>Weather & travel alerts</Typography><Typography variant="caption" color="text.secondary">Forecast outlook for your route</Typography></Box></Box><Chip size="small" label="Live forecast" sx={{ bgcolor: "#eaf3ed", color: "#387353", fontWeight: 750 }} /></Box>
    {loading && <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1, color: "text.secondary" }}><CircularProgress size={16} /><Typography variant="body2">Checking destination forecasts…</Typography></Box>}
    {error && !loading && <Typography variant="body2" color="text.secondary" sx={{ py: .5 }}>{error}</Typography>}
    {!loading && rows.length > 0 && <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)" }, gap: 1 }}>
      {rows.map((day) => {
        const advisory = forecastAdvisory(day);
        return <Box key={`${day.destination}-${day.date}`} sx={{ p: 1.25, borderRadius: 2.6, border: "1px solid #e8eeea", bgcolor: "white" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "flex-start" }}><Box><Typography variant="caption" color="text.secondary">{new Date(`${day.date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</Typography><Typography variant="body2" fontWeight={800}>{day.destination}</Typography></Box><Chip size="small" icon={<WbSunnyOutlinedIcon />} label={weatherDescription(Number(day.weather_code))} sx={{ maxWidth: "58%", bgcolor: advisory ? "#fff5e8" : "#f1f6f2", color: advisory ? "#805f2e" : "#436a50", fontWeight: 700, "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" } }} /></Box>
          <Box sx={{ display: "flex", gap: 1.4, mt: 1, color: "#56665e", flexWrap: "wrap" }}><Typography variant="caption">{Math.round(day.temperature_2m_min)}°–{Math.round(day.temperature_2m_max)}°C</Typography><Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: .3 }}><UmbrellaRoundedIcon sx={{ fontSize: 14 }} />{day.precipitation_probability_max ?? 0}%</Typography><Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: .3 }}><AirRoundedIcon sx={{ fontSize: 14 }} />{Math.round(day.wind_speed_10m_max || 0)} km/h</Typography></Box>
          {advisory && <Alert severity={advisory.level} sx={{ mt: 1, py: 0, borderRadius: 2, "& .MuiAlert-message": { py: .4 } }}><Typography variant="caption" fontWeight={800}>{advisory.title}</Typography><Typography variant="caption" component="div">{advisory.detail}</Typography></Alert>}
        </Box>;
      })}
    </Box>}
    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.2, lineHeight: 1.5 }}>Forecast data: Open‑Meteo. These are forecast signals, not official emergency warnings. Follow local authorities and India Meteorological Department advisories for safety decisions.</Typography>
  </Paper>;
}
