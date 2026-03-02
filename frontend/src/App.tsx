import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LandingPage } from "./features/landing/views/LandingPage";
import { LoginPage } from "./features/auth/views/LoginPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/register"
          element={
            <div className="min-h-screen flex items-center justify-center text-brand-text">
              <h1 className="text-2xl font-jakarta">
                Vista de Registro (En construcción)
              </h1>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
