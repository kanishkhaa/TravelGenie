import { useEffect, useState } from "react";

import { Alert, Box, Container, Typography } from "@mui/material";

import PlannerForm from "../../components/planner/PlannerForm";
import PlanResults from "../../components/planner/PlanResults";
import {
  generateTravelPlan,
  getPlannerOptions,
  getTripHistory,
  saveFullPlan,
  saveTripToHistory,
} from "../../services/plannerService";

const INITIAL_FORM = {
  starting_location: "Delhi",
  destination: "Anywhere in India",
  start_date: "",
  end_date: "",
  duration_days: "6",
  max_budget: "60000",
  travelers: "2",
  interests: ["Nature", "Cultural"],
  pace: "Balanced",
  stay_style: "Mid-range",
  group_type: "Friends",
  crowd_preference: "Mix",
  travel_mode: "Mixed",
};

function SmartPlanner() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [options, setOptions] = useState({});
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setHistory(getTripHistory());
    getPlannerOptions()
      .then(setOptions)
      .catch(() => {
        setOptions({});
      });
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);
    setResult(null);

    const payload = {
      starting_location: form.starting_location,
      destination: form.destination || "Anywhere in India",
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      duration_days: form.duration_days ? Number(form.duration_days) : null,
      max_budget: Number(form.max_budget),
      travelers: Number(form.travelers),
      interests: form.interests,
      pace: form.pace,
      stay_style: form.stay_style,
      group_type: form.group_type,
      crowd_preference: form.crowd_preference,
      travel_mode: form.travel_mode,
      previous_trips: getTripHistory(),
    };

    try {
      const data = await generateTravelPlan(payload);
      setResult(data);
      if (data.plan) {
        setHistory(saveTripToHistory(data.plan, form));
      }
    } catch {
      setError(
        "Could not generate a plan. Make sure the TravelGenie API is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 72px)",
        backgroundColor: "#fafafa",
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 5 }}>
          <Typography
            variant="overline"
            sx={{
              fontWeight: 700,
              letterSpacing: "1.5px",
              color: "#0f766e",
            }}
          >
            FEATURE 8
          </Typography>
          <Typography variant="h3" fontWeight={800} sx={{ mt: 1 }}>
            AI-powered travel planner
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: 720 }}>
            Get a complete personalized itinerary: destinations, route order,
            day-by-day plans, costs, weather, and safety — matched to your
            budget and travel style.
          </Typography>
        </Box>

        <PlannerForm
          form={form}
          setForm={setForm}
          options={options}
          loading={loading}
          onSubmit={handleSubmit}
          history={history}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 3, borderRadius: "12px" }}>
            {error}
          </Alert>
        )}

        {result && (
          <Box sx={{ mt: 5 }}>
            <PlanResults
              result={result}
              saved={saved}
              onSave={() => {
                saveFullPlan(result, form);
                setSaved(true);
              }}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default SmartPlanner;
