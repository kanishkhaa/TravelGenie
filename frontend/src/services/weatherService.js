const forecastCache = new Map();
const geocodeCache = new Map();

async function geocode(destination) {
  const key = destination.toLowerCase();
  if (geocodeCache.has(key)) return geocodeCache.get(key);
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.search = new URLSearchParams({ name: `${destination}, India`, count: "1", language: "en", format: "json", countryCode: "IN" });
  const response = await fetch(url);
  if (!response.ok) throw new Error("Destination coordinates are unavailable.");
  const result = (await response.json()).results?.[0];
  if (!result) throw new Error("Could not find this destination for a local forecast.");
  const coordinates = { latitude: result.latitude, longitude: result.longitude };
  geocodeCache.set(key, coordinates);
  return coordinates;
}

export async function getDestinationForecast(destination, coordinates) {
  const location = coordinates?.latitude && coordinates?.longitude ? coordinates : await geocode(destination);
  const key = `${location.latitude},${location.longitude}`;
  const cached = forecastCache.get(key);
  if (cached && Date.now() - cached.savedAt < 15 * 60 * 1000) return cached.data;
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max",
    forecast_days: "16",
    timezone: "auto",
  });
  const response = await fetch(url);
  if (!response.ok) throw new Error("Weather provider did not return a forecast.");
  const data = await response.json();
  forecastCache.set(key, { data, savedAt: Date.now() });
  return data;
}

export function weatherDescription(code) {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain or showers";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Variable conditions";
}

export function forecastAdvisory(day) {
  const code = Number(day.weather_code);
  const rainChance = Number(day.precipitation_probability_max || 0);
  const rainMm = Number(day.precipitation_sum || 0);
  const wind = Number(day.wind_speed_10m_max || 0);
  const maxTemp = Number(day.temperature_2m_max || 0);
  if ([95, 96, 99].includes(code)) return { level: "error", title: "Thunderstorm signal", detail: "Consider flexible outdoor plans and check local official advisories." };
  if ([65, 67, 82].includes(code) || rainChance >= 75 || rainMm >= 25) return { level: "warning", title: "Heavy rain signal", detail: "Allow extra travel time and keep an indoor option available." };
  if (wind >= 50) return { level: "warning", title: "Strong wind signal", detail: "Check local conditions before exposed, coastal, or elevated activities." };
  if (maxTemp >= 38) return { level: "warning", title: "High heat signal", detail: "Plan shade and water breaks during the warmest part of the day." };
  return null;
}
