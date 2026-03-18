import { useEffect, useState } from "react";
import { Clock, Scale, XCircle, Image as ImageIcon } from "lucide-react";

interface Donation {
  _id: string;
  titulo: string;
  cantidad: string;
  fechaCaducidad: string;
  estado: "disponible" | "reservado" | "entregado";
  imagenUrl?: string;
}

interface Props {
  donation: Donation;
  onCancel: (id: string) => void;
}

export const DonationCard = ({ donation, onCancel }: Props) => {
  const [timeLeft, setTimeLeft] = useState("");

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
    disponible: { bg: "bg-green-500/10", text: "text-green-500", label: "Activo" },
    reservado: { bg: "bg-yellow-500/10", text: "text-yellow-500", label: "Asignado" },
    entregado: { bg: "bg-gray-500/10", text: "text-gray-400", label: "Recolectado" },
  };

  const currentStatus = statusConfig[donation.estado] || statusConfig.disponible;

  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden hover:border-brand-accent/50 transition-colors flex flex-col relative shadow-md">
      
      {/* SECTOR DE LA IMAGEN */}
      {donation.imagenUrl ? (
        <div className="h-40 w-full overflow-hidden bg-brand-background relative group">
          <img
            src={`http://localhost:5000/${donation.imagenUrl.replace(/\\/g, "/")}`}
            alt={donation.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="h-40 w-full bg-brand-background flex items-center justify-center border-b border-brand-border/50">
          <ImageIcon size={32} className="text-brand-muted opacity-50" />
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

        {donation.estado !== "entregado" && (
          <button
            onClick={() => onCancel(donation._id)}
            className="mt-auto pt-3 flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            <XCircle size={16} />
            Cancelar Publicación
          </button>
        )}
      </div>
    </div>
  );
};