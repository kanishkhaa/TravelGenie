import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Typography,
} from "@mui/material";

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import RouteIcon from "@mui/icons-material/Route";
import WbSunnyIcon from "@mui/icons-material/WbSunny";

function inr(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function Section({ title, icon, children }) {
  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "20px",
        p: { xs: 3, md: 4 },
        mb: 3,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        {icon}
        <Typography variant="h6" fontWeight={800}>
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  );
}

function PlanBody({ plan }) {
  if (!plan) return null;

  return (
    <>
      <Alert
        severity={plan.fits_budget ? "success" : "warning"}
        sx={{ mb: 3, borderRadius: "12px" }}
      >
        {plan.budget_message} Stay style: {plan.stay_style}. Mode:{" "}
        {plan.travel_mode}. Window: {plan.travel_window?.start} to{" "}
        {plan.travel_window?.end} ({plan.travel_window?.days} days).
      </Alert>

      <Section title="Recommended destinations" icon={<RouteIcon color="action" />}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          {(plan.recommended_destinations || []).map((dest, index) => (
            <Box
              key={dest.id || dest.name}
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                p: 2.5,
              }}
            >
              <Typography variant="overline" color="text.secondary" fontWeight={700}>
                Stop {index + 1} · {dest.days} day{dest.days > 1 ? "s" : ""}
              </Typography>
              <Typography variant="h6" fontWeight={800}>
                {dest.name}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                {dest.state} · {dest.region}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mb: 1.5 }}>
                {(dest.trip_types || []).slice(0, 4).map((type) => (
                  <Chip key={type} size="small" label={type} variant="outlined" />
                ))}
              </Box>
              <Typography fontWeight={700} sx={{ mb: 0.5 }}>
                Places to visit
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                {(dest.places || []).join(", ") || "See day-wise itinerary"}
              </Typography>
              <Typography fontWeight={700} sx={{ mb: 0.5 }}>
                Suggested experiences
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                {(dest.activities || []).join(", ")}
              </Typography>
              {(dest.reasons || []).map((reason) => (
                <Typography key={reason} variant="body2" color="text.secondary">
                  • {reason}
                </Typography>
              ))}
            </Box>
          ))}
        </Box>
      </Section>

      <Section title="Efficient travel sequence" icon={<RouteIcon color="action" />}>
        {(plan.route || []).map((leg, index) => (
          <Box
            key={`${leg.from}-${leg.to}-${index}`}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              py: 1.2,
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <Typography fontWeight={600}>
              {index + 1}. {leg.from} → {leg.to}
            </Typography>
            <Typography color="text.secondary">
              {leg.distance_km} km · {leg.mode} · {inr(leg.estimated_cost)}
            </Typography>
          </Box>
        ))}
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          This order is chosen to reduce unnecessary backtracking from your
          starting point.
        </Typography>
      </Section>

      <Section title="Day-wise itinerary">
        {(plan.itinerary || []).map((day, index) => (
          <Box key={`${day.date}-${index}`} sx={{ mb: 2.5 }}>
            <Typography fontWeight={800}>
              Day {index + 1} · {day.date} · {day.destination}
            </Typography>
            <Typography sx={{ mt: 0.4 }}>{day.title}</Typography>
            {day.places?.length > 0 && (
              <Typography color="text.secondary" sx={{ mt: 0.6 }}>
                Places: {day.places.join(" · ")}
              </Typography>
            )}
            {day.activities?.length > 0 && (
              <Typography color="text.secondary">
                Activities: {day.activities.join(" · ")}
              </Typography>
            )}
            {index < (plan.itinerary || []).length - 1 && (
              <Divider sx={{ mt: 2 }} />
            )}
          </Box>
        ))}
      </Section>

      <Section
        title="Estimated trip cost"
        icon={<AccountBalanceWalletIcon color="action" />}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          {[
            ["Long-distance transport", plan.costs?.long_distance_transport],
            ["Local transport", plan.costs?.local_transport],
            ["All transportation", plan.costs?.transportation],
            ["Accommodation", plan.costs?.accommodation],
            ["Food", plan.costs?.food],
            ["Entry fees & activities", plan.costs?.activities_and_entry],
          ].map(([label, value]) => (
            <Box
              key={label}
              sx={{
                backgroundColor: "#f8fafc",
                borderRadius: "14px",
                p: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {label}
              </Typography>
              <Typography variant="h6" fontWeight={800}>
                {inr(value)}
              </Typography>
            </Box>
          ))}
        </Box>
        <Typography variant="h5" fontWeight={800} sx={{ mt: 3 }}>
          Total estimated cost: {inr(plan.costs?.total)}
        </Typography>
        <Typography color="text.secondary">
          Your maximum budget: {inr(plan.max_budget)}
        </Typography>
      </Section>

      <Section title="Weather & season suitability" icon={<WbSunnyIcon color="action" />}>
        {(plan.weather || []).map((item) => (
          <Box key={item.destination} sx={{ mb: 2.5 }}>
            <Typography fontWeight={800}>{item.destination}</Typography>
            <Typography color="text.secondary">
              {(item.temperatures || []).join(" · ")}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Rainfall: {item.rainfall}
            </Typography>
            <Typography color="text.secondary">
              Peak: {item.peak_season} · Off-season: {item.off_season}
            </Typography>
            {(item.suitability || []).map((note) => (
              <Typography key={note} sx={{ mt: 0.4 }}>
                • {note}
              </Typography>
            ))}
          </Box>
        ))}
      </Section>

      <Section
        title="Safety information & precautions"
        icon={<HealthAndSafetyIcon color="action" />}
      >
        {(plan.safety || []).map((item) => (
          <Box key={item.destination} sx={{ mb: 2.5 }}>
            <Typography fontWeight={800}>
              {item.destination} · safety {item.safety_rating}/10
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {item.safety_notes}
            </Typography>
            {item.special_considerations && (
              <Typography sx={{ mt: 0.5 }}>
                Precaution: {item.special_considerations}
              </Typography>
            )}
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Permits: {item.permits_details}
            </Typography>
            <Typography color="text.secondary">
              Access: {item.accessibility} · Roads: {item.road_connectivity}
            </Typography>
            {item.local_customs && (
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Customs: {item.local_customs}
              </Typography>
            )}
          </Box>
        ))}
      </Section>
    </>
  );
}

