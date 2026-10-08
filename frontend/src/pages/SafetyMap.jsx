import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Box, Button, Chip, CircularProgress, Container, IconButton, Link, Paper, Tooltip, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { getDistrictCrimeCounts, getSafetyDestinations } from "../services/safetyService";

const TILE_SIZE = 256;
const indiaCenter = { lat: 22.5, lon: 80, zoom: 4 };

function worldPoint(lat, lon, zoom) {
  const scale = TILE_SIZE * 2 ** zoom;
  const clampedLat = Math.max(-85.0511, Math.min(85.0511, lat));
  const sin = Math.sin(clampedLat * Math.PI / 180);
  return { x: (lon + 180) / 360 * scale, y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale };
}

function geoPoint(x, y, zoom) {
  const scale = TILE_SIZE * 2 ** zoom;
  return { lon: x / scale * 360 - 180, lat: Math.atan(Math.sinh(Math.PI * (1 - 2 * y / scale))) * 180 / Math.PI };
}

function normalize(value) { return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }

function matchCrime(destination, crimeRows) {
  const state = normalize(destination.state);
  const districts = String(destination.district || "").split(/[,/&]+/).map(normalize).filter(Boolean);
  const matches = crimeRows.filter((row) => normalize(row.state) === state && districts.some((district) => {
    const candidate = normalize(row.district);
    return candidate && (candidate === district || candidate.includes(district) || district.includes(candidate));
  }));
  return matches.length ? Math.round(matches.reduce((total, item) => total + item.cases, 0) / matches.length) : null;
}

function safetyColor(score) { return score >= 8 ? "#19836b" : score >= 6 ? "#d99b41" : "#c75a57"; }

