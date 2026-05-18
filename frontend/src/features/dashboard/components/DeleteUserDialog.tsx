import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteUserDialogProps {
  config: {
    isOpen: boolean;
    userId: string | null;
    userName: string;
    rating?: number;
    totalReviews?: number;
  };
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteUserDialog = ({
  config,
  onCancel,
  onConfirm,
}: DeleteUserDialogProps) => {
  return (
    <AlertDialog
      open={config.isOpen}
      onOpenChange={(open) => !open && onCancel()}
    >
      <AlertDialogContent className="bg-brand-card border-brand-border rounded-3xl max-w-md">
        <AlertDialogHeader>
          <div
            aria-hidden="true"
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 bg-red-500/10 text-red-500"
          >
            <AlertTriangle size={32} />
          </div>
          <AlertDialogTitle className="text-2xl font-bold text-center text-brand-text font-jakarta">
            Eliminar Usuario
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div className="text-center text-brand-muted space-y-2">
              <p>
                ¿Estás seguro de eliminar a{" "}
                <span className="font-semibold text-brand-text">
                  {config.userName}
                </span>
                ?
              </p>
              <p>
                Este usuario tiene un promedio de{" "}
                <strong className="text-red-500">
                  {config.rating} estrellas
                </strong>{" "}
                tras {config.totalReviews} evaluaciones.
              </p>
              <p className="text-xs text-red-500 uppercase tracking-wider font-bold pt-2">
                ⚠️ Acción irreversible. Sus reservas serán canceladas.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-3 sm:gap-3">
          <AlertDialogCancel
            onClick={onCancel}
            className="flex-1 rounded-xl border-brand-border text-brand-text hover:bg-brand-background"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 text-white hover:bg-red-500"
          >
            Sí, eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
