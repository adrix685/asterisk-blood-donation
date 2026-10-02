import { BrowserRouter, Routes, Route } from "react-router-dom";
import DonorDashboard from "./DonorDashboard/DonorDashboard.jsx";
import Donate from "./Donate/Donate.jsx";
import DonorProfile from ".//DonorProfile/DonorProfile.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DonorDashboard />} />
        <Route path="/donor-dashboard" element={<DonorDashboard />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/donor-profile" element={<DonorProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;