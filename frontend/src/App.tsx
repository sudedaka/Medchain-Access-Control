import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import DoctorDashboard from "./pages/DoctorDashboard";
import LabDashboard from "./pages/LabDashboard";
import PatientDashboard from "./pages/PatientDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/doctor" element={<DoctorDashboard />} />
      <Route path="/lab" element={<LabDashboard />} />
      <Route path="/patient" element={<PatientDashboard />} />
    </Routes>
  );
}

export default App;
