import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LogOut,
  Leaf,
  PlusCircle,
  PackageOpen,
  Image as ImageIcon,
  Calendar,
  Scale,
  CheckCircle,
  Clock,
  XCircle,
  Box,
} from "lucide-react";

interface DonationData {
  _id: string;
  titulo: string;
  descripcion: string;
  cantidad: string;
  fechaCaducidad: string;
  estado: "activo" | "asignado" | "recolectado";
  imagenUrl: string;
}

const CountdownTimer = ({ expiresAt }: { expiresAt: string }) => {
  const calculateTime = (expiration: string) => {
    const difference = new Date(expiration).getTime() - new Date().getTime();
    if (difference <= 0) return { text: "Vencido", expired: true };

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);

    if (days > 0)
      return { text: `${days}d ${hours}h restantes`, expired: false };
    return { text: `${hours}h ${minutes}m restantes`, expired: false };
  };

  const [timeLeft, setTimeLeft] = useState(() => calculateTime(expiresAt).text);
  const [isExpired, setIsExpired] = useState(
    () => calculateTime(expiresAt).expired,
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const result = calculateTime(expiresAt);
      setTimeLeft(result.text);
      setIsExpired(result.expired);
    }, 60000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <div
      className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md border ${isExpired ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"}`}
    >
      <Clock size={12} />
      <span>{timeLeft}</span>
    </div>
  );
};

