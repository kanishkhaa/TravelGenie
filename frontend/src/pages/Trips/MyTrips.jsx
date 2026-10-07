import { useMemo } from "react";

import { Box, Container, Typography } from "@mui/material";

import { getSavedPlans } from "../../services/plannerService";

function MyTrips() {
  const plans = useMemo(() => getSavedPlans(), []);

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 72px)",
        backgroundColor: "#fafafa",
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="overline"
          sx={{ fontWeight: 700, letterSpacing: "1.5px", color: "#0f766e" }}
        >
          MY TRIPS
        </Typography>
        <Typography variant="h3" fontWeight={800} sx={{ mt: 1, mb: 4 }}>
          Saved travel plans
        </Typography>

        {plans.length === 0 ? (
          <Typography color="text.secondary">
            Plans you save from the Smart Planner tab will appear here.
          </Typography>
        ) : (
          plans.map((item) => {
            const dests =
              item.result?.plan?.recommended_destinations?.map((d) => d.name) ||
              [];
            return (
              <Box
                key={item.id}
                sx={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "18px",
                  p: 3,
                  mb: 2,
                }}
              >
                <Typography fontWeight={800}>
                  {dests.join(" → ") || item.form?.destination}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  From {item.form?.starting_location} · budget ₹
                  {Number(item.form?.max_budget || 0).toLocaleString("en-IN")} ·{" "}
                  {item.form?.travelers} travelers
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Estimated total: ₹
                  {Number(
                    item.result?.plan?.costs?.total || 0
                  ).toLocaleString("en-IN")}
                </Typography>
              </Box>
            );
          })
        )}
      </Container>
    </Box>
  );
}

export default MyTrips;
