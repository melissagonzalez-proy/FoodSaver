/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  Leaf,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl } from "../../../lib/api";

type Step = "FORM" | "OTP";

export const RegisterDonorPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("FORM");
  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

    setIsConfirming(true);
  };

  const handleFinalSubmit = async () => {
    setError("");
    try {
      const payload = { ...formData, role: "donor" };
      const response = await axios.post(apiUrl("/api/auth/register"), payload);

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
      await axios.post("http://localhost:5000/api/auth/donor/verify", { http://localhost:5000/api/auth/donor/pre-register
        otp,
        donorData: formData,
      });

      setSuccess("Cuenta creada correctamente. Redirigiendo...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Código inválido o expirado"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-background flex flex-col items-center justify-center p-6 font-sans">
      <Link
        to="/"
        className="flex items-center gap-2 text-brand-accent mb-8"
      >
        <Leaf size={32} />
        <span className="text-3xl font-bold text-brand-text font-jakarta">
          FoodSaver
        </span>
      </Link>

      <div className="w-full max-w-2xl bg-brand-card border border-brand-border rounded-4xl p-10 shadow-2xl">
        <h1 className="text-3xl font-semibold text-center mb-6 font-jakarta">
          Registro de Donador
        </h1>

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

        {/* ================= FORM ================= */}
        {step === "FORM" && (
          <form onSubmit={handlePreRegister} className="flex flex-col gap-6">
            <input
              name="nombreEmpresa"
              placeholder="Nombre de la empresa"
              value={formData.nombreEmpresa}
              onChange={handleChange}
              required
              className="input"
            />

            <input
              name="nit"
              placeholder="NIT"
              value={formData.nit}
              onChange={handleChange}
              required
              className="input"
            />

            <input
              name="nombreEncargado"
              placeholder="Nombre del encargado"
              value={formData.nombreEncargado}
              onChange={handleChange}
              required
              className="input"
            />

            <input
              name="celular"
              placeholder="Celular Ej:+573001234567"
              value={formData.celular}
              onChange={handleChange}
              required
              className="input"
            />

            <select
              name="departamento"
              value={formData.departamento}
              onChange={handleChange}
              required
              className="input"
            >
              <option value="Antioquia" className="bg-gray-800 text-white">Selecciona un departamento</option>
              <option value="Antioquia" className="bg-gray-800 text-white">Antioquia</option>
            </select>

            <select
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              required
              className="input"
              >
                <option value=" " className="bg-gray-800 text-white">Selecciona una ciudad</option>
                <option value="Apartadó" className="bg-gray-800 text-white">Apartadó</option>
                <option value="Giraldo" className="bg-gray-800 text-white">Giraldo</option>
                <option value="Medellín" className="bg-gray-800 text-white">Medellín</option>
                <option value="Yarumal" className="bg-gray-800 text-white">Yarumal</option>
              </select>

            <input
              name="direccion"
              placeholder="Dirección"
              value={formData.direccion}
              onChange={handleChange}
              required
              className="input"
            />

            <input
              name="email"
              type="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              required
              className="input"
            />

            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                required
                className="input pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-accent text-white rounded-xl flex items-center justify-center gap-2"
            >
              {loading ? "Validando..." : "Continuar"}
              <ArrowRight />
            </button>
          </form>
        )}

        {/* ================= OTP ================= */}
        {step === "OTP" && (
          <div className="flex flex-col gap-6 animate-in fade-in">
            <p className="text-center text-brand-muted">
              Ingresa el código enviado a tu celular
            </p>

            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="text-center text-2xl tracking-widest py-3 border rounded-xl"
            />

            <button
              onClick={handleVerifyOtp}
              disabled={otp.length < 4 || loading}
              className="w-full py-4 bg-brand-accent text-white rounded-xl"
            >
              {loading ? "Verificando..." : "Verificar código"}
            </button>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-brand-muted">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-brand-accent font-medium">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
};