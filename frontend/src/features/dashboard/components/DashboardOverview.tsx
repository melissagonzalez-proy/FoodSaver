import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import type { TooltipItem } from "chart.js";
import { Box, Clock, RefreshCw, Star, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { StatCard } from "./StatCard";
import { DonationStatusBadge } from "./DonationStatusBadge";
import type {
  CollectedMetricsResponse,
  DateFilter,
  DateRange,
  DonationData,
} from "../views/DashboardAdminPage";

interface DashboardOverviewProps {
  dateFilter: DateFilter;
  onDateFilterChange: (v: DateFilter) => void;
  selectedMonth: string;
  onSelectedMonthChange: (v: string) => void;
  dashboardRange: DateRange;
  isDashboardLoading: boolean;
  onRefresh: () => void;
  allDonations: DonationData[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  usersList: any[];
  collectedMetrics: CollectedMetricsResponse;
  isMetricsLoading: boolean;
  onMetricsRefresh: () => void;
}

export const DashboardOverview = ({
  dateFilter,
  onDateFilterChange,
  selectedMonth,
  onSelectedMonthChange,
  dashboardRange,
  isDashboardLoading,
  onRefresh,
  allDonations,
  usersList,
  collectedMetrics,
  isMetricsLoading,
  onMetricsRefresh,
}: DashboardOverviewProps) => {
  const donationStats = allDonations.reduce(
    (acc, d) => {
      acc.total += 1;
      if (d.estado === "activo") acc.activo += 1;
      if (d.estado === "asignado") acc.asignado += 1;
      if (d.estado === "recolectado") acc.recolectado += 1;
      if (d.estado === "cancelado") acc.cancelado += 1;
      return acc;
    },
    { total: 0, activo: 0, asignado: 0, recolectado: 0, cancelado: 0 },
  );

  const usersForDashboard = usersList.filter((u) => {
    if (!u.createdAt) return true;
    const d = new Date(u.createdAt);
    return d >= dashboardRange.start && d < dashboardRange.end;
  });

  const totalUsers = usersForDashboard.length;
  const donorCount = usersForDashboard.filter((u) => u.role === "donor").length;
  const beneficiaryCount = usersForDashboard.filter(
    (u) => u.role === "beneficiary",
  ).length;
  const adminCount = usersForDashboard.filter((u) => u.role === "admin").length;
  const totalEvaluations = usersForDashboard.reduce(
    (acc, u) => acc + (u.totalEvaluaciones || 0),
    0,
  );
  const weightedRatingSum = usersForDashboard.reduce(
    (acc, u) =>
      acc + (u.promedioCalificacion || 0) * (u.totalEvaluaciones || 0),
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
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const unitMetrics = collectedMetrics.totalPorUnidad || [];
  const maxUnitTotal = Math.max(...unitMetrics.map((m) => m.total), 1);
  const seriesByUnit = collectedMetrics.seriePorUnidad || [];

  const chartLabels = useMemo(
    () => Array.from(new Set(seriesByUnit.map((p) => p.mes))).sort(),
    [seriesByUnit],
  );

  const chartDatasets = useMemo(() => {
    const palette = [
      "#2f855a",
      "#48bb78",
      "#f59e0b",
      "#3b82f6",
      "#8b5cf6",
      "#14b8a6",
    ];
    const unitKeys = Array.from(
      new Set(seriesByUnit.map((p) => p.unidad)),
    ).sort();
    return unitKeys.map((unit, index) => {
      const data = chartLabels.map((label) => {
        const match = seriesByUnit.find(
          (p) => p.unidad === unit && p.mes === label,
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
        return new Date(safeYear, safeMonth, 1).toLocaleString("es-ES", {
          month: "short",
          year: "2-digit",
        });
      }),
    [chartLabels],
  );

  const chartData = useMemo(
    () => ({ labels: chartLabelNames, datasets: chartDatasets }),
    [chartLabelNames, chartDatasets],
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: { color: "#6b7280", usePointStyle: true },
        },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<"bar">) =>
              `${ctx.dataset.label || "Unidad"}: ${ctx.raw}`,
          },
        },
      },
      scales: {
        x: { ticks: { color: "#6b7280" }, grid: { display: false } },
        y: {
          ticks: { color: "#6b7280" },
          grid: { color: "rgba(107, 114, 128, 0.15)" },
        },
      },
    }),
    [],
  );

  const statusBreakdown = [
    { label: "Activas", count: donationStats.activo, color: "bg-green-500" },
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
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Filtros */}
      <Card className="border-brand-border bg-brand-card rounded-3xl">
        <CardContent className="p-4 flex flex-col xl:flex-row xl:items-center gap-4 justify-between">
          <Tabs
            value={dateFilter}
            onValueChange={(v) => onDateFilterChange(v as DateFilter)}
          >
            <TabsList className="bg-brand-background">
              <TabsTrigger
                value="month"
                className="data-[state=active]:bg-brand-accent/10 data-[state=active]:text-brand-accent"
              >
                Por mes
              </TabsTrigger>
              <TabsTrigger
                value="last6"
                className="data-[state=active]:bg-brand-accent/10 data-[state=active]:text-brand-accent"
              >
                Últimos 6 meses
              </TabsTrigger>
              <TabsTrigger
                value="last12"
                className="data-[state=active]:bg-brand-accent/10 data-[state=active]:text-brand-accent"
              >
                Último año
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {dateFilter === "month" && (
              <div className="flex items-center gap-2">
                <Label htmlFor="dashboard-month" className="sr-only">
                  Mes
                </Label>
                <Input
                  id="dashboard-month"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => onSelectedMonthChange(e.target.value)}
                  className="w-auto bg-brand-background border-brand-border"
                />
              </div>
            )}
            <span className="text-xs text-brand-muted">
              Rango: {dashboardRange.label}
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={onRefresh}
              disabled={isDashboardLoading}
              className="gap-2 border-brand-border text-brand-text hover:border-brand-accent hover:text-brand-accent"
            >
              <RefreshCw
                size={16}
                aria-hidden="true"
                className={isDashboardLoading ? "animate-spin" : ""}
              />
              Actualizar datos
            </Button>
          </div>
        </CardContent>
      </Card>

      {isDashboardLoading ? (
        <Card className="border-brand-border bg-brand-card rounded-3xl">
          <CardContent className="p-10 text-center text-brand-muted">
            Cargando dashboard...
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Métricas principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard
              label="Usuarios nuevos"
              value={totalUsers}
              icon={Users}
              hint={`Donadores ${donorCount} · Beneficiarios ${beneficiaryCount} · Admin ${adminCount}`}
            />
            <StatCard
              label="Entregas completadas"
              value={donationStats.recolectado}
              icon={Box}
              iconClassName="bg-green-500/10 text-green-600"
              hint={`Tasa de entrega ${completionRate}%`}
              progress={completionRate}
              progressBarClassName="bg-green-500"
            />
            <StatCard
              label="Reservas activas"
              value={donationStats.asignado}
              icon={Clock}
              iconClassName="bg-yellow-500/10 text-yellow-600"
              hint={`Publicaciones activas ${donationStats.activo}`}
            />
            <StatCard
              label="Evaluaciones"
              value={totalEvaluations}
              icon={Star}
              iconClassName="bg-yellow-500/10 text-yellow-600"
              hint={`Promedio comunidad ${averageRating} ★`}
            />
          </div>

          {/* Impacto + Estado donaciones */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2 border-brand-border bg-brand-card rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
                    Impacto por unidad
                  </CardTitle>
                  <p className="text-xs text-brand-muted mt-1">
                    Suma de cantidades recolectadas por tipo de medida en{" "}
                    {dashboardRange.label}.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onMetricsRefresh}
                  disabled={isMetricsLoading}
                  aria-label="Actualizar métricas"
                  className="text-brand-muted hover:text-brand-accent"
                >
                  <RefreshCw
                    size={18}
                    className={isMetricsLoading ? "animate-spin" : ""}
                  />
                </Button>
              </CardHeader>
              <CardContent>
                {unitMetrics.length === 0 ? (
                  <div className="text-brand-muted text-center py-10">
                    Sin datos recolectados todavía.
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {unitMetrics.map((metric) => {
                      const pct = Math.round(
                        (metric.total / maxUnitTotal) * 100,
                      );
                      return (
                        <div
                          key={metric.unidad}
                          className="flex items-center gap-4"
                        >
                          <span className="w-20 text-xs font-semibold uppercase text-brand-muted">
                            {metric.unidad}
                          </span>
                          <div
                            role="progressbar"
                            aria-valuenow={pct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${metric.unidad}: ${metric.total}`}
                            className="flex-1 h-3 bg-brand-background rounded-full overflow-hidden"
                          >
                            <div
                              className="h-full bg-brand-accent rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="min-w-22 text-right text-sm font-semibold text-brand-text">
                            {metric.total.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-4 text-xs text-brand-muted">
                  Donaciones recolectadas:{" "}
                  {collectedMetrics.totalDonacionesRecolectadas}
                </div>
              </CardContent>
            </Card>

            <Card className="border-brand-border bg-brand-card rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
                  Estado de donaciones
                </CardTitle>
                <span className="text-xs text-brand-muted">
                  Total {donationStats.total}
                </span>
              </CardHeader>
              <CardContent className="space-y-4">
                {statusBreakdown.map((item) => {
                  const percent =
                    donationStats.total > 0
                      ? Math.round((item.count / donationStats.total) * 100)
                      : 0;
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-xs text-brand-muted mb-1">
                        <span>{item.label}</span>
                        <span>
                          {item.count} • {percent}%
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-valuenow={percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${item.label}: ${percent}%`}
                        className="h-2 bg-brand-background rounded-full overflow-hidden"
                      >
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Tendencia */}
          <Card className="border-brand-border bg-brand-card rounded-3xl">
            <CardHeader>
              <CardTitle className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
                Tendencia recolectada por mes
              </CardTitle>
              <p className="text-xs text-brand-muted">
                Comparativo por unidad en {dashboardRange.label}.
              </p>
            </CardHeader>
            <CardContent>
              {chartLabels.length === 0 ? (
                <div className="text-brand-muted text-center py-10">
                  No hay datos para graficar en este rango.
                </div>
              ) : (
                <div className="h-72">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actividad reciente */}
          <Card className="border-brand-border bg-brand-card rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
                  Actividad reciente
                </CardTitle>
                <p className="text-xs text-brand-muted mt-1">
                  Últimas donaciones registradas en {dashboardRange.label}.
                </p>
              </div>
              <span className="text-xs text-brand-muted">
                {recentDonations.length} registros
              </span>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-brand-border hover:bg-transparent">
                      <TableHead className="text-brand-muted">
                        Alimento
                      </TableHead>
                      <TableHead className="text-brand-muted">
                        Donador
                      </TableHead>
                      <TableHead className="text-brand-muted text-center">
                        Estado
                      </TableHead>
                      <TableHead className="text-brand-muted text-right">
                        Fecha
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentDonations.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-10 text-brand-muted"
                        >
                          No hay actividad reciente.
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentDonations.map((d) => {
                        const donorName =
                          d.donor?.nombreEmpresa ||
                          `${d.donor?.nombres ?? ""} ${
                            d.donor?.apellidos ?? ""
                          }`.trim() ||
                          "Sin datos";
                        const donationTitle = d.titulo || "Sin titulo";
                        const donationDate = d.createdAt
                          ? new Date(d.createdAt).toLocaleDateString()
                          : "-";

                        return (
                          <TableRow
                            key={d._id}
                            className="border-brand-border/60"
                          >
                            <TableCell>
                              <p className="font-semibold text-brand-text">
                                {donationTitle}
                              </p>
                              <p className="text-xs text-brand-muted">
                                {d.cantidad} {d.unidad || "uds"}
                              </p>
                            </TableCell>
                            <TableCell className="text-sm text-brand-text">
                              {donorName}
                            </TableCell>
                            <TableCell className="text-center">
                              <DonationStatusBadge estado={d.estado} />
                            </TableCell>
                            <TableCell className="text-right text-xs text-brand-muted">
                              {donationDate}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