export const DashboardDonorPage = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState<DonationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "activo" | "asignado" | "recolectado"
  >("activo");

  const userId = JSON.parse(localStorage.getItem("user") || "{}").id;

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    cantidad: "",
    fechaCaducidad: "",
    imagen: null as File | null,
  });
  const [imageName, setImageName] = useState("");

  const fetchDonations = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/donations/donor/${userId}`,
      );
      setDonations(response.data);
    } catch (error) {
      console.error("Error al cargar las publicaciones:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchDonations();
  }, [userId, fetchDonations]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      setFormData({ ...formData, imagen: files[0] });
      setImageName(files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("donorId", userId);
      data.append("titulo", formData.titulo);
      data.append("descripcion", formData.descripcion);
      data.append("cantidad", formData.cantidad);
      data.append("fechaCaducidad", formData.fechaCaducidad);
      if (formData.imagen) data.append("imagen", formData.imagen);

      await axios.post("http://localhost:5000/api/donations", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFormData({
        titulo: "",
        descripcion: "",
        cantidad: "",
        fechaCaducidad: "",
        imagen: null,
      });
      setImageName("");
      fetchDonations();
      setActiveTab("activo");
      setShowSuccessModal(true);
    } catch {
      alert("Hubo un error al crear la publicación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (
      !window.confirm(
        "¿Seguro que deseas cancelar esta reserva y liberar el producto?",
      )
    )
      return;
    try {
      await axios.put(`http://localhost:5000/api/donations/cancel/${id}`);
      fetchDonations();
    } catch {
      alert("Error al cancelar la reserva.");
    }
  };

  const handleComplete = async (id: string) => {
    if (
      !window.confirm(
        "¿Confirmas que el beneficiario ya recogió este alimento?",
      )
    )
      return;
    try {
      await axios.put(`http://localhost:5000/api/donations/complete/${id}`);
      fetchDonations();
    } catch {
      alert("Error al completar la entrega.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const filteredDonations = donations.filter((d) => d.estado === activeTab);
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-brand-background font-sans flex flex-col md:flex-row relative">
      <aside className="w-full md:w-64 bg-brand-card border-r border-brand-border p-6 flex flex-col z-10">
        <div className="flex items-center gap-2 text-brand-accent mb-10">
          <Leaf size={28} />
          <span className="text-2xl font-bold tracking-tight text-brand-text font-jakarta">
            FoodSaver
          </span>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 bg-brand-accent/10 text-brand-accent rounded-xl font-medium transition-colors w-full text-left">
            <PackageOpen size={20} /> Inventario
          </button>
        </nav>
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl font-medium transition-colors w-full text-left"
        >
          <LogOut size={20} /> Cerrar Sesión
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto z-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand-text font-jakarta mb-2">
            Panel de Control de Inventario
          </h1>
          <p className="text-brand-muted">
            Publica y gestiona el estado de tus excedentes alimentarios.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-brand-card border border-brand-border rounded-4xl p-6 shadow-xl h-fit">
            <div className="flex items-center gap-2 mb-6">
              <PlusCircle className="text-brand-accent" size={24} />
              <h2 className="text-xl font-semibold text-brand-text">
                Nueva Publicación
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                required
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Título. Ej: Caja de manzanas"
                className="bg-brand-background border border-brand-border rounded-xl px-4 py-2.5 text-brand-text focus:border-brand-accent outline-none"
              />
              <textarea
                required
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Descripción..."
                rows={2}
                className="bg-brand-background border border-brand-border rounded-xl px-4 py-2.5 text-brand-text focus:border-brand-accent outline-none resize-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  name="cantidad"
                  value={formData.cantidad}
                  onChange={handleChange}
                  placeholder="Cantidad. Ej: 5 kg"
                  className="bg-brand-background border border-brand-border rounded-xl px-4 py-2.5 text-brand-text focus:border-brand-accent outline-none"
                />
                <input
                  required
                  type="date"
                  name="fechaCaducidad"
                  value={formData.fechaCaducidad}
                  onChange={handleChange}
                  min={today}
                  className="bg-brand-background border border-brand-border rounded-xl px-4 py-2.5 text-brand-text focus:border-brand-accent outline-none"
                />
              </div>
              <label
                className={`cursor-pointer border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors ${imageName ? "border-brand-accent bg-brand-accent/5" : "border-brand-border hover:border-brand-accent"}`}
              >
                <input
                  type="file"
                  name="imagen"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <ImageIcon size={24} className="text-brand-accent mb-2" />
                <span className="text-sm font-medium text-brand-text">
                  {imageName || "Subir foto"}
                </span>
              </label>
              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full mt-2 py-3 bg-brand-accent text-white rounded-xl font-medium hover:bg-brand-accent-light transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Publicando..." : "Publicar Alimento"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 flex flex-col">
            <div className="flex gap-2 p-1 bg-brand-card border border-brand-border rounded-xl mb-6 w-fit">
              <button
                onClick={() => setActiveTab("activo")}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "activo" ? "bg-green-500/10 text-green-500" : "text-brand-muted hover:text-brand-text"}`}
              >
                <CheckCircle size={16} /> Activos
              </button>
              <button
                onClick={() => setActiveTab("asignado")}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "asignado" ? "bg-yellow-500/10 text-yellow-500" : "text-brand-muted hover:text-brand-text"}`}
              >
                <PackageOpen size={16} /> Asignados
              </button>
              <button
                onClick={() => setActiveTab("recolectado")}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "recolectado" ? "bg-gray-500/10 text-gray-400" : "text-brand-muted hover:text-brand-text"}`}
              >
                <Box size={16} /> Recolectados
              </button>
            </div>

            {isLoading ? (
              <div className="text-brand-muted text-center py-10">
                Cargando inventario...
              </div>
            ) : filteredDonations.length === 0 ? (
              <div className="bg-brand-card border border-brand-border rounded-4xl p-10 text-center flex flex-col items-center justify-center h-64">
                <PackageOpen
                  size={48}
                  className="text-brand-muted mb-4 opacity-50"
                />
                <p className="text-brand-muted">
                  No tienes alimentos en estado "{activeTab}".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-max">
                {filteredDonations.map((donation) => (
                  <div
                    key={donation._id}
                    className={`bg-brand-card border border-brand-border rounded-2xl overflow-hidden transition-colors flex flex-col ${donation.estado === "recolectado" ? "opacity-60 grayscale" : "hover:border-brand-accent/50"}`}
                  >
                    <div className="h-40 w-full overflow-hidden bg-brand-background relative group">
                      {donation.imagenUrl ? (
                        <img
                          src={`http://localhost:5000/${donation.imagenUrl.replace(/\\/g, "/")}`}
                          alt={donation.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon
                            size={32}
                            className="text-brand-muted opacity-50"
                          />
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h3 className="font-semibold text-brand-text text-lg line-clamp-1">
                          {donation.titulo}
                        </h3>
                        <CountdownTimer expiresAt={donation.fechaCaducidad} />
                      </div>

                      <p className="text-sm text-brand-muted line-clamp-2 mb-4 flex-1">
                        {donation.descripcion}
                      </p>

                      <div className="flex justify-between items-center text-xs text-brand-muted mb-4 pt-4 border-t border-brand-border">
                        <span className="flex items-center gap-1">
                          <Scale size={14} /> {donation.cantidad}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />{" "}
                          {new Date(
                            donation.fechaCaducidad,
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      {donation.estado === "asignado" && (
                        <div className="flex gap-2 mt-auto">
                          <button
                            onClick={() => handleCancel(donation._id)}
                            className="flex-1 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                          >
                            <XCircle size={16} /> Cancelar
                          </button>
                          <button
                            onClick={() => handleComplete(donation._id)}
                            className="flex-1 py-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                          >
                            <CheckCircle size={16} /> Entregado
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-brand-card border border-brand-border rounded-3xl w-full max-w-sm p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-brand-text mb-2 font-jakarta">
              ¡Publicado!
            </h3>
            <p className="text-brand-muted mb-8">
              El alimento está activo y visible para los beneficiarios.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 bg-brand-accent text-white rounded-xl font-medium"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
