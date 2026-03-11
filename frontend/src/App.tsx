import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { LoginPage } from "./features/auth/views/LoginPage";
import { RegisterBeneficiaryPage } from "./features/auth/views/RegisterBeneficiaryPage";
import { RegisterDonorPage } from "./features/auth/views/RegisterDonorPage";
import { SelectionRolePage } from "./features/auth/views/SelectionRolePage";
import { DashboardPage } from "./features/dashboard/views/DashboardPage";
import { LandingPage } from "./features/landing/views/LandingPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/register-beneficiary"
          element={<RegisterBeneficiaryPage />}
        />
        <Route path="/register-donor" element={<RegisterDonorPage />} />
        <Route path="/selection" element={<SelectionRolePage />} />

        {/* Ruta protegida */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
