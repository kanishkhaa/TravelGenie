import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Container,
  Typography,
  Divider,
  Chip,
  Paper,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import ContactEmergencyIcon from "@mui/icons-material/ContactEmergency";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import HotelIcon from "@mui/icons-material/Hotel";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import SecurityIcon from "@mui/icons-material/Security";


function Profile({ onNavigate }) {

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // --------------------------------------------------
  // Get Profile
  // --------------------------------------------------

  useEffect(() => {

    const fetchProfile = async () => {

      const userId = localStorage.getItem("user_id");

      if (!userId) {
        setError("User session not found. Please login again.");
        setLoading(false);
        return;
      }

      try {

        const response = await fetch(
          `http://127.0.0.1:8000/profile/${userId}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.detail || "Unable to load profile.");
          setLoading(false);
          return;
        }

        setProfile(data.profile);

      } catch (error) {

        console.error("Profile fetch error:", error);

        setError(
          "Unable to connect to the server. Please make sure the backend is running."
        );

      } finally {

        setLoading(false);

      }
    };

    fetchProfile();

  }, []);


  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {

    return (
      <Box
        sx={{
          minHeight: "calc(100vh - 72px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
        }}
      >
        <Typography
          sx={{
            color: "#64748b",
            fontSize: "1rem",
          }}
        >
          Loading profile...
        </Typography>
      </Box>
    );

  }


  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error) {

    return (
      <Box
        sx={{
          minHeight: "calc(100vh - 72px)",
          backgroundColor: "#f8fafc",
          py: 6,
        }}
      >

        <Container maxWidth="md">

          <Paper
            elevation={0}
            sx={{
              p: 6,
              borderRadius: "20px",
              textAlign: "center",
              border: "1px solid #e2e8f0",
            }}
          >

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "#111827",
                mb: 2,
              }}
            >
              Complete your profile to get personalized travel recommendations🌍✈️
            </Typography>

            

            <Button
              variant="contained"
              onClick={() => onNavigate("profileform")}
              sx={{
                backgroundColor: "#0f766e",
                textTransform: "none",
                borderRadius: "10px",
                px: 4,
                fontWeight: 600,

                "&:hover": {
                  backgroundColor: "#115e59",
                },
              }}
            >
              Complete Profile
            </Button>

          </Paper>

        </Container>

      </Box>
    );

  }


  // --------------------------------------------------
  // Display Value
  // --------------------------------------------------

  const showValue = (value) => {

    if (
      value === null ||
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return (
        <Typography
          component="span"
          sx={{
            color: "#94a3b8",
            fontStyle: "italic",
          }}
        >
          Not provided
        </Typography>
      );
    }


    // Array values
    if (Array.isArray(value)) {

      return (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            mt: 0.5,
          }}
        >

          {value.map((item, index) => (

            <Chip
              key={`${item}-${index}`}
              label={item}
              size="small"
              sx={{
                backgroundColor: "#f0fdfa",
                color: "#0f766e",
                border: "1px solid #ccfbf1",
                fontWeight: 600,
              }}
            />

          ))}

        </Box>
      );

    }


    return value;

  };


  // --------------------------------------------------
  // Profile Field
  // --------------------------------------------------

  const ProfileField = ({ label, value }) => (

    <Box>

      <Typography
        sx={{
          fontSize: "0.82rem",
          fontWeight: 600,
          color: "#64748b",
          mb: 0.7,
          textTransform: "uppercase",
          letterSpacing: "0.03em",
        }}
      >
        {label}
      </Typography>

      <Typography
        component="div"
        sx={{
          fontSize: "1rem",
          fontWeight: 500,
          color: "#1e293b",
          minHeight: "24px",
          lineHeight: 1.6,
        }}
      >
        {showValue(value)}
      </Typography>

    </Box>

  );


  // --------------------------------------------------
  // Section Header
  // --------------------------------------------------

  const SectionHeader = ({
    icon,
    title,
    description,
  }) => (

    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        mb: 3,
      }}
    >

      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: "12px",
          backgroundColor: "#f0fdfa",
          color: "#0f766e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#111827",
          }}
        >
          {title}
        </Typography>

        {description && (
          <Typography
            sx={{
              color: "#64748b",
              fontSize: "0.9rem",
              mt: 0.3,
            }}
          >
            {description}
          </Typography>
        )}

      </Box>

    </Box>

  );


  // --------------------------------------------------
  // Main UI
  // --------------------------------------------------

  return (

    <Box
      sx={{
        minHeight: "calc(100vh - 72px)",
        backgroundColor: "#f8fafc",
        py: {
          xs: 3,
          md: 5,
        },
      }}
    >

      <Container maxWidth="md">


        {/* ==========================================
            PROFILE HEADER
        ========================================== */}

        <Paper
          elevation={0}
          sx={{
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            p: {
              xs: 3,
              md: 4,
            },
            mb: 3,
          }}
        >

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: {
                xs: "flex-start",
                sm: "center",
              },
              gap: 2,
              flexDirection: {
                xs: "column",
                sm: "row",
              },
            }}
          >

            {/* Profile identity */}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >

              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  backgroundColor: "#ccfbf1",
                  color: "#0f766e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.6rem",
                  fontWeight: 800,
                }}
              >
                {profile?.name
                  ? profile.name.charAt(0).toUpperCase()
                  : "U"}
              </Box>


              <Box>

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: "#111827",
                  }}
                >
                  {profile?.name || "User"}
                </Typography>

                <Typography
                  sx={{
                    color: "#64748b",
                    mt: 0.5,
                  }}
                >
                  {profile?.email || "Email not provided"}
                </Typography>

              </Box>

            </Box>


            {/* Edit Button */}

            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => onNavigate("profileform")}
              sx={{
                backgroundColor: "#0f766e",
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                px: 3,
                py: 1.2,

                "&:hover": {
                  backgroundColor: "#115e59",
                },
              }}
            >
              Edit Profile
            </Button>

          </Box>

        </Paper>


        {/* ==========================================
            PERSONAL INFORMATION
        ========================================== */}

        <Paper
          elevation={0}
          sx={{
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            p: {
              xs: 3,
              md: 4,
            },
            mb: 3,
          }}
        >

          <SectionHeader
            icon={<PersonIcon />}
            title="Personal Information"
            description="Your basic personal details"
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: 3,
            }}
          >

            <ProfileField
              label="Full Name"
              value={profile.name}
            />

            <ProfileField
              label="Gender"
              value={profile.gender}
            />

            <ProfileField
              label="Date of Birth"
              value={profile.dateOfBirth}
            />

            <ProfileField
              label="Age"
              value={profile.age}
            />

            <ProfileField
              label="Mobile Number"
              value={profile.phone}
            />

            <ProfileField
              label="Email Address"
              value={profile.email}
            />

          </Box>

        </Paper>


        {/* ==========================================
            CONTACT & LOCATION
        ========================================== */}

        <Paper
          elevation={0}
          sx={{
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            p: {
              xs: 3,
              md: 4,
            },
            mb: 3,
          }}
        >

          <SectionHeader
            icon={<PersonIcon />}
            title="Contact & Location"
            description="Your current location details"
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: 3,
            }}
          >

            <ProfileField
              label="State"
              value={profile.state}
            />

            <ProfileField
              label="City"
              value={profile.city}
            />

            <ProfileField
              label="Pincode"
              value={profile.pincode}
            />

            <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
              <ProfileField
                label="Address"
                value={profile.address}
              />
            </Box>

          </Box>

        </Paper>


        {/* ==========================================
            EMERGENCY CONTACT
        ========================================== */}

        <Paper
          elevation={0}
          sx={{
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            p: {
              xs: 3,
              md: 4,
            },
            mb: 3,
          }}
        >

          <SectionHeader
            icon={<ContactEmergencyIcon />}
            title="Emergency Contact"
            description="Information used in case of an emergency"
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: 3,
            }}
          >

            <ProfileField
              label="Contact Name"
              value={profile.emergencyName}
            />

            <ProfileField
              label="Contact Number"
              value={profile.emergencyPhone}
            />

          </Box>

        </Paper>


        {/* ==========================================
            TRAVEL PREFERENCES
        ========================================== */}

        <Paper
          elevation={0}
          sx={{
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            p: {
              xs: 3,
              md: 4,
            },
            mb: 3,
          }}
        >

          <SectionHeader
            icon={<FlightTakeoffIcon />}
            title="Travel Preferences"
            description="Your preferred travel experience"
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: 3,
            }}
          >

            <ProfileField
              label="Travel Type"
              value={profile.travelTypes}
            />

            <ProfileField
              label="Preferred Destinations"
              value={profile.destinations}
            />

            <ProfileField
              label="Travel Duration"
              value={profile.duration}
            />

            <ProfileField
              label="Budget Per Person"
              value={profile.budget}
            />

            <ProfileField
              label="Travel Style"
              value={profile.travelStyle}
            />

          </Box>

        </Paper>


        {/* ==========================================
            ACCOMMODATION & TRANSPORTATION
        ========================================== */}

        <Paper
          elevation={0}
          sx={{
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            p: {
              xs: 3,
              md: 4,
            },
            mb: 3,
          }}
        >

          <SectionHeader
            icon={<HotelIcon />}
            title="Accommodation & Transportation"
            description="Your stay and travel preferences"
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: 3,
            }}
          >

            <ProfileField
              label="Accommodation"
              value={profile.accommodation}
            />

            <ProfileField
              label="Accommodation Budget"
              value={profile.accommodationBudget}
            />

            <ProfileField
              label="Transportation"
              value={profile.transportation}
            />

          </Box>

        </Paper>


        {/* ==========================================
            FOOD & ACTIVITIES
        ========================================== */}

        <Paper
          elevation={0}
          sx={{
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            p: {
              xs: 3,
              md: 4,
            },
            mb: 3,
          }}
        >

          <SectionHeader
            icon={<RestaurantIcon />}
            title="Food & Activities"
            description="Your food preferences and preferred activities"
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: 3,
            }}
          >

            <ProfileField
              label="Food Preference"
              value={profile.foodPreference}
            />

            <ProfileField
              label="Preferred Cuisines"
              value={profile.cuisines}
            />

            <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
              <ProfileField
                label="Activities"
                value={profile.activities}
              />
            </Box>

          </Box>

        </Paper>


        {/* ==========================================
            SAFETY & ACCESSIBILITY
        ========================================== */}

        <Paper
          elevation={0}
          sx={{
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            p: {
              xs: 3,
              md: 4,
            },
            mb: 3,
          }}
        >

          <SectionHeader
            icon={<SecurityIcon />}
            title="Safety & Accessibility"
            description="Your safety and accessibility preferences"
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: 3,
            }}
          >

            <ProfileField
              label="Safety Level"
              value={profile.safetyLevel}
            />

            <ProfileField
              label="Accessibility"
              value={profile.accessibility}
            />

          </Box>

        </Paper>


        {/* ==========================================
            OTHER PREFERENCES
        ========================================== */}

        <Paper
          elevation={0}
          sx={{
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            p: {
              xs: 3,
              md: 4,
            },
            mb: 3,
          }}
        >

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#111827",
              mb: 3,
            }}
          >
            Other Preferences
          </Typography>

          <ProfileField
            label="Additional Preferences"
            value={profile.otherPreferences}
          />

        </Paper>


        {/* ==========================================
            BOTTOM NAVIGATION
        ========================================== */}

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => onNavigate("explore")}
          sx={{
            color: "#0f766e",
            textTransform: "none",
            fontWeight: 600,
            mb: 4,
          }}
        >
          Back to Explore
        </Button>

      </Container>

    </Box>

  );

}

export default Profile;