function MapCanvas({ destinations, selected, onSelect, metric, crimeMax }) {
  const [center, setCenter] = useState(indiaCenter);
  const [size, setSize] = useState({ width: 900, height: 540 });
  const [dragging, setDragging] = useState(false);
  const mapRef = useRef(null);
  const dragRef = useRef(null);
  useEffect(() => {
    const element = mapRef.current;
    if (!element) return undefined;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const tiles = useMemo(() => {
    const point = worldPoint(center.lat, center.lon, center.zoom);
    const leftWorld = point.x - size.width / 2;
    const topWorld = point.y - size.height / 2;
    const startX = Math.floor(leftWorld / TILE_SIZE) - 1;
    const startY = Math.floor(topWorld / TILE_SIZE) - 1;
    const columns = Math.ceil(size.width / TILE_SIZE) + 2;
    const rows = Math.ceil(size.height / TILE_SIZE) + 2;
    const tileCount = 2 ** center.zoom;
    const result = [];
    for (let col = 0; col < columns; col += 1) for (let row = 0; row < rows; row += 1) {
      const x = startX + col;
      const y = startY + row;
      if (y < 0 || y >= tileCount) continue;
      result.push({ url: `https://tile.openstreetmap.org/${center.zoom}/${((x % tileCount) + tileCount) % tileCount}/${y}.png`, left: x * TILE_SIZE - leftWorld, top: y * TILE_SIZE - topWorld });
    }
    return { tiles: result, leftWorld, topWorld };
  }, [center, size]);

  const markerPosition = (destination) => {
    const coords = destination.coordinates || {};
    const point = worldPoint(Number(coords.latitude), Number(coords.longitude), center.zoom);
    const score = Number(destination.safety_rating || 0);
    const crime = destination.crime_cases;
    const intensity = crime === null || crime === undefined ? 0 : Math.min(1, crime / Math.max(1, crimeMax));
    return {
      left: point.x - tiles.leftWorld,
      top: point.y - tiles.topWorld,
      color: metric === "crime" ? (crime === null ? "#7d8982" : intensity > .66 ? "#c94f50" : intensity > .33 ? "#e2a342" : "#19836b") : safetyColor(score),
      size: metric === "crime" ? 16 + intensity * 18 : 15 + score * 1.2,
    };
  };

  const zoomBy = (amount) => setCenter((value) => ({ ...value, zoom: Math.max(3, Math.min(7, value.zoom + amount)) }));
  const startDrag = (event) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    const point = worldPoint(center.lat, center.lon, center.zoom);
    dragRef.current = { startX: event.clientX, startY: event.clientY, centerX: point.x, centerY: point.y };
  };
  const moveDrag = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    const next = geoPoint(drag.centerX - (event.clientX - drag.startX), drag.centerY - (event.clientY - drag.startY), center.zoom);
    setCenter((value) => ({ ...value, ...next }));
    dragRef.current = { ...drag, startX: event.clientX, startY: event.clientY, centerX: worldPoint(next.lat, next.lon, center.zoom).x, centerY: worldPoint(next.lat, next.lon, center.zoom).y };
  };

  return <Box ref={mapRef} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={() => { dragRef.current = null; setDragging(false); }} onPointerCancel={() => { dragRef.current = null; setDragging(false); }} sx={{ height: { xs: 440, md: 570 }, position: "relative", overflow: "hidden", bgcolor: "#dbe8e1", cursor: dragging ? "grabbing" : "grab", touchAction: "none", userSelect: "none" }}>
    {tiles.tiles.map((tile) => <Box key={tile.url} component="img" draggable={false} src={tile.url} alt="" sx={{ position: "absolute", width: TILE_SIZE, height: TILE_SIZE, left: tile.left, top: tile.top, maxWidth: "none", pointerEvents: "none" }} />)}
    {destinations.map((destination) => {
      const point = markerPosition(destination);
      const selectedMarker = String(selected?.id) === String(destination.id);
      return <Tooltip key={destination.id} title={`${destination.destination_name} · ${metric === "crime" ? destination.crime_cases === null ? "No district match" : `${destination.crime_cases.toLocaleString("en-IN")} reported SLL cases` : `Guide safety score ${destination.safety_rating}/10`}`}>
        <Box component="button" aria-label={`Show safety details for ${destination.destination_name}`} onPointerDown={(event) => event.stopPropagation()} onClick={() => onSelect(destination)} sx={{ position: "absolute", left: point.left, top: point.top, transform: "translate(-50%,-50%)", width: point.size, height: point.size, p: 0, borderRadius: "50%", border: selectedMarker ? "3px solid white" : "2px solid rgba(255,255,255,.96)", bgcolor: point.color, boxShadow: `0 0 ${selectedMarker ? 25 : 16}px ${point.color}99`, cursor: "pointer", zIndex: selectedMarker ? 3 : 2, "&:hover": { zIndex: 4, transform: "translate(-50%,-50%) scale(1.3)" } }} />
      </Tooltip>;
    })}
    <Box sx={{ position: "absolute", top: 14, right: 14, display: "grid", gap: .8, zIndex: 5 }}>
      <Tooltip title="Zoom in"><IconButton onClick={() => zoomBy(1)} sx={{ bgcolor: "white", boxShadow: "0 3px 12px #0002", "&:hover": { bgcolor: "#f2f7f3" } }}><AddRoundedIcon /></IconButton></Tooltip>
      <Tooltip title="Zoom out"><IconButton onClick={() => zoomBy(-1)} sx={{ bgcolor: "white", boxShadow: "0 3px 12px #0002", "&:hover": { bgcolor: "#f2f7f3" } }}><RemoveRoundedIcon /></IconButton></Tooltip>
      <Tooltip title="Reset to India"><IconButton onClick={() => setCenter(indiaCenter)} sx={{ bgcolor: "white", boxShadow: "0 3px 12px #0002", "&:hover": { bgcolor: "#f2f7f3" } }}><MyLocationRoundedIcon /></IconButton></Tooltip>
    </Box>
    <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 46, background: "linear-gradient(0deg,rgba(255,255,255,.92),rgba(255,255,255,0))", pointerEvents: "none" }} />
    <Typography component="a" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" variant="caption" sx={{ position: "absolute", right: 8, bottom: 5, zIndex: 5, px: .7, py: .2, borderRadius: 1, bgcolor: "rgba(255,255,255,.86)", color: "#3f5c51", textDecoration: "none", fontSize: ".66rem" }}>© OpenStreetMap contributors</Typography>
  </Box>;
}

