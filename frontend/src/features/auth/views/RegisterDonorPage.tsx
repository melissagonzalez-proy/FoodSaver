/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  Leaf,
  UploadCloud,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// 1. AGREGAMOS EL TERCER PASO
type Step = "FORM" | "OTP" | "DOCUMENTS";

export const RegisterDonorPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("FORM");
  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Guardaremos el ID del usuario recién creado para atarle los documentos
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);

  // Estado para los documentos
  const [documents, setDocuments] = useState({
    rut: null as File | null,
    camaraComercio: null as File | null,
  });

  const [formData, setFormData] = useState({
    nombreEmpresa: "",
    nit: "",
    nombreEncargado: "",
    departamento: "",
    ciudad: "",
    direccion: "",
    email: "",
    celular: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
  ) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments({ ...documents, [field]: e.target.files[0] });
    }
  };

  // =========================
  // STEP 1 — PRE REGISTER
  // =========================
  const handlePreRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/donor/pre-register",
        formData,
      );

      if (res.data.nitValid === true && res.data.otpSent === true) {
        setStep("OTP");
      } else {
        setError("No fue posible enviar el código de verificación.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al validar datos.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // STEP 2 — VERIFY OTP
  // =========================
  const handleVerifyOtp = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/donor/verify",
        {
          otp,
          donorData: formData,
        },
      );

      // Asumimos que el backend devuelve el ID del usuario creado (ej. res.data.user._id o res.data.userId)
      if (res.data.user?._id) {
        setCreatedUserId(res.data.user._id);
      } else if (res.data.userId) {
        setCreatedUserId(res.data.userId);
      }

      setSuccess("Celular verificado. Por favor, sube tus documentos.");

      // EN VEZ DE IR AL LOGIN, PASAMOS AL PASO DE DOCUMENTOS
      setTimeout(() => {
        setSuccess("");
        setStep("DOCUMENTS");
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Código inválido o expirado");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // STEP 3 — UPLOAD DOCUMENTS
  // =========================
  const handleUploadDocuments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documents.rut || !documents.camaraComercio) {
      setError("Por favor sube ambos documentos requeridos.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = new FormData();
      // Le enviamos el ID al backend para que sepa de quién son estos archivos
      if (createdUserId) data.append("userId", createdUserId);
      data.append("rut", documents.rut);
      data.append("camaraComercio", documents.camaraComercio);

      // Endpoint imaginario (debes ajustarlo a la ruta real de tu backend)
      await axios.post(
        "http://localhost:5000/api/auth/donor/upload-docs",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      setSuccess("¡Registro completado! Redirigiendo al inicio de sesión...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al subir documentos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-background flex flex-col items-center justify-center p-6 font-sans">
      <Link
        to="/"
        className="flex items-center gap-2 text-brand-accent mb-8 hover:opacity-80 transition-opacity"
      >
        <Leaf size={32} />
        <span className="text-3xl font-bold tracking-tight text-brand-text font-jakarta">
          FoodSaver
        </span>
      </Link>

      <div className="w-full max-w-2xl bg-brand-card border border-brand-border rounded-4xl p-10 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold text-brand-text font-jakarta mb-2">
            {step === "DOCUMENTS"
              ? "Validación de Empresa"
              : "Registro de Donador"}
          </h1>
          <p className="text-brand-muted">
            Únete a FoodSaver para donar excedentes de alimentos.
          </p>
        </div>

        {/* Barra de progreso visual */}
        <div className="flex justify-center gap-2 mb-8">
          <div
            className={`h-2 w-12 rounded-full ${step === "FORM" ? "bg-brand-accent" : "bg-green-500"}`}
          />
          <div
            className={`h-2 w-12 rounded-full ${step === "OTP" ? "bg-brand-accent" : step === "DOCUMENTS" ? "bg-green-500" : "bg-brand-border"}`}
          />
          <div
            className={`h-2 w-12 rounded-full ${step === "DOCUMENTS" ? "bg-brand-accent" : "bg-brand-border"}`}
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-500">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-xl flex items-center gap-3 text-green-500">
            <CheckCircle size={20} />
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        {/* ================= FORM (AHORA CON GRID 2 COLUMNAS) ================= */}
        {step === "FORM" && (
          <form
            onSubmit={handlePreRegister}
            className="flex flex-col gap-6 animate-in fade-in"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Empresa */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-brand-muted ml-1">
                  Nombre de la empresa
                </label>
                <input
                  name="nombreEmpresa"
                  type="text"
                  value={formData.nombreEmpresa}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text"
                  required
                />
              </div>

              {/* NIT */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-brand-muted ml-1">
                  NIT
                </label>
                <input
                  name="nit"
                  type="text"
                  value={formData.nit}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text"
                  required
                />
              </div>

              {/* Encargado */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-medium text-brand-muted ml-1">
                  Nombre del encargado
                </label>
                <input
                  name="nombreEncargado"
                  type="text"
                  value={formData.nombreEncargado}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text"
                  required
                />
              </div>

              {/* Celular */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-brand-muted ml-1">
                  Celular
                </label>
                <input
                  name="celular"
                  type="text"
                  value={formData.celular}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text"
                  placeholder="+573001234567"
                  required
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-brand-muted ml-1">
                  Correo electrónico
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text"
                  required
                />
              </div>

              {/* Departamento */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-brand-muted ml-1">
                  Departamento
                </label>
                <select
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="Antioquia">Antioquia</option>
                </select>
              </div>

              {/* Ciudad */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-brand-muted ml-1">
                  Ciudad
                </label>
                <select
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="Apartadó">Apartadó</option>
                  <option value="Giraldo">Giraldo</option>
                  <option value="Medellín">Medellín</option>
                  <option value="Yarumal">Yarumal</option>
                </select>
              </div>

              {/* Dirección */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-medium text-brand-muted ml-1">
                  Dirección
                </label>
                <input
                  name="direccion"
                  type="text"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text"
                  required
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-medium text-brand-muted ml-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text pr-12"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="text-brand-muted" />
                    ) : (
                      <Eye className="text-brand-muted" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-4 bg-brand-accent text-white rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-brand-accent-light transition-colors disabled:opacity-50"
            >
              {loading ? "Validando..." : "Continuar"}
              <ArrowRight size={20} />
            </button>
          </form>
        )}

        {/* ================= OTP ================= */}
        {step === "OTP" && (
          <div className="flex flex-col items-center gap-6 animate-in slide-in-from-right-4">
            <h3 className="text-xl font-medium text-brand-text">
              Verificación OTP
            </h3>
            <p className="text-center text-brand-muted">
              Ingresa el código enviado a tu celular
            </p>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="w-full text-center text-3xl font-bold tracking-widest py-4 border border-brand-border bg-brand-background text-brand-text rounded-xl outline-none focus:border-brand-accent transition-colors"
            />
            <button
              onClick={handleVerifyOtp}
              disabled={otp.length < 4 || loading}
              className="w-full py-4 bg-brand-accent text-white rounded-xl font-medium disabled:opacity-50 hover:bg-brand-accent-light transition-colors"
            >
              {loading ? "Verificando..." : "Verificar código"}
            </button>
          </div>
        )}

        {/* ================= DOCUMENTS ================= */}
        {step === "DOCUMENTS" && (
          <form
            onSubmit={handleUploadDocuments}
            className="flex flex-col gap-6 animate-in slide-in-from-right-4"
          >
            <p className="text-center text-brand-muted mb-2">
              Para finalizar, adjunta la documentación de la empresa.
            </p>

            {/* Input RUT */}
            <label
              className={`cursor-pointer border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors ${documents.rut ? "border-green-500 bg-green-500/5" : "border-brand-border hover:border-brand-accent"}`}
            >
              <input
                type="file"
                accept=".pdf,image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, "rut")}
              />
              {documents.rut ? (
                <FileText size={32} className="text-green-500 mb-2" />
              ) : (
                <UploadCloud size={32} className="text-brand-accent mb-2" />
              )}
              <span className="font-medium text-brand-text">
                {documents.rut ? documents.rut.name : "Subir RUT"}
              </span>
              {!documents.rut && (
                <span className="text-xs text-brand-muted mt-1">
                  PDF o Imagen (Máx 5MB)
                </span>
              )}
            </label>

            {/* Input Cámara de Comercio */}
            <label
              className={`cursor-pointer border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors ${documents.camaraComercio ? "border-green-500 bg-green-500/5" : "border-brand-border hover:border-brand-accent"}`}
            >
              <input
                type="file"
                accept=".pdf,image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, "camaraComercio")}
              />
              {documents.camaraComercio ? (
                <FileText size={32} className="text-green-500 mb-2" />
              ) : (
                <UploadCloud size={32} className="text-brand-accent mb-2" />
              )}
              <span className="font-medium text-brand-text">
                {documents.camaraComercio
                  ? documents.camaraComercio.name
                  : "Subir Cámara de Comercio"}
              </span>
              {!documents.camaraComercio && (
                <span className="text-xs text-brand-muted mt-1">
                  PDF o Imagen (Máx 5MB)
                </span>
              )}
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-brand-accent text-white rounded-xl flex items-center justify-center gap-2 font-medium disabled:opacity-50 hover:bg-brand-accent-light transition-colors"
            >
              {loading ? "Subiendo..." : "Finalizar Registro"}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-brand-muted">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            className="text-brand-accent font-medium hover:underline"
          >
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
};
