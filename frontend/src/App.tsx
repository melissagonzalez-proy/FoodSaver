import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { LoginPage } from "./features/auth/views/LoginPage";
import { RegisterBeneficiaryPage } from "./features/auth/views/RegisterBeneficiaryPage";
import { RegisterDonorPage } from "./features/auth/views/RegisterDonorPage";
import { SelectionRolePage } from "./features/auth/views/SelectionRolePage";
import { LandingPage } from "./features/landing/views/LandingPage";
import { DashboardAdminPage } from "./features/dashboard/views/DashboardAdminPage";
import { DashboardDonorPage } from "./features/dashboard/views/DashboardDonorPage";
import { DashboardBeneficiaryPage } from "./features/dashboard/views/DashboardBeneficiaryPage";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { ForgotPasswordPage } from "./features/auth/views/ForgotPasswordPage";
import { ResetPasswordPage } from "./features/auth/views/ResetPasswordPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route
          path="/register-beneficiary"
          element={<RegisterBeneficiaryPage />}
        />
        <Route path="/register-donor" element={<RegisterDonorPage />} />
        <Route path="/selection" element={<SelectionRolePage />} />
        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route path="/dashboard-admin" element={<DashboardAdminPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRole="donor" />}>
          <Route path="/dashboard-donor" element={<DashboardDonorPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRole="beneficiary" />}>
          <Route
            path="/dashboard-beneficiary"
            element={<DashboardBeneficiaryPage />}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
