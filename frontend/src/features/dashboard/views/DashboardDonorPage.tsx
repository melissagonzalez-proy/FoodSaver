import axios from "axios";
import {
  Box,
  Calendar,
  CheckCircle,
  Clock,
  Image as ImageIcon,
  KeyRound,
  Leaf,
  ListOrdered,
  Lock,
  LogOut,
  Menu,
  MessageSquare,
  PackageOpen,
  Pencil,
  PlusCircle,
  Scale,
  Star,
  User,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl, assetUrl } from "../../../lib/api";
import { EditDonationModal } from "../components/EditDonationModal";
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
  CardDescription,
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
import { Textarea } from "@/components/ui/textarea";

interface BeneficiaryInfo {
  _id: string;
  nombres: string;
  apellidos: string;
  promedioCalificacion?: number;
  totalEvaluaciones?: number;
}
interface NotificationLog {
  canal: "email";
  destinatario: string;
        {donation.estado === "recolectado" &&
          donation.beneficiary &&
          donation.beneficiary._id !== userId ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto flex-col py-2 px-3 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
            onClick={() =>
              setRatingModal({
                isOpen: true,
                donationId: donation._id,
                toUserId: donation.beneficiary!._id,
                toUserName:
                  `${donation.beneficiary!.nombres} ${donation.beneficiary!.apellidos || ""}`.trim(),
                canRate: donation.canRate !== false,
              })
            }
          >
            <span className="flex items-center gap-1 text-xs mb-1">
              <Star size={14} />
              {donation.canRate !== false ? "Ver / Evaluar" : "Ver"}
            </span>
            {(() => {
              if (donation.canRate === false) {
                return (
                  <span className="text-[10px] opacity-70">
                    Calificado
                  </span>
                );
              }
              const badge = getReputation(
                donation.beneficiary!.promedioCalificacion,
                donation.beneficiary!.totalEvaluaciones,
              );
              return (
                <span className={`text-[10px] ${badge.className}`}>
                  {badge.label}
                </span>
              );
            })()}
          </Button>
        ) : null}
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
      className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md border ${isExpired ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-orange-500/10 text-orange-600 border-orange-500/20"}`}
    >
      <Clock size={12} />
      <span>{timeLeft}</span>
    </div>
  );
};

