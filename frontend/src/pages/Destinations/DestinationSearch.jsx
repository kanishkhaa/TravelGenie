import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Container,
  CircularProgress,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import SearchBar from "../../components/destinations/SearchBar";
import DestinationFilters from "../../components/destinations/DestinationFilters";
import DestinationGrid from "../../components/destinations/DestinationGrid";

import { getDestinations } from "../../services/destinationService";

function DestinationSearch({ onViewDetails }) {
  const [destinations, setDestinations] = useState([]);

  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [tripType, setTripType] = useState("");
  const [budget, setBudget] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDestinations({
        search,
        state,
        tripType,
        budget,
      });

      setDestinations(data.destinations);
    } catch (err) {
      console.error(err);
      setError("Unable to load destinations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#fafafa",
        py: 6,
      }}
    >
      <Container maxWidth="lg">

        {/* Page Header */}
        <Box sx={{ mb: 5 }}>
          <Typography
            variant="overline"
            sx={{
              fontWeight: 700,
              letterSpacing: "1.5px",
              color: "text.secondary",
            }}
          >
            EXPLORE INDIA
          </Typography>

          <Typography
            variant="h3"
            fontWeight={800}
            sx={{
              mt: 1,
              color: "#111827",
              fontSize: {
                xs: "2rem",
                md: "3rem",
              },
            }}
          >
            Find your next destination
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mt: 1.5,
              maxWidth: 650,
              fontSize: "1.05rem",
            }}
          >
            Explore destinations across India based on your
            interests, travel style and budget.
          </Typography>
        </Box>

        {/* Search Panel */}
        <Box
          sx={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "20px",
            p: {
              xs: 2,
              md: 3,
            },
            mb: 6,
          }}
        >
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={fetchDestinations}
          />

          <Box sx={{ mt: 2 }}>
            <DestinationFilters
              state={state}
              setState={setState}
              tripType={tripType}
              setTripType={setTripType}
              budget={budget}
              setBudget={setBudget}
            />
          </Box>

          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={fetchDestinations}
            disabled={loading}
            sx={{
              mt: 2.5,
              px: 3,
              py: 1.2,
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {loading ? "Searching..." : "Search destinations"}
          </Button>
        </Box>

        {/* Results Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Destinations
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {destinations.length} destinations found
            </Typography>
          </Box>
        </Box>

        {/* Error */}
        {error && (
          <Typography
            color="error"
            sx={{ mb: 3 }}
          >
            {error}
          </Typography>
        )}

        {/* Loading */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 10,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <DestinationGrid
            destinations={destinations}
            onViewDetails={onViewDetails}
          />
        )}

      </Container>
    </Box>
  );
}

export default DestinationSearch;