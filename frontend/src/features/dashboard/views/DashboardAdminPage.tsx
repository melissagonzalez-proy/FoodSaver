import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../../../lib/api";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";

import { AdminReviewModal } from "../components/AdminReviewModal";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminHeader } from "../components/AdminHeader";
import { DashboardOverview } from "../components/DashboardOverview";
import { DonationsMonitoringView } from "../components/DonationsMonitoringView";
import { TrialUsersView } from "../components/TrialUsersView";
import { UsersManagementView } from "../components/UsersManagementView";
import { DeleteUserDialog } from "../components/DeleteUserDialog";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  Tooltip,
  Legend,
);

interface UserShort {
  nombres: string;
  apellidos: string;
  email: string;
  nombreEmpresa?: string;
}

export interface DonationData {
  _id: string;
  titulo: string;
  cantidad: number;
  unidad?: string;
  estado: string;
  donor: UserShort;
  beneficiary?: UserShort;
  createdAt: string;
}

export interface CollectedMetric {
  unidad: string;
  total: number;
  count: number;
}

export interface CollectedSeriesPoint {
  mes: string;
  unidad: string;
  total: number;
  count: number;
}

export interface CollectedMetricsResponse {
  totalRecolectado: number;
  totalDonacionesRecolectadas: number;
  totalPorUnidad: CollectedMetric[];
  seriePorUnidad: CollectedSeriesPoint[];
}

export interface ReputationNotification {
  tipo: "warning" | "probation" | "final" | "message";
  estadoEntrega: "enviado" | "fallido";
  fechaHora: string;
  error?: string | null;
}

export interface TrialUser {
  _id: string;
  nombres?: string;
  apellidos?: string;
  nombreEmpresa?: string;
  email: string;
  role: "donor" | "beneficiary" | "admin";
  promedioCalificacion: number;
  totalEvaluaciones: number;
  reputationStatus: "green" | "yellow" | "red";
  diasRestantes?: number | null;
  isSuspended?: boolean;
  reputationNotifications?: ReputationNotification[];
}

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
  params: { startDate: string; endDate: string };
}

export type AdminTab = "dashboard" | "donaciones" | "usuarios" | "trial";
export type DateFilter = "month" | "last6" | "last12";

