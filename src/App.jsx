import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FindDonors from "./FindDonors/FindDonors";
import DonorDashboard from "./DonorDashboard/DonorDashboard";
import DonorStatus from "./DonorStatus/DonorStatus";
import DonorProfile from "./DonorProfile/DonorProfile";
import Donate from "./Donate/Donate";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" element={<FindDonors />} 
        />

        <Route
          path="/find-donors"
          element={<FindDonors />}
        />

        <Route
          path="/donor-dashboard"
          element={<DonorDashboard />}
        />

        <Route
          path="/donor-status"
          element={<DonorStatus />}
        />
        <Route
          path="/donor-profile"
          element={<DonorProfile />}
        />
          <Route
          path="/donate"
          element={<Donate />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;