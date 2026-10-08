import { getDestinations } from "./destinationService";

const NCRB_LAYER = "https://livingatlas.esri.in/server1/rest/services/NCRB/District_Wise_SLL_Crimes_2022/MapServer/0/query";

export async function getSafetyDestinations() {
  const data = await getDestinations({});
  return data.destinations || [];
}

export async function getDistrictCrimeCounts() {
  const query = new URLSearchParams({ where: "1=1", outFields: "dist,state,totcogsll24", returnGeometry: "false", f: "json" });
  const response = await fetch(`${NCRB_LAYER}?${query}`);
  if (!response.ok) throw new Error("District crime data is temporarily unavailable.");
  const payload = await response.json();
  if (payload.error || !payload.features) throw new Error("District crime data could not be loaded.");
  return payload.features.map(({ attributes }) => ({
    district: attributes.dist || attributes.DIST || "",
    state: attributes.state || attributes.STATE || "",
    cases: Number(attributes.totcogsll24) || 0,
    year: 2024,
  }));
}
