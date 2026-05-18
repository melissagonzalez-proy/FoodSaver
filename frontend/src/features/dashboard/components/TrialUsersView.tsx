import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type {
  ReputationNotification,
  TrialUser,
} from "../views/DashboardAdminPage";

interface TrialUsersViewProps {
  trialUsers: TrialUser[];
  isLoading: boolean;
  onSuspend: (userId: string) => void;
  onRestore: (userId: string) => void;
  onReview: (userId: string) => void;
}

const REPUTATION_BADGE: Record<"green" | "yellow" | "red", string> = {
  green: "bg-green-500/10 text-green-600 border-green-500/20",
  yellow: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  red: "bg-red-500/10 text-red-600 border-red-500/20",
};

const REPUTATION_LABEL: Record<"green" | "yellow" | "red", string> = {
  green: "Verde",
  yellow: "Amarillo",
  red: "Rojo",
};

const hasNotification = (
  notifs: ReputationNotification[] | undefined,
  type: ReputationNotification["tipo"],
) => notifs?.some((n) => n.tipo === type && n.estadoEntrega === "enviado");

export const TrialUsersView = ({
  trialUsers,
  isLoading,
  onSuspend,
  onRestore,
  onReview,
}: TrialUsersViewProps) => {
  return (
    <Card className="border-brand-border bg-brand-card rounded-3xl">
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-brand-border hover:bg-transparent">
                <TableHead className="text-brand-muted">Usuario</TableHead>
                <TableHead className="text-brand-muted text-center">
                  Rol
                </TableHead>
                <TableHead className="text-brand-muted text-center">
                  Calificación
                </TableHead>
                <TableHead className="text-brand-muted text-center">
                  Días restantes
                </TableHead>
                <TableHead className="text-brand-muted text-center">
                  Acción
                </TableHead>
                <TableHead className="text-brand-muted text-center">
                  Notificaciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-brand-muted"
                  >
                    Cargando usuarios en prueba...
                  </TableCell>
                </TableRow>
              ) : trialUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-brand-muted"
                  >
                    No hay usuarios en estado amarillo o rojo.
                  </TableCell>
                </TableRow>
              ) : (
                trialUsers.map((user) => {
                  const status = user.reputationStatus || "green";
                  return (
                    <TableRow key={user._id} className="border-brand-border/60">
                      <TableCell>
                        <p className="font-medium text-brand-text">
                          {user.nombreEmpresa ||
                            `${user.nombres ?? ""} ${user.apellidos ?? ""}`.trim() ||
                            "Usuario"}
                        </p>
                        <p className="text-xs text-brand-muted">{user.email}</p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "mt-2 text-[10px] font-semibold border",
                            REPUTATION_BADGE[status],
                          )}
                        >
                          {REPUTATION_LABEL[status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="bg-brand-background border-brand-border text-brand-muted uppercase text-xs"
                        >
                          {user.role === "donor" ? "Donador" : "Beneficiario"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-yellow-500 font-bold">
                          <Star
                            size={16}
                            fill="currentColor"
                            aria-hidden="true"
                          />
                          {user.promedioCalificacion?.toFixed(1) || "0.0"}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm text-brand-text">
                        {status === "red" ? (user.diasRestantes ?? 0) : "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        {status === "red" ? (
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => onSuspend(user._id)}
                              disabled={user.isSuspended}
                              className="bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white"
                            >
                              Suspender
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => onRestore(user._id)}
                              className="bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white"
                            >
                              Restaurar
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => onReview(user._id)}
                            className="bg-orange-500/10 text-orange-600 hover:bg-orange-500 hover:text-white"
                          >
                            Revisión Comentarios
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-2">
                          {hasNotification(
                            user.reputationNotifications,
                            "probation",
                          ) && (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20"
                            >
                              Correo de finalización enviado
                            </Badge>
                          )}
                          {hasNotification(
                            user.reputationNotifications,
                            "warning",
                          ) && (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20"
                            >
                              Advertencia enviada
                            </Badge>
                          )}
                          {!hasNotification(
                            user.reputationNotifications,
                            "warning",
                          ) &&
                            !hasNotification(
                              user.reputationNotifications,
                              "probation",
                            ) && (
                              <span className="text-xs text-brand-muted">
                                —
                              </span>
                            )}
                        </div>
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
  );
};
