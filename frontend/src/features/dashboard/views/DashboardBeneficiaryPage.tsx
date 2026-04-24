import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl, assetUrl } from "../../../lib/api";
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
  ListOrdered,
  KeyRound,
  XCircle,
  Clock,
  Box,
  Lock,
  User 
} from "lucide-react";
import { EditProfile } from "../components/EditProfile"; // <-- IMPORTACIÓN DEL COMPONENTE

interface DonorInfo { _id: string; nombres: string; apellidos: string; departamento: string; ciudad: string; direccion: string; celular: string; nombreEmpresa?: string; }
interface DonationData {
  _id: string; titulo: string; descripcion: string; cantidad: number; unidad?: string;
  fechaCaducidad: string; estado: string; imagenUrl: string; donor: DonorInfo; pickupPin?: string;
}

export const DashboardBeneficiaryPage = () => {
  const navigate = useNavigate();
  // NUEVO: Agregamos "perfil" a los estados posibles
  const [activeTab, setActiveTab] = useState<"galeria" | "reservas" | "perfil">("galeria");
  const [availableDonations, setAvailableDonations] = useState<DonationData[]>([]);
  const [myReservations, setMyReservations] = useState<DonationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean; type: "success" | "error"; message: string; pin?: string; }>({ isOpen: false, type: "success", message: "" });
  const [requestModal, setRequestModal] = useState<{ isOpen: boolean; donation: DonationData | null; cantidadSolicitada: number; }>({ isOpen: false, donation: null, cantidadSolicitada: 1 });
  
  const [passwordModal, setPasswordModal] = useState({ isOpen: false, actual: "", nueva: "", confirmar: "", isSubmitting: false });

  const fetchAvailableDonations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(apiUrl("/api/donations/available"));
      setAvailableDonations(response.data);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  }, []);

  const fetchMyReservations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        apiUrl(`/api/donations/beneficiary/${currentUser.id}`),
      );
      setMyReservations(response.data);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  }, [currentUser.id]);

  useEffect(() => { 
    if (activeTab === "galeria") { fetchAvailableDonations(); } 
    else if (activeTab === "reservas") { fetchMyReservations(); } 
  }, [activeTab, fetchAvailableDonations, fetchMyReservations]);

  const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) { return error.response?.data?.message || "Hubo un error al procesar tu solicitud."; }
    return "Hubo un error al procesar tu solicitud.";
  };

  const openRequestModal = (donation: DonationData) => { setRequestModal({ isOpen: true, donation, cantidadSolicitada: 1 }); };

  const confirmRequest = async () => {
    if (!requestModal.donation) return;
    try {
      const response = await axios.put(
        apiUrl(`/api/donations/request/${requestModal.donation._id}`),
        {
          beneficiaryId: currentUser.id,
          cantidadSolicitada: requestModal.cantidadSolicitada,
        },
      );
      const pinSecreto = response.data.donation.pickupPin;
      setFeedbackModal({ isOpen: true, type: "success", message: response.data.message || "¡Reserva exitosa!", pin: pinSecreto });
      setRequestModal({ isOpen: false, donation: null, cantidadSolicitada: 1 });
      fetchAvailableDonations();
    } catch (error) {
      setFeedbackModal({ isOpen: true, type: "error", message: getErrorMessage(error) });
      setRequestModal({ isOpen: false, donation: null, cantidadSolicitada: 1 });
    }
  };

  const handleCancelReservation = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta reserva? El alimento volverá a estar disponible para otros y el PIN se anulará.")) return;
    try {
      await axios.put(apiUrl(`/api/donations/cancel/${id}`));
      fetchMyReservations();
    } catch {
      alert("Error al cancelar la reserva.");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordModal.nueva !== passwordModal.confirmar) {
      alert("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (passwordModal.nueva.length < 6) {
      alert("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    
    setPasswordModal(prev => ({ ...prev, isSubmitting: true }));
    try {
      const response = await axios.put(apiUrl("/api/auth/change-password"), {
        userId: currentUser.id,
        passwordActual: passwordModal.actual,
        passwordNueva: passwordModal.nueva
      });
      alert(response.data.message);
      setPasswordModal({ isOpen: false, actual: "", nueva: "", confirmar: "", isSubmitting: false });
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al cambiar la contraseña.");
      setPasswordModal(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); };

  const filteredDonations = availableDonations.filter((d) => d.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || d.donor.ciudad.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="h-screen overflow-hidden bg-brand-background font-sans flex flex-col md:flex-row relative">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-brand-card border-r border-brand-border p-6 flex flex-col z-10">
        <div className="flex items-center gap-2 text-brand-accent mb-10"><Leaf size={28} /><span className="text-2xl font-bold tracking-tight text-brand-text font-jakarta">FoodSaver</span></div>
        <nav className="flex-1 flex flex-col gap-2">
          <button onClick={() => setActiveTab("galeria")} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors w-full text-left ${activeTab === "galeria" ? "bg-brand-accent/10 text-brand-accent" : "text-brand-muted hover:bg-brand-background hover:text-brand-text"}`}><ShoppingBag size={20} /> Galería</button>
          <button onClick={() => setActiveTab("reservas")} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors w-full text-left ${activeTab === "reservas" ? "bg-brand-accent/10 text-brand-accent" : "text-brand-muted hover:bg-brand-background hover:text-brand-text"}`}><ListOrdered size={20} /> Mis Reservas</button>
          
          {/* NUEVO BOTÓN DE PERFIL */}
          <button onClick={() => setActiveTab("perfil")} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors w-full text-left ${activeTab === "perfil" ? "bg-brand-accent/10 text-brand-accent" : "text-brand-muted hover:bg-brand-background hover:text-brand-text"}`}><User size={20} /> Mi Perfil</button>
        </nav>
        
        <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-brand-border/50">
          <button onClick={() => setPasswordModal({ ...passwordModal, isOpen: true })} className="flex items-center gap-3 px-4 py-3 text-brand-muted hover:bg-brand-background hover:text-brand-text rounded-xl font-medium w-full text-left transition-colors"><KeyRound size={20} /> Cambiar Contraseña</button>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl font-medium w-full text-left transition-colors"><LogOut size={20} /> Cerrar Sesión</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto z-10">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            {/* TÍTULO DINÁMICO */}
            <h1 className="text-3xl font-bold text-brand-text font-jakarta mb-2">
              {activeTab === "galeria" ? "Alimentos Disponibles" : activeTab === "reservas" ? "Mis Reservas" : "Mi Perfil"}
            </h1>
            {/* DESCRIPCIÓN DINÁMICA */}
            <p className="text-brand-muted">
              {activeTab === "galeria" ? "Explora los excedentes disponibles para recolección inmediata." : activeTab === "reservas" ? "Gestiona los alimentos que has reservado y revisa tus códigos PIN." : "Actualiza tus datos personales y de logística de recolección."}
            </p>
          </div>
          {activeTab === "galeria" && (
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
              <input type="text" placeholder="Buscar alimento o ciudad..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-brand-card border border-brand-border rounded-xl pl-10 pr-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-accent transition-colors shadow-sm" />
            </div>
          )}
        </header>

        {/* LÓGICA DE VISTAS */}
        {activeTab === "perfil" ? (
          <EditProfile />
        ) : isLoading ? (
          <div className="text-center py-20 flex flex-col items-center"><div className="w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mb-4"></div><p className="text-brand-muted">Cargando...</p></div>
        ) : activeTab === "galeria" ? (
          filteredDonations.length === 0 ? (
            <div className="bg-brand-card border border-brand-border rounded-4xl p-10 text-center flex flex-col items-center justify-center h-64"><ShoppingBag size={48} className="text-brand-muted mb-4 opacity-50" /><p className="text-brand-muted">No hay alimentos activos en este momento.</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDonations.map((donation) => (
                <div key={donation._id} className="bg-brand-card border border-brand-border rounded-4xl overflow-hidden hover:border-brand-accent/30 transition-all duration-300 flex flex-col group shadow-lg">
                  <div className="h-44 w-full overflow-hidden bg-brand-background relative">
                    {donation.imagenUrl ? <img src={assetUrl(donation.imagenUrl.replace(/\\/g, "/"))} alt={donation.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={32} className="text-brand-muted opacity-30" /></div>}
                    <div className="absolute top-3 right-3 bg-brand-background/90 backdrop-blur-sm px-3 py-1 rounded-full border border-brand-border text-xs font-medium text-brand-text flex items-center gap-1">
                      <Scale size={12} className="text-brand-accent" /> {donation.cantidad} {donation.unidad || 'uds'}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-brand-text text-lg mb-1 line-clamp-1">{donation.titulo}</h3>
                    <div className="bg-brand-background rounded-xl p-3 mb-4 border border-brand-border/50 text-xs">
                      <div className="flex items-start gap-2 text-brand-text mb-1.5"><Store size={14} className="text-brand-accent mt-0.5" /><span className="font-semibold">{donation.donor.nombreEmpresa || `${donation.donor.nombres}`}</span></div>
                      <div className="flex items-start gap-2 text-brand-muted"><MapPin size={14} className="mt-0.5" /><span>{donation.donor.direccion}, {donation.donor.ciudad}</span></div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-red-400 mb-5"><Calendar size={14} /><span>Expira: {new Date(donation.fechaCaducidad).toLocaleDateString()}</span></div>
                    <button onClick={() => openRequestModal(donation)} className="w-full py-3 bg-brand-accent text-white rounded-xl font-medium hover:bg-brand-accent-light transition-all shadow-[0_0_15px_rgba(255,0,85,0.15)] mt-auto">Solicitar Recolección</button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="bg-brand-card border border-brand-border rounded-4xl p-6 shadow-xl">
             <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-border text-brand-muted text-sm">
                    <th className="pb-3 font-medium min-w-40">Alimento</th><th className="pb-3 font-medium min-w-50">Donante & Ubicación</th><th className="pb-3 font-medium text-center min-w-32">Estado</th><th className="pb-3 font-medium text-center min-w-32">PIN Secreto</th><th className="pb-3 font-medium text-center min-w-32">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {myReservations.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-10 text-brand-muted">No has reservado ningún alimento aún.</td></tr>
                  ) : (
                    myReservations.map((reservation) => (
                      <tr key={reservation._id} className="border-b border-brand-border/50 hover:bg-brand-background/50 transition-colors">
                        <td className="py-4"><p className="font-semibold text-brand-text">{reservation.titulo}</p><p className="text-xs text-brand-muted flex items-center gap-1 mt-1"><Scale size={12}/> {reservation.cantidad} {reservation.unidad || 'uds'}</p></td>
                        <td className="py-4 text-sm"><p className="font-medium text-brand-text flex items-center gap-1"><Store size={14} className="text-brand-accent"/> {reservation.donor.nombreEmpresa || reservation.donor.nombres}</p><p className="text-xs text-brand-muted flex items-center gap-1 mt-1"><MapPin size={12}/> {reservation.donor.direccion}, {reservation.donor.ciudad}</p></td>
                        <td className="py-4 text-center"><span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${reservation.estado === 'asignado' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>{reservation.estado === 'asignado' ? <Clock size={12} /> : <Box size={12} />}{reservation.estado === 'asignado' ? 'Pendiente' : 'Recolectado'}</span></td>
                        <td className="py-4 text-center">{reservation.estado === "asignado" ? (<div className="inline-flex items-center gap-2 bg-brand-background border border-brand-accent/30 px-4 py-2 rounded-lg text-brand-accent font-bold tracking-[0.2em] shadow-[0_0_10px_rgba(255,0,85,0.1)]"><KeyRound size={16} /> {reservation.pickupPin}</div>) : (<span className="text-brand-muted text-sm">—</span>)}</td>
                        <td className="py-4 flex justify-center">{reservation.estado === "asignado" ? (<button onClick={() => handleCancelReservation(reservation._id)} className="flex items-center gap-1 text-xs px-3 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors font-medium"><XCircle size={14} /> Cancelar</button>) : (<span className="text-brand-muted text-xs">Entregado</span>)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* --- MODAL CAMBIAR CONTRASEÑA --- */}
      {passwordModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-card border border-brand-border rounded-3xl w-full max-w-sm p-8 shadow-2xl">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-brand-accent/10 rounded-2xl flex items-center justify-center mb-4 border border-brand-accent/20">
                <KeyRound size={32} className="text-brand-accent" />
              </div>
              <h3 className="text-2xl font-bold text-brand-text">Cambiar Clave</h3>
            </div>

            <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
                <input required type="password" placeholder="Contraseña Actual" value={passwordModal.actual} onChange={(e) => setPasswordModal({...passwordModal, actual: e.target.value})} className="w-full bg-brand-background border border-brand-border rounded-xl pl-12 pr-4 py-3 text-sm text-brand-text focus:border-brand-accent outline-none transition-colors" />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
                <input required type="password" placeholder="Nueva Contraseña" value={passwordModal.nueva} onChange={(e) => setPasswordModal({...passwordModal, nueva: e.target.value})} className="w-full bg-brand-background border border-brand-border rounded-xl pl-12 pr-4 py-3 text-sm text-brand-text focus:border-brand-accent outline-none transition-colors" />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
                <input required type="password" placeholder="Confirmar Nueva" value={passwordModal.confirmar} onChange={(e) => setPasswordModal({...passwordModal, confirmar: e.target.value})} className="w-full bg-brand-background border border-brand-border rounded-xl pl-12 pr-4 py-3 text-sm text-brand-text focus:border-brand-accent outline-none transition-colors" />
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setPasswordModal({ isOpen: false, actual: "", nueva: "", confirmar: "", isSubmitting: false })} className="flex-1 py-3 font-medium border border-brand-border text-brand-text rounded-xl hover:bg-brand-background transition-colors">Cancelar</button>
                <button type="submit" disabled={passwordModal.isSubmitting} className="flex-1 py-3 font-medium bg-brand-accent text-white rounded-xl hover:bg-brand-accent-light transition-all disabled:opacity-50">{passwordModal.isSubmitting ? "..." : "Guardar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE SOLICITUD DE RECOLECCIÓN */}
      {requestModal.isOpen && requestModal.donation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-card border border-brand-border rounded-3xl w-full max-w-sm p-8 text-center shadow-2xl">
            <h3 className="text-2xl font-bold text-brand-text mb-2">¿Cuánto necesitas?</h3>
            <p className="text-brand-muted mb-6">Disponible: <span className="font-bold text-brand-accent">{requestModal.donation.cantidad} {requestModal.donation.unidad || 'uds'}</span> de {requestModal.donation.titulo}</p>
            <div className="flex items-center justify-center gap-4 mb-8">
              <input type="number" min="1" max={requestModal.donation.cantidad} value={requestModal.cantidadSolicitada} onChange={(e) => setRequestModal({...requestModal, cantidadSolicitada: Number(e.target.value)})} className="w-24 bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-center text-xl font-bold text-brand-text focus:border-brand-accent outline-none" />
              <span className="text-brand-muted font-medium">{requestModal.donation.unidad || 'uds'}</span>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setRequestModal({ isOpen: false, donation: null, cantidadSolicitada: 1 })} className="flex-1 py-3 font-medium border border-brand-border text-brand-text rounded-xl hover:bg-brand-background transition-colors">Cancelar</button>
              <button onClick={confirmRequest} className="flex-1 py-3 font-medium bg-brand-accent text-white rounded-xl hover:bg-brand-accent-light transition-all shadow-[0_0_15px_rgba(255,0,85,0.2)]">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE FEEDBACK (ÉXITO O ERROR) */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-card border border-brand-border rounded-3xl w-full max-w-sm p-8 text-center shadow-2xl">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${feedbackModal.type === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
              {feedbackModal.type === "success" ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
            </div>
            <h3 className="text-2xl font-bold text-brand-text mb-2">{feedbackModal.type === "success" ? "¡Reserva Exitosa!" : "Atención"}</h3>
            <p className="text-brand-muted mb-6">{feedbackModal.message}</p>
            {feedbackModal.type === "success" && feedbackModal.pin && (
              <div className="bg-brand-background border border-brand-border rounded-2xl p-4 mb-8"><p className="text-xs text-brand-muted uppercase tracking-wider mb-2 font-semibold">Tu PIN de entrega</p><div className="flex items-center justify-center gap-2 text-3xl font-bold text-brand-accent tracking-[0.3em]"><KeyRound size={28} /> {feedbackModal.pin}</div></div>
            )}
            <button onClick={() => { setFeedbackModal({ ...feedbackModal, isOpen: false, pin: undefined }); if (feedbackModal.type === "success") setActiveTab("reservas"); }} className="w-full py-3 font-medium bg-brand-accent text-white rounded-xl hover:bg-brand-accent-light transition-all">Entendido</button>
          </div>
        </div>
      )}
    </div>
  );
};