import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRole?: "admin" | "donor" | "beneficiary";
}

export const ProtectedRoute = ({ allowedRole }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);

  if (allowedRole && user.role !== allowedRole) {
    if (user.role === "admin")
      return <Navigate to="/dashboard-admin" replace />;
    if (user.role === "donor")
      return <Navigate to="/dashboard-donor" replace />;
    if (user.role === "beneficiary")
      return <Navigate to="/dashboard-beneficiary" replace />;

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