export const DashboardAdminPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  const [allDonations, setAllDonations] = useState<DonationData[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [usersList, setUsersList] = useState<any[]>([]);

  const [collectedMetrics, setCollectedMetrics] =
    useState<CollectedMetricsResponse>({
      totalRecolectado: 0,
      totalDonacionesRecolectadas: 0,
      totalPorUnidad: [],
      seriePorUnidad: [],
    });
  const [isMetricsLoading, setIsMetricsLoading] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [trialUsers, setTrialUsers] = useState<TrialUser[]>([]);
  const [isTrialLoading, setIsTrialLoading] = useState(false);
  const [reviewModal, setReviewModal] = useState({ isOpen: false, userId: "" });
  const [dateFilter, setDateFilter] = useState<DateFilter>("last6");
  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().toISOString().slice(0, 7),
  );

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string;
    rating?: number;
    totalReviews?: number;
  }>({
    isOpen: false,
    userId: null,
    userName: "",
    rating: 0,
    totalReviews: 0,
  });

  useEffect(() => {
    if (activeTab === "dashboard") {
      refreshDashboard();
    } else if (activeTab === "donaciones") {
      fetchAllDonations();
      fetchMetrics();
    } else if (activeTab === "trial") {
      fetchTrialUsers();
    } else if (activeTab === "usuarios") {
      fetchUsersList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, dateFilter, selectedMonth]);

  const dashboardRange = useMemo<DateRange>(() => {
    const now = new Date();
    if (dateFilter === "month") {
      const [yearValue, monthValue] = selectedMonth.split("-").map(Number);
      const safeYear = Number.isFinite(yearValue)
        ? yearValue
        : now.getFullYear();
      const safeMonth = Number.isFinite(monthValue)
        ? monthValue
        : now.getMonth() + 1;
      const start = new Date(safeYear, safeMonth - 1, 1);
      const end = new Date(safeYear, safeMonth, 1);
      const label = start.toLocaleString("es-ES", {
        month: "long",
        year: "numeric",
      });
      return {
        start,
        end,
        label,
        params: { startDate: start.toISOString(), endDate: end.toISOString() },
      };
    }
    const monthsBack = dateFilter === "last6" ? 6 : 12;
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const start = new Date(end);
    start.setMonth(start.getMonth() - monthsBack);
    const label = dateFilter === "last6" ? "Últimos 6 meses" : "Último año";
    return {
      start,
      end,
      label,
      params: { startDate: start.toISOString(), endDate: end.toISOString() },
    };
  }, [dateFilter, selectedMonth]);

  const fetchAllDonations = async (options?: {
    setLoading?: boolean;
    dateParams?: { startDate: string; endDate: string };
  }) => {
    const shouldSetLoading = options?.setLoading !== false;
    if (shouldSetLoading) setIsLoading(true);
    try {
      const response = await axios.get(apiUrl("/api/donations/admin/all"), {
        headers: { Authorization: `Bearer ${token}` },
        params: options?.dateParams,
      });
      setAllDonations(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      if (shouldSetLoading) setIsLoading(false);
    }
  };

  const fetchMetrics = async (dateParams?: {
    startDate: string;
    endDate: string;
  }) => {
    setIsMetricsLoading(true);
    try {
      const response = await axios.get(
        apiUrl("/api/donations/metrics/total-collected"),
        {
          headers: { Authorization: `Bearer ${token}` },
          params: dateParams,
        },
      );
      const data = response.data || {};
      setCollectedMetrics({
        totalRecolectado: data.totalRecolectado || 0,
        totalDonacionesRecolectadas: data.totalDonacionesRecolectadas || 0,
        totalPorUnidad: Array.isArray(data.totalPorUnidad)
          ? data.totalPorUnidad
          : [],
        seriePorUnidad: Array.isArray(data.seriePorUnidad)
          ? data.seriePorUnidad
          : [],
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsMetricsLoading(false);
    }
  };

  const fetchUsersList = async (options?: { setLoading?: boolean }) => {
    const shouldSetLoading = options?.setLoading !== false;
    if (shouldSetLoading) setIsLoading(true);
    try {
      const response = await axios.get(apiUrl("/api/admin/users-ratings"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsersList(response.data);
    } catch (error) {
      console.error("Error al cargar lista de usuarios:", error);
    } finally {
      if (shouldSetLoading) setIsLoading(false);
    }
  };

  const fetchTrialUsers = async () => {
    setIsTrialLoading(true);
    try {
      const response = await axios.get(apiUrl("/api/admin/trial-users"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrialUsers(response.data || []);
    } catch (error) {
      console.error("Error al cargar periodo de prueba:", error);
    } finally {
      setIsTrialLoading(false);
    }
  };

  const handleRestoreUser = async (userId: string) => {
    try {
      await axios.put(
        apiUrl(`/api/admin/trial-users/${userId}/restore`),
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchTrialUsers();
    } catch (error) {
      console.error("Error restaurando usuario:", error);
      alert("No se pudo restaurar el usuario.");
    }
  };

  const refreshDashboard = async () => {
    setIsDashboardLoading(true);
    try {
      const dateParams = dashboardRange.params;
      await Promise.all([
        fetchAllDonations({ setLoading: false, dateParams }),
        fetchUsersList({ setLoading: false }),
        fetchMetrics(dateParams),
      ]);
    } finally {
      setIsDashboardLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const confirmDelete = (user: any) => {
    setModalConfig({
      isOpen: true,
      userId: user._id,
      userName: `${user.nombres} ${user.apellidos}`,
      rating: user.promedioCalificacion,
      totalReviews: user.totalEvaluaciones,
    });
  };

  const executeAction = async () => {
    if (!modalConfig.userId) return;
    try {
      await axios.delete(
        apiUrl(`/api/admin/delete-bad-user/${modalConfig.userId}`),
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setUsersList(usersList.filter((u) => u._id !== modalConfig.userId));
      setModalConfig({
        isOpen: false,
        userId: null,
        userName: "",
        rating: 0,
        totalReviews: 0,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(
        error.response?.data?.message || "Hubo un error al ejecutar la acción.",
      );
      setModalConfig({
        isOpen: false,
        userId: null,
        userName: "",
        rating: 0,
        totalReviews: 0,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-brand-background font-sans flex flex-col md:flex-row">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="relative flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_circle_at_10%_-20%,#e6f4ea_0%,transparent_45%),radial-gradient(900px_circle_at_95%_0%,#f4f7ea_0%,transparent_40%)]" />

        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <AdminHeader
            activeTab={activeTab}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {activeTab === "dashboard" && (
            <DashboardOverview
              dateFilter={dateFilter}
              onDateFilterChange={setDateFilter}
              selectedMonth={selectedMonth}
              onSelectedMonthChange={setSelectedMonth}
              dashboardRange={dashboardRange}
              isDashboardLoading={isDashboardLoading}
              onRefresh={refreshDashboard}
              allDonations={allDonations}
              usersList={usersList}
              collectedMetrics={collectedMetrics}
              isMetricsLoading={isMetricsLoading}
              onMetricsRefresh={() => fetchMetrics(dashboardRange.params)}
            />
          )}

          {activeTab === "trial" && (
            <TrialUsersView
              trialUsers={trialUsers}
              isLoading={isTrialLoading}
              onRestore={handleRestoreUser}
              onReview={(userId) => setReviewModal({ isOpen: true, userId })}
              onDelete={confirmDelete}
            />
          )}

          {activeTab === "donaciones" && (
            <DonationsMonitoringView
              donations={allDonations}
              isLoading={isLoading}
              searchTerm={searchTerm}
              collectedMetrics={collectedMetrics}
              isMetricsLoading={isMetricsLoading}
              onMetricsRefresh={() => fetchMetrics()}
            />
          )}

          {activeTab === "usuarios" && (
            <UsersManagementView
              users={usersList}
              isLoading={isLoading}
              searchTerm={searchTerm}
              onDelete={confirmDelete}
            />
          )}
        </div>
      </main>

      <DeleteUserDialog
        config={modalConfig}
        onCancel={() =>
          setModalConfig({
            isOpen: false,
            userId: null,
            userName: "",
            rating: 0,
            totalReviews: 0,
          })
        }
        onConfirm={executeAction}
      />

      <AdminReviewModal
        isOpen={reviewModal.isOpen}
        userId={reviewModal.userId}
        onClose={() => setReviewModal({ isOpen: false, userId: "" })}
        onMessageSent={fetchTrialUsers}
      />
    </div>
  );
};
