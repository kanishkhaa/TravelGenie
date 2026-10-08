import { useEffect, useState } from "react";

import Navbar from "./components/common/Navbar";
import ComingSoon from "./components/common/ComingSoon";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProfileForm from "./pages/ProfileForm";
import Profile from "./pages/Profile"; 
import Home from "./pages/Home/Home";
import DestinationSearch from "./pages/Destinations/DestinationSearch";
import DestinationDetails from "./pages/Destinations/DestinationDetails";
import SmartPlanner from "./pages/Planner/SmartPlanner";
import MyTrips from "./pages/Trips/MyTrips";
import Dashboard from "./pages/Dashboard";
import Favorites from "./pages/Favorites";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import AssistantWidget from "./components/common/AssistantWidget";
import EmergencySOS from "./components/common/EmergencySOS";
import SafetyMap from "./pages/SafetyMap";
import { acceptTripInvite } from "./services/plannerService";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const [selectedDestination, setSelectedDestination] =
    useState(null);
  
  
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem("access_token")));

  const handleNavigation = (page) => {
    setSelectedDestination(null);
    setCurrentPage(page);
  };

  const handleViewDetails = (destination) => {
    setSelectedDestination(destination);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linkToken = params.get("invite");
    if (linkToken) {
      sessionStorage.setItem("pending_trip_invite", linkToken);
      params.delete("invite");
      const query = params.toString();
      window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
    }
    const token = sessionStorage.getItem("pending_trip_invite");
    if (!token) return undefined;
    if (!isLoggedIn) {
      setCurrentPage("login");
      return undefined;
    }
    let active = true;
    acceptTripInvite(token).then((result) => {
      sessionStorage.setItem("trip_invite_notice", result.message || "Trip invitation accepted.");
      if (active) setCurrentPage("trips");
    }).catch((reason) => {
      sessionStorage.setItem("trip_invite_notice", reason.message || "This trip invite could not be accepted.");
      if (active) setCurrentPage("trips");
    }).finally(() => sessionStorage.removeItem("pending_trip_invite"));
    return () => { active = false; };
  }, [isLoggedIn]);

  const renderPage = () => {
    if (selectedDestination) {
      return (
        <DestinationDetails
          destination={selectedDestination}
          onNavigate={handleNavigation}
          onBack={() => setSelectedDestination(null)}
        />
      );
    }

    switch (currentPage) {
      case "home":
        return <Home onNavigate={handleNavigation} />;
      case "register":
        return <Register onNavigate={handleNavigation} onAuthenticated={() => setIsLoggedIn(true)} />;
      case "login":
        return <Login onNavigate={handleNavigation} onAuthenticated={() => setIsLoggedIn(true)} />;
      
      case "explore":
        return (
          <DestinationSearch
            onViewDetails={handleViewDetails}
            onNavigate={handleNavigation}
          />
        );

      case "recommendations":
        return (
          <ComingSoon
            feature="AI Destination Recommendations"
            onBack={() => handleNavigation("explore")}
          />
        );

      case "trips":
        return <MyTrips onNavigate={handleNavigation} />;

      case "favorites":
        return <Favorites onNavigate={handleNavigation} onViewDetails={handleViewDetails} />;

      case "safety":
        return <SafetyMap />;

      case "dashboard":
        return <Dashboard onNavigate={handleNavigation} />;

      case "planner":
        return <SmartPlanner />;

      case "profileform":
        if (!isLoggedIn) return <Login onNavigate={handleNavigation} onAuthenticated={() => setIsLoggedIn(true)} />;
        return (
          <ProfileForm
            onBack={() => handleNavigation("explore")}
            onNavigate={handleNavigation}
          />
        );
      case "profile":
        if (!isLoggedIn) return <Login onNavigate={handleNavigation} onAuthenticated={() => setIsLoggedIn(true)} />;
        return (
           <Profile
              onNavigate={handleNavigation}
          />
        );

      default:
        return <Home onNavigate={handleNavigation} />;
    }
  };

  return (
    <FavoritesProvider isLoggedIn={isLoggedIn} onLoginRequired={() => handleNavigation("login")}>
    <>
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigation}
        isLoggedIn={isLoggedIn}
        onLogout={() => { localStorage.removeItem("access_token"); localStorage.removeItem("user_id"); localStorage.removeItem("user_name"); localStorage.removeItem("user_email"); setIsLoggedIn(false); handleNavigation("home"); }}
      />

      {renderPage()}
      <AssistantWidget onLoginRequired={() => handleNavigation("login")} />
      <EmergencySOS />
    </>
    </FavoritesProvider>
  );
}

export default App;