export const DashboardDonorPage = () => {
  const navigate = useNavigate();
  const [mainView, setMainView] = useState<
    "inventario" | "historial" | "perfil"
  >("inventario");
  const [activeTab, setActiveTab] = useState<
    "activo" | "asignado" | "recolectado"
  >("activo");
  const [donations, setDonations] = useState<DonationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pinInputs, setPinInputs] = useState<{ [key: string]: string }>({});
  const [editingDonation, setEditingDonation] = useState<DonationData | null>(
    null,
  );
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [ratingModal, setRatingModal] = useState({
    isOpen: false,
    donationId: "",
    toUserId: "",
    toUserName: "",
    canRate: true,
  });

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = storedUser.id || storedUser._id || "";
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    categoria: "otros",
    cantidad: "",
    unidad: "kg",
    fechaCaducidad: "",
    fechaRecogida: "",
    imagen: null as File | null,
  });
  const [imageName, setImageName] = useState("");
  const [passwordModal, setPasswordModal] = useState({
    isOpen: false,
    actual: "",
    nueva: "",
    confirmar: "",
    isSubmitting: false,
  });
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

  const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message;
      const detail = error.response?.data?.detail;
      if (message && detail) return `${message} (${detail})`;
      return message || "Hubo un error al crear la publicacion.";
    }
    return "Hubo un error al crear la publicacion.";
  };

  const getLatestNotification = (donation: DonationData) => {
    if (!donation.notificaciones || donation.notificaciones.length === 0) {
      return null;
    }
    return donation.notificaciones[donation.notificaciones.length - 1];
  };

  const formatNotificationDate = (value: string) =>
    new Date(value).toLocaleString();

  const fetchDonations = useCallback(async () => {
    try {
      const response = await axios.get(
        apiUrl(`/api/donations/donor/${userId}`),
      );
      setDonations(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchDonations();
  }, [userId, fetchDonations]);

  const scrollToComments = useCallback(() => {
    setMainView("perfil");
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
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
    if (!userId) {
      showFeedback(
        "error",
        "Sesion invalida",
        "Tu sesion no es valida. Por favor inicia sesion de nuevo.",
      );
      setIsSubmitting(false);
      return;
    }
    try {
      const data = new FormData();
      data.append("donorId", String(userId));
      data.append("titulo", formData.titulo);
      data.append("descripcion", formData.descripcion);
      data.append("categoria", formData.categoria);
      data.append("cantidad", formData.cantidad);
      data.append("unidad", formData.unidad);
      data.append("fechaCaducidad", formData.fechaCaducidad);
      data.append("fechaRecogida", formData.fechaRecogida);
      if (formData.imagen) data.append("imagen", formData.imagen);

      await axios.post(apiUrl("/api/donations"), data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData({
        titulo: "",
        descripcion: "",
        categoria: "otros",
        cantidad: "",
        unidad: "kg",
        fechaCaducidad: "",
        fechaRecogida: "",
        imagen: null,
      });
      setImageName("");
      fetchDonations();
      setActiveTab("activo");
      setMainView("inventario");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error al crear la publicacion:", error);
      showFeedback("error", "No se pudo publicar", getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (id: string) => {
    setCancelTargetId(id);
  };

  const confirmCancel = async () => {
    if (!cancelTargetId) return;
    try {
      await axios.put(apiUrl(`/api/donations/cancel/${cancelTargetId}`));
      fetchDonations();
      showFeedback(
        "success",
        "Reserva cancelada",
        "El alimento fue liberado correctamente.",
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

  const handleComplete = async (id: string) => {
    const pin = pinInputs[id];
    if (!pin || pin.length !== 4) {
      showFeedback("error", "PIN invalido", "Ingresa el PIN de 4 digitos.");
      return;
    }
    try {
      const response = await axios.put(
        apiUrl(`/api/donations/complete/${id}`),
        { pin },
      );
      showFeedback("success", "Entrega completada", response.data.message);
      fetchDonations();
    } catch (error: any) {
      showFeedback(
        "error",
        "No se pudo completar",
        error.response?.data?.message || "Error al completar la entrega.",
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
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
          userId: userId,
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

  const filteredDonations = donations.filter((d) => d.estado === activeTab);
  const today = new Date().toISOString().split("T")[0];

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

  const inputClassNames =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const NavigationLinks = () => (
    <>
      <nav className="flex-1 flex flex-col gap-2 mt-6">
        <Button
          variant={mainView === "inventario" ? "secondary" : "ghost"}
          className="w-full justify-start gap-3"
          onClick={() => {
            setMainView("inventario");
            setIsMobileMenuOpen(false);
          }}
        >
          <PackageOpen size={18} /> Inventario
        </Button>
        <Button
          variant={mainView === "historial" ? "secondary" : "ghost"}
          className="w-full justify-start gap-3"
          onClick={() => {
            setMainView("historial");
            setIsMobileMenuOpen(false);
          }}
        >
          <ListOrdered size={18} /> Historial
        </Button>
        <Button
          variant={mainView === "perfil" ? "secondary" : "ghost"}
          className="w-full justify-start gap-3"
          onClick={() => {
            setMainView("perfil");
            setIsMobileMenuOpen(false);
          }}
        >
          <User size={18} /> Mi Perfil
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={scrollToComments}
        >
          <MessageSquare size={18} /> Comentarios
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
            className="w-70 bg-brand-card p-6 flex flex-col border-r-border"
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
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-brand-accent/5 blur-3xl" />
        </div>

        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-brand-text mb-2">
            {mainView === "inventario"
              ? "Panel de Control de Inventario"
              : mainView === "historial"
                ? "Historial de Donaciones"
                : "Mi Perfil"}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {mainView === "inventario"
              ? "Publica y gestiona el estado de tus excedentes alimentarios."
              : mainView === "historial"
                ? "Supervisa todas las donaciones que has realizado y su estado actual."
                : "Consulta tu informacion personal y comentarios recibidos."}
          </p>
        </header>

        {mainView === "inventario" && (
          <div
            id="mis-publicaciones"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8"
          >
            <div className="lg:col-span-1 h-fit">
              <Card className="shadow-sm ring-1 ring-foreground/5 bg-brand-card/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <PlusCircle className="text-brand-accent" size={20} />
                    Nueva Publicación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="titulo">Título</Label>
                      <Input
                        required
                        id="titulo"
                        name="titulo"
                        value={formData.titulo}
                        onChange={handleChange}
                        placeholder="Ej: Caja de manzanas"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Textarea
                        required
                        id="descripcion"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        placeholder="Detalles sobre el alimento..."
                        rows={2}
                        className="resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categoria">Categoría</Label>
                      <select
                        id="categoria"
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleChange}
                        className={inputClassNames}
                      >
                        {FOOD_CATEGORIES.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-1/2 space-y-2">
                        <Label htmlFor="cantidad">Cantidad</Label>
                        <Input
                          required
                          id="cantidad"
                          name="cantidad"
                          value={formData.cantidad}
                          onChange={handleChange}
                          placeholder="Ej: 5"
                          type="number"
                          min="1"
                        />
                      </div>
                      <div className="w-full sm:w-1/2 space-y-2">
                        <Label htmlFor="unidad">Unidad</Label>
                        <select
                          id="unidad"
                          name="unidad"
                          value={formData.unidad}
                          onChange={handleChange}
                          className={inputClassNames}
                        >
                          <option value="kg">kg</option>
                          <option value="lb">lb</option>
                          <option value="litros">litros</option>
                          <option value="unidades">unidades</option>
                          <option value="paquetes">paquetes</option>
                          <option value="raciones">raciones</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-1/2 space-y-2">
                        <Label htmlFor="fechaCaducidad">Vencimiento</Label>
                        <Input
                          required
                          id="fechaCaducidad"
                          type="date"
                          name="fechaCaducidad"
                          value={formData.fechaCaducidad}
                          onChange={handleChange}
                          min={today}
                        />
                      </div>
                      <div className="w-1/2 space-y-2">
                        <Label
                          htmlFor="fechaRecogida"
                          className="text-brand-accent"
                        >
                          Recogida
                        </Label>
                        <Input
                          required
                          id="fechaRecogida"
                          type="date"
                          name="fechaRecogida"
                          value={formData.fechaRecogida}
                          onChange={handleChange}
                          min={today}
                          className="border-brand-accent/30 focus-visible:ring-brand-accent"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Imagen</Label>
                      <label
                        className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-md transition-colors cursor-pointer ${imageName ? "border-brand-accent bg-brand-accent/5" : "border-muted-foreground/25 hover:bg-muted/50"}`}
                      >
                        <input
                          type="file"
                          name="imagen"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <ImageIcon
                          size={24}
                          className="text-muted-foreground mb-2"
                        />
                        <span className="text-sm font-medium text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap max-w-full px-2">
                          {imageName || "Haz clic para subir una foto"}
                        </span>
                      </label>
                    </div>

                    <Button
                      disabled={isSubmitting}
                      type="submit"
                      className="w-full mt-2"
                    >
                      {isSubmitting ? "Publicando..." : "Publicar Alimento"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 flex flex-col w-full">
              <div className="w-full overflow-x-auto hide-scrollbar mb-6 pb-1">
                <div className="flex gap-2 p-1 bg-muted/30 border border-border rounded-lg w-fit min-w-max backdrop-blur">
                  <Button
                    variant={activeTab === "activo" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("activo")}
                    className={
                      activeTab === "activo"
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "text-muted-foreground"
                    }
                  >
                    <CheckCircle size={16} className="mr-2" /> Activos
                  </Button>
                  <Button
                    variant={activeTab === "asignado" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("asignado")}
                    className={
                      activeTab === "asignado"
                        ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                        : "text-muted-foreground"
                    }
                  >
                    <PackageOpen size={16} className="mr-2" /> Asignados
                  </Button>
                  <Button
                    variant={activeTab === "recolectado" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("recolectado")}
                    className={
                      activeTab === "recolectado"
                        ? "bg-slate-600 hover:bg-slate-700 text-white"
                        : "text-muted-foreground"
                    }
                  >
                    <Box size={16} className="mr-2" /> Recolectados
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="text-muted-foreground text-center py-10">
                  Cargando inventario...
                </div>
              ) : filteredDonations.length === 0 ? (
                <Card className="p-10 text-center flex flex-col items-center justify-center h-64 border-dashed bg-transparent shadow-none">
                  <PackageOpen
                    size={48}
                    className="text-muted-foreground mb-4 opacity-50"
                  />
                  <p className="text-muted-foreground">
                    No tienes alimentos en estado "{activeTab}".
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-max">
                  {filteredDonations.map((donation) => {
                    const latestNotification = getLatestNotification(donation);
                    return (
                      <Card
                        key={donation._id}
                        className={`overflow-hidden flex flex-col shadow-sm transition-all ${donation.estado === "recolectado" ? "opacity-60 grayscale" : "hover:border-brand-accent/40"}`}
                      >
                        <div className="h-40 w-full overflow-hidden bg-muted relative group">
                          {donation.imagenUrl ? (
                            <img
                              src={assetUrl(
                                donation.imagenUrl.replace(/\\/g, "/"),
                              )}
                              alt={donation.titulo}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon
                                size={32}
                                className="text-muted-foreground opacity-30"
                              />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4 flex flex-col flex-1 pb-2">
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <h3 className="font-semibold text-foreground text-lg line-clamp-1">
                              {donation.titulo}
                            </h3>
                            <CountdownTimer
                              expiresAt={donation.fechaCaducidad}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                            {donation.descripcion}
                          </p>
                          <div className="flex justify-between items-center text-xs text-muted-foreground mb-4 pt-4 border-t border-border">
                            <span className="flex items-center gap-1">
                              <Scale size={14} /> {donation.cantidad}{" "}
                              {donation.unidad || "uds"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />{" "}
                              {new Date(
                                donation.fechaCaducidad,
                              ).toLocaleDateString()}
                            </span>
                          </div>

                          {donation.beneficiary && (
                            <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                              <User
                                size={12}
                                className="text-brand-accent shrink-0"
                              />
                              <span className="text-muted-foreground">
                                {donation.beneficiary.nombres}
                              </span>
                              {(() => {
                                const badge = getReputation(
                                  donation.beneficiary.promedioCalificacion,
                                  donation.beneficiary.totalEvaluaciones,
                                );
                                return (
                                  <span
                                    className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${badge.className}`}
                                  >
                                    {badge.label}
                                  </span>
                                );
                              })()}
                            </div>
                          )}

                          {latestNotification && (
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground mb-2">
                              <span
                                className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${latestNotification.estadoEntrega === "enviado" ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}
                              >
                                {latestNotification.estadoEntrega === "enviado"
                                  ? "Email enviado"
                                  : "Email fallido"}
                              </span>
                              <span>
                                {formatNotificationDate(
                                  latestNotification.fechaHora,
                                )}
                              </span>
                            </div>
                          )}
                        </CardContent>

                        <CardFooter className="p-4 pt-0 gap-2">
                          {donation.estado === "activo" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-brand-accent border-brand-accent/30 hover:bg-brand-accent/5 hover:text-brand-accent"
                              onClick={() => setEditingDonation(donation)}
                            >
                              <Pencil size={16} className="mr-2" /> Editar
                            </Button>
                          )}

                          {donation.estado === "asignado" && (
                            <div className="flex flex-col gap-3 w-full">
                              <div className="flex flex-col gap-1">
                                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                  PIN de Seguridad
                                </Label>
                                <Input
                                  type="text"
                                  maxLength={4}
                                  placeholder="0000"
                                  value={pinInputs[donation._id] || ""}
                                  onChange={(e) =>
                                    setPinInputs({
                                      ...pinInputs,
                                      [donation._id]: e.target.value.replace(
                                        /\D/g,
                                        "",
                                      ),
                                    })
                                  }
                                  className="text-center font-bold tracking-[0.5em] text-brand-accent"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleCancel(donation._id)}
                                >
                                  <XCircle size={16} className="mr-1" />{" "}
                                  Cancelar
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                  onClick={() => handleComplete(donation._id)}
                                >
                                  <CheckCircle size={16} className="mr-1" />{" "}
                                  Validar
                                </Button>
                              </div>
                            </div>
                          )}

                          {donation.estado === "recolectado" &&
                            donation.beneficiary &&
                            donation.beneficiary._id !== userId && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-yellow-600 border-yellow-500/30 hover:bg-yellow-50 hover:text-yellow-700"
                                onClick={() =>
                                  setRatingModal({
                                    isOpen: true,
                                    donationId: donation._id,
                                    toUserId: donation.beneficiary!._id,
                                    toUserName:
                                      donation.beneficiary!.nombres ||
                                      "Usuario",
                                    canRate: true,
                                  })
                                }
                              >
                                <Star size={16} className="mr-2" /> Ver /
                                Evaluar
                              </Button>
                            )}
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {mainView === "historial" && (
          <Card className="shadow-sm ring-1 ring-foreground/5 bg-brand-card/90 backdrop-blur w-full">
            <div className="overflow-x-auto w-full p-2">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-sm">
                    <th className="p-4 font-medium">Producto</th>
                    <th className="p-4 font-medium text-center">Cantidad</th>
                    <th className="p-4 font-medium text-center">Estado</th>
                    <th className="p-4 font-medium text-center">PIN</th>
                    <th className="p-4 font-medium text-center">
                      Notificación
                        canal: "email";
                        destinatario: string;
                        estadoEntrega: "enviado" | "fallido";
                        fechaHora: string;
                      }

                      const calculateTime = (expiresAt: string) => {
                        const difference = new Date(expiresAt).getTime() - new Date().getTime();
                        if (difference <= 0) return { text: "Vencido", expired: true };

                        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                        const minutes = Math.floor((difference / 1000 / 60) % 60);

                        if (days > 0) return { text: `${days}d ${hours}h restantes`, expired: false };
                        return { text: `${hours}h ${minutes}m restantes`, expired: false };
                      };

                      const ExpiryBadge = ({ expiresAt }: { expiresAt: string }) => {
                        const [timeLeft, setTimeLeft] = useState(() => calculateTime(expiresAt).text);
                        const [isExpired, setIsExpired] = useState(() => calculateTime(expiresAt).expired);

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
                            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md border ${isExpired ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-orange-500/10 text-orange-600 border-orange-500/20"}`}
                          >
                            <Clock size={12} />
                            <span>{timeLeft}</span>
                          </div>
                        );
                                  : "Email fallido"}
                              </span>
                              <span className="text-muted-foreground">
                                {formatNotificationDate(
                                  latestNotification.fechaHora,
                                )}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {d.estado === "recolectado" && d.beneficiary ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto flex-col py-2 px-3 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                              onClick={() =>
                                setRatingModal({
                                  isOpen: true,
                                  donationId: d._id,
                                  toUserId: d.beneficiary!._id,
                                  toUserName:
                                    `${d.beneficiary!.nombres} ${d.beneficiary!.apellidos || ""}`.trim(),
                                  canRate: d.canRate !== false,
                                })
                              }
                            >
                              <span className="flex items-center gap-1 text-xs mb-1">
                                <Star size={14} />
                                {d.canRate !== false ? "Ver / Evaluar" : "Ver"}
                              </span>
                              {(() => {
                                if (d.canRate === false) {
                                  return (
                                    <span className="text-[10px] opacity-70">
                                      Calificado
                                    </span>
                                  );
                                }
                                const badge = getReputation(
                                  d.beneficiary!.promedioCalificacion,
                                  d.beneficiary!.totalEvaluaciones,
                                );
                                return (
                                  <span
                                    className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${badge.className}`}
                                  >
                                    {badge.label}
                                  </span>
                                );
                              })()}
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {mainView === "perfil" && (
          <div className="flex flex-col gap-6 md:gap-8">
            <ProfileOverview onEdit={() => setIsEditProfileOpen(true)} />
            <div id="comentarios">
              <UserCommentsPanel userId={userId} title="Mis Comentarios" />
            </div>
          </div>
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
              <CardDescription>
                Ingresa tu contraseña actual y la nueva
              </CardDescription>
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
                    className="absolute left-3 top-8.5 -translate-y-1/2 text-muted-foreground"
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
                    className="absolute left-3 top-8.5 -translate-y-1/2 text-muted-foreground"
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

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-sm shadow-xl text-center">
            <CardHeader>
              <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <CardTitle className="text-2xl font-jakarta">
                ¡Publicado!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                El alimento está activo y visible para los beneficiarios.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => setShowSuccessModal(false)}
                className="w-full"
              >
                Continuar
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      <EditDonationModal
        isOpen={!!editingDonation}
        onClose={() => setEditingDonation(null)}
        donation={editingDonation}
        onSuccess={fetchDonations}
      />

      <EditProfile
        open={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />

      <UserProfileModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal((prev) => ({ ...prev, isOpen: false }))}
        donationId={ratingModal.donationId}
        toUserId={ratingModal.toUserId}
        toUserName={ratingModal.toUserName}
        canRate={ratingModal.canRate}
        onSuccess={fetchDonations}
      />

      <ConfirmDialog
        open={!!cancelTargetId}
        onOpenChange={(open) => {
          if (!open) setCancelTargetId(null);
        }}
        title="Cancelar reserva"
        description="¿Seguro que deseas cancelar esta reserva y liberar el producto?"
        confirmLabel="Sí, cancelar"
        confirmClassName="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        onConfirm={confirmCancel}
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