function PlanResults({ result, onSave, saved }) {
  if (!result || result.error) {
    return result?.error ? (
      <Alert severity="error" sx={{ borderRadius: "12px" }}>
        {result.error}
      </Alert>
    ) : null;
  }

  const { analysis, plan, alternatives, emergency_contacts } = result;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="h5" fontWeight={800}>
          Your personalized travel plan
        </Typography>
        <Button
          variant="outlined"
          onClick={onSave}
          disabled={saved}
          sx={{
            textTransform: "none",
            borderRadius: "10px",
            fontWeight: 700,
            borderColor: "#0f766e",
            color: "#0f766e",
          }}
        >
          {saved ? "Saved to My Trips" : "Save this plan"}
        </Button>
      </Box>

      {analysis?.notes && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: "12px" }}>
          {(analysis.notes || []).join(" ")}
          {analysis.history_used ? " Previous travel history was included." : ""}
        </Alert>
      )}

      <PlanBody plan={plan} />

      {(!plan?.fits_budget ||
        alternatives?.destinations?.length > 0 ||
        alternatives?.budget_fit_plan) && (
        <Section title="Alternatives if this exceeds your budget">
          {(alternatives?.travel_options || []).map((option) => (
            <Box key={option.title} sx={{ mb: 1.5 }}>
              <Typography fontWeight={700}>{option.title}</Typography>
              <Typography color="text.secondary">{option.detail}</Typography>
            </Box>
          ))}
          {(alternatives?.activities || []).map((item) => (
            <Typography key={item.destination} color="text.secondary" sx={{ mb: 1 }}>
              {item.destination}: {item.swap}
            </Typography>
          ))}
          {alternatives?.destinations?.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography fontWeight={700} sx={{ mb: 1 }}>
                Alternative destinations
              </Typography>
              {alternatives.destinations.map((dest) => (
                <Typography key={dest.id || dest.name} sx={{ mb: 0.8 }}>
                  {dest.name} ({dest.state}) — {(dest.reasons || [])[0] || dest.why}
                </Typography>
              ))}
            </Box>
          )}
        </Section>
      )}

      {alternatives?.budget_fit_plan && (
        <>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
            Budget-fit alternative plan
          </Typography>
          <PlanBody plan={alternatives.budget_fit_plan} />
        </>
      )}

      <Section title="Emergency & contact information">
        {(emergency_contacts || []).map((contact) => (
          <Box
            key={contact.number}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              py: 1,
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <Box>
              <Typography fontWeight={700}>{contact.name}</Typography>
              <Typography color="text.secondary">{contact.when}</Typography>
            </Box>
            <Typography fontWeight={800}>{contact.number}</Typography>
          </Box>
        ))}
      </Section>
    </Box>
  );
}

export default PlanResults;
