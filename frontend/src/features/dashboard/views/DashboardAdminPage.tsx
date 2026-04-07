import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users,
  FileText,
  CheckCircle,
  XCircle,
  LogOut,
  Search,
  Leaf,
  AlertTriangle,
  PackageOpen, // NUEVO ICONO
  Clock,
  Box
} from "lucide-react";

interface UserShort {
  nombres: string;
  apellidos: string;
  email: string;
  nombreEmpresa?: string;
}

interface DonationData {
  _id: string;
  titulo: string;
  cantidad: number;
  unidad?: string;
  estado: string;
  donor: UserShort;
  beneficiary?: UserShort;
  createdAt: string;
}

export const DashboardAdminPage = () => {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<"solicitudes" | "donaciones">("solicitudes");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [allDonations, setAllDonations] = useState<DonationData[]>([]); // NUEVO ESTADO
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "approve" | "reject" | null;
    userId: string | null;
    userName: string;
  }>({ isOpen: false, type: null, userId: null, userName: "" });

  useEffect(() => {
    if (activeTab === "solicitudes") {
      fetchPendingUsers();
    } else {
      fetchAllDonations();
    }
  }, [activeTab]);

  const fetchPendingUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/admin/pending-beneficiaries");
      setPendingUsers(response.data);
    } catch (error) {
      console.error("Error al cargar los usuarios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllDonations = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/donations/admin/all");
      setAllDonations(response.data);
    } catch (error) {
      console.error("Error al cargar las donaciones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmApprove = (id: string, name: string) => {
    setModalConfig({ isOpen: true, type: "approve", userId: id, userName: name });
  };

  const confirmReject = (id: string, name: string) => {
    setModalConfig({ isOpen: true, type: "reject", userId: id, userName: name });
  };

  const executeAction = async () => {
    if (!modalConfig.userId || !modalConfig.type) return;

    try {
      if (modalConfig.type === "approve") {
        await axios.put(`http://localhost:5000/api/admin/approve-beneficiary/${modalConfig.userId}`);
      } else {
        await axios.delete(`http://localhost:5000/api/admin/reject-beneficiary/${modalConfig.userId}`);
      }
      setPendingUsers(pendingUsers.filter((user) => user._id !== modalConfig.userId));
      setModalConfig({ isOpen: false, type: null, userId: null, userName: "" });
    } catch (error) {
      console.error(`Error al ${modalConfig.type}:`, error);
    }
  };

  const openFile = (path: string) => {
    if (!path) return;
    const normalizedPath = path.replace(/\\/g, "/");
    window.open(`http://localhost:5000/${normalizedPath}`, "_blank");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const filteredUsers = pendingUsers.filter(user => 
    user.nombres.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDonations = allDonations.filter(don => 
    don.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    don.donor?.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    don.beneficiary?.nombres.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen overflow-hidden bg-brand-background font-sans flex flex-col md:flex-row relative">
      <aside className="w-full md:w-64 bg-brand-card border-r border-brand-border p-6 flex flex-col z-10">
        <div className="flex items-center gap-2 text-brand-accent mb-10">
          <Leaf size={28} />
          <span className="text-2xl font-bold tracking-tight text-brand-text font-jakarta">FoodSaver</span>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab("solicitudes")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors w-full text-left ${activeTab === "solicitudes" ? "bg-brand-accent/10 text-brand-accent" : "text-brand-muted hover:bg-brand-background hover:text-brand-text"}`}
          >
            <Users size={20} /> Solicitudes Pendientes
          </button>
          
          <button 
            onClick={() => setActiveTab("donaciones")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors w-full text-left ${activeTab === "donaciones" ? "bg-brand-accent/10 text-brand-accent" : "text-brand-muted hover:bg-brand-background hover:text-brand-text"}`}
          >
            <PackageOpen size={20} /> Monitoreo Alimentos
          </button>
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl font-medium transition-colors w-full text-left">
          <LogOut size={20} /> Cerrar Sesión
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto z-10">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-text font-jakarta mb-2">Panel de Administración</h1>
            <p className="text-brand-muted">
              {activeTab === "solicitudes" 
                ? "Revisa y gestiona las solicitudes de nuevos beneficiarios." 
                : "Supervisa todas las donaciones activas e histórico del sistema."}
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-brand-card border border-brand-border rounded-xl pl-10 pr-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-accent transition-colors shadow-sm"
            />
          </div>
        </header>

        <div className="bg-brand-card border border-brand-border rounded-4xl p-6 shadow-xl">
          {/* --- VISTA 1: SOLICITUDES PENDIENTES --- */}
          {activeTab === "solicitudes" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-border text-brand-muted text-sm">
                    <th className="pb-3 font-medium min-w-50">Nombre y Correo</th>
                    <th className="pb-3 font-medium min-w-37.5">Documento</th>
                    <th className="pb-3 font-medium min-w-50">Archivos Adjuntos</th>
                    <th className="pb-3 font-medium text-center min-w-25">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={4} className="text-center py-10 text-brand-muted">Cargando solicitudes...</td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-10 text-brand-muted">No hay solicitudes pendientes.</td></tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id} className="border-b border-brand-border/50 hover:bg-brand-background/50 transition-colors">
                        <td className="py-4">
                          <p className="font-medium text-brand-text">{user.nombres} {user.apellidos}</p>
                          <p className="text-xs text-brand-muted">{user.email}</p>
                        </td>
                        <td className="py-4 text-sm text-brand-text">
                          {user.tipoDocumento} <br />
                          <span className="text-brand-muted">{user.numeroDocumento}</span>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => openFile(user.documentoIdentidadUrl)} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-brand-background border border-brand-border rounded-lg text-brand-text hover:border-brand-accent transition-colors">
                              <FileText size={14} /> Cédula
                            </button>
                            <button onClick={() => openFile(user.sisbenUrl)} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-brand-background border border-brand-border rounded-lg text-brand-text hover:border-brand-accent transition-colors">
                              <FileText size={14} /> SISBEN
                            </button>
                          </div>
                        </td>
                        <td className="py-4 flex justify-center gap-2">
                          <button onClick={() => confirmApprove(user._id, `${user.nombres} ${user.apellidos}`)} className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-colors" title="Aprobar"><CheckCircle size={20} /></button>
                          <button onClick={() => confirmReject(user._id, `${user.nombres} ${user.apellidos}`)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors" title="Rechazar"><XCircle size={20} /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* --- VISTA 2: MONITOREO DE DONACIONES --- */}
          {activeTab === "donaciones" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-border text-brand-muted text-sm">
                    <th className="pb-3 font-medium">Alimento</th>
                    <th className="pb-3 font-medium">Donador</th>
                    <th className="pb-3 font-medium">Beneficiario (Reserva)</th>
                    <th className="pb-3 font-medium text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={4} className="text-center py-10 text-brand-muted">Cargando donaciones...</td></tr>
                  ) : filteredDonations.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-10 text-brand-muted">No se encontraron donaciones.</td></tr>
                  ) : (
                    filteredDonations.map((donation) => (
                      <tr key={donation._id} className="border-b border-brand-border/50 hover:bg-brand-background/50 transition-colors">
                        <td className="py-4">
                          <p className="font-semibold text-brand-text">{donation.titulo}</p>
                          <p className="text-xs text-brand-muted">
                            {donation.cantidad} {donation.unidad || 'uds'} • {new Date(donation.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-4 text-sm text-brand-text">
                          {donation.donor?.nombreEmpresa || `${donation.donor?.nombres} ${donation.donor?.apellidos}`}
                          <br /><span className="text-xs text-brand-muted">{donation.donor?.email}</span>
                        </td>
                        <td className="py-4 text-sm text-brand-text">
                          {donation.beneficiary ? (
                            <>
                              {donation.beneficiary.nombres} {donation.beneficiary.apellidos}
                              <br /><span className="text-xs text-brand-muted">{donation.beneficiary.email}</span>
                            </>
                          ) : (
                            <span className="text-brand-muted italic">Sin reservar</span>
                          )}
                        </td>
                        <td className="py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                            donation.estado === 'activo' ? 'bg-green-500/10 text-green-500' : 
                            donation.estado === 'asignado' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-gray-500/10 text-gray-400'
                          }`}>
                            {donation.estado === 'activo' && <CheckCircle size={12} />}
                            {donation.estado === 'asignado' && <Clock size={12} />}
                            {donation.estado === 'recolectado' && <Box size={12} />}
                            {donation.estado.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal Personalizado (Para Aprobación de Usuarios) */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-card border border-brand-border rounded-3xl w-full max-w-md p-8 shadow-2xl scale-in-95">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${modalConfig.type === "approve" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
              {modalConfig.type === "approve" ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
            </div>
            <h3 className="text-2xl font-bold text-center text-brand-text mb-2 font-jakarta">
              {modalConfig.type === "approve" ? "Aprobar Solicitud" : "Rechazar Solicitud"}
            </h3>
            <p className="text-center text-brand-muted mb-8">
              ¿Estás seguro de que deseas {modalConfig.type === "approve" ? "aprobar" : "rechazar"} a <span className="font-semibold text-brand-text">{modalConfig.userName}</span>?
              {modalConfig.type === "reject" && " Esta acción eliminará su registro de forma permanente."}
            </p>
            <div className="flex gap-4">
              <button onClick={() => setModalConfig({ isOpen: false, type: null, userId: null, userName: "" })} className="flex-1 py-3 font-medium border border-brand-border text-brand-text rounded-xl hover:bg-brand-background transition-colors">
                Cancelar
              </button>
              <button onClick={executeAction} className={`flex-1 py-3 font-medium text-white rounded-xl transition-all shadow-lg ${modalConfig.type === "approve" ? "bg-green-600 hover:bg-green-500 shadow-green-500/20" : "bg-red-600 hover:bg-red-500 shadow-red-500/20"}`}>
                Sí, {modalConfig.type === "approve" ? "Aprobar" : "Rechazar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};