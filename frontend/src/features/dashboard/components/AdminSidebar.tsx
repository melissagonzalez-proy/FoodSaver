import {
  AlertTriangle,
  Leaf,
  LogOut,
  PackageOpen,
  TrendingUp,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { AdminTab } from "../views/DashboardAdminPage";

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
}

const NAV_ITEMS: { id: AdminTab; label: string; icon: typeof TrendingUp }[] = [
  { id: "dashboard", label: "Dashboard", icon: TrendingUp },
  { id: "donaciones", label: "Monitoreo Alimentos", icon: PackageOpen },
  { id: "trial", label: "Periodo de Prueba", icon: AlertTriangle },
  { id: "usuarios", label: "Gestión Usuarios", icon: UserCog },
];

export const AdminSidebar = ({
  activeTab,
  onTabChange,
  onLogout,
}: AdminSidebarProps) => {
  return (
    <aside
      aria-label="Navegación principal"
      className="w-full md:w-72 md:min-h-screen md:sticky md:top-0 bg-brand-card/90 backdrop-blur border-b md:border-b-0 md:border-r border-brand-border px-4 py-4 md:px-6 md:py-6 flex flex-col gap-5 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-brand-accent">
          <Leaf size={26} aria-hidden="true" />
          <span className="text-lg md:text-xl font-bold tracking-tight text-brand-text font-jakarta">
            FoodSaver
          </span>
        </div>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={onLogout}
          aria-label="Cerrar sesión"
          className="md:hidden text-brand-muted hover:text-destructive"
        >
          <LogOut size={18} aria-hidden="true" />
        </Button>
      </div>

      <nav className="grid grid-cols-4 md:flex md:flex-col gap-2">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <Button
              key={id}
              type="button"
              variant="ghost"
              aria-current={isActive ? "page" : undefined}
              aria-label={label}
              onClick={() => onTabChange(id)}
              className={cn(
                "group flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 rounded-2xl px-3 py-3 md:px-4 md:py-4 text-[11px] md:text-sm font-medium",
                "text-brand-muted hover:bg-brand-background hover:text-brand-text",
                isActive &&
                  "bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/15 hover:text-brand-accent",
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-2xl border",
                  isActive
                    ? "border-brand-accent/30 bg-brand-accent/15 text-brand-accent"
                    : "border-brand-border bg-brand-card text-brand-muted group-hover:text-brand-text",
                )}
              >
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="hidden md:inline">{label}</span>
            </Button>
          );
        })}
      </nav>

      <Separator className="hidden md:block bg-brand-border" />

      <Button
        type="button"
        variant="ghost"
        onClick={onLogout}
        className="hidden md:flex justify-start gap-3 mt-auto rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut size={18} aria-hidden="true" /> Cerrar Sesión
      </Button>
    </aside>
  );
};
