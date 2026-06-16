import axios from "axios";
import {
  AlertCircle,
  Box,
  Calendar,
  CheckCircle,
  Clock,
  KeyRound,
  Leaf,
  ListOrdered,
  Lock,
  LogOut,
  MapPin,
  Menu,
  Scale,
  Search,
  ShoppingBag,
  Star,
  Store,
  User,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl, assetUrl } from "../../../lib/api";
import { EditProfile } from "../components/EditProfile";
import { ProfileOverview } from "../components/ProfileOverview";
import { UserCommentsPanel } from "../components/UserCommentsPanel";
import { UserProfileModal } from "../components/UserProfileModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FeedbackDialog } from "@/components/ui/feedback-dialog";

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface DonorInfo {
  _id: string;
  nombres: string;
  apellidos: string;
  departamento: string;
  ciudad: string;
  direccion: string;
  celular: string;
  nombreEmpresa?: string;
  promedioCalificacion?: number;
  totalEvaluaciones?: number;
  reputationStatus?: "green" | "yellow" | "red";
}
interface DonationData {
  _id: string;
  titulo: string;
  descripcion: string;
  cantidad: number;
  unidad?: string;
  fechaCaducidad: string;
  estado: string;
  imagenUrl: string;
  donor: DonorInfo;
  pickupPin?: string;
  canRate?: boolean;
}

