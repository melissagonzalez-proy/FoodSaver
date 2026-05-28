import { AlertTriangle, Clock, Image as ImageIcon, Pencil, Scale, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { assetUrl } from "../../../lib/api";

interface Donation {
  _id: string;
  titulo: string;
  cantidad: string;
  fechaCaducidad: string;
  fechaRecogida: string; 
  estado: "activo" | "asignado" | "recolectado"; 
  imagenUrl?: string;
}

interface Props {
  donation: Donation;
  onCancel: (id: string) => void;
  onComplete: (id: string, pin: string) => void;
  onEdit?: () => void;
}

export const DonationCard = ({ donation, onCancel, onComplete, onEdit }: Props) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [pinInput, setPinInput] = useState("");

  
  const isNearExpiry = () => {
  const difference = new Date(donation.fechaCaducidad).getTime() - new Date().getTime();
  const hours = difference / (1000 * 60 * 60); // 👈 comparar en horas, no días
  return hours > 0 && hours <= 72; // 72h = 3 días
};

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(donation.fechaCaducidad).getTime() - new Date().getTime();
      if (difference <= 0) return "Vencido";

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);

      if (days > 0) return `Faltan ${days}d ${hours}h`;
      return `Faltan ${hours}h ${minutes}m`;
    };

    setTimeLeft(calculateTime());
    const timer = setInterval(() => setTimeLeft(calculateTime()), 60000);
    return () => clearInterval(timer);
  }, [donation.fechaCaducidad]);

  const statusConfig = {
    activo: { bg: "bg-green-500/10", text: "text-green-500", label: "Activo" },
    asignado: { bg: "bg-yellow-500/10", text: "text-yellow-500", label: "Asignado" },
    recolectado: { bg: "bg-gray-500/10", text: "text-gray-400", label: "Recolectado" },
  };

  const currentStatus = statusConfig[donation.estado] || statusConfig.activo;

  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden hover:border-brand-accent/50 transition-colors flex flex-col relative shadow-md">
      
      {/* SECTOR DE LA IMAGEN */}
      {donation.imagenUrl ? (
        <div className="h-40 w-full overflow-hidden bg-brand-background relative group">
          <img
            src={assetUrl(donation.imagenUrl.replace(/\\/g, "/"))}
            alt={donation.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Etiqueta "Próximo a vencer" sobre la imagen */}
          {isNearExpiry() && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-orange-500/90 text-white text-xs font-semibold px-2 py-1 rounded-md backdrop-blur-sm">
              <AlertTriangle size={12} />
              Próximo a vencer
            </div>
          )}
        </div>
      ) : (
        <div className="h-40 w-full bg-brand-background flex items-center justify-center border-b border-brand-border/50 relative">
          <ImageIcon size={32} className="text-brand-muted opacity-50" />
          {/* Etiqueta cuando no hay imagen */}
          {isNearExpiry() && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-orange-500/90 text-white text-xs font-semibold px-2 py-1 rounded-md">
              <AlertTriangle size={12} />
              Próximo a vencer
            </div>
          )}
        </div>
      )}

      {/* SECTOR DE CONTENIDO */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-brand-text font-jakarta truncate pr-4">
            {donation.titulo}
          </h3>
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${currentStatus.bg} ${currentStatus.text}`}>
            {currentStatus.label}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-brand-muted mt-1">
          <div className="flex items-center gap-1">
            <Scale size={16} />
            <span>{donation.cantidad}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} className={timeLeft === "Vencido" ? "text-red-500" : ""} />
            <span className={timeLeft === "Vencido" ? "text-red-500 font-medium" : ""}>
              {timeLeft}
            </span>
          </div>
        </div>

        {donation.estado === "activo" && (
          <div className="mt-auto pt-3 flex gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex-1 py-2 flex items-center justify-center gap-1 text-sm font-medium text-brand-accent border border-brand-accent/30 rounded-lg hover:bg-brand-accent/10 transition-colors"
              >
                <Pencil size={16} />
                Editar
              </button>
            )}
            <button
              onClick={() => onCancel(donation._id)}
              className="flex-1 py-2 flex items-center justify-center gap-1 text-sm font-medium text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <XCircle size={16} />
              Cancelar
            </button>
          </div>
        )}

        {donation.estado === "asignado" && (
          <div className="mt-auto pt-4 border-t border-brand-border/50 flex flex-col gap-2">
            <label className="text-xs font-semibold text-brand-text uppercase tracking-wider">
              Safe-Pickup: Ingresa el PIN
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                placeholder="Ej: 4829"
                className="flex-1 bg-brand-background border border-brand-border rounded-lg px-3 py-2 text-sm text-center tracking-[0.3em] font-bold text-brand-text focus:border-brand-accent outline-none transition-colors"
              />
              <button
                onClick={() => {
                  onComplete(donation._id, pinInput);
                  setPinInput(""); 
                }}
                disabled={pinInput.length !== 4}
                className="px-4 py-2 bg-brand-accent text-white rounded-lg text-sm font-medium hover:bg-brand-accent-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Validar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};