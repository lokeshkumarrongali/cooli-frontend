import { Routes, Route } from "react-router-dom";
import RoleDashboard from "../pages/dashboard/RoleDashboard";
import WorkerHome from "../pages/worker/WorkerHome";
import WorkerProfile from "../pages/worker/WorkerProfile";
import EmployerHome from "../pages/employer/EmployerHome";
import EmployerProfile from "../pages/employer/EmployerProfile";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<RoleDashboard />} />
      <Route path="/worker/home" element={<WorkerHome />} />
      <Route path="/worker/profile" element={<WorkerProfile />} />
      <Route path="/employer/home" element={<EmployerHome />} />
      <Route path="/employer/profile" element={<EmployerProfile />} />
    </Routes>
  );
}

export default AppRoutes;
