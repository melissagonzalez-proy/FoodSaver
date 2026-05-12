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
  TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  Users,
  CheckCircle,
  XCircle,
  LogOut,
  Search,
  Leaf,
  AlertTriangle,
  PackageOpen,
  Clock,
  Box,
  TrendingUp,
  RefreshCw,
  Star,
  UserCog,
  Trash2,
} from "lucide-react";

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

interface DonationData { 
  _id: string; 
  titulo: string; 
  cantidad: number; 
  unidad?: string; 
  estado: string; 
  donor: UserShort; 
  beneficiary?: UserShort; 
  createdAt: string; 
}

interface CollectedMetric {
  unidad: string;
  total: number;
  count: number;
}

interface CollectedSeriesPoint {
  mes: string;
  unidad: string;
  total: number;
  count: number;
}

interface CollectedMetricsResponse {
  totalRecolectado: number;
  totalDonacionesRecolectadas: number;
  totalPorUnidad: CollectedMetric[];
  seriePorUnidad: CollectedSeriesPoint[];
}

interface DateRange {
  start: Date;
  end: Date;
  label: string;
  params: { startDate: string; endDate: string };
}

export const DashboardAdminPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "donaciones" | "usuarios"
  >("dashboard");

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
  const [dateFilter, setDateFilter] = useState<
    "month" | "last6" | "last12"
  >("last6");
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
    } else if (activeTab === "usuarios") {
      fetchUsersList();
    }
  }, [activeTab, dateFilter, selectedMonth]);

  const dashboardRange = useMemo<DateRange>(() => {
    const now = new Date();

    if (dateFilter === "month") {
      const [yearValue, monthValue] = selectedMonth.split("-").map(Number);
      const safeYear = Number.isFinite(yearValue) ? yearValue : now.getFullYear();
      const safeMonth = Number.isFinite(monthValue) ? monthValue : now.getMonth() + 1;
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
        params: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
      };
    }

    const monthsBack = dateFilter === "last6" ? 6 : 12;
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const start = new Date(end);
    start.setMonth(start.getMonth() - monthsBack);
    const label =
      dateFilter === "last6" ? "Últimos 6 meses" : "Último año";

    return {
      start,
      end,
      label,
      params: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
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
      await axios.delete(apiUrl(`/api/admin/delete-bad-user/${modalConfig.userId}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsersList(usersList.filter((user) => user._id !== modalConfig.userId));
      setModalConfig({
        isOpen: false,
        userId: null,
        userName: "",
        rating: 0,
        totalReviews: 0,
      });
    } catch (error: any) {
      alert(error.response?.data?.message || "Hubo un error al ejecutar la acción.");
      setModalConfig({
        isOpen: false,
        userId: null,
        userName: "",
        rating: 0,
        totalReviews: 0,
      });
    }
  };
  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); };

  const filteredDonations = allDonations.filter((don) => {
    const term = searchTerm.toLowerCase();
    return (
      don.titulo.toLowerCase().includes(term) ||
      (don.donor?.nombres || "").toLowerCase().includes(term) ||
      (don.beneficiary?.nombres || "").toLowerCase().includes(term)
    );
  });
  const filteredUsersList = usersList.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      (user.nombres || "").toLowerCase().includes(term) ||
      (user.email || "").toLowerCase().includes(term)
    );
  });

  const donationStats = allDonations.reduce(
    (acc, donation) => {
      acc.total += 1;
      if (donation.estado === "activo") acc.activo += 1;
      if (donation.estado === "asignado") acc.asignado += 1;
      if (donation.estado === "recolectado") acc.recolectado += 1;
      if (donation.estado === "cancelado") acc.cancelado += 1;
      return acc;
    },
    {
      total: 0,
      activo: 0,
      asignado: 0,
      recolectado: 0,
      cancelado: 0,
    },
  );

  const usersForDashboard = usersList.filter((user) => {
    if (!user.createdAt) return true;
    const date = new Date(user.createdAt);
    return date >= dashboardRange.start && date < dashboardRange.end;
  });

  const totalUsers = usersForDashboard.length;
  const donorCount = usersForDashboard.filter(
    (user) => user.role === "donor",
  ).length;
  const beneficiaryCount = usersForDashboard.filter(
    (user) => user.role === "beneficiary",
  ).length;
  const adminCount = usersForDashboard.filter(
    (user) => user.role === "admin",
  ).length;
  const totalEvaluations = usersForDashboard.reduce(
    (acc, user) => acc + (user.totalEvaluaciones || 0),
    0,
  );
  const weightedRatingSum = usersForDashboard.reduce(
    (acc, user) =>
      acc + (user.promedioCalificacion || 0) * (user.totalEvaluaciones || 0),
    0,
  );
  const averageRating =
    totalEvaluations > 0
      ? (weightedRatingSum / totalEvaluations).toFixed(2)
      : "—";

  const completionRate =
    donationStats.total > 0
      ? Math.round((donationStats.recolectado / donationStats.total) * 100)
      : 0;

  const recentDonations = [...allDonations]
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const unitMetrics = collectedMetrics.totalPorUnidad || [];
  const maxUnitTotal = Math.max(
    ...unitMetrics.map((metric) => metric.total),
    1,
  );

  const seriesByUnit = collectedMetrics.seriePorUnidad || [];
  const chartLabels = useMemo(() => {
    const labels = Array.from(
      new Set(seriesByUnit.map((point) => point.mes)),
    ).sort();
    return labels;
  }, [seriesByUnit]);

  const chartDatasets = useMemo(() => {
    const palette = [
      "#16a34a",
      "#f59e0b",
      "#3b82f6",
      "#ef4444",
      "#8b5cf6",
      "#14b8a6",
    ];
    const unitKeys = Array.from(
      new Set(seriesByUnit.map((point) => point.unidad)),
    ).sort();

    return unitKeys.map((unit, index) => {
      const data = chartLabels.map((label) => {
        const match = seriesByUnit.find(
          (point) => point.unidad === unit && point.mes === label,
        );
        return match ? match.total : 0;
      });

      const color = palette[index % palette.length];

      return {
        label: unit,
        data,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
        borderRadius: 6,
      };
    });
  }, [chartLabels, seriesByUnit]);

  const chartLabelNames = useMemo(
    () =>
      chartLabels.map((label) => {
        const [yearValue, monthValue] = label.split("-").map(Number);
        const safeYear = Number.isFinite(yearValue) ? yearValue : 2000;
        const safeMonth = Number.isFinite(monthValue) ? monthValue - 1 : 0;
        const date = new Date(safeYear, safeMonth, 1);
        return date.toLocaleString("es-ES", {
          month: "short",
          year: "2-digit",
        });
      }),
    [chartLabels],
  );

  const chartData = useMemo(
    () => ({
      labels: chartLabelNames,
      datasets: chartDatasets,
    }),
    [chartLabelNames, chartDatasets],
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: {
            color: "#94a3b8",
            usePointStyle: true,
          },
        },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<"bar">) =>
              `${context.dataset.label || "Unidad"}: ${context.raw}`,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#94a3b8",
          },
          grid: {
            display: false,
          },
        },
        y: {
          ticks: {
            color: "#94a3b8",
          },
          grid: {
            color: "rgba(148, 163, 184, 0.2)",
          },
        },
      },
    }),
    [],
  );

  return (
    <div className="h-screen overflow-hidden bg-brand-background font-sans flex flex-col md:flex-row relative">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-brand-card border-r border-brand-border p-6 flex flex-col z-10">
        <div className="flex items-center gap-2 text-brand-accent mb-10">
          <Leaf size={28} />
          <span className="text-2xl font-bold tracking-tight text-brand-text font-jakarta">FoodSaver</span>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors w-full text-left ${activeTab === "dashboard" ? "bg-brand-accent/10 text-brand-accent" : "text-brand-muted hover:bg-brand-background hover:text-brand-text"}`}
          >
            <TrendingUp size={20} /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab("donaciones")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors w-full text-left ${activeTab === "donaciones" ? "bg-brand-accent/10 text-brand-accent" : "text-brand-muted hover:bg-brand-background hover:text-brand-text"}`}
          >
            <PackageOpen size={20} /> Monitoreo Alimentos
          </button>
          <button
            onClick={() => setActiveTab("usuarios")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors w-full text-left ${activeTab === "usuarios" ? "bg-brand-accent/10 text-brand-accent" : "text-brand-muted hover:bg-brand-background hover:text-brand-text"}`}
          >
            <UserCog size={20} /> Gestión Usuarios
          </button>
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl font-medium transition-colors w-full text-left">
          <LogOut size={20} /> Cerrar Sesión
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto z-10">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-text font-jakarta mb-2">Panel de Administración</h1>
            <p className="text-brand-muted">
              {activeTab === "dashboard"
                ? "Visualiza el pulso del sistema y la interacción de la comunidad."
                : activeTab === "donaciones"
                  ? "Supervisa todas las donaciones activas e histórico del sistema."
                  : "Supervisa la reputación y mantén la seguridad de la comunidad."}
            </p>
          </div>

          {activeTab !== "dashboard" && (
            <div className="relative w-full md:w-72">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-brand-card border border-brand-border rounded-xl pl-10 pr-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-accent transition-colors shadow-sm"
              />
            </div>
          )}
        </header>

        {/* --- VISTA 1: DASHBOARD --- */}
        {activeTab === "dashboard" && (
          <div className="flex flex-col gap-6">
            <div className="bg-brand-card border border-brand-border rounded-3xl p-4 flex flex-col xl:flex-row xl:items-center gap-4 justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setDateFilter("month")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    dateFilter === "month"
                      ? "bg-brand-accent/10 text-brand-accent"
                      : "text-brand-muted hover:text-brand-text hover:bg-brand-background"
                  }`}
                >
                  Por mes
                </button>
                <button
                  onClick={() => setDateFilter("last6")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    dateFilter === "last6"
                      ? "bg-brand-accent/10 text-brand-accent"
                      : "text-brand-muted hover:text-brand-text hover:bg-brand-background"
                  }`}
                >
                  Últimos 6 meses
                </button>
                <button
                  onClick={() => setDateFilter("last12")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    dateFilter === "last12"
                      ? "bg-brand-accent/10 text-brand-accent"
                      : "text-brand-muted hover:text-brand-text hover:bg-brand-background"
                  }`}
                >
                  Último año
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {dateFilter === "month" && (
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(event) => setSelectedMonth(event.target.value)}
                    className="bg-brand-background border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-text focus:border-brand-accent outline-none"
                  />
                )}
                <span className="text-xs text-brand-muted">
                  Rango: {dashboardRange.label}
                </span>
                <button
                  onClick={refreshDashboard}
                  disabled={isDashboardLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-background border border-brand-border text-sm font-medium text-brand-text hover:border-brand-accent transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={isDashboardLoading ? "animate-spin" : ""}
                  />
                  Actualizar datos
                </button>
              </div>
            </div>

            {isDashboardLoading ? (
              <div className="bg-brand-card border border-brand-border rounded-4xl p-10 text-center text-brand-muted">
                Cargando dashboard...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  <div className="bg-brand-card border border-brand-border rounded-3xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-brand-muted uppercase tracking-wider">
                        Usuarios nuevos
                      </p>
                      <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 text-brand-accent flex items-center justify-center">
                        <Users size={22} />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-brand-text font-jakarta">
                      {totalUsers}
                    </div>
                    <p className="text-xs text-brand-muted mt-2">
                      Donadores {donorCount} • Beneficiarios {beneficiaryCount} •
                      Admin {adminCount}
                    </p>
                  </div>

                  <div className="bg-brand-card border border-brand-border rounded-3xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-brand-muted uppercase tracking-wider">
                        Entregas completadas
                      </p>
                      <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center">
                        <Box size={22} />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-brand-text font-jakarta">
                      {donationStats.recolectado}
                    </div>
                    <p className="text-xs text-brand-muted mt-2">
                      Tasa de entrega {completionRate}%
                    </p>
                    <div className="mt-3 h-2 bg-brand-background rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-brand-card border border-brand-border rounded-3xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-brand-muted uppercase tracking-wider">
                        Reservas activas
                      </p>
                      <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                        <Clock size={22} />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-brand-text font-jakarta">
                      {donationStats.asignado}
                    </div>
                    <p className="text-xs text-brand-muted mt-2">
                      Publicaciones activas {donationStats.activo}
                    </p>
                  </div>

                  <div className="bg-brand-card border border-brand-border rounded-3xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-brand-muted uppercase tracking-wider">
                        Evaluaciones
                      </p>
                      <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                        <Star size={22} />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-brand-text font-jakarta">
                      {totalEvaluations}
                    </div>
                    <p className="text-xs text-brand-muted mt-2">
                      Promedio comunidad {averageRating} ★
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 bg-brand-card border border-brand-border rounded-4xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-sm font-semibold text-brand-muted uppercase tracking-wider">
                          Impacto por unidad
                        </p>
                        <p className="text-xs text-brand-muted">
                          Suma de cantidades recolectadas por tipo de medida en
                          {" "}{dashboardRange.label}.
                        </p>
                      </div>
                      <button
                        onClick={fetchMetrics}
                        disabled={isMetricsLoading}
                        className="p-3 text-brand-muted hover:text-brand-accent hover:bg-brand-background rounded-full transition-all disabled:opacity-50"
                        title="Actualizar Métrica"
                      >
                        <RefreshCw
                          size={18}
                          className={isMetricsLoading ? "animate-spin" : ""}
                        />
                      </button>
                    </div>

                    {unitMetrics.length === 0 ? (
                      <div className="text-brand-muted text-center py-10">
                        Sin datos recolectados todavía.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {unitMetrics.map((metric) => (
                          <div key={metric.unidad} className="flex items-center gap-4">
                            <span className="w-20 text-xs font-semibold uppercase text-brand-muted">
                              {metric.unidad}
                            </span>
                            <div className="flex-1 h-3 bg-brand-background rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand-accent"
                                style={{
                                  width: `${(metric.total / maxUnitTotal) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="min-w-22.5 text-right text-sm font-semibold text-brand-text">
                              {metric.total.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 text-xs text-brand-muted">
                      Donaciones recolectadas: {collectedMetrics.totalDonacionesRecolectadas}
                    </div>
                  </div>

                  <div className="bg-brand-card border border-brand-border rounded-4xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-sm font-semibold text-brand-muted uppercase tracking-wider">
                        Estado de donaciones
                      </p>
                      <span className="text-xs text-brand-muted">
                        Total {donationStats.total}
                      </span>
                    </div>

                    {[
                      {
                        label: "Activas",
                        count: donationStats.activo,
                        color: "bg-green-500",
                      },
                      {
                        label: "Asignadas",
                        count: donationStats.asignado,
                        color: "bg-yellow-500",
                      },
                      {
                        label: "Recolectadas",
                        count: donationStats.recolectado,
                        color: "bg-gray-500",
                      },
                      {
                        label: "Canceladas",
                        count: donationStats.cancelado,
                        color: "bg-red-500",
                      },
                    ].map((item) => {
                      const percent =
                        donationStats.total > 0
                          ? Math.round((item.count / donationStats.total) * 100)
                          : 0;
                      return (
                        <div key={item.label} className="mb-4">
                          <div className="flex items-center justify-between text-xs text-brand-muted mb-1">
                            <span>{item.label}</span>
                            <span>
                              {item.count} • {percent}%
                            </span>
                          </div>
                          <div className="h-2 bg-brand-background rounded-full overflow-hidden">
                            <div
                              className={`h-full ${item.color}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-brand-card border border-brand-border rounded-4xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm font-semibold text-brand-muted uppercase tracking-wider">
                        Tendencia recolectada por mes
                      </p>
                      <p className="text-xs text-brand-muted">
                        Comparativo por unidad en {dashboardRange.label}.
                      </p>
                    </div>
                  </div>

                  {chartLabels.length === 0 ? (
                    <div className="text-brand-muted text-center py-10">
                      No hay datos para graficar en este rango.
                    </div>
                  ) : (
                    <div className="h-72">
                      <Bar data={chartData} options={chartOptions} />
                    </div>
                  )}
                </div>

                <div className="bg-brand-card border border-brand-border rounded-4xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-brand-muted uppercase tracking-wider">
                        Actividad reciente
                      </p>
                      <p className="text-xs text-brand-muted">
                        Últimas donaciones registradas en {dashboardRange.label}.
                      </p>
                    </div>
                    <span className="text-xs text-brand-muted">
                      {recentDonations.length} registros
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-brand-border text-brand-muted text-sm">
                          <th className="pb-3 font-medium">Alimento</th>
                          <th className="pb-3 font-medium">Donador</th>
                          <th className="pb-3 font-medium text-center">Estado</th>
                          <th className="pb-3 font-medium text-right">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentDonations.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="text-center py-10 text-brand-muted"
                            >
                              No hay actividad reciente.
                            </td>
                          </tr>
                        ) : (
                          recentDonations.map((donation) => (
                            <tr
                              key={donation._id}
                              className="border-b border-brand-border/50 hover:bg-brand-background/50 transition-colors"
                            >
                              <td className="py-4">
                                <p className="font-semibold text-brand-text">
                                  {donation.titulo}
                                </p>
                                <p className="text-xs text-brand-muted">
                                  {donation.cantidad} {donation.unidad || "uds"}
                                </p>
                              </td>
                              <td className="py-4 text-sm text-brand-text">
                                {donation.donor?.nombreEmpresa ||
                                  `${donation.donor?.nombres} ${donation.donor?.apellidos}`}
                              </td>
                              <td className="py-4 text-center">
                                <span
                                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                                    donation.estado === "activo"
                                      ? "bg-green-500/10 text-green-500"
                                      : donation.estado === "asignado"
                                        ? "bg-yellow-500/10 text-yellow-500"
                                        : donation.estado === "cancelado"
                                          ? "bg-red-500/10 text-red-500"
                                          : "bg-gray-500/10 text-gray-400"
                                  }`}
                                >
                                  {donation.estado === "activo" && (
                                    <CheckCircle size={12} />
                                  )}
                                  {donation.estado === "asignado" && (
                                    <Clock size={12} />
                                  )}
                                  {donation.estado === "cancelado" && (
                                    <XCircle size={12} />
                                  )}
                                  {donation.estado === "recolectado" && (
                                    <Box size={12} />
                                  )}
                                  {donation.estado.toUpperCase()}
                                </span>
                              </td>
                              <td className="py-4 text-right text-xs text-brand-muted">
                                {new Date(donation.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* --- VISTA 2: MONITOREO DE DONACIONES --- */}
        {activeTab === "donaciones" && (
           <div className="flex flex-col gap-6">
             {/* TARJETA DE MÉTRICAS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-brand-card border border-brand-border rounded-3xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm font-semibold text-brand-muted uppercase tracking-wider">
                      Impacto por unidad
                    </p>
                    <p className="text-xs text-brand-muted">
                      Suma de cantidades recolectadas por tipo de medida (histórico).
                    </p>
                  </div>
                  <button
                    onClick={fetchMetrics}
                    disabled={isMetricsLoading}
                    className="p-3 text-brand-muted hover:text-brand-accent hover:bg-brand-background rounded-full transition-all disabled:opacity-50"
                    title="Actualizar Métrica"
                  >
                    <RefreshCw
                      size={20}
                      className={isMetricsLoading ? "animate-spin" : ""}
                    />
                  </button>
                </div>

                {unitMetrics.length === 0 ? (
                  <div className="text-brand-muted text-center py-8">
                    Sin datos recolectados todavía.
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {unitMetrics.map((metric) => (
                      <div key={metric.unidad} className="flex items-center gap-4">
                        <span className="w-20 text-xs font-semibold uppercase text-brand-muted">
                          {metric.unidad}
                        </span>
                        <div className="flex-1 h-3 bg-brand-background rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-accent"
                            style={{
                              width: `${(metric.total / maxUnitTotal) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="min-w-22.5 text-right text-sm font-semibold text-brand-text">
                          {metric.total.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 text-xs text-brand-muted">
                  Donaciones recolectadas: {collectedMetrics.totalDonacionesRecolectadas}
                </div>
              </div>
            </div>

            {/* TABLA DE DONACIONES */}
            <div className="bg-brand-card border border-brand-border rounded-4xl p-6 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-brand-border text-brand-muted text-sm">
                      <th className="pb-3 font-medium">Alimento</th>
                      <th className="pb-3 font-medium">Donador</th>
                      <th className="pb-3 font-medium">Beneficiario (Reserva)</th>
                      <th className="pb-3 font-medium text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan={4} className="text-center py-10 text-brand-muted">Cargando donaciones...</td></tr>
                    ) : filteredDonations.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-10 text-brand-muted">No se encontraron donaciones.</td></tr>
                    ) : (
                      filteredDonations.map((donation) => (
                        <tr key={donation._id} className="border-b border-brand-border/50 hover:bg-brand-background/50 transition-colors">
                          <td className="py-4">
                            <p className="font-semibold text-brand-text">{donation.titulo}</p>
                            <p className="text-xs text-brand-muted">
                              {donation.cantidad} {donation.unidad || 'uds'} • {new Date(donation.createdAt).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="py-4 text-sm text-brand-text">
                            {donation.donor?.nombreEmpresa || `${donation.donor?.nombres} ${donation.donor?.apellidos}`}
                            <br /><span className="text-xs text-brand-muted">{donation.donor?.email}</span>
                          </td>
                          <td className="py-4 text-sm text-brand-text">
                            {donation.beneficiary ? (
                              <>
                                {donation.beneficiary.nombres} {donation.beneficiary.apellidos}
                                <br /><span className="text-xs text-brand-muted">{donation.beneficiary.email}</span>
                              </>
                            ) : (
                              <span className="text-brand-muted italic">Sin reservar</span>
                            )}
                          </td>
                          <td className="py-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                              donation.estado === 'activo' ? 'bg-green-500/10 text-green-500' : 
                              donation.estado === 'asignado' ? 'bg-yellow-500/10 text-yellow-500' :
                              donation.estado === 'cancelado' ? 'bg-red-500/10 text-red-500' :
                              'bg-gray-500/10 text-gray-400'
                            }`}>
                              {donation.estado === 'activo' && <CheckCircle size={12} />}
                              {donation.estado === 'asignado' && <Clock size={12} />}
                              {donation.estado === 'cancelado' && <XCircle size={12} />}
                              {donation.estado === 'recolectado' && <Box size={12} />}
                              {donation.estado.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
           </div>
        )}

        {/* --- VISTA 3: GESTIÓN DE USUARIOS Y CALIFICACIONES --- */}
        {activeTab === "usuarios" && (
          <div className="bg-brand-card border border-brand-border rounded-4xl p-6 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-border text-brand-muted text-sm">
                    <th className="pb-3 font-medium min-w-50">Usuario</th>
                    <th className="pb-3 font-medium text-center">Rol</th>
                    <th className="pb-3 font-medium text-center">Calificación</th>
                    <th className="pb-3 font-medium text-center">Evaluaciones</th>
                    <th className="pb-3 font-medium text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={5} className="text-center py-10 text-brand-muted">Cargando comunidad...</td></tr>
                  ) : filteredUsersList.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-10 text-brand-muted">No se encontraron usuarios.</td></tr>
                  ) : (
                    filteredUsersList.map((user) => (
                      <tr key={user._id} className="border-b border-brand-border/50 hover:bg-brand-background/50 transition-colors">
                        <td className="py-4">
                          <p className="font-medium text-brand-text">{user.nombreEmpresa || `${user.nombres} ${user.apellidos}`}</p>
                          <p className="text-xs text-brand-muted">{user.email}</p>
                        </td>
                        <td className="py-4 text-center">
                          <span className="px-3 py-1 bg-brand-background border border-brand-border rounded-lg text-xs font-medium uppercase text-brand-muted">
                            {user.role === 'donor' ? 'Donador' : 'Beneficiario'}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          {user.totalEvaluaciones > 0 ? (
                            <div className="flex items-center justify-center gap-1 text-yellow-500 font-bold">
                              <Star size={16} fill="currentColor" /> {user.promedioCalificacion}
                            </div>
                          ) : (
                            <span className="text-brand-muted text-xs italic">Sin evaluaciones</span>
                          )}
                        </td>
                        <td className="py-4 text-center text-sm font-medium text-brand-text">
                          {user.totalEvaluaciones}
                        </td>
                        <td className="py-4 flex justify-center">
                          {user.promedioCalificacion <= 3 && user.totalEvaluaciones > 0 ? (
                            <button onClick={() => confirmDelete(user)} className="flex items-center gap-1 text-xs px-3 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors font-medium">
                              <Trash2 size={14} /> Eliminar
                            </button>
                          ) : (
                            <span className="text-brand-muted text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal General de Acciones */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-card border border-brand-border rounded-3xl w-full max-w-md p-8 shadow-2xl scale-in-95">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-red-500/10 text-red-500">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-center text-brand-text mb-2 font-jakarta">
              Eliminar Usuario
            </h3>

            <p className="text-center text-brand-muted mb-8">
              ¿Estás seguro de eliminar a{" "}
              <span className="font-semibold text-brand-text">
                {modalConfig.userName}
              </span>
              ?<br />
              <br />
              Este usuario tiene un promedio de{" "}
              <strong className="text-red-500">
                {modalConfig.rating} estrellas
              </strong>{" "}
              tras {modalConfig.totalReviews} evaluaciones.
              <br />
              <span className="text-xs text-red-400 mt-2 block uppercase tracking-wider font-bold">
                ⚠️ Acción irreversible. Sus reservas serán canceladas.
              </span>
            </p>

            <div className="flex gap-4">
              <button
                onClick={() =>
                  setModalConfig({
                    isOpen: false,
                    userId: null,
                    userName: "",
                    rating: 0,
                    totalReviews: 0,
                  })
                }
                className="flex-1 py-3 font-medium border border-brand-border text-brand-text rounded-xl hover:bg-brand-background transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={executeAction}
                className="flex-1 py-3 font-medium text-white rounded-xl transition-all shadow-lg bg-red-600 hover:bg-red-500 shadow-red-500/20"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};