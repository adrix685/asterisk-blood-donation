import { BrowserRouter, Routes, Route } from "react-router-dom";
import FindDonors from "./FindDonors/FindDonors";
import DonorDashboard from "./DonorDashboard/DonorDashboard.jsx";
import Donate from "./Donate/Donate.jsx";
import DonorProfile from ".//DonorProfile/DonorProfile.jsx";
import DonorStatus from "./DonorStatus/DonorStatus.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/find-donors" element={<FindDonors/>}/>
        <Route path="/donor-status" element={<DonorStatus />} />
        <Route path="/" element={<DonorDashboard />} />
        <Route path="/donor-dashboard" element={<DonorDashboard />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/donor-profile" element={<DonorProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;