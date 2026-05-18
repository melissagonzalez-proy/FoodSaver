import { Search, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminTab } from "../views/DashboardAdminPage";

interface AdminHeaderProps {
  activeTab: AdminTab;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const SUBTITLES: Record<AdminTab, string> = {
  dashboard: "Visualiza el pulso del sistema y la interacción de la comunidad.",
  donaciones: "Supervisa todas las donaciones activas e histórico del sistema.",
  trial: "Monitorea usuarios en estado amarillo o rojo.",
  usuarios: "Supervisa la reputación y mantén la seguridad de la comunidad.",
};

export const AdminHeader = ({
  activeTab,
  searchTerm,
  onSearchChange,
}: AdminHeaderProps) => {
  const showSearch = activeTab === "donaciones" || activeTab === "usuarios";

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-text font-jakarta mb-1">
            Panel de Administración
          </h1>
          <p className="text-sm md:text-base text-brand-muted">
            {SUBTITLES[activeTab]}
          </p>
        </div>
        <Badge
          variant="outline"
          className="w-fit gap-1 border-brand-border bg-brand-card text-brand-muted"
        >
          <ShieldCheck size={12} className="text-brand-accent" aria-hidden="true" />
          Seguridad activa
        </Badge>
      </div>

      {showSearch && (
        <div className="relative w-full md:w-72">
          <Label htmlFor="admin-search" className="sr-only">
            Buscar
          </Label>
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
            size={18}
          />
          <Input
            id="admin-search"
            type="search"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-brand-card border-brand-border text-brand-text focus-visible:ring-brand-accent"
          />
        </div>
      )}
    </header>
  );
};
