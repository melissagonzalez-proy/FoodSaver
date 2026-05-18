import { Star, Trash2 } from "lucide-react";
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

interface UsersManagementViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  users: any[];
  isLoading: boolean;
  searchTerm: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDelete: (user: any) => void;
}

export const UsersManagementView = ({
  users,
  isLoading,
  searchTerm,
  onDelete,
}: UsersManagementViewProps) => {
  const filtered = users.filter((u) => {
    const t = searchTerm.toLowerCase();
    return (
      (u.nombres || "").toLowerCase().includes(t) ||
      (u.email || "").toLowerCase().includes(t)
    );
  });

  return (
    <Card className="border-brand-border bg-brand-card rounded-3xl">
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-brand-border hover:bg-transparent">
                <TableHead className="text-brand-muted min-w-[200px]">
                  Usuario
                </TableHead>
                <TableHead className="text-brand-muted text-center">
                  Rol
                </TableHead>
                <TableHead className="text-brand-muted text-center">
                  Calificación
                </TableHead>
                <TableHead className="text-brand-muted text-center">
                  Evaluaciones
                </TableHead>
                <TableHead className="text-brand-muted text-center">
                  Acción
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 text-brand-muted"
                  >
                    Cargando comunidad...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 text-brand-muted"
                  >
                    No se encontraron usuarios.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user) => (
                  <TableRow key={user._id} className="border-brand-border/60">
                    <TableCell>
                      <p className="font-medium text-brand-text">
                        {user.nombreEmpresa ||
                          `${user.nombres} ${user.apellidos}`}
                      </p>
                      <p className="text-xs text-brand-muted">{user.email}</p>
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
                      {user.totalEvaluaciones > 0 ? (
                        <div className="flex items-center justify-center gap-1 text-yellow-500 font-bold">
                          <Star
                            size={16}
                            fill="currentColor"
                            aria-hidden="true"
                          />
                          {user.promedioCalificacion}
                        </div>
                      ) : (
                        <span className="text-brand-muted text-xs italic">
                          Sin evaluaciones
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-sm font-medium text-brand-text">
                      {user.totalEvaluaciones}
                    </TableCell>
                    <TableCell className="text-center">
                      {user.promedioCalificacion <= 3 &&
                      user.totalEvaluaciones > 0 ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(user)}
                          className="gap-1 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 size={14} aria-hidden="true" /> Eliminar
                        </Button>
                      ) : (
                        <span className="text-brand-muted text-xs">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
