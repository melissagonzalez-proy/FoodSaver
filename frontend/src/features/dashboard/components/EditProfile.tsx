import { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../../../lib/api"; 
import { CheckCircle, AlertCircle, Save, X } from "lucide-react";

interface EditProfileProps {
  open: boolean;
  onClose: () => void;
}

export const EditProfile = ({ open, onClose }: EditProfileProps) => {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser.id || currentUser._id || "";
  const token = localStorage.getItem("token");

  const buildFormData = (user: any) => ({
    nombres: user.nombres || "",
    apellidos: user.apellidos || "",
    celular: user.celular || "",
    departamento: user.departamento || "",
    ciudad: user.ciudad || "",
    tipoVia: "Calle",
    numeroPrincipal: "",
    numeroSecundario: "",
  });

  const [formData, setFormData] = useState(() => buildFormData(currentUser));

  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setFormData(buildFormData(storedUser));
    setError("");
    setShowConfirmModal(false);
    setShowSuccessModal(false);
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); 
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.tipoVia || !formData.numeroPrincipal || !formData.numeroSecundario) {
      setError("Los campos de dirección (Tipo de vía, Número principal y secundario) son obligatorios.");
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.celular)) {
      setError("El número de celular debe contener exactamente 10 dígitos numéricos.");
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmUpdate = async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);

    const direccionCompleta = `${formData.tipoVia} ${formData.numeroPrincipal} # ${formData.numeroSecundario}`;

    try {
      const response = await axios.put(
        apiUrl(`/api/auth/profile/${currentUserId}`),
        {
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          departamento: formData.departamento,
          ciudad: formData.ciudad,
          celular: formData.celular,
          direccion: direccionCompleta,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      localStorage.setItem("user", JSON.stringify({ ...currentUser, ...response.data.user }));
      
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al actualizar el perfil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-brand-card border border-brand-border rounded-3xl w-full max-w-2xl p-6 shadow-2xl animate-in fade-in relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-background transition-colors flex items-center justify-center"
        >
          <X size={18} />
        </button>

        <h2 className="text-2xl font-bold text-brand-text font-jakarta mb-6">
          Actualizar Perfil
        </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-500">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handlePreSubmit} className="flex flex-col gap-6">
        {/* NOMBRES Y APELLIDOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-brand-muted">Nombres</label>
            <input name="nombres" value={formData.nombres} onChange={handleChange} required className="bg-brand-background border border-brand-border rounded-xl px-4 py-2.5 text-brand-text outline-none focus:border-brand-accent" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-brand-muted">Apellidos</label>
            <input name="apellidos" value={formData.apellidos} onChange={handleChange} required className="bg-brand-background border border-brand-border rounded-xl px-4 py-2.5 text-brand-text outline-none focus:border-brand-accent" />
          </div>
        </div>

        {/* CELULAR, DEPARTAMENTO Y CIUDAD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-brand-muted">Celular (10 dígitos)</label>
            <input name="celular" maxLength={10} value={formData.celular} onChange={(e) => setFormData({...formData, celular: e.target.value.replace(/\D/g, "")})} required placeholder="Ej: 3001234567" className="bg-brand-background border border-brand-border rounded-xl px-4 py-2.5 text-brand-text outline-none focus:border-brand-accent" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-brand-muted">Departamento</label>
            <select name="departamento" value={formData.departamento} onChange={handleChange} required className="bg-brand-background border border-brand-border rounded-xl px-4 py-2.5 text-brand-text outline-none focus:border-brand-accent">
              <option value="Antioquia">Antioquia</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-brand-muted">Ciudad</label>
            <select name="ciudad" value={formData.ciudad} onChange={handleChange} required className="bg-brand-background border border-brand-border rounded-xl px-4 py-2.5 text-brand-text outline-none focus:border-brand-accent">
              <option value="">Seleccionar</option>
              <option value="Medellín">Medellín</option>
              <option value="Apartadó">Apartadó</option>
              <option value="Giraldo">Giraldo</option>
              <option value="Yarumal">Yarumal</option>
            </select>
          </div>
        </div>

        {/* DIRECCIÓN DIVIDIDA */}
        <div className="p-4 border border-brand-border rounded-2xl bg-brand-background/50">
          <h3 className="text-sm font-semibold text-brand-text mb-4">Logística y Dirección</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-brand-muted">Tipo de vía</label>
              <select name="tipoVia" value={formData.tipoVia} onChange={handleChange} required className="bg-brand-background border border-brand-border rounded-xl px-4 py-2.5 text-brand-text outline-none focus:border-brand-accent">
                <option value="Calle">Calle</option>
                <option value="Carrera">Carrera</option>
                <option value="Avenida">Avenida</option>
                <option value="Transversal">Transversal</option>
                <option value="Circular">Circular</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-brand-muted">Número principal</label>
              <input name="numeroPrincipal" value={formData.numeroPrincipal} onChange={handleChange} required placeholder="Ej: 45A" className="bg-brand-background border border-brand-border rounded-xl px-4 py-2.5 text-brand-text outline-none focus:border-brand-accent" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-brand-muted">Número secundario</label>
              <input name="numeroSecundario" value={formData.numeroSecundario} onChange={handleChange} required placeholder="Ej: 12-34" className="bg-brand-background border border-brand-border rounded-xl px-4 py-2.5 text-brand-text outline-none focus:border-brand-accent" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-brand-accent text-white rounded-xl font-medium flex justify-center items-center gap-2 hover:bg-brand-accent-light transition-all disabled:opacity-50">
          <Save size={20} />
          {isSubmitting ? "Procesando..." : "Guardar Cambios"}
        </button>
      </form>

      </div>

      {/* MODAL DE CONFIRMACIÓN ANTES DE GUARDAR */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-brand-card border border-brand-border rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-brand-text mb-2">
              Confirmar cambios
            </h3>
            <p className="text-brand-muted mb-6 text-sm">
              ¿Estás seguro de que deseas actualizar tu información de perfil y logística?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 font-medium border border-brand-border text-brand-text rounded-xl hover:bg-brand-background transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmUpdate}
                className="flex-1 py-3 font-medium bg-brand-accent text-white rounded-xl hover:bg-brand-accent-light transition-all"
              >
                Sí, actualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ÉXITO VISUAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-brand-card border border-brand-border rounded-3xl w-full max-w-sm p-8 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-brand-text mb-2 font-jakarta">
              ¡Actualizado!
            </h3>
            <p className="text-brand-muted mb-8 text-sm">
              Tus datos han sido modificados correctamente en el sistema.
            </p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                onClose();
              }}
              className="w-full py-3 bg-brand-accent text-white rounded-xl font-medium"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};