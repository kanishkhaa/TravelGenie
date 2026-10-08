import { useState, useEffect } from "react";

import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Divider,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SaveIcon from "@mui/icons-material/Save";


// ===============================
// Reusable Styles
// ===============================

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "#ffffff",
  },

  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#0f766e",
  },

  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#0f766e",
  },
};


// ===============================
// Section Title
// ===============================

function SectionTitle({ children }) {
  return (
    <Typography
      variant="h6"
      sx={{
        fontWeight: 700,
        color: "#111827",
        mb: 2.5,
      }}
    >
      {children}
    </Typography>
  );
}


// ===============================
// Field Label
// ===============================

function FieldLabel({ children, required = false }) {
  return (
    <Typography
      sx={{
        fontSize: "0.9rem",
        fontWeight: 600,
        color: "#374151",
        mb: 0.8,
      }}
    >
      {children}

      {required && (
        <Box
          component="span"
          sx={{
            color: "#dc2626",
            ml: 0.4,
          }}
        >
          *
        </Box>
      )}
    </Typography>
  );
}


// ===============================
// Checkbox Group
// ===============================

function CheckboxGroup({
  label,
  options,
  value,
  onChange,
  required = false,
}) {
  return (
    <FormControl
      component="fieldset"
      sx={{
        width: "100%",
        mb: 2.5,
      }}
    >
      <FormLabel
        component="legend"
        sx={{
          fontSize: "0.9rem",
          fontWeight: 600,
          color: "#374151",
          mb: 1,
        }}
      >
        {label}

        {required && (
          <Box
            component="span"
            sx={{
              color: "#dc2626",
              ml: 0.4,
            }}
          >
            *
          </Box>
        )}
      </FormLabel>

      <FormGroup
        row
        sx={{
          gap: 0.5,
        }}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option}
            control={
              <Checkbox
                checked={value.includes(option)}
                onChange={() => onChange(option)}
                sx={{
                  color: "#9ca3af",

                  "&.Mui-checked": {
                    color: "#0f766e",
                  },
                }}
              />
            }
            label={option}
          />
        ))}
      </FormGroup>
    </FormControl>
  );
}


// ===============================
// Profile Component
// ===============================

function ProfileForm({ onNavigate }) {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // Personal Details
    name: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    state: "",
    city: "",
    address: "",
    pincode: "",

    // Emergency Contact
    emergencyName: "",
    emergencyPhone: "",

    // Travel Preferences
    travelTypes: [],
    destinations: [],
    duration: "",
    budget: "",
    travelStyle: [],

    // Accommodation
    accommodation: [],
    accommodationBudget: "",

    // Transportation
    transportation: [],

    // Food
    foodPreference: [],
    cuisines: [],

    // Activities
    activities: [],

    // Safety
    safetyLevel: "",
    accessibility: [],

    // Other
    otherPreferences: "",
  });

  const [errors, setErrors] = useState({});

  // ===============================
// Load Existing Profile
// ===============================

