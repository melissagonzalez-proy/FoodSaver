import { RatingModal } from "../components/RatingModal";
import { useEffect, useState, useCallback } from "react";
import { EditDonationModal } from "../components/EditDonationModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl, assetUrl } from "../../../lib/api";
import { LogOut, User, Leaf, PlusCircle, PackageOpen, Image as ImageIcon, Calendar, Scale, CheckCircle, Clock, KeyRound, Lock, XCircle, Box, ListOrdered, Pencil, Star } from "lucide-react";
import { EditProfile } from "../components/EditProfile";

interface BeneficiaryInfo { _id: string; nombres: string; apellidos: string; promedioCalificacion?: number; totalEvaluaciones?: number; }
interface DonationData {
  _id: string; titulo: string; descripcion: string;
  cantidad: number; unidad: string;
  fechaCaducidad: string; fechaRecogida: string; estado: "activo" | "asignado" | "recolectado"; 
  imagenUrl: string; pickupPin?: string; beneficiary?: BeneficiaryInfo; createdAt: string;
}

const CountdownTimer = ({ expiresAt }: { expiresAt: string }) => {
  const calculateTime = (expiration: string) => {
    const difference = new Date(expiration).getTime() - new Date().getTime();
    if (difference <= 0) return { text: "Vencido", expired: true };
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    if (days > 0) return { text: `${days}d ${hours}h restantes`, expired: false };
    return { text: `${hours}h ${minutes}m restantes`, expired: false };
  };
  const [timeLeft, setTimeLeft] = useState(() => calculateTime(expiresAt).text);
  const [isExpired, setIsExpired] = useState(() => calculateTime(expiresAt).expired);
  useEffect(() => {
    const timer = setInterval(() => {
      const result = calculateTime(expiresAt);
      setTimeLeft(result.text); setIsExpired(result.expired);
    }, 60000);
    return () => clearInterval(timer);
  }, [expiresAt]);
  return (
    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md border ${isExpired ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"}`}>
      <Clock size={12} /><span>{timeLeft}</span>
    </div>
  );
};

export const DashboardDonorPage = () => {
  const navigate = useNavigate();
  const [mainView, setMainView] = useState<"inventario" | "historial" | "perfil">("inventario");
  const [activeTab, setActiveTab] = useState<"activo" | "asignado" | "recolectado">("activo");
  const [donations, setDonations] = useState<DonationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pinInputs, setPinInputs] = useState<{ [key: string]: string }>({});
  const [editingDonation, setEditingDonation] = useState<DonationData | null>(null);
  
  const [ratingModal, setRatingModal] = useState({
    isOpen: false,
    donationId: "",
    toUserId: "",
    toUserName: ""
  });

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = storedUser.id || storedUser._id || "";

  const [formData, setFormData] = useState({
    titulo: "", descripcion: "", cantidad: "", unidad: "kg", fechaCaducidad: "", fechaRecogida: "", imagen: null as File | null,
  });
  const [imageName, setImageName] = useState("");
  const [passwordModal, setPasswordModal] = useState({ isOpen: false, actual: "", nueva: "", confirmar: "", isSubmitting: false });

  const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      const detail = error.response?.data?.detail;
      if (message && detail) return `${message} (${detail})`;
      return message || "Hubo un error al crear la publicacion.";
    }
    return "Hubo un error al crear la publicacion.";
  };

  const fetchDonations = useCallback(async () => {
    try {
      const response = await axios.get(
        apiUrl(`/api/donations/donor/${userId}`),
      );
      setDonations(response.data);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  }, [userId]);

  useEffect(() => { if (userId) fetchDonations(); }, [userId, fetchDonations]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) { setFormData({ ...formData, imagen: files[0] }); setImageName(files[0].name); }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setIsSubmitting(true);
    if (!userId) {
      alert("Tu sesion no es valida. Por favor inicia sesion de nuevo.");
      setIsSubmitting(false);
      return;
    }
    try {
      const data = new FormData();
      data.append("donorId", userId);
      data.append("titulo", formData.titulo);
      data.append("descripcion", formData.descripcion);
      data.append("cantidad", formData.cantidad);
      data.append("unidad", formData.unidad);
      data.append("fechaCaducidad", formData.fechaCaducidad);
      data.append("fechaRecogida", formData.fechaRecogida); 
      if (formData.imagen) data.append("imagen", formData.imagen);

      await axios.post(apiUrl("/api/donations"), data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData({ titulo: "", descripcion: "", cantidad: "", unidad: "kg", fechaCaducidad: "", fechaRecogida: "", imagen: null });
      setImageName(""); fetchDonations(); setActiveTab("activo"); setMainView("inventario"); setShowSuccessModal(true);
    } catch (error) {
      console.error("Error al crear la publicacion:", error);
      alert(getErrorMessage(error));
    } finally { setIsSubmitting(false); }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas cancelar esta reserva y liberar el producto?")) return;
    try {
      await axios.put(apiUrl(`/api/donations/cancel/${id}`));
      fetchDonations();
    } catch {
      alert("Error al cancelar la reserva.");
    }
  };

  const handleComplete = async (id: string) => {
    const pin = pinInputs[id];
    if (!pin || pin.length !== 4) { alert("Ingresa el PIN de 4 dígitos."); return; }
    try {
      const response = await axios.put(
        apiUrl(`/api/donations/complete/${id}`),
        { pin },
      );
      alert(response.data.message); fetchDonations();
    } catch (error: any) { alert(error.response?.data?.message || "Error al completar la entrega."); }
  };

  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); };

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
        userId: userId,
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
  
  const filteredDonations = donations.filter((d) => d.estado === activeTab);
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="h-screen overflow-hidden bg-brand-background font-sans flex flex-col md:flex-row relative">
      <aside className="w-full md:w-64 bg-brand-card border-r border-brand-border p-6 flex flex-col z-10">
        <div className="flex items-center gap-2 text-brand-accent mb-10">
          <Leaf size={28} />
          <span className="text-2xl font-bold tracking-tight text-brand-text font-jakarta">FoodSaver</span>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2">
          <button onClick={() => setMainView("inventario")} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors w-full text-left ${mainView === "inventario" ? "bg-brand-accent/10 text-brand-accent" : "text-brand-muted hover:bg-brand-background hover:text-brand-text"}`}>
            <PackageOpen size={20} /> Inventario
          </button>
          <button onClick={() => setMainView("historial")} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors w-full text-left ${mainView === "historial" ? "bg-brand-accent/10 text-brand-accent" : "text-brand-muted hover:bg-brand-background hover:text-brand-text"}`}>
            <ListOrdered size={20} /> Historial
          </button>
          <button onClick={() => setMainView("perfil")} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors w-full text-left ${mainView === "perfil" ? "bg-brand-accent/10 text-brand-accent" : "text-brand-muted hover:bg-brand-background hover:text-brand-text"}`}>
            <User size={20} /> Mi Perfil
          </button>
        </nav>
        
        <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-brand-border/50">
          <button onClick={() => setPasswordModal({ ...passwordModal, isOpen: true })} className="flex items-center gap-3 px-4 py-3 text-brand-muted hover:bg-brand-background hover:text-brand-text rounded-xl font-medium w-full text-left transition-colors">
            <KeyRound size={20} /> Cambiar Contraseña
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl font-medium w-full text-left transition-colors">
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto z-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand-text font-jakarta mb-2">
            {mainView === "inventario" ? "Panel de Control de Inventario" : 
             mainView === "historial" ? "Historial de Donaciones" : 
             "Mi Perfil"}
          </h1>
          <p className="text-brand-muted">
            {mainView === "inventario" ? "Publica y gestiona el estado de tus excedentes alimentarios." : 
             mainView === "historial" ? "Supervisa todas las donaciones que has realizado y su estado actual." :
             "Actualiza tus datos personales y de logística de recolección."}
          </p>
        </header>

        {mainView === "inventario" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-brand-card border border-brand-border rounded-4xl p-6 shadow-xl h-fit">
              <div className="flex items-center gap-2 mb-6"><PlusCircle className="text-brand-accent" size={24} /><h2 className="text-xl font-semibold text-brand-text">Nueva Publicación</h2></div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input required name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Título. Ej: Caja de manzanas" className="bg-brand-background border border-brand-border rounded-xl px-4 py-2.5 text-brand-text focus:border-brand-accent outline-none" />
                <textarea required name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Descripción..." rows={2} className="bg-brand-background border border-brand-border rounded-xl px-4 py-2.5 text-brand-text focus:border-brand-accent outline-none resize-none" />
                
                <div className="flex gap-2">
                  <input required name="cantidad" value={formData.cantidad} onChange={handleChange} placeholder="Cant. Ej: 5" type="number" min="1" className="w-1/2 bg-brand-background border border-brand-border rounded-xl px-4 py-2.5 text-brand-text focus:border-brand-accent outline-none" />
                  <select name="unidad" value={formData.unidad} onChange={handleChange} className="w-1/2 bg-brand-background border border-brand-border rounded-xl px-2 py-2.5 text-brand-text focus:border-brand-accent outline-none">
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                    <option value="litros">litros</option>
                    <option value="unidades">unidades</option>
                    <option value="paquetes">paquetes</option>
                    <option value="raciones">raciones</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <div className="w-1/2 flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-brand-muted ml-1 tracking-wider">Vencimiento</label>
                    <input required type="date" name="fechaCaducidad" value={formData.fechaCaducidad} onChange={handleChange} min={today} className="w-full bg-brand-background border border-brand-border rounded-xl px-3 py-2.5 text-brand-text focus:border-brand-accent outline-none text-sm" />
                  </div>
                  <div className="w-1/2 flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-brand-accent ml-1 tracking-wider">Recogida</label>
                    <input required type="date" name="fechaRecogida" value={formData.fechaRecogida} onChange={handleChange} min={today} className="w-full bg-brand-background border border-brand-accent/30 rounded-xl px-3 py-2.5 text-brand-text focus:border-brand-accent outline-none text-sm" />
                  </div>
                </div>
                
                <label className={`cursor-pointer border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors ${imageName ? "border-brand-accent bg-brand-accent/5" : "border-brand-border hover:border-brand-accent"}`}>
                  <input type="file" name="imagen" accept="image/*" onChange={handleFileChange} className="hidden" /><ImageIcon size={24} className="text-brand-accent mb-2" /><span className="text-sm font-medium text-brand-text">{imageName || "Subir foto"}</span>
                </label>
                <button disabled={isSubmitting} type="submit" className="w-full mt-2 py-3 bg-brand-accent text-white rounded-xl font-medium hover:bg-brand-accent-light transition-all disabled:opacity-50">
                  {isSubmitting ? "Publicando..." : "Publicar Alimento"}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 flex flex-col">
              <div className="flex gap-2 p-1 bg-brand-card border border-brand-border rounded-xl mb-6 w-fit">
                <button onClick={() => setActiveTab("activo")} className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "activo" ? "bg-green-500/10 text-green-500" : "text-brand-muted hover:text-brand-text"}`}><CheckCircle size={16} /> Activos</button>
                <button onClick={() => setActiveTab("asignado")} className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "asignado" ? "bg-yellow-500/10 text-yellow-500" : "text-brand-muted hover:text-brand-text"}`}><PackageOpen size={16} /> Asignados</button>
                <button onClick={() => setActiveTab("recolectado")} className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "recolectado" ? "bg-gray-500/10 text-gray-400" : "text-brand-muted hover:text-brand-text"}`}><Box size={16} /> Recolectados</button>
              </div>

              {isLoading ? <div className="text-brand-muted text-center py-10">Cargando inventario...</div> : filteredDonations.length === 0 ? (
                <div className="bg-brand-card border border-brand-border rounded-4xl p-10 text-center flex flex-col items-center justify-center h-64"><PackageOpen size={48} className="text-brand-muted mb-4 opacity-50" /><p className="text-brand-muted">No tienes alimentos en estado "{activeTab}".</p></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-max">
                  {filteredDonations.map((donation) => (
                    <div key={donation._id} className={`bg-brand-card border border-brand-border rounded-2xl overflow-hidden transition-colors flex flex-col ${donation.estado === "recolectado" ? "opacity-60 grayscale" : "hover:border-brand-accent/50"}`}>
                      <div className="h-40 w-full overflow-hidden bg-brand-background relative group">
                        {donation.imagenUrl ? <img src={assetUrl(donation.imagenUrl.replace(/\\/g, "/"))} alt={donation.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={32} className="text-brand-muted opacity-50" /></div>}
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-2 gap-2"><h3 className="font-semibold text-brand-text text-lg line-clamp-1">{donation.titulo}</h3><CountdownTimer expiresAt={donation.fechaCaducidad} /></div>
                        <p className="text-sm text-brand-muted line-clamp-2 mb-4 flex-1">{donation.descripcion}</p>
                        <div className="flex justify-between items-center text-xs text-brand-muted mb-4 pt-4 border-t border-brand-border">
                          <span className="flex items-center gap-1"><Scale size={14} /> {donation.cantidad} {donation.unidad || 'uds'}</span>
                          <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(donation.fechaCaducidad).toLocaleDateString()}</span>
                        </div>

                        {donation.beneficiary && (
                          <div className="flex items-center gap-2 text-xs text-brand-muted mb-3">
                            <User size={12} className="text-brand-accent" />
                            <span>{donation.beneficiary.nombres}</span>
                            <span>•</span>
                            {donation.beneficiary.totalEvaluaciones && donation.beneficiary.totalEvaluaciones > 0 ? (
                              <span>{donation.beneficiary.promedioCalificacion?.toFixed(1)} • {donation.beneficiary.totalEvaluaciones} eval.</span>
                            ) : (
                              <span>Usuario nuevo</span>
                            )}
                          </div>
                        )}
                        
                        {donation.estado === "activo" && (
                          <div className="flex gap-2 mt-auto">
                            <button onClick={() => setEditingDonation(donation)} className="flex-1 py-2 border border-brand-accent/30 text-brand-accent hover:bg-brand-accent/10 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1">
                              <Pencil size={16} /> Editar
                            </button>
                          </div>
                        )}

                        {donation.estado === "asignado" && (
                          <div className="flex flex-col gap-3 mt-auto">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">PIN de Seguridad</label>
                              <input type="text" maxLength={4} placeholder="0000" value={pinInputs[donation._id] || ""} onChange={(e) => setPinInputs({ ...pinInputs, [donation._id]: e.target.value.replace(/\D/g, "") })} className="bg-brand-background border border-brand-border rounded-lg py-2 text-center font-bold tracking-[0.5em] text-brand-accent outline-none focus:border-brand-accent/50" />
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleCancel(donation._id)} className="flex-1 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"><XCircle size={16} /> Cancelar</button>
                              <button onClick={() => handleComplete(donation._id)} className="flex-1 py-2 bg-green-600 text-white hover:bg-green-500 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 shadow-lg shadow-green-500/20"><CheckCircle size={16} /> Validar</button>
                            </div>
                          </div>
                        )}

                        {/* NUEVO BOTÓN DE CALIFICAR PARA EL DONADOR */}
                        {donation.estado === "recolectado" && donation.beneficiary && (
                          <div className="flex gap-2 mt-auto pt-2">
                            <button 
                              onClick={() => setRatingModal({ isOpen: true, donationId: donation._id, toUserId: donation.beneficiary!._id, toUserName: donation.beneficiary!.nombres })} 
                              className="flex-1 py-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 hover:bg-yellow-500 hover:text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                            >
                              <Star size={16} /> Evaluar Beneficiario
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
        )}

        {mainView === "historial" && (
          <div className="bg-brand-card border border-brand-border rounded-4xl p-6 shadow-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border text-brand-muted text-sm">
                  <th className="pb-3 font-medium">Producto</th><th className="pb-3 font-medium text-center">Cantidad</th><th className="pb-3 font-medium text-center">Estado</th><th className="pb-3 font-medium text-center">PIN</th><th className="pb-3 font-medium text-center">Accion</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d._id} className="border-b border-brand-border/50 hover:bg-brand-background/50 transition-colors">
                    <td className="py-4"><p className="font-semibold text-brand-text">{d.titulo}</p><p className="text-xs text-brand-muted">{new Date(d.createdAt || Date.now()).toLocaleDateString()}</p></td>
                    <td className="py-4 text-center text-brand-text font-medium">{d.cantidad} {d.unidad || 'uds'}</td>
                    <td className="py-4 text-center"><span className={`px-3 py-1 rounded-full text-xs font-bold ${d.estado === 'activo' ? 'bg-green-500/10 text-green-500' : d.estado === 'asignado' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-gray-500/10 text-gray-400'}`}>{d.estado.toUpperCase()}</span></td>
                    <td className="py-4 text-center">{d.estado === 'asignado' ? <span className="bg-brand-background border border-brand-accent/30 px-2 py-1 rounded text-brand-accent font-mono font-bold tracking-wider">{d.pickupPin || "----"}</span> : <span className="text-brand-muted">—</span>}</td>
                    <td className="py-4 text-center">
                      {d.estado === "recolectado" && d.beneficiary ? (
                        <button
                          onClick={() => setRatingModal({
                            isOpen: true,
                            donationId: d._id,
                            toUserId: d.beneficiary!._id,
                            toUserName: `${d.beneficiary!.nombres} ${d.beneficiary!.apellidos || ""}`.trim(),
                          })}
                          className="inline-flex items-center gap-1 text-xs px-3 py-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white rounded-lg transition-colors font-medium"
                        >
                          <Star size={14} /> Calificar
                        </button>
                      ) : (
                        <span className="text-brand-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {mainView === "perfil" && (
          <EditProfile />
        )}

      </main>

      {/* MODALES */}
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
                <button type="button" onClick={() => setPasswordModal({ isOpen: false, actual: "", nueva: "", confirmar: "", isSubmitting: false })} className="flex-1 py-3 font-medium border border-brand-border text-brand-text rounded-xl hover:bg-brand-background transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={passwordModal.isSubmitting} className="flex-1 py-3 font-medium bg-brand-accent text-white rounded-xl hover:bg-brand-accent-light transition-all disabled:opacity-50">
                  {passwordModal.isSubmitting ? "..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-brand-card border border-brand-border rounded-3xl w-full max-w-sm p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-brand-text mb-2 font-jakarta">¡Publicado!</h3>
            <p className="text-brand-muted mb-8">El alimento está activo y visible para los beneficiarios.</p>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 bg-brand-accent text-white rounded-xl font-medium">Continuar</button>
          </div>
        </div>
      )}

      <EditDonationModal 
        isOpen={!!editingDonation} 
        onClose={() => setEditingDonation(null)} 
        donation={editingDonation} 
        onSuccess={fetchDonations} 
      />

      {/* MODAL DE CALIFICACIÓN */}
      <RatingModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal({ ...ratingModal, isOpen: false })}
        donationId={ratingModal.donationId}
        toUserId={ratingModal.toUserId}
        toUserName={ratingModal.toUserName}
        onSuccess={fetchDonations}
      />

    </div>
  );
};