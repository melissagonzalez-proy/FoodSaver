import { Building2, Mail, MapPin, Phone, User2 } from "lucide-react";

interface ProfileOverviewProps {
  onEdit: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  donor: "Donador",
  beneficiary: "Beneficiario",
  admin: "Administrador",
};

export const ProfileOverview = ({ onEdit }: ProfileOverviewProps) => {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const fullName = `${currentUser.nombres ?? ""} ${currentUser.apellidos ?? ""}`.trim();
  const displayName = currentUser.nombreEmpresa || fullName || "Usuario";
  const roleLabel = ROLE_LABELS[currentUser.role] || "Usuario";

  const infoCards = [] as Array<{
    label: string;
    value: string;
    icon: typeof User2;
  }>;

  if (currentUser.nombreEmpresa) {
    infoCards.push({
      label: "Empresa",
      value: currentUser.nombreEmpresa,
      icon: Building2,
    });
    infoCards.push({
      label: "Representante",
      value: fullName || "Sin registrar",
      icon: User2,
    });
  } else {
    infoCards.push({
      label: "Nombre",
      value: fullName || "Sin registrar",
      icon: User2,
    });
  }

  infoCards.push(
    {
      label: "Correo",
      value: currentUser.email || "Sin registrar",
      icon: Mail,
    },
    {
      label: "Celular",
      value: currentUser.celular || "Sin registrar",
      icon: Phone,
    },
    {
      label: "Ciudad",
      value:
        currentUser.ciudad && currentUser.departamento
          ? `${currentUser.ciudad}, ${currentUser.departamento}`
          : currentUser.ciudad || "Sin registrar",
      icon: MapPin,
    },
    {
      label: "Direccion",
      value: currentUser.direccion || "Sin registrar",
      icon: MapPin,
    },
  );

  return (
    <div className="bg-brand-card border border-brand-border rounded-3xl p-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm text-brand-muted">Mi perfil</p>
          <h2 className="text-2xl font-bold text-brand-text font-jakarta">
            {displayName}
          </h2>
          <span className="inline-flex mt-2 px-3 py-1 rounded-full border border-brand-border text-xs font-semibold text-brand-muted uppercase tracking-wide">
            {roleLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="px-5 py-2.5 rounded-xl bg-brand-accent text-white font-medium hover:bg-brand-accent-light transition-colors"
        >
          Editar perfil
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {infoCards.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="bg-brand-background border border-brand-border/60 rounded-2xl p-4 flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center shrink-0">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xs text-brand-muted uppercase tracking-wide">
                  {item.label}
                </p>
                <p className="text-sm font-medium text-brand-text">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