useEffect(() => {

  const loadProfile = async () => {

    const userId = localStorage.getItem("user_id");

    if (!userId) {
      return;
    }

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/profile/${userId}`
      );

      const data = await response.json();

      // Profile doesn't exist yet
      if (!response.ok) {

        console.log(
          "No existing profile found:",
          data.detail
        );

        return;
      }

      // Load profile into form
      setFormData((previous) => ({
        ...previous,
        ...data.profile,
      }));

    } catch (error) {

      console.error(
        "Error loading profile:",
        error
      );

    }
  };

  loadProfile();

}, []);

  // ===============================
  // Handle Text Fields
  // ===============================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Remove error when user starts correcting field
    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }
  };


  // ===============================
  // Calculate Age
  // ===============================

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) {
      return "";
    }

    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference =
      today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (
        monthDifference === 0 &&
        today.getDate() < birthDate.getDate()
      )
    ) {
      age--;
    }

    return age;
  };


  // ===============================
  // Handle DOB
  // ===============================

  const handleDateOfBirthChange = (event) => {
    const dateOfBirth = event.target.value;

    const calculatedAge = calculateAge(dateOfBirth);

    setFormData((previous) => ({
      ...previous,
      dateOfBirth,
      age: calculatedAge,
    }));

    if (errors.dateOfBirth) {
      setErrors((previous) => ({
        ...previous,
        dateOfBirth: "",
      }));
    }
  };


  // ===============================
  // Handle Checkboxes
  // ===============================

  const handleCheckboxChange = (field, value) => {
    setFormData((previous) => {
      const currentValues = previous[field];

      const updatedValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      return {
        ...previous,
        [field]: updatedValues,
      };
    });

    if (errors[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: "",
      }));
    }
  };


  // ===============================
  // Validate Personal Details
  // ===============================

 const validatePersonalDetails = () => {
  const newErrors = {};

  if (!formData.name.trim()) {
    newErrors.name = "Name is required";
  }

  if (!formData.phone.trim()) {
    newErrors.phone = "Mobile number is required";
  }

  if (!formData.email.trim()) {
    newErrors.email = "Email is required";
  }

  if (!formData.dateOfBirth) {
    newErrors.dateOfBirth = "Date of birth is required";
  }

  // Gender is optional, so no validation here

  if (!formData.state) {
    newErrors.state = "State is required";
  }

  if (!formData.city.trim()) {
    newErrors.city = "City is required";
  }

  if (!formData.address.trim()) {
    newErrors.address = "Address is required";
  }

  if (!formData.pincode.trim()) {
    newErrors.pincode = "Pincode is required";
  }

  if (!formData.emergencyName.trim()) {
    newErrors.emergencyName =
      "Emergency contact name is required";
  }

  if (!formData.emergencyPhone.trim()) {
    newErrors.emergencyPhone =
      "Emergency contact number is required";
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};


  // ===============================
  // Validate Travel Preferences
  // ===============================

  const validateTravelPreferences = () => {
    const newErrors = {};

    if (formData.travelTypes.length === 0) {
      newErrors.travelTypes = "Select at least one travel type";
    }

    if (formData.destinations.length === 0) {
      newErrors.destinations =
        "Select at least one preferred destination";
    }

    if (!formData.duration) {
      newErrors.duration = "Travel duration is required";
    }

    if (!formData.budget) {
      newErrors.budget = "Budget range is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  // ===============================
  // Next Button
  // ===============================

  const handleNext = () => {
    if (validatePersonalDetails()) {
      setStep(2);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };


  // ===============================
  // Back Button
  // ===============================

  const handleBack = () => {
    setStep(1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  // ===============================
  // Submit Profile
  // ===============================

  // ===============================
// Submit Profile
// ===============================

const handleSubmit = async (event) => {
  event.preventDefault();

  if (!validateTravelPreferences()) {
    return;
  }

  const userId = localStorage.getItem("user_id");

  if (!userId) {
    alert("User session not found. Please login/register again.");
    return;
  }

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/profile",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          ...formData,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.detail || "Failed to save profile");
      return;
    }

    console.log("Profile saved:", data);

    alert("Profile saved successfully!");

    // Go to Explore page
    onNavigate("explore");

  } catch (error) {
    console.error("Profile save error:", error);

    alert(
      "Unable to connect to the server. Please make sure the backend is running."
    );
  }
};


  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 72px)",
        backgroundColor: "#f8fafc",
        py: 5,
      }}
    >
      <Container maxWidth="md">

        {/* ===============================
            Header
        =============================== */}

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#111827",
            }}
          >
            Your Profile & Travel Preferences🌍✈️
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "#6b7280",
            }}
          >
            Manage your personal details and travel preferences to get personalized travel recommendations.
          </Typography>
        </Box>


        {/* ===============================
            Step Indicator
        =============================== */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 4,
          }}
        >
          {/* Step 1 */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                color: "#ffffff",
                backgroundColor:
                  step >= 1 ? "#0f766e" : "#d1d5db",
              }}
            >
              1
            </Box>

            <Typography
              sx={{
                fontWeight: 700,
                color:
                  step >= 1
                    ? "#0f766e"
                    : "#6b7280",
              }}
            >
              Personal Details
            </Typography>
          </Box>


          {/* Line */}

          <Box
            sx={{
              flex: 1,
              height: 2,
              mx: 2,
              backgroundColor:
                step === 2 ? "#0f766e" : "#d1d5db",
            }}
          />


          {/* Step 2 */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                color:
                  step === 2
                    ? "#ffffff"
                    : "#6b7280",
                backgroundColor:
                  step === 2
                    ? "#0f766e"
                    : "#e5e7eb",
              }}
            >
              2
            </Box>

            <Typography
              sx={{
                fontWeight: 700,
                color:
                  step === 2
                    ? "#0f766e"
                    : "#6b7280",
              }}
            >
              Travel Preferences
            </Typography>
          </Box>
        </Box>


        {/* ===============================
            Form Card
        =============================== */}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            backgroundColor: "#ffffff",
            borderRadius: "18px",
            p: {
              xs: 3,
              md: 5,
            },
            boxShadow:
              "0 10px 35px rgba(15, 23, 42, 0.08)",
          }}
        >

          {/* ==================================================
              STEP 1 - PERSONAL DETAILS
          ================================================== */}

          {step === 1 && (
            <>
              <SectionTitle>
                Personal Details
              </SectionTitle>


              {/* Name + Phone */}

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "1fr 1fr",
                  },
                  gap: 3,
                }}
              >

                <Box>
                  <FieldLabel required>
                    Full Name
                  </FieldLabel>

                  <TextField
                    fullWidth
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    error={Boolean(errors.name)}
                    helperText={errors.name}
                    required
                    sx={inputStyle}
                  />
                </Box>


                <Box>
                  <FieldLabel required>
                    Mobile Number
                  </FieldLabel>

                  <TextField
                    fullWidth
                    name="phone"
                    placeholder="Enter your mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    error={Boolean(errors.phone)}
                    helperText={errors.phone}
                    required
                    sx={inputStyle}
                  />
                </Box>

              </Box>


              {/* Email */}

              <Box sx={{ mt: 3 }}>
                <FieldLabel required>
                  Email Address
                </FieldLabel>

                <TextField
                  fullWidth
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  required
                  sx={inputStyle}
                />
              </Box>


              {/* DOB + Age */}

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "1fr 1fr",
                  },
                  gap: 3,
                  mt: 3,
                }}
              >

                <Box>
                  <FieldLabel required>
                    Date of Birth
                  </FieldLabel>

                  <TextField
                    fullWidth
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleDateOfBirthChange}
                    error={Boolean(errors.dateOfBirth)}
                    helperText={errors.dateOfBirth}
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={inputStyle}
                  />
                </Box>


                <Box>
                  <FieldLabel>
                    Age
                  </FieldLabel>

                  <TextField
                    fullWidth
                    value={formData.age}
                    placeholder="Automatically calculated"
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={inputStyle}
                  />
                </Box>

              </Box>


              {/* Gender */}

              <Box sx={{ mt: 3 }}>
                <FieldLabel>
                  Gender
                </FieldLabel>

                <RadioGroup
                  row
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="Female"
                    control={
                      <Radio
                        sx={{
                          "&.Mui-checked": {
                            color: "#0f766e",
                          },
                        }}
                      />
                    }
                    label="Female"
                  />

                  <FormControlLabel
                    value="Male"
                    control={
                      <Radio
                        sx={{
                          "&.Mui-checked": {
                            color: "#0f766e",
                          },
                        }}
                      />
                    }
                    label="Male"
                  />

                  <FormControlLabel
                    value="Other"
                    control={
                      <Radio
                        sx={{
                          "&.Mui-checked": {
                            color: "#0f766e",
                          },
                        }}
                      />
                    }
                    label="Other"
                  />
                </RadioGroup>

                {errors.gender && (
                  <Typography
                    sx={{
                      color: "#dc2626",
                      fontSize: "0.8rem",
                      mt: 0.5,
                    }}
                  >
                    {errors.gender}
                  </Typography>
                )}
              </Box>


              {/* State + City */}

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "1fr 1fr",
                  },
                  gap: 3,
                  mt: 3,
                }}
              >

                <Box>
                  <FieldLabel required>
                    State
                  </FieldLabel>

                  <TextField
                    select
                    fullWidth
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    error={Boolean(errors.state)}
                    helperText={errors.state}
                    required
                    sx={inputStyle}
                  >
                    <MenuItem value="Tamil Nadu">
                      Tamil Nadu
                    </MenuItem>

                    <MenuItem value="Kerala">
                      Kerala
                    </MenuItem>

                    <MenuItem value="Karnataka">
                      Karnataka
                    </MenuItem>

                    <MenuItem value="Andhra Pradesh">
                      Andhra Pradesh
                    </MenuItem>

                    <MenuItem value="Telangana">
                      Telangana
                    </MenuItem>

                    <MenuItem value="Maharashtra">
                      Maharashtra
                    </MenuItem>

                    <MenuItem value="Delhi">
                      Delhi
                    </MenuItem>

                    <MenuItem value="Rajasthan">
                      Rajasthan
                    </MenuItem>

                    <MenuItem value="Other">
                      Other
                    </MenuItem>
                  </TextField>
                </Box>


                <Box>
                  <FieldLabel required>
                    City
                  </FieldLabel>

                  <TextField
                    fullWidth
                    name="city"
                    placeholder="Enter your city"
                    value={formData.city}
                    onChange={handleChange}
                    error={Boolean(errors.city)}
                    helperText={errors.city}
                    required
                    sx={inputStyle}
                  />
                </Box>

              </Box>


              {/* Address + Pincode */}

              <Box sx={{ mt: 3 }}>
                <FieldLabel required>
                  Address
                </FieldLabel>

                <TextField
  fullWidth
  multiline
  rows={3}
  name="address"
  placeholder="Enter your address"
  value={formData.address}
  onChange={handleChange}
  error={Boolean(errors.address)}
  helperText={errors.address}
  required
  sx={inputStyle}
/>
              </Box>


              <Box sx={{ mt: 3 }}>
                <FieldLabel required>
                  Pincode
                </FieldLabel>

                <TextField
  fullWidth
  name="pincode"
  placeholder="Enter pincode"
  value={formData.pincode}
  onChange={handleChange}
  error={Boolean(errors.pincode)}
  helperText={errors.pincode}
  required
  sx={inputStyle}
/>
              </Box>


              <Divider sx={{ my: 4 }} />


              {/* Emergency Contact */}

              <SectionTitle>
                Emergency Contact
              </SectionTitle>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "1fr 1fr",
                  },
                  gap: 3,
                }}
              >

                <Box>
                  <FieldLabel required>
                    Emergency Contact Name
                  </FieldLabel>

                  <TextField
  fullWidth
  name="emergencyName"
  placeholder="Enter contact name"
  value={formData.emergencyName}
  onChange={handleChange}
  error={Boolean(errors.emergencyName)}
  helperText={errors.emergencyName}
  required
  sx={inputStyle}
/>
                </Box>


                <Box>
                  <FieldLabel required>
                    Emergency Contact Number
                  </FieldLabel>

                  <TextField
  fullWidth
  name="emergencyPhone"
  placeholder="Enter contact number"
  value={formData.emergencyPhone}
  onChange={handleChange}
  error={Boolean(errors.emergencyPhone)}
  helperText={errors.emergencyPhone}
  required
  sx={inputStyle}
/>
                </Box>

              </Box>


              {/* Next Button */}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mt: 5,
                }}
              >
                <Button
                  type="button"
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleNext}
                  sx={{
                    backgroundColor: "#0f766e",
                    px: 4,
                    py: 1.4,
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 700,

                    "&:hover": {
                      backgroundColor: "#115e59",
                    },
                  }}
                >
                  Next
                </Button>
              </Box>
            </>
          )}


          {/* ==================================================
              STEP 2 - TRAVEL PREFERENCES
          ================================================== */}

          {step === 2 && (
            <>
              <SectionTitle>
                Travel Preferences
              </SectionTitle>


              {/* Travel Type */}

              <CheckboxGroup
                label="Travel Type"
                required
                options={[
                  "Solo",
                  "Friends",
                  "Family",
                  "Couples",
                ]}
                value={formData.travelTypes}
                onChange={(value) =>
                  handleCheckboxChange(
                    "travelTypes",
                    value
                  )
                }
              />

              {errors.travelTypes && (
                <Typography
                  sx={{
                    color: "#dc2626",
                    fontSize: "0.8rem",
                    mt: -2,
                    mb: 2,
                  }}
                >
                  {errors.travelTypes}
                </Typography>
              )}


              {/* Preferred Destinations */}

              <CheckboxGroup
                label="Preferred Destinations"
                required
                options={[
                  "Beaches",
                  "Hill Stations",
                  "Historical",
                  "Religious",
                  "Wildlife",
                  "Adventure",
                  "Waterfalls",
                  "Lakes",
                  "Forests",
                  "Cultural",
                  "Heritage",
                  "Museums",
                  "Cities",
                  "Villages / Rural",
                  "Islands",
                  "Desert",
                  "Romantic",
                  "Offbeat",
                ]}
                value={formData.destinations}
                onChange={(value) =>
                  handleCheckboxChange(
                    "destinations",
                    value
                  )
                }
              />

              {errors.destinations && (
                <Typography
                  sx={{
                    color: "#dc2626",
                    fontSize: "0.8rem",
                    mt: -2,
                    mb: 2,
                  }}
                >
                  {errors.destinations}
                </Typography>
              )}


              {/* Duration + Budget */}

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "1fr 1fr",
                  },
                  gap: 3,
                  mt: 2,
                }}
              >

                <Box>
                  <FieldLabel required>
                    Preferred Travel Duration
                  </FieldLabel>

                  <TextField
                    select
                    fullWidth
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    error={Boolean(errors.duration)}
                    helperText={errors.duration}
                    required
                    sx={inputStyle}
                  >
                    <MenuItem value="1 Day">
                      1 Day
                    </MenuItem>

                    <MenuItem value="2-3 Days">
                      2-3 Days
                    </MenuItem>

                    <MenuItem value="4-5 Days">
                      4-5 Days
                    </MenuItem>

                    <MenuItem value="6-7 Days">
                      6-7 Days
                    </MenuItem>

                    <MenuItem value="8-14 Days">
                      8-14 Days
                    </MenuItem>

                    <MenuItem value="15+ Days">
                      15+ Days
                    </MenuItem>

                    <MenuItem value="Flexible">
                      Flexible
                    </MenuItem>
                  </TextField>
                </Box>


                <Box>
                  <FieldLabel required>
                    Budget Per Person
                  </FieldLabel>

                  <TextField
                    select
                    fullWidth
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    error={Boolean(errors.budget)}
                    helperText={errors.budget}
                    required
                    sx={inputStyle}
                  >
                    <MenuItem value="Below ₹5,000">
                      Below ₹5,000
                    </MenuItem>

                    <MenuItem value="₹5,000 - ₹10,000">
                      ₹5,000 - ₹10,000
                    </MenuItem>

                    <MenuItem value="₹10,000 - ₹25,000">
                      ₹10,000 - ₹25,000
                    </MenuItem>

                    <MenuItem value="₹25,000 - ₹50,000">
                      ₹25,000 - ₹50,000
                    </MenuItem>

                    <MenuItem value="₹50,000 - ₹1,00,000">
                      ₹50,000 - ₹1,00,000
                    </MenuItem>

                    <MenuItem value="Above ₹1,00,000">
                      Above ₹1,00,000
                    </MenuItem>
                  </TextField>
                </Box>

              </Box>


              <Divider sx={{ my: 4 }} />


              {/* Travel Style */}

              <CheckboxGroup
                label="Travel Style"
                options={[
                  "Relaxation",
                  "Adventure",
                  "Nature",
                  "Cultural",
                  "Historical",
                  "Spiritual",
                  "Food",
                  "Shopping",
                  "Nightlife",
                  "Photography",
                  "Wellness",
                  "Luxury",
                  "Budget",
                  "Road Trips",
                  "Trekking",
                  "Wildlife",
                ]}
                value={formData.travelStyle}
                onChange={(value) =>
                  handleCheckboxChange(
                    "travelStyle",
                    value
                  )
                }
              />


              <Divider sx={{ my: 4 }} />


              {/* Accommodation */}

              <SectionTitle>
                Accommodation Preferences
              </SectionTitle>

              <CheckboxGroup
                label="Preferred Accommodation"
                options={[
                  "Hotels",
                  "Resorts",
                  "Hostels",
                  "Homestays",
                  "Guest Houses",
                  "Camping",
                  "Luxury Hotels",
                ]}
                value={formData.accommodation}
                onChange={(value) =>
                  handleCheckboxChange(
                    "accommodation",
                    value
                  )
                }
              />


              <Box sx={{ mb: 3 }}>
                <FieldLabel>
                  Accommodation Budget
                </FieldLabel>

                <TextField
                  select
                  fullWidth
                  name="accommodationBudget"
                  value={formData.accommodationBudget}
                  onChange={handleChange}
                  sx={inputStyle}
                >
                  <MenuItem value="Budget">
                    Budget
                  </MenuItem>

                  <MenuItem value="Mid-range">
                    Mid-range
                  </MenuItem>

                  <MenuItem value="Premium">
                    Premium
                  </MenuItem>

                  <MenuItem value="Luxury">
                    Luxury
                  </MenuItem>
                </TextField>
              </Box>


              <Divider sx={{ my: 4 }} />


              {/* Transportation */}

              <SectionTitle>
                Transportation Preferences
              </SectionTitle>

              <CheckboxGroup
                label="Preferred Transportation"
                options={[
                  "Flight",
                  "Train",
                  "Bus",
                  "Car",
                  "Rental Car",
                  "Bike",
                  "Metro",
                  "Local Transport",
                ]}
                value={formData.transportation}
                onChange={(value) =>
                  handleCheckboxChange(
                    "transportation",
                    value
                  )
                }
              />


              <Divider sx={{ my: 4 }} />


              {/* Food */}

              <SectionTitle>
                Food Preferences
              </SectionTitle>

              <CheckboxGroup
                label="Food Preference"
                options={[
                  "Vegetarian",
                  "Non-Vegetarian",
                  "Vegan",
                  "Jain",
                  "Halal",
                ]}
                value={formData.foodPreference}
                onChange={(value) =>
                  handleCheckboxChange(
                    "foodPreference",
                    value
                  )
                }
              />

              <CheckboxGroup
                label="Preferred Cuisines"
                options={[
                  "South Indian",
                  "North Indian",
                  "Chinese",
                  "Italian",
                  "Continental",
                  "Street Food",
                  "Seafood",
                  "Local Cuisine",
                ]}
                value={formData.cuisines}
                onChange={(value) =>
                  handleCheckboxChange(
                    "cuisines",
                    value
                  )
                }
              />


              <Divider sx={{ my: 4 }} />


              {/* Activities */}

              <SectionTitle>
                Activities
              </SectionTitle>

              <CheckboxGroup
                label="Preferred Activities"
                options={[
                  "Trekking",
                  "Hiking",
                  "Sightseeing",
                  "Photography",
                  "Water Sports",
                  "Camping",
                  "Wildlife Safari",
                  "Shopping",
                  "Cultural Experiences",
                  "Nightlife",
                  "Boating",
                  "Cycling",
                ]}
                value={formData.activities}
                onChange={(value) =>
                  handleCheckboxChange(
                    "activities",
                    value
                  )
                }
              />


              <Divider sx={{ my: 4 }} />


              {/* Safety */}

              <SectionTitle>
                Safety & Accessibility
              </SectionTitle>

              <Box sx={{ mb: 3 }}>
                <FieldLabel>
                  Preferred Safety Level
                </FieldLabel>

                <RadioGroup
                  row
                  name="safetyLevel"
                  value={formData.safetyLevel}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="Normal"
                    control={<Radio />}
                    label="Normal"
                  />

                  <FormControlLabel
                    value="High"
                    control={<Radio />}
                    label="High"
                  />

                  <FormControlLabel
                    value="Very High"
                    control={<Radio />}
                    label="Very High"
                  />
                </RadioGroup>
              </Box>


              <CheckboxGroup
                label="Accessibility Requirements"
                options={[
                  "Wheelchair Accessible",
                  "Elderly Friendly",
                  "Child Friendly",
                  "Medical Facilities Nearby",
                  "Low Walking Required",
                ]}
                value={formData.accessibility}
                onChange={(value) =>
                  handleCheckboxChange(
                    "accessibility",
                    value
                  )
                }
              />


              {/* Other Preferences */}

              <Box sx={{ mt: 2 }}>
                <FieldLabel>
                  Other Travel Preferences
                </FieldLabel>

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="otherPreferences"
                  placeholder="Tell us anything else about your travel preferences..."
                  value={formData.otherPreferences}
                  onChange={handleChange}
                  sx={inputStyle}
                />
              </Box>


              {/* Buttons */}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 5,
                  gap: 2,
                }}
              >

                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  sx={{
                    px: 3,
                    py: 1.4,
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 700,
                    color: "#0f766e",
                    borderColor: "#0f766e",

                    "&:hover": {
                      borderColor: "#115e59",
                      backgroundColor: "#f0fdfa",
                    },
                  }}
                >
                  Back
                </Button>


                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  sx={{
                    px: 4,
                    py: 1.4,
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 700,
                    backgroundColor: "#0f766e",

                    "&:hover": {
                      backgroundColor: "#115e59",
                    },
                  }}
                >
                  Save Profile
                </Button>

              </Box>
            </>
          )}

        </Box>

      </Container>
    </Box>
  );
}

export default ProfileForm;