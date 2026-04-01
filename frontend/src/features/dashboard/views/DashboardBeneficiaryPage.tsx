import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LogOut,
  Leaf,
  MapPin,
  Calendar,
  Scale,
  Search,
  ShoppingBag,
  Store,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface DonorInfo {
  _id: string;
  nombres: string;
  apellidos: string;
  departamento: string;
  ciudad: string;
  direccion: string;
  celular: string;
  nombreEmpresa?: string;
}

interface DonationData {
  _id: string;
  titulo: string;
  descripcion: string;
  cantidad: string;
  fechaCaducidad: string;
  estado: string;
  imagenUrl: string;
  donor: DonorInfo;
}

export const DashboardBeneficiaryPage = () => {
  const navigate = useNavigate();
  const [availableDonations, setAvailableDonations] = useState<DonationData[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    message: string;
  }>({ isOpen: false, type: "success", message: "" });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchAvailableDonations = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/donations/available",
      );
      setAvailableDonations(response.data);
    } catch (error) {
      console.error("Error al cargar la galería:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableDonations();
  }, [fetchAvailableDonations]);

  const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || "Hubo un error al procesar tu solicitud.";
    }
    return "Hubo un error al procesar tu solicitud.";
  };

  const handleRequest = async (id: string) => {
    try {
      await axios.put(`http://localhost:5000/api/donations/request/${id}`, {
        beneficiaryId: currentUser.id,
      });

      setFeedbackModal({
        isOpen: true,
        type: "success",
        message:
          "¡Reserva exitosa! Por favor, dirígete a la ubicación del donante para recoger el alimento.",
      });

      fetchAvailableDonations();
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        message: errorMsg,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const filteredDonations = availableDonations.filter(
    (donation) =>
      donation.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.donor.ciudad.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-brand-background font-sans flex flex-col md:flex-row relative">
      <aside className="w-full md:w-64 bg-brand-card border-r border-brand-border p-6 flex flex-col z-10">
        <div className="flex items-center gap-2 text-brand-accent mb-10">
          <Leaf size={28} />
          <span className="text-2xl font-bold tracking-tight text-brand-text font-jakarta">
            FoodSaver
          </span>
        </div>
        <nav className="flex-1">
          <button className="flex items-center gap-3 px-4 py-3 bg-brand-accent/10 text-brand-accent rounded-xl font-medium w-full text-left">
            <ShoppingBag size={20} /> Galería
          </button>
        </nav>
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl font-medium w-full text-left"
        >
          <LogOut size={20} /> Cerrar Sesión
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto z-10">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-text font-jakarta mb-2">
              Alimentos Disponibles
            </h1>
            <p className="text-brand-muted">
              Explora los excedentes disponibles para recolección inmediata.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar alimento o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-brand-card border border-brand-border rounded-xl pl-10 pr-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-accent transition-colors shadow-sm"
            />
          </div>
        </header>

        {isLoading ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-brand-muted">Cargando alimentos...</p>
          </div>
        ) : filteredDonations.length === 0 ? (
          <div className="bg-brand-card border border-brand-border rounded-4xl p-10 text-center flex flex-col items-center justify-center h-64">
            <ShoppingBag
              size={48}
              className="text-brand-muted mb-4 opacity-50"
            />
            <p className="text-brand-muted">
              No hay alimentos activos en este momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDonations.map((donation) => (
              <div
                key={donation._id}
                className="bg-brand-card border border-brand-border rounded-4xl overflow-hidden hover:border-brand-accent/30 transition-all duration-300 flex flex-col group shadow-lg"
              >
                <div className="h-44 w-full overflow-hidden bg-brand-background relative">
                  {donation.imagenUrl ? (
                    <img
                      src={`http://localhost:5000/${donation.imagenUrl.replace(/\\/g, "/")}`}
                      alt={donation.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag
                        size={32}
                        className="text-brand-muted opacity-30"
                      />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-brand-background/90 backdrop-blur-sm px-3 py-1 rounded-full border border-brand-border text-xs font-medium text-brand-text flex items-center gap-1">
                    <Scale size={12} className="text-brand-accent" />{" "}
                    {donation.cantidad}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-brand-text text-lg mb-1 line-clamp-1">
                    {donation.titulo}
                  </h3>

                  <div className="bg-brand-background rounded-xl p-3 mb-4 border border-brand-border/50 text-xs">
                    <div className="flex items-start gap-2 text-brand-text mb-1.5">
                      <Store size={14} className="text-brand-accent mt-0.5" />
                      <span className="font-semibold">
                        {donation.donor.nombreEmpresa ||
                          `${donation.donor.nombres}`}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-brand-muted">
                      <MapPin size={14} className="mt-0.5" />
                      <span>
                        {donation.donor.direccion}, {donation.donor.ciudad}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-red-400 mb-5">
                    <Calendar size={14} />
                    <span>
                      Expira:{" "}
                      {new Date(donation.fechaCaducidad).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRequest(donation._id)}
                    className="w-full py-3 bg-brand-accent text-white rounded-xl font-medium hover:bg-brand-accent-light transition-all shadow-[0_0_15px_rgba(255,0,85,0.15)] mt-auto"
                  >
                    Solicitar Recolección
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {feedbackModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-card border border-brand-border rounded-3xl w-full max-w-sm p-8 text-center shadow-2xl">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${feedbackModal.type === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
            >
              {feedbackModal.type === "success" ? (
                <CheckCircle size={32} />
              ) : (
                <AlertCircle size={32} />
              )}
            </div>
            <h3 className="text-2xl font-bold text-brand-text mb-2">
              {feedbackModal.type === "success" ? "¡Todo listo!" : "Atención"}
            </h3>
            <p className="text-brand-muted mb-8">{feedbackModal.message}</p>
            <button
              onClick={() =>
                setFeedbackModal({ ...feedbackModal, isOpen: false })
              }
              className="w-full py-3 font-medium bg-brand-accent text-white rounded-xl hover:bg-brand-accent-light transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