export const DashboardBeneficiaryPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"galeria" | "reservas" | "perfil">(
    "galeria",
  );
  const [availableDonations, setAvailableDonations] = useState<DonationData[]>(
    [],
  );
  const [myReservations, setMyReservations] = useState<DonationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser.id || currentUser._id || "";
  const token = localStorage.getItem("token");

  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    message: string;
    pin?: string;
  }>({ isOpen: false, type: "success", message: "" });
  const [requestModal, setRequestModal] = useState<{
    isOpen: boolean;
    donation: DonationData | null;
    cantidadSolicitada: number;
  }>({ isOpen: false, donation: null, cantidadSolicitada: 1 });
  const [passwordModal, setPasswordModal] = useState({
    isOpen: false,
    actual: "",
    nueva: "",
    confirmar: "",
    isSubmitting: false,
  });
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [feedback, setFeedback] = useState({
    open: false,
    title: "",
    message: "",
    tone: "info" as "info" | "success" | "error",
  });
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  const showFeedback = (
    tone: "info" | "success" | "error",
    title: string,
    message = "",
  ) => {
    setFeedback({ open: true, title, message, tone });
  };

  // ESTADO DEL MODAL DE CALIFICACIÓN
  const [profileModal, setProfileModal] = useState({
    isOpen: false,
    donationId: "",
    toUserId: "",
    toUserName: "",
    canRate: false,
  });

  const fetchAvailableDonations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(apiUrl("/api/donations/available"));
      setAvailableDonations(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyReservations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        apiUrl(`/api/donations/beneficiary/${currentUserId}`),
      );
      setMyReservations(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (activeTab === "galeria") {
      fetchAvailableDonations();
    } else if (activeTab === "reservas") {
      fetchMyReservations();
    }
  }, [activeTab, fetchAvailableDonations, fetchMyReservations]);

  const scrollToComments = useCallback(() => {
    setActiveTab("perfil");
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      document.getElementById("comentarios")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }, []);

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === "#comentarios") {
        scrollToComments();
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [scrollToComments]);

  const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      return (
        error.response?.data?.message ||
        "Hubo un error al procesar tu solicitud."
      );
    }
    return "Hubo un error al procesar tu solicitud.";
  };

  const openRequestModal = (donation: DonationData) => {
    setRequestModal({ isOpen: true, donation, cantidadSolicitada: 1 });
  };

  const confirmRequest = async () => {
    if (!requestModal.donation) return;
    try {
      const response = await axios.put(
        apiUrl(`/api/donations/request/${requestModal.donation._id}`),
        {
          beneficiaryId: currentUserId,
          cantidadSolicitada: requestModal.cantidadSolicitada,
        },
      );
      const pinSecreto = response.data.donation.pickupPin;
      setFeedbackModal({
        isOpen: true,
        type: "success",
        message: response.data.message || "¡Reserva exitosa!",
        pin: pinSecreto,
      });
      setRequestModal({ isOpen: false, donation: null, cantidadSolicitada: 1 });
      fetchAvailableDonations();
    } catch (error) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        message: getErrorMessage(error),
      });
      setRequestModal({ isOpen: false, donation: null, cantidadSolicitada: 1 });
    }
  };

  const handleCancelReservation = (id: string) => {
    setCancelTargetId(id);
  };

  const confirmCancelReservation = async () => {
    if (!cancelTargetId) return;
    try {
      await axios.put(apiUrl(`/api/donations/cancel/${cancelTargetId}`));
      fetchMyReservations();
      showFeedback(
        "success",
        "Reserva cancelada",
        "El alimento vuelve a estar disponible.",
      );
    } catch {
      showFeedback(
        "error",
        "No se pudo cancelar",
        "Intenta nuevamente en unos momentos.",
      );
    } finally {
      setCancelTargetId(null);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordModal.nueva !== passwordModal.confirmar) {
      showFeedback(
        "error",
        "Contraseñas no coinciden",
        "Las contraseñas nuevas no coinciden.",
      );
      return;
    }
    if (passwordModal.nueva.length < 6) {
      showFeedback(
        "error",
        "Contraseña muy corta",
        "La nueva contraseña debe tener al menos 6 caracteres.",
      );
      return;
    }

    setPasswordModal((prev) => ({ ...prev, isSubmitting: true }));
    try {
      const response = await axios.put(
        apiUrl("/api/auth/change-password"),
        {
          userId: currentUserId,
          passwordActual: passwordModal.actual,
          passwordNueva: passwordModal.nueva,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      showFeedback("success", "Contraseña actualizada", response.data.message);
      setPasswordModal({
        isOpen: false,
        actual: "",
        nueva: "",
        confirmar: "",
        isSubmitting: false,
      });
    } catch (error: any) {
      showFeedback(
        "error",
        "No se pudo actualizar",
        error.response?.data?.message || "Error al cambiar la contraseña.",
      );
      setPasswordModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const filteredDonations = availableDonations.filter(
    (d) =>
      d.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.donor.ciudad.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getReputation = (avg?: number, total?: number) => {
    if (!total || total === 0)
      return {
        label: "Sin calificación",
        className: "bg-muted text-muted-foreground border-border",
      };
    if (avg! >= 4)
      return {
        label: "⭐ Excelente",
        className: "bg-green-500/10 text-green-600 border-green-500/30",
      };
    if (avg! >= 3)
      return {
        label: "👍 Regular",
        className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
      };
    return {
      label: "⚠️ Bajo",
      className: "bg-destructive/10 text-destructive border-destructive/30",
    };
  };

  const NavigationLinks = () => (
    <>
      <nav className="flex-1 flex flex-col gap-2 mt-6">
        <Button
          variant={activeTab === "galeria" ? "secondary" : "ghost"}
          className="w-full justify-start gap-3"
          onClick={() => {
            setActiveTab("galeria");
            setIsMobileMenuOpen(false);
          }}
        >
          <ShoppingBag size={18} /> Galería
        </Button>
        <Button
          variant={activeTab === "reservas" ? "secondary" : "ghost"}
          className="w-full justify-start gap-3"
          onClick={() => {
            setActiveTab("reservas");
            setIsMobileMenuOpen(false);
          }}
        >
          <ListOrdered size={18} /> Mis Reservas
        </Button>
        <Button
          variant={activeTab === "perfil" ? "secondary" : "ghost"}
          className="w-full justify-start gap-3"
          onClick={() => {
            setActiveTab("perfil");
            setIsMobileMenuOpen(false);
          }}
        >
          <User size={18} /> Mi Perfil
        </Button>
      </nav>

      <div className="mt-auto flex flex-col gap-2 pt-4">
        <Separator className="mb-2" />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={() => {
            setPasswordModal({ ...passwordModal, isOpen: true });
            setIsMobileMenuOpen(false);
          }}
        >
          <KeyRound size={18} /> Cambiar Contraseña
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut size={18} /> Cerrar Sesión
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen overflow-hidden bg-brand-background font-sans flex flex-col md:flex-row relative">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-brand-card/90 border-b border-border z-20 backdrop-blur">
        <div className="flex items-center gap-2 text-brand-accent">
          <Leaf size={24} />
          <span className="text-xl font-semibold tracking-tight text-brand-text font-jakarta">
            FoodSaver
          </span>
        </div>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger>
            <Button variant="ghost" size="icon">
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[280px] bg-brand-card p-6 flex flex-col border-r-border"
          >
            <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
            <div className="flex items-center gap-2 text-brand-accent">
              <Leaf size={28} />
              <span className="text-2xl font-semibold tracking-tight text-brand-text font-jakarta">
                FoodSaver
              </span>
            </div>
            <NavigationLinks />
          </SheetContent>
        </Sheet>
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 bg-brand-card/90 border-r border-border p-6 flex-col z-10 shrink-0 backdrop-blur">
        <div className="flex items-center gap-2 text-brand-accent">
          <Leaf size={28} />
          <span className="text-2xl font-semibold tracking-tight text-brand-text font-jakarta">
            FoodSaver
          </span>
        </div>
        <NavigationLinks />
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto z-10 w-full relative">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-brand-accent/5 blur-3xl" />
        </div>

        <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-brand-text mb-2">
              {activeTab === "galeria"
                ? "Alimentos Disponibles"
                : activeTab === "reservas"
                  ? "Mis Reservas"
                  : "Mi Perfil"}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {activeTab === "galeria"
                ? "Explora los excedentes disponibles para recolección inmediata."
                : activeTab === "reservas"
                  ? "Gestiona los alimentos que has reservado y revisa tus códigos PIN."
                  : "Consulta tu informacion personal y comentarios recibidos."}
            </p>
          </div>
          {activeTab === "galeria" && (
            <div className="relative w-full md:w-72">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <Input
                type="text"
                placeholder="Buscar alimento o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full bg-brand-card/50 backdrop-blur"
              />
            </div>
          )}
        </header>

        {activeTab === "perfil" ? (
          <div className="flex flex-col gap-6 md:gap-8">
            <ProfileOverview onEdit={() => setIsEditProfileOpen(true)} />
            <div id="comentarios">
              <UserCommentsPanel
                userId={currentUserId}
                title="Mis Comentarios"
              />
            </div>
          </div>
        ) : isLoading ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        ) : activeTab === "galeria" ? (
          filteredDonations.length === 0 ? (
            <Card className="p-10 text-center flex flex-col items-center justify-center h-64 border-dashed bg-transparent shadow-none">
              <ShoppingBag
                size={48}
                className="text-muted-foreground mb-4 opacity-50"
              />
              <p className="text-muted-foreground">
                No hay alimentos activos en este momento.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDonations.map((donation) => (
                <Card
                  key={donation._id}
                  className="overflow-hidden hover:border-brand-accent/40 transition-all duration-300 flex flex-col group shadow-sm bg-brand-card/90 backdrop-blur"
                >
                  <div className="h-44 w-full overflow-hidden bg-muted relative">
                    {donation.imagenUrl ? (
                      <img
                        src={assetUrl(donation.imagenUrl.replace(/\\/g, "/"))}
                        alt={donation.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag
                          size={32}
                          className="text-muted-foreground opacity-30"
                        />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-background/90 backdrop-blur px-3 py-1 rounded-full border border-border text-xs font-medium text-foreground flex items-center gap-1 shadow-sm">
                      <Scale size={12} className="text-brand-accent" />{" "}
                      {donation.cantidad} {donation.unidad || "uds"}
                    </div>
                    {(() => {
                      const badge = getReputation(
                        donation.donor.promedioCalificacion,
                        donation.donor.totalEvaluaciones,
                      );
                      return (
                        <div
                          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full border text-xs font-semibold backdrop-blur shadow-sm ${badge.className}`}
                        >
                          {badge.label}
                        </div>
                      );
                    })()}
                  </div>
                  <CardContent className="p-5 flex flex-col flex-1 pb-4">
                    <h3 className="font-semibold text-foreground text-lg mb-2 line-clamp-1">
                      {donation.titulo}
                    </h3>
                    <div className="bg-muted/50 rounded-xl p-3 mb-4 border border-border text-xs">
                      <div className="flex items-start gap-2 text-foreground mb-1.5">
                        <Store
                          size={14}
                          className="text-brand-accent mt-0.5 shrink-0"
                        />
                        <span className="font-medium">
                          {donation.donor.nombreEmpresa ||
                            `${donation.donor.nombres}`}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin size={14} className="mt-0.5 shrink-0" />
                        <span>
                          {donation.donor.direccion}, {donation.donor.ciudad}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground mt-2">
                          {donation.donor._id !== currentUserId && (
                          <button
                          type="button"
                          onClick={() =>
                            setProfileModal({
                              isOpen: true,
                              donationId: donation._id,
                              toUserId: donation.donor._id,
                              toUserName:
                                donation.donor.nombreEmpresa ||
                                donation.donor.nombres,
                              canRate: false,
                            })
                          }
                          className="flex items-center gap-1 mt-1 transition-colors hover:opacity-80"
                        >
                          {(() => {
                            const badge = getReputation(
                              donation.donor.promedioCalificacion,
                              donation.donor.totalEvaluaciones,
                            );
                            const totalEvaluations =
                              donation.donor.totalEvaluaciones || 0;
                            const avgScore =
                              donation.donor.promedioCalificacion ?? 0;
                            const starClass =
                              badge?.className
                                .split(" ")
                                .find((c) => c.startsWith("text-")) ||
                              "text-muted-foreground";
                            const textClass =
                              totalEvaluations > 0
                                ? avgScore >= 4
                                  ? "text-green-600"
                                  : avgScore >= 3
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                : "text-muted-foreground";

                            return (
                              <>
                                <Star size={12} className={starClass} />
                                <span className={`text-xs ${textClass}`}>
                                  {totalEvaluations > 0
                                    ? `${avgScore.toFixed(1)} • ${totalEvaluations} eval.`
                                    : "Sin calificación"}
                                </span>
                              </>
                            );
                          })()}
                          </button>
                          )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-destructive mb-4">
                      <Calendar size={14} />
                      <span>
                        Expira:{" "}
                        {new Date(donation.fechaCaducidad).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-5 pt-0 mt-auto">
                    <Button
                      className="w-full"
                      onClick={() => openRequestModal(donation)}
                    >
                      Solicitar Recolección
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )
        ) : (
          <Card className="shadow-sm ring-1 ring-foreground/5 bg-brand-card/90 backdrop-blur w-full">
            <div className="overflow-x-auto w-full p-2">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-sm">
                    <th className="p-4 font-medium min-w-40">Alimento</th>
                    <th className="p-4 font-medium min-w-50">
                      Donante & Ubicación
                    </th>
                    <th className="p-4 font-medium text-center min-w-32">
                      Estado
                    </th>
                    <th className="p-4 font-medium text-center min-w-32">
                      PIN Secreto
                    </th>
                    <th className="p-4 font-medium text-center min-w-32">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {myReservations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No has reservado ningún alimento aún.
                      </td>
                    </tr>
                  ) : (
                    myReservations.map((reservation) => (
                      <tr
                        key={reservation._id}
                        className="border-b border-border/50 hover:bg-muted/50 transition-colors last:border-0"
                      >
                        <td className="p-4">
                          <p className="font-semibold text-foreground">
                            {reservation.titulo}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Scale size={12} /> {reservation.cantidad}{" "}
                            {reservation.unidad || "uds"}
                          </p>
                        </td>
                        <td className="p-4 text-sm">
                          <p className="font-medium text-foreground flex items-center gap-1">
                            <Store size={14} className="text-brand-accent" />{" "}
                            {reservation.donor.nombreEmpresa ||
                              reservation.donor.nombres}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin size={12} /> {reservation.donor.direccion},{" "}
                            {reservation.donor.ciudad}
                          </p>
                          <p className="flex items-center gap-1 mt-1">
                            {(() => {
                              const badge = getReputation(
                                reservation.donor.promedioCalificacion,
                                reservation.donor.totalEvaluaciones,
                              );
                              const starClass =
                                badge.className
                                  .split(" ")
                                  .find((c) => c.startsWith("text-")) ||
                                "text-muted-foreground";
                              const textClass = starClass;
                              return (
                                <span
                                  className={`text-xs flex items-center gap-1 ${textClass}`}
                                >
                                  <Star size={12} className={starClass} />
                                  {reservation.donor.totalEvaluaciones &&
                                  reservation.donor.totalEvaluaciones > 0
                                    ? `${reservation.donor.promedioCalificacion?.toFixed(1)} • ${reservation.donor.totalEvaluaciones} eval.`
                                    : "Sin calificación"}
                                  <span
                                    className={`ml-1 px-1.5 py-0.5 rounded-full border text-[10px] font-semibold ${badge.className}`}
                                  >
                                    {badge.label}
                                  </span>
                                </span>
                              );
                            })()}
                          </p>
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${reservation.estado === "asignado" ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20" : "bg-slate-500/10 text-slate-600 border border-slate-500/20"}`}
                          >
                            {reservation.estado === "asignado" ? (
                              <Clock size={12} />
                            ) : (
                              <Box size={12} />
                            )}
                            {reservation.estado === "asignado"
                              ? "Pendiente"
                              : "Recolectado"}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {reservation.estado === "asignado" ? (
                            <span className="inline-flex items-center gap-2 bg-background border border-brand-accent/30 px-3 py-1.5 rounded-lg text-brand-accent font-mono font-bold tracking-widest shadow-sm">
                              <KeyRound size={14} /> {reservation.pickupPin}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              —
                            </span>
                          )}
                        </td>

                        <td className="p-4 flex justify-center h-full items-center">
                          {reservation.estado === "asignado" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleCancelReservation(reservation._id)
                              }
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <XCircle size={16} className="mr-2" /> Cancelar
                            </Button>
                          ) : (
                            reservation.donor?._id !== currentUserId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setProfileModal({
                                  isOpen: true,
                                  donationId: reservation._id,
                                  toUserId: reservation.donor?._id,
                                  toUserName:
                                    reservation.donor?.nombreEmpresa ||
                                    reservation.donor?.nombres ||
                                    "Usuario",
                                  canRate: reservation.canRate !== false,
                                })
                              }
                              className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                            >
                              <Star size={16} className="mr-2" />
                              {reservation.canRate !== false
                                ? "Ver / Calificar"
                                : "Ver"}
                            </Button>
                            )}
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>

      {/* MODALES */}

      {passwordModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-xl ring-1 ring-foreground/5">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-brand-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-accent/20">
                <KeyRound size={32} className="text-brand-accent" />
              </div>
              <CardTitle className="text-2xl font-semibold">
                Cambiar Clave
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={handlePasswordChange}
                className="flex flex-col gap-4"
              >
                <div className="space-y-2 relative">
                  <Lock
                    className="absolute left-3 top-[34px] -translate-y-1/2 text-muted-foreground"
                    size={18}
                  />
                  <Label htmlFor="actual" className="sr-only">
                    Contraseña Actual
                  </Label>
                  <Input
                    id="actual"
                    required
                    type="password"
                    placeholder="Contraseña Actual"
                    value={passwordModal.actual}
                    onChange={(e) =>
                      setPasswordModal({
                        ...passwordModal,
                        actual: e.target.value,
                      })
                    }
                    className="pl-10"
                  />
                </div>
                <div className="space-y-2 relative">
                  <Lock
                    className="absolute left-3 top-[34px] -translate-y-1/2 text-muted-foreground"
                    size={18}
                  />
                  <Label htmlFor="nueva" className="sr-only">
                    Nueva Contraseña
                  </Label>
                  <Input
                    id="nueva"
                    required
                    type="password"
                    placeholder="Nueva Contraseña"
                    value={passwordModal.nueva}
                    onChange={(e) =>
                      setPasswordModal({
                        ...passwordModal,
                        nueva: e.target.value,
                      })
                    }
                    className="pl-10"
                  />
                </div>
                <div className="space-y-2 relative">
                  <Lock
                    className="absolute left-3 top-[34px] -translate-y-1/2 text-muted-foreground"
                    size={18}
                  />
                  <Label htmlFor="confirmar" className="sr-only">
                    Confirmar Nueva
                  </Label>
                  <Input
                    id="confirmar"
                    required
                    type="password"
                    placeholder="Confirmar Nueva"
                    value={passwordModal.confirmar}
                    onChange={(e) =>
                      setPasswordModal({
                        ...passwordModal,
                        confirmar: e.target.value,
                      })
                    }
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      setPasswordModal({
                        isOpen: false,
                        actual: "",
                        nueva: "",
                        confirmar: "",
                        isSubmitting: false,
                      })
                    }
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={passwordModal.isSubmitting}
                  >
                    {passwordModal.isSubmitting ? "..." : "Guardar"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {requestModal.isOpen && requestModal.donation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-sm shadow-xl text-center">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                ¿Cuánto necesitas?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Disponible:{" "}
                <span className="font-bold text-brand-accent">
                  {requestModal.donation.cantidad}{" "}
                  {requestModal.donation.unidad || "uds"}
                </span>{" "}
                de {requestModal.donation.titulo}
              </p>
              <div className="flex items-center justify-center gap-4 mb-2">
                <Input
                  type="number"
                  min="1"
                  max={requestModal.donation.cantidad}
                  value={requestModal.cantidadSolicitada}
                  onChange={(e) =>
                    setRequestModal({
                      ...requestModal,
                      cantidadSolicitada: Number(e.target.value),
                    })
                  }
                  className="w-24 text-center text-xl font-bold"
                />
                <span className="text-muted-foreground font-medium">
                  {requestModal.donation.unidad || "uds"}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() =>
                  setRequestModal({
                    isOpen: false,
                    donation: null,
                    cantidadSolicitada: 1,
                  })
                }
              >
                Cancelar
              </Button>
              <Button className="flex-1" onClick={confirmRequest}>
                Confirmar
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {feedbackModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-sm shadow-xl text-center">
            <CardHeader>
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${feedbackModal.type === "success" ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"}`}
              >
                {feedbackModal.type === "success" ? (
                  <CheckCircle size={32} />
                ) : (
                  <AlertCircle size={32} />
                )}
              </div>
              <CardTitle className="text-2xl font-bold">
                {feedbackModal.type === "success"
                  ? "¡Reserva Exitosa!"
                  : "Atención"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {feedbackModal.message}
              </p>
              {feedbackModal.type === "success" && feedbackModal.pin && (
                <div className="bg-muted border border-border rounded-2xl p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-semibold">
                    Tu PIN de entrega
                  </p>
                  <div className="flex items-center justify-center gap-2 text-3xl font-bold text-brand-accent tracking-[0.3em]">
                    <KeyRound size={28} /> {feedbackModal.pin}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => {
                  setFeedbackModal({
                    ...feedbackModal,
                    isOpen: false,
                    pin: undefined,
                  });
                  if (feedbackModal.type === "success")
                    setActiveTab("reservas");
                }}
              >
                Entendido
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* MODAL DE CALIFICACIÓN */}
      <UserProfileModal
        isOpen={profileModal.isOpen}
        onClose={() => setProfileModal((prev) => ({ ...prev, isOpen: false }))}
        donationId={profileModal.donationId}
        toUserId={profileModal.toUserId}
        toUserName={profileModal.toUserName}
        canRate={profileModal.canRate}
        onSuccess={fetchMyReservations}
      />

      <EditProfile
        open={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />

      <ConfirmDialog
        open={!!cancelTargetId}
        onOpenChange={(open) => {
          if (!open) setCancelTargetId(null);
        }}
        title="Cancelar reserva"
        description="¿Estás seguro de que deseas cancelar esta reserva? El alimento volverá a estar disponible y el PIN se anulará."
        confirmLabel="Sí, cancelar"
        confirmClassName="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        onConfirm={confirmCancelReservation}
      />

      <FeedbackDialog
        open={feedback.open}
        onOpenChange={(open) => setFeedback((prev) => ({ ...prev, open }))}
        title={feedback.title}
        message={feedback.message}
        tone={feedback.tone}
      />
    </div>
  );
};
