import { useEffect, useState } from "react";
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
  Phone,
} from "lucide-react";

interface DonorInfo {
  _id: string;
  nombres: string;
  apellidos: string;
  departamento: string;
  ciudad: string;
  direccion: string;
  celular: string;
}

interface DonationData {
  _id: string;
  titulo: string;
  descripcion: string;
  cantidad: string;
  fechaCaducidad: string;
  estado: string;
  imagenUrl?: string; // Hacemos la imagen opcional por seguridad
  donor: DonorInfo;
}

export const DashboardBeneficiaryPage = () => {
  const navigate = useNavigate();
  const [availableDonations, setAvailableDonations] = useState<DonationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAvailableDonations();
  }, []);

  const fetchAvailableDonations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/donations/available"
      );
      setAvailableDonations(response.data);
    } catch (error) {
      console.error("Error al cargar la galería:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest = async (id: string) => {
    try {
      // 1. Obtenemos el ID del beneficiario que está conectado
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        alert("Error: No has iniciado sesión.");
        return;
      }
      const user = JSON.parse(userStr);

      // 2. Hacemos la petición a la nueva ruta
      const response = await axios.put(`http://localhost:5000/api/donations/${id}/reserve`, {
        beneficiaryId: user.id
      });

      // 3. Mostramos el mensaje 
      alert(response.data.message);

      // 4. Recargamos la galería para que la tarjeta desaparezca mágicamente de la pantalla
      fetchAvailableDonations();

    } catch (error: any) {
      // Por si hay error al intentar solicitar el alimento y ya se asigno
      if (error.response && error.response.data) {
        alert(error.response.data.message);
      } else {
        alert("Hubo un error al intentar solicitar el alimento.");
      }
      console.error("Error al solicitar:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // 1. BLINDAMOS EL BUSCADOR AQUÍ
  const filteredDonations = availableDonations.filter(
    (donation) =>
      donation?.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation?.donor?.ciudad?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-background font-sans flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-brand-card border-r border-brand-border p-6 flex flex-col z-10">
        <div className="flex items-center gap-2 text-brand-accent mb-10">
          <Leaf size={28} />
          <span className="text-2xl font-bold tracking-tight text-brand-text font-jakarta">
            FoodSaver
          </span>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 bg-brand-accent/10 text-brand-accent rounded-xl font-medium transition-colors w-full text-left">
            <ShoppingBag size={20} />
            Galería de Alimentos
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

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-text font-jakarta mb-2">
              Alimentos Disponibles
            </h1>
            <p className="text-brand-muted">
              Explora y solicita alimentos que han sido donados cerca de ti.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar por alimento o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-brand-card border border-brand-border rounded-xl pl-10 pr-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-accent transition-colors shadow-sm"
            />
          </div>
        </header>

        {isLoading ? (
          <div className="text-brand-muted text-center py-20 flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mb-4"></div>
            Buscando alimentos en tu zona...
          </div>
        ) : filteredDonations.length === 0 ? (
          <div className="bg-brand-card border border-brand-border rounded-4xl p-10 text-center flex flex-col items-center justify-center h-64">
            <ShoppingBag
              size={48}
              className="text-brand-muted mb-4 opacity-50"
            />
            <p className="text-brand-muted text-lg">
              No hay alimentos disponibles que coincidan con tu búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDonations.map((donation) => (
              <div
                key={donation._id}
                className="bg-brand-card border border-brand-border rounded-4xl overflow-hidden hover:border-brand-accent/50 transition-all duration-300 flex flex-col group shadow-lg hover:shadow-brand-accent/5"
              >
                <div className="h-48 w-full overflow-hidden bg-brand-background relative">
                  {donation.imagenUrl ? (
                    <img
                      src={`http://localhost:5000/${donation.imagenUrl.replace(/\\/g, "/")}`}
                      alt={donation.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag
                        size={40}
                        className="text-brand-muted opacity-30"
                      />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-brand-background/90 backdrop-blur-sm px-3 py-1 rounded-full border border-brand-border flex items-center gap-1 text-xs font-medium text-brand-text">
                    <Scale size={12} className="text-brand-accent" />{" "}
                    {donation?.cantidad}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-brand-text text-xl mb-1 line-clamp-1">
                    {donation?.titulo}
                  </h3>
                  <p className="text-sm text-brand-muted line-clamp-2 mb-4 flex-1">
                    {donation?.descripcion}
                  </p>

                  {/* 2. BLINDAMOS LAS TARJETAS AQUÍ */}
                  <div className="bg-brand-background rounded-xl p-3 mb-4 border border-brand-border/50">
                    <div className="flex items-start gap-2 text-sm text-brand-text mb-2">
                      <Store
                        size={16}
                        className="text-brand-accent shrink-0 mt-0.5"
                      />
                      <span className="font-medium">
                        {donation.donor?.nombres || "Donador"} {donation.donor?.apellidos || "Anónimo"}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-brand-muted mb-1">
                      <MapPin size={14} className="shrink-0 mt-0.5" />
                      <span>
                        {donation.donor?.direccion || "Sin dirección"}, {donation.donor?.ciudad || "Sin ciudad"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-brand-muted">
                      <Phone size={14} className="shrink-0" />
                      <span>{donation.donor?.celular || "Sin número"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-brand-muted mb-5">
                    <Calendar size={14} className="text-red-400" />
                    <span className="text-red-400/80">
                      Vence:{" "}
                      {new Date(donation.fechaCaducidad).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRequest(donation._id)}
                    className="w-full py-3 bg-brand-accent text-white rounded-xl font-medium hover:bg-brand-accent-light transition-all shadow-[0_0_15px_rgba(255,0,85,0.15)] mt-auto"
                  >
                    Solicitar Alimento
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};