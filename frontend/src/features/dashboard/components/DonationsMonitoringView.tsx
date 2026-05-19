import { Activity, CheckCircle2, Clock, PackageOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { DonationStatusBadge } from "./DonationStatusBadge";
import { StatCard } from "./StatCard";
import type {
  CollectedMetricsResponse,
  DonationData,
} from "../views/DashboardAdminPage";

interface DonationsMonitoringViewProps {
  donations: DonationData[];
  isLoading: boolean;
  searchTerm: string;
  collectedMetrics: CollectedMetricsResponse;
  isMetricsLoading: boolean;
  onMetricsRefresh: () => void;
}

export const DonationsMonitoringView = ({
  donations,
  isLoading,
  searchTerm,
  collectedMetrics,
  isMetricsLoading,
  onMetricsRefresh,
}: DonationsMonitoringViewProps) => {
  const safeDonations = Array.isArray(donations) ? donations : [];
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const unitMetrics = collectedMetrics.totalPorUnidad || [];
  const maxUnitTotal = Math.max(
    ...unitMetrics.map((m) =>
      typeof m.total === "number" ? m.total : Number(m.total) || 0,
    ),
    1,
  );

  const donationStats = safeDonations.reduce(
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

  const toSearchable = (value?: string | number | null) =>
    typeof value === "string" || typeof value === "number" ? String(value) : "";
  const filtered = normalizedSearch
    ? safeDonations.filter((d) => {
        const haystack = [
          toSearchable(d.titulo),
          toSearchable(d.donor?.nombres),
          toSearchable(d.donor?.apellidos),
          toSearchable(d.donor?.nombreEmpresa),
          toSearchable(d.donor?.email),
          toSearchable(d.beneficiary?.nombres),
          toSearchable(d.beneficiary?.apellidos),
          toSearchable(d.beneficiary?.nombreEmpresa),
          toSearchable(d.beneficiary?.email),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      })
    : safeDonations;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Donaciones totales"
          value={donationStats.total}
          icon={PackageOpen}
          hint={`Canceladas ${donationStats.cancelado}`}
        />
        <StatCard
          label="Activas"
          value={donationStats.activo}
          icon={Activity}
          iconClassName="bg-blue-500/10 text-blue-600"
        />
        <StatCard
          label="Reservadas"
          value={donationStats.asignado}
          icon={Clock}
          iconClassName="bg-amber-500/10 text-amber-600"
        />
        <StatCard
          label="Recolectadas"
          value={donationStats.recolectado}
          icon={CheckCircle2}
          iconClassName="bg-green-500/10 text-green-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-brand-border bg-brand-card rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
                Impacto por unidad
              </CardTitle>
              <p className="text-xs text-brand-muted mt-1">
                Suma de cantidades recolectadas por tipo de medida (histórico).
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
                size={20}
                className={isMetricsLoading ? "animate-spin" : ""}
              />
            </Button>
          </CardHeader>
          <CardContent>
            {unitMetrics.length === 0 ? (
              <div className="text-brand-muted text-center py-8">
                Sin datos recolectados todavía.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {unitMetrics.map((metric) => {
                  const pct = Math.round((metric.total / maxUnitTotal) * 100);
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
      </div>

      <Card className="border-brand-border bg-brand-card rounded-3xl">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
                Donaciones registradas
              </p>
              <p className="text-xs text-brand-muted">
                Mostrando {filtered.length} de {safeDonations.length} resultados.
              </p>
            </div>
            {normalizedSearch && (
              <Badge
                variant="outline"
                className="border-brand-border bg-brand-background text-brand-muted"
              >
                Filtro: {searchTerm.trim()}
              </Badge>
            )}
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-brand-border hover:bg-transparent">
                  <TableHead className="text-brand-muted">Alimento</TableHead>
                  <TableHead className="text-brand-muted">Donador</TableHead>
                  <TableHead className="text-brand-muted">
                    Beneficiario (Reserva)
                  </TableHead>
                  <TableHead className="text-brand-muted text-center">
                    Estado
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-10 text-brand-muted"
                    >
                      Cargando donaciones...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-10 text-brand-muted"
                    >
                      No se encontraron donaciones.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((d) => {
                    const donorName =
                      d.donor?.nombreEmpresa ||
                      `${d.donor?.nombres ?? ""} ${d.donor?.apellidos ?? ""}`.trim() ||
                      "Sin datos";
                    const donorEmail = d.donor?.email || "—";
                    const beneficiaryName =
                      d.beneficiary?.nombreEmpresa ||
                      `${d.beneficiary?.nombres ?? ""} ${
                        d.beneficiary?.apellidos ?? ""
                      }`.trim();
                    const beneficiaryEmail = d.beneficiary?.email || "—";
                    const donationTitle = d.titulo || "Sin titulo";
                    const donationUnit = d.unidad || "uds";
                    const donationDate = d.createdAt
                      ? new Date(d.createdAt).toLocaleDateString()
                      : "-";

                    return (
                      <TableRow key={d._id} className="border-brand-border/60">
                        <TableCell>
                          <p className="font-semibold text-brand-text">
                            {donationTitle}
                          </p>
                          <p className="text-xs text-brand-muted">
                            {d.cantidad} {donationUnit} • {donationDate}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm text-brand-text">
                          {donorName}
                          <br />
                          <span className="text-xs text-brand-muted">
                            {donorEmail}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-brand-text">
                          {d.beneficiary ? (
                            <>
                              {beneficiaryName || "Beneficiario"}
                              <br />
                              <span className="text-xs text-brand-muted">
                                {beneficiaryEmail}
                              </span>
                            </>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-brand-muted italic border-brand-border"
                            >
                              Sin reservar
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <DonationStatusBadge estado={d.estado} />
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
    </div>
  );
};