export default function SafetyMap() {
  const [destinations, setDestinations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [metric, setMetric] = useState("safety");
  const [loading, setLoading] = useState(true);
  const [crimeError, setCrimeError] = useState("");
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.allSettled([getSafetyDestinations(), getDistrictCrimeCounts()]).then(([places, crime]) => {
      if (!active) return;
      if (places.status === "rejected") setPageError("Tourism destinations could not be loaded.");
      const rows = crime.status === "fulfilled" ? crime.value : [];
      if (crime.status === "rejected") setCrimeError(crime.reason?.message || "District crime data is unavailable.");
      const mapped = places.status === "fulfilled" ? places.value.filter((item) => Number.isFinite(Number(item.coordinates?.latitude)) && Number.isFinite(Number(item.coordinates?.longitude))).map((item) => ({ ...item, crime_cases: matchCrime(item, rows) })) : [];
      setDestinations(mapped);
      setSelected(mapped[0] || null);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const crimeMax = useMemo(() => Math.max(1, ...destinations.map((item) => item.crime_cases || 0)), [destinations]);
  const matchCount = destinations.filter((item) => item.crime_cases !== null).length;
  const selectedScore = Number(selected?.safety_rating || 0);

  return <Box sx={{ minHeight: "calc(100vh - 72px)", bgcolor: "#f5f8f6", py: { xs: 2.5, md: 4.5 }, background: "linear-gradient(180deg,#edf4f0 0%,#f7f9f7 430px,#f5f8f6 100%)" }}><Container maxWidth="xl">
    <Box sx={{ position: "relative", overflow: "hidden", mb: 3, p: { xs: 3, sm: 4, md: 5 }, borderRadius: { xs: 5, md: 7 }, color: "white", background: "radial-gradient(ellipse at 88% 4%,rgba(183,220,196,.25),transparent 34%),linear-gradient(120deg,#123e38,#1d675a)" }}>
      <Chip icon={<ShieldRoundedIcon sx={{ color: "#f2c894 !important" }} />} label="SAFETY INSIGHTS · INDIA" sx={{ mb: 1.8, color: "white", bgcolor: "rgba(255,255,255,.11)", fontWeight: 750, letterSpacing: ".07em" }} />
      <Typography variant="h2" fontWeight={850} sx={{ maxWidth: 800, letterSpacing: "-.06em", lineHeight: 1.05, fontSize: { xs: "2.4rem", md: "3.55rem" } }}>Explore with a little more context.</Typography>
      <Typography sx={{ mt: 1.5, maxWidth: 760, color: "rgba(248,251,249,.78)", fontSize: { xs: ".98rem", md: "1.05rem" }, lineHeight: 1.75 }}>Compare the tourism guide’s destination safety ratings with district-level crime reports while you plan your route.</Typography>
    </Box>
    {pageError && <Alert severity="error" sx={{ mb: 2 }}>{pageError}</Alert>}
    <Paper elevation={0} sx={{ overflow: "hidden", border: "1px solid #e1e9e3", borderRadius: { xs: 4, md: 5 }, boxShadow: "0 18px 48px rgba(25,45,35,.06)" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5, p: { xs: 1.7, md: 2.3 }, borderBottom: "1px solid #e9efeb" }}>
        <Box><Typography variant="h6" fontWeight={850}>Destination safety map</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .25 }}>{loading ? "Loading destination and district data…" : `${destinations.length} tourist destinations · ${matchCount} matched district records`}</Typography></Box>
        <Box sx={{ display: "flex", gap: .8 }}><Button onClick={() => setMetric("safety")} variant={metric === "safety" ? "contained" : "outlined"} sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 750 }}>Guide scores</Button><Button onClick={() => setMetric("crime")} variant={metric === "crime" ? "contained" : "outlined"} sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 750 }}>Crime reports</Button></Box>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0,1.8fr) minmax(300px,.8fr)" } }}>
        <Box sx={{ position: "relative", minHeight: 440 }}>{loading ? <Box sx={{ height: 570, display: "grid", placeItems: "center", color: "#176e61" }}><Box sx={{ textAlign: "center" }}><CircularProgress /><Typography color="text.secondary" sx={{ mt: 1.5 }}>Preparing the India map</Typography></Box></Box> : <MapCanvas destinations={destinations} selected={selected} onSelect={setSelected} metric={metric} crimeMax={crimeMax} />}
          {!loading && <Box sx={{ position: "absolute", left: 12, top: 12, display: "flex", gap: .7, alignItems: "center", px: 1.2, py: .8, borderRadius: 2, bgcolor: "rgba(255,255,255,.93)", zIndex: 4 }}><Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: metric === "crime" ? "#d76551" : "#19836b" }} /><Typography variant="caption" fontWeight={750}>{metric === "safety" ? "Tourism guide rating" : "Reported district case volume"}</Typography></Box>}
        </Box>
        <Box sx={{ p: { xs: 2, md: 2.5 }, borderTop: { xs: "1px solid #e7eee9", lg: "none" }, borderLeft: { lg: "1px solid #e7eee9" }, bgcolor: "#fbfcfb" }}>
          {selected ? <>
            <Typography variant="overline" fontWeight={800} color="text.secondary" letterSpacing=".1em">SELECTED DESTINATION</Typography>
            <Typography variant="h4" fontWeight={850} letterSpacing="-.045em" sx={{ mt: .4 }}>{selected.destination_name}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: .6, mt: .7, color: "text.secondary" }}><PlaceRoundedIcon sx={{ fontSize: 17 }} /><Typography variant="body2">{selected.district} · {selected.state}</Typography></Box>
            <Paper elevation={0} sx={{ p: 2, mt: 2, borderRadius: 3.5, bgcolor: "#edf5f0", border: "1px solid #dfebe3" }}><Typography variant="caption" color="text.secondary" fontWeight={800} letterSpacing=".07em">TOURISM GUIDE SAFETY RATING</Typography><Box sx={{ display: "flex", alignItems: "baseline", gap: .6, mt: .3 }}><Typography variant="h3" fontWeight={900} sx={{ color: safetyColor(selectedScore) }}>{selectedScore.toFixed(1)}</Typography><Typography color="text.secondary">/ 10</Typography></Box><Typography variant="body2" color="text.secondary">Based on the destination guide’s safety rating and notes.</Typography></Paper>
            <Paper elevation={0} sx={{ p: 2, mt: 1.3, borderRadius: 3.5, bgcolor: "white", border: "1px solid #e5ece7" }}><Typography variant="caption" color="text.secondary" fontWeight={800} letterSpacing=".07em">NCRB DISTRICT CRIME RECORD</Typography><Typography variant="h5" fontWeight={850} sx={{ mt: .5 }}>{selected.crime_cases === null ? "No district match" : `${selected.crime_cases.toLocaleString("en-IN")} reported cases`}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Special and Local Laws (SLL), 2024. {selected.crime_cases === null ? "This destination could not be matched to a district record." : "Reported case volume, not adjusted for population or visitor numbers."}</Typography></Paper>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, lineHeight: 1.65 }}>{selected.safety_notes || "Check local advisories and current conditions before travel."}</Typography>
            <Button fullWidth variant="outlined" endIcon={<OpenInNewRoundedIcon />} href={`https://www.openstreetmap.org/?mlat=${selected.coordinates.latitude}&mlon=${selected.coordinates.longitude}#map=11/${selected.coordinates.latitude}/${selected.coordinates.longitude}`} target="_blank" sx={{ mt: 2, borderRadius: 2.5, textTransform: "none", fontWeight: 750 }}>Open in OpenStreetMap</Button>
          </> : <Box sx={{ py: 6, textAlign: "center" }}><ReportProblemOutlinedIcon sx={{ color: "#a3b2aa", fontSize: 36 }} /><Typography color="text.secondary" sx={{ mt: 1 }}>Select a destination on the map to inspect its safety context.</Typography></Box>}
        </Box>
      </Box>
      <Box sx={{ px: { xs: 1.8, md: 2.5 }, py: 1.5, borderTop: "1px solid #e7eee9", bgcolor: "#f8faf8" }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "flex-start", gap: .7, lineHeight: 1.55 }}><ReportProblemOutlinedIcon sx={{ fontSize: 16, flexShrink: 0, mt: .1 }} />Reported crime counts are not a personal risk prediction or a population-adjusted crime rate. A high number may reflect population, reporting, or district size. Tourism guide ratings are shown separately and are not computed from NCRB counts.</Typography>
        {crimeError && <Typography variant="caption" color="warning.dark" sx={{ display: "block", mt: .7 }}>Crime overlay unavailable: {crimeError} Tourism guide safety ratings are still shown.</Typography>}
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: .7 }}>Crime data: <Link href="https://livingatlas.esri.in/server1/rest/services/NCRB/District_Wise_SLL_Crimes_2022/MapServer/0" target="_blank" rel="noreferrer" underline="hover" color="inherit">NCRB district-wise SLL layer, 2024</Link> · Basemap: © OpenStreetMap contributors.</Typography>
      </Box>
    </Paper>
  </Container></Box>;
}
