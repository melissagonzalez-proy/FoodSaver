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
} from "lucide-react";

export const DashboardAdminPage = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "approve" | "reject" | null;
    userId: string | null;
    userName: string;
  }>({ isOpen: false, type: null, userId: null, userName: "" });

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/pending-beneficiaries",
      );
      setPendingUsers(response.data);
    } catch (error) {
      console.error("Error al cargar los usuarios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmApprove = (id: string, name: string) => {
    setModalConfig({
      isOpen: true,
      type: "approve",
      userId: id,
      userName: name,
    });
  };

  const confirmReject = (id: string, name: string) => {
    setModalConfig({
      isOpen: true,
      type: "reject",
      userId: id,
      userName: name,
    });
  };

  const executeAction = async () => {
    if (!modalConfig.userId || !modalConfig.type) return;

    try {
      if (modalConfig.type === "approve") {
        await axios.put(
          `http://localhost:5000/api/admin/approve-beneficiary/${modalConfig.userId}`,
        );
      } else {
        await axios.delete(
          `http://localhost:5000/api/admin/reject-beneficiary/${modalConfig.userId}`,
        );
      }

      setPendingUsers(
        pendingUsers.filter((user) => user._id !== modalConfig.userId),
      );

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
            <Users size={20} />
            Solicitudes Pendientes
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-brand-muted hover:bg-brand-background hover:text-brand-text rounded-xl font-medium transition-colors w-full text-left">
            <CheckCircle size={20} />
            Usuarios Aprobados
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
            Panel de Administración
          </h1>
          <p className="text-brand-muted">
            Revisa y gestiona las solicitudes de nuevos beneficiarios.
          </p>
        </header>

        <div className="bg-brand-card border border-brand-border rounded-4xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold text-brand-text">
              Beneficiarios por verificar
            </h2>
            <div className="relative w-full sm:w-auto">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full bg-brand-background border border-brand-border rounded-xl pl-10 pr-4 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border text-brand-muted text-sm">
                  <th className="pb-3 font-medium min-w-50">Nombre y Correo</th>
                  <th className="pb-3 font-medium min-w-37.5">Documento</th>
                  <th className="pb-3 font-medium min-w-50">
                    Archivos Adjuntos
                  </th>
                  <th className="pb-3 font-medium text-center min-w-25">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-10 text-brand-muted"
                    >
                      Cargando solicitudes...
                    </td>
                  </tr>
                ) : pendingUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-10 text-brand-muted"
                    >
                      No hay solicitudes pendientes en este momento.
                    </td>
                  </tr>
                ) : (
                  pendingUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-brand-border/50 hover:bg-brand-background/50 transition-colors"
                    >
                      <td className="py-4">
                        <p className="font-medium text-brand-text">
                          {user.nombres} {user.apellidos}
                        </p>
                        <p className="text-xs text-brand-muted">{user.email}</p>
                      </td>
                      <td className="py-4 text-sm text-brand-text">
                        {user.tipoDocumento} <br />
                        <span className="text-brand-muted">
                          {user.numeroDocumento}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => openFile(user.documentoIdentidadUrl)}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-brand-background border border-brand-border rounded-lg text-brand-text hover:border-brand-accent transition-colors"
                          >
                            <FileText size={14} /> Cédula
                          </button>
                          <button
                            onClick={() => openFile(user.sisbenUrl)}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-brand-background border border-brand-border rounded-lg text-brand-text hover:border-brand-accent transition-colors"
                          >
                            <FileText size={14} /> SISBEN
                          </button>
                        </div>
                      </td>
                      <td className="py-4 flex justify-center gap-2">
                        <button
                          onClick={() =>
                            confirmApprove(
                              user._id,
                              `${user.nombres} ${user.apellidos}`,
                            )
                          }
                          className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-colors"
                          title="Aprobar"
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button
                          onClick={() =>
                            confirmReject(
                              user._id,
                              `${user.nombres} ${user.apellidos}`,
                            )
                          }
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                          title="Rechazar"
                        >
                          <XCircle size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Personalizado */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-card border border-brand-border rounded-3xl w-full max-w-md p-8 shadow-2xl scale-in-95">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${modalConfig.type === "approve" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
            >
              {modalConfig.type === "approve" ? (
                <CheckCircle size={32} />
              ) : (
                <AlertTriangle size={32} />
              )}
            </div>

            <h3 className="text-2xl font-bold text-center text-brand-text mb-2 font-jakarta">
              {modalConfig.type === "approve"
                ? "Aprobar Solicitud"
                : "Rechazar Solicitud"}
            </h3>

            <p className="text-center text-brand-muted mb-8">
              ¿Estás seguro de que deseas{" "}
              {modalConfig.type === "approve" ? "aprobar" : "rechazar"} a{" "}
              <span className="font-semibold text-brand-text">
                {modalConfig.userName}
              </span>
              ?
              {modalConfig.type === "reject" &&
                " Esta acción eliminará su registro de forma permanente."}
            </p>

            <div className="flex gap-4">
              <button
                onClick={() =>
                  setModalConfig({
                    isOpen: false,
                    type: null,
                    userId: null,
                    userName: "",
                  })
                }
                className="flex-1 py-3 font-medium border border-brand-border text-brand-text rounded-xl hover:bg-brand-background transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={executeAction}
                className={`flex-1 py-3 font-medium text-white rounded-xl transition-all shadow-lg ${
                  modalConfig.type === "approve"
                    ? "bg-green-600 hover:bg-green-500 shadow-green-500/20"
                    : "bg-red-600 hover:bg-red-500 shadow-red-500/20"
                }`}
              >
                Sí, {modalConfig.type === "approve" ? "Aprobar" : "Rechazar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
