import { useState } from "react";

import Navbar from "./components/common/Navbar";
import ComingSoon from "./components/common/ComingSoon";

import Home from "./pages/Home/Home";
import DestinationSearch from "./pages/Destinations/DestinationSearch";
import DestinationDetails from "./pages/Destinations/DestinationDetails";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const [selectedDestination, setSelectedDestination] =
    useState(null);

  const handleNavigation = (page) => {
    setSelectedDestination(null);
    setCurrentPage(page);
  };

  const handleViewDetails = (destination) => {
    setSelectedDestination(destination);
  };

  const renderPage = () => {
    if (selectedDestination) {
      return (
        <DestinationDetails
          destination={selectedDestination}
          onBack={() => setSelectedDestination(null)}
        />
      );
    }

    switch (currentPage) {
      case "home":
        return <Home onNavigate={handleNavigation} />;

      case "explore":
        return (
          <DestinationSearch
            onViewDetails={handleViewDetails}
          />
        );

      case "recommendations":
        return (
          <ComingSoon
            feature="AI Destination Recommendations"
            onBack={() => handleNavigation("explore")}
          />
        );

      case "assistant":
        return (
          <ComingSoon
            feature="AI Travel Assistant"
            onBack={() => handleNavigation("explore")}
          />
        );

      case "trips":
        return (
          <ComingSoon
            feature="My Trips"
            onBack={() => handleNavigation("explore")}
          />
        );

      case "favorites":
        return (
          <ComingSoon
            feature="Saved & Favourite Destinations"
            onBack={() => handleNavigation("explore")}
          />
        );

      case "dashboard":
        return (
          <ComingSoon
            feature="Tourist Dashboard"
            onBack={() => handleNavigation("explore")}
          />
        );

      case "planner":
        return (
          <ComingSoon
            feature="AI-Powered Smart Travel Planner"
            onBack={() => handleNavigation("explore")}
          />
        );

      case "profile":
        return (
          <ComingSoon
            feature="User Profile & Authentication"
            onBack={() => handleNavigation("explore")}
          />
        );

      default:
        return <Home onNavigate={handleNavigation} />;
    }
  };

  return (
    <>
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigation}
      />

      {renderPage()}
    </>
  );
}

export default App;