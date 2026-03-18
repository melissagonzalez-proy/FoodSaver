import { useState, useEffect } from "react";
import axios from "axios";
import { DonationCard } from "./DonationCard"; // Importamos la tarjeta que acabamos de crear
interface DonationData {
  _id: string;
  titulo: string;
  cantidad: string;
  fechaCaducidad: string;
  estado: "disponible" | "reservado" | "entregado"; 
  imagenUrl?: string;
}

export const DonationHistory = () => {
  // 1. EL ESTADO (La memoria del componente)
  const [donations, setDonations] = useState<DonationData[]>([]);
  const [activeTab, setActiveTab] = useState("disponible"); // Por defecto iniciamos en "Activos"
  const [loading, setLoading] = useState(true);

  // 2. EL EFECTO (Se ejecuta automáticamente al abrir la página)
  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      // Obtenemos el ID del usuario que inició sesión
      const userStr = localStorage.getItem("user");
      if (!userStr) return; // Si no hay usuario, no hacemos nada
      
      const user = JSON.parse(userStr);
      
      // Llamada al backend
      const response = await axios.get(`http://localhost:5000/api/donations/donor/${user.id}`);
      setDonations(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar las donaciones:", error);
      setLoading(false);
    }
  };

  // 3. LA FUNCIÓN PARA CANCELAR
  const handleCancelDonation = async (id: string) => {
    try {
      // Llamamos a la nueva ruta que creamos en el backend
      await axios.delete(`http://localhost:5000/api/donations/${id}/cancel`);
      
      // Volvemos a pedir los datos al backend para que la pantalla se actualice al instante
      fetchDonations();
    } catch (error) {
      console.error("Error al cancelar la donación:", error);
      alert("Hubo un error al cancelar la publicación.");
    }
  };

  // 4. EL FILTRO (La magia de las pestañas)
  // Filtro de la lista completa para mostrar solo los del estado seleccionados
  const filteredDonations = donations.filter((don) => don.estado === activeTab);

  if (loading) return <p className="text-brand-muted">Cargando tu historial...</p>;

  return (
    <div className="w-full flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-brand-text font-jakarta">
        Mi Historial de Publicaciones
      </h2>

      {/* SISTEMA DE PESTAÑAS (Tabs) */}
      <div className="flex gap-2 border-b border-brand-border pb-4">
        <button
          onClick={() => setActiveTab("disponible")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "disponible"
              ? "bg-green-500/20 text-green-500 border border-green-500/50"
              : "text-brand-muted hover:bg-brand-background"
          }`}
        >
          Activos
        </button>
        
        <button
          onClick={() => setActiveTab("reservado")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "reservado"
              ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/50"
              : "text-brand-muted hover:bg-brand-background"
          }`}
        >
          Asignados
        </button>

        <button
          onClick={() => setActiveTab("entregado")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "entregado"
              ? "bg-gray-500/20 text-gray-400 border border-gray-500/50"
              : "text-brand-muted hover:bg-brand-background"
          }`}
        >
          Recolectados
        </button>
      </div>

      {/* RENDERIZADO DE LAS TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDonations.length === 0 ? (
          <p className="text-brand-muted col-span-2 py-8 text-center border border-dashed border-brand-border rounded-xl">
            No tienes publicaciones en este estado.
          </p>
        ) : (
          filteredDonations.map((donation) => (
            <DonationCard
              key={donation._id}
              donation={donation}
              onCancel={handleCancelDonation}
            />
          ))
        )}
      </div>
    </div>
  );
};