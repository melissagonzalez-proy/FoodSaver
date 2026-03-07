import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LandingPage } from "./features/landing/views/LandingPage";
import { LoginPage } from "./features/auth/views/LoginPage";
import { RegisterPage } from "./features/auth/views/RegisterPage";
import { DashboardPage } from "./features/dashboard/views/DashboardPage";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

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
