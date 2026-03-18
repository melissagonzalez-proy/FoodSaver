import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DonationHistory } from "../../auth/components/DonationHistory";
import {
  LogOut,
  Leaf,
  PlusCircle,
  PackageOpen,
  Image as ImageIcon,
  Calendar,
  Scale,
  CheckCircle,
} from "lucide-react";

export const DashboardDonorPage = () => {
  const navigate = useNavigate();
  // const [donations, setDonations] = useState<DonationData[]>([]);
  // const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const userId = JSON.parse(localStorage.getItem("user") || "{}").id;

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    cantidad: "",
    horasValidez: "",
    imagen: null as File | null,
  });
  const [imageName, setImageName] = useState("");

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
      const fechaCalculada = new Date();
      fechaCalculada.setHours(fechaCalculada.getHours() + parseInt(formData.horasValidez));

      const data = new FormData();
      data.append("donorId", userId);
      data.append("titulo", formData.titulo);
      data.append("descripcion", formData.descripcion);
      data.append("cantidad", formData.cantidad);
      data.append("fechaCaducidad", fechaCalculada.toISOString());
      if (formData.imagen) {
        data.append("imagen", formData.imagen);
      }

      await axios.post("http://localhost:5000/api/donations", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFormData({
        titulo: "",
        descripcion: "",
        cantidad: "",
        horasValidez: "",
        imagen: null,
      });
      setImageName("");
      setRefreshKey(prev => prev + 1);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error al publicar:", error);
      alert("Hubo un error al crear la publicación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

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
            <PackageOpen size={20} />
            Mis Publicaciones
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl font-medium transition-colors w-full text-left"
        >
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto z-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand-text font-jakarta mb-2">
            Panel de Donador
          </h1>
          <p className="text-brand-muted">
            Publica los alimentos excedentes de tu establecimiento para que
            puedan ser aprovechados.
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
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-brand-muted">
                  Título del alimento
                </label>
                <input
                  required
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  placeholder="Ej: Caja de manzanas"
                  className="bg-brand-background border border-brand-border rounded-xl px-4 py-2.5 text-brand-text focus:border-brand-accent outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-brand-muted">
                  Descripción
                </label>
                <textarea
                  required
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Detalles sobre el estado..."
                  rows={3}
                  className="bg-brand-background border border-brand-border rounded-xl px-4 py-2.5 text-brand-text focus:border-brand-accent outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-brand-muted flex items-center gap-1">
                    <Scale size={14} /> Cantidad
                  </label>
                  <input
                    required
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleChange}
                    placeholder="Ej: 5 kg"
                    className="bg-brand-background border border-brand-border rounded-xl px-4 py-2.5 text-brand-text focus:border-brand-accent outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-brand-muted flex items-center gap-1">
                    <Calendar size={14} /> Horas de validez
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    name="horasValidez"
                    value={formData.horasValidez}
                    onChange={handleChange}
                    placeholder="Ej: 12"
                    className="bg-brand-background border border-brand-border rounded-xl px-4 py-2.5 text-brand-text focus:border-brand-accent outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-2">
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
                    {imageName || "Subir foto del alimento"}
                  </span>
                </label>
              </div>

              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full mt-4 py-3 bg-brand-accent text-white rounded-xl font-medium hover:bg-brand-accent-light transition-all shadow-[0_0_20px_rgba(255,0,85,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Publicando..." : "Publicar Alimento"}
              </button>
            </form>
          </div>

      <div className="lg:col-span-2">
            <DonationHistory key={refreshKey} />
          </div>
      </div>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-card border border-brand-border rounded-3xl w-full max-w-sm p-8 shadow-2xl scale-in-95 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-brand-text mb-2 font-jakarta">
              ¡Publicación Exitosa!
            </h3>
            <p className="text-brand-muted mb-8">
              Tu alimento ha sido publicado y ya está disponible en la galería
              de los beneficiarios.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 font-medium bg-brand-accent text-white rounded-xl hover:bg-brand-accent-light transition-all shadow-[0_0_20px_rgba(255,0,85,0.15)]"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
