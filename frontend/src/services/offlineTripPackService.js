const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const list = (value) => Array.isArray(value) ? value : [];
const rupees = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export function downloadOfflineTripPack(trip) {
  const plan = trip.result?.plan || {};
  const destinations = list(plan.recommended_destinations);
  const itinerary = list(plan.itinerary);
  const route = list(plan.route);
  const contacts = list(trip.result?.emergency_contacts);
  const dateRange = [trip.form?.start_date, trip.form?.end_date].filter(Boolean).join(" – ") || "Flexible dates";
  const destinationsHtml = destinations.map((destination) => {
    const coordinates = destination.coordinates || {};
    const mapLink = coordinates.latitude && coordinates.longitude
      ? `<a href="https://www.openstreetmap.org/?mlat=${encodeURIComponent(coordinates.latitude)}&mlon=${encodeURIComponent(coordinates.longitude)}#map=12/${encodeURIComponent(coordinates.latitude)}/${encodeURIComponent(coordinates.longitude)}">Open destination map when online</a>`
      : "Map coordinates are not included for this destination.";
    return `<li><strong>${escapeHtml(destination.name)}</strong> · ${escapeHtml(destination.state || "India")}<br><span>${escapeHtml(list(destination.places).join(" · "))}</span><br>${mapLink}</li>`;
  }).join("");
  const itineraryHtml = itinerary.map((day, index) => `<article class="day"><div class="day-number">DAY ${index + 1}</div><h2>${escapeHtml(day.title || day.destination || `Day ${index + 1}`)}</h2><p class="muted">${escapeHtml(day.date || "Date to confirm")} · ${escapeHtml(day.destination || "Route stop")}</p>${list(day.places).length ? `<h3>Places</h3><p>${escapeHtml(list(day.places).join(" · "))}</p>` : ""}${list(day.activities).length ? `<h3>Experiences</h3><p>${escapeHtml(list(day.activities).join(" · "))}</p>` : ""}${day.notes ? `<p>${escapeHtml(day.notes)}</p>` : ""}</article>`).join("");
  const routeHtml = route.map((leg, index) => `<li><strong>${index + 1}. ${escapeHtml(leg.from)} → ${escapeHtml(leg.to)}</strong><br>${escapeHtml(leg.distance_km)} km · ${escapeHtml(leg.mode)} · estimate ${rupees(leg.estimated_cost)}</li>`).join("");
  const contactsHtml = contacts.map((contact) => `<div class="contact"><strong>${escapeHtml(contact.name)}</strong><b>${escapeHtml(contact.number)}</b><span>${escapeHtml(contact.when)}</span></div>`).join("");
  const safetyHtml = list(plan.safety).map((item) => `<li><strong>${escapeHtml(item.destination)} · guide rating ${escapeHtml(item.safety_rating)}/10</strong><br>${escapeHtml(item.safety_notes)}${item.special_considerations ? `<br><b>Precaution:</b> ${escapeHtml(item.special_considerations)}` : ""}</li>`).join("");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#15584e"><title>${escapeHtml(trip.title || "Travel pack")} · Offline Trip Pack</title><style>
  *{box-sizing:border-box}body{margin:0;background:#f3f7f4;color:#20352d;font:16px/1.6 system-ui,-apple-system,Segoe UI,sans-serif}.wrap{max-width:900px;margin:0 auto;padding:24px}.hero{padding:32px;border-radius:24px;background:linear-gradient(120deg,#123e38,#1d675a);color:white}.eyebrow{font-size:12px;letter-spacing:.12em;font-weight:800;color:#f2c894}.hero h1{font-size:clamp(32px,7vw,54px);letter-spacing:-.05em;line-height:1.05;margin:12px 0}.hero p{color:#dcebe4}.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-top:24px}.fact{padding:13px;border:1px solid #ffffff2a;background:#ffffff14;border-radius:12px}.fact b{display:block}.card{margin-top:18px;padding:22px;border:1px solid #e2eae4;border-radius:18px;background:white}.card h2{margin:0 0 14px;letter-spacing:-.03em}.day{padding:17px;margin:12px 0;background:#f8faf8;border:1px solid #e8eee9;border-radius:14px}.day h2{margin:4px 0;font-size:21px}.day h3{font-size:13px;text-transform:uppercase;letter-spacing:.05em;margin:12px 0 2px;color:#276b5b}.day p{margin:4px 0}.day-number{font-size:12px;letter-spacing:.1em;font-weight:850;color:#26705e}.muted{color:#64766c}li{padding:10px 0}a{color:#176e61;font-weight:700}.contacts{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}.contact{display:grid;gap:4px;padding:14px;background:#fff8f6;border:1px solid #f0dedb;border-radius:12px}.contact b{font-size:24px;color:#a7443e}.notice{padding:12px;border-radius:10px;background:#fff6e7;color:#705523}.foot{margin:22px 0;color:#697a70;font-size:12px}@media print{body{background:white}.wrap{padding:0}.hero,.card{break-inside:avoid}.hero{print-color-adjust:exact}}
  </style></head><body><main class="wrap"><header class="hero"><div class="eyebrow">TRAVELGENIE · OFFLINE TRIP PACK</div><h1>${escapeHtml(trip.title || "India getaway")}</h1><p>${escapeHtml(trip.form?.starting_location || "Starting point")} → ${escapeHtml(destinations.map((item) => item.name).join(" · ") || trip.form?.destination || "Destination")}</p><div class="facts"><div class="fact"><span>TRAVEL DATES</span><b>${escapeHtml(dateRange)}</b></div><div class="fact"><span>TRAVELERS</span><b>${escapeHtml(trip.form?.travelers || 1)}</b></div><div class="fact"><span>DURATION</span><b>${escapeHtml(plan.travel_window?.days || trip.form?.duration_days || "—")} days</b></div><div class="fact"><span>ESTIMATED COST</span><b>${rupees(plan.costs?.total)}</b></div></div></header>
  <section class="card"><h2>Day-by-day itinerary</h2>${itineraryHtml || "<p>Your itinerary details are not available in this saved trip.</p>"}</section>
  ${routeHtml ? `<section class="card"><h2>Route & transport notes</h2><ol>${routeHtml}</ol><p class="muted">These are your saved route legs and estimates. Confirm current schedules with the transport operator.</p></section>` : ""}
  ${destinationsHtml ? `<section class="card"><h2>Destinations & maps</h2><ul>${destinationsHtml}</ul><p class="muted">Map links require internet access. The trip details on this page are stored in this file and remain available offline.</p></section>` : ""}
  ${safetyHtml ? `<section class="card"><h2>Safety notes</h2><ul>${safetyHtml}</ul><div class="notice">These are destination guide notes, not live emergency alerts. Follow current local authority advice.</div></section>` : ""}
  ${contactsHtml ? `<section class="card"><h2>Emergency & support contacts</h2><div class="contacts">${contactsHtml}</div><p class="muted">Call links require a mobile network. Check numbers and local coverage before departure.</p></section>` : ""}
  ${trip.notes ? `<section class="card"><h2>Your notes</h2><p>${escapeHtml(trip.notes)}</p></section>` : ""}<p class="foot">Generated ${new Date().toLocaleString("en-IN")} · Keep a copy on your device before travel.</p></main></body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${(trip.title || "travel-trip").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "travel-trip"}-offline-pack.html`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
