import { useState, useEffect } from "react";
import axios from "axios";
import { DonationCard } from "./DonationCard"; 
import { apiUrl } from "../../../lib/api";

interface DonationData {
  _id: string;
  titulo: string;
  cantidad: string;
  fechaCaducidad: string;
  fechaRecogida: string; 
  estado: "activo" | "asignado" | "recolectado";
  imagenUrl?: string;
}

export const DonationHistory = () => {
  const [donations, setDonations] = useState<DonationData[]>([]);
  const [activeTab, setActiveTab] = useState("activo"); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return; 
      
      const user = JSON.parse(userStr);
      
      const response = await axios.get(
        apiUrl(`/api/donations/donor/${user.id}`),
      );
      setDonations(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar las donaciones:", error);
      setLoading(false);
    }
  };

  const handleCancelDonation = async (id: string) => {
    try {
      await axios.delete(apiUrl(`/api/donations/${id}/cancel`));
      fetchDonations();
    } catch (error) {
      console.error("Error al cancelar la donación:", error);
      alert("Hubo un error al cancelar la publicación.");
    }
  };

  const handleCompleteDelivery = async (id: string, pin: string) => {
    try {
      const response = await axios.put(
        apiUrl(`/api/donations/${id}/complete`),
        { pin: pin },
      );
      
      alert(response.data.message); 
      fetchDonations(); 
      
    } catch (error: any) {
      if (error.response && error.response.data) {
        alert("❌ " + error.response.data.message);
      } else {
        alert("Error de conexión al validar el PIN.");
      }
    }
  };

  const filteredDonations = donations.filter((don) => don.estado === activeTab);

  if (loading) return <p className="text-brand-muted">Cargando tu historial...</p>;

  return (
    <div className="w-full flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-brand-text font-jakarta">
        Mi Historial de Publicaciones
      </h2>

      <div className="flex gap-2 border-b border-brand-border pb-4">
        <button
          onClick={() => setActiveTab("activo")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "activo"
              ? "bg-green-500/20 text-green-500 border border-green-500/50"
              : "text-brand-muted hover:bg-brand-background"
          }`}
        >
          Activos
        </button>
        
        <button
          onClick={() => setActiveTab("asignado")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "asignado"
              ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/50"
              : "text-brand-muted hover:bg-brand-background"
          }`}
        >
          Asignados
        </button>

        <button
          onClick={() => setActiveTab("recolectado")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "recolectado"
              ? "bg-gray-500/20 text-gray-400 border border-gray-500/50"
              : "text-brand-muted hover:bg-brand-background"
          }`}
        >
          Recolectados
        </button>
      </div>

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
              onComplete={handleCompleteDelivery} 
            />
          ))
        )}
      </div>
    </div>
  );
};