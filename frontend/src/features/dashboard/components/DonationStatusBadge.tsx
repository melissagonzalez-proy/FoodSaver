import { Box, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CONFIG = {
  activo: {
    label: "ACTIVO",
    icon: CheckCircle,
    classes: "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/15",
  },
  asignado: {
    label: "ASIGNADO",
    icon: Clock,
    classes: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/15",
  },
  cancelado: {
    label: "CANCELADO",
    icon: XCircle,
    classes: "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/15",
  },
  recolectado: {
    label: "RECOLECTADO",
    icon: Box,
    classes: "bg-gray-500/10 text-gray-600 border-gray-500/20 hover:bg-gray-500/15",
  },
} as const;

interface DonationStatusBadgeProps {
  estado: string;
}

export const DonationStatusBadge = ({ estado }: DonationStatusBadgeProps) => {
  const key = (estado in CONFIG ? estado : "recolectado") as keyof typeof CONFIG;
  const { label, icon: Icon, classes } = CONFIG[key];
  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border",
        classes,
      )}
    >
      <Icon size={12} aria-hidden="true" />
      {label}
    </Badge>
  );
};
