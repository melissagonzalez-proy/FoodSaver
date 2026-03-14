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

export const RegisterDonorPage = () => {
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

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInitialSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsConfirming(true);
  };

  const handleFinalSubmit = async () => {
    setError("");
    try {
      const payload = { ...formData, role: "donor" };
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        payload,
      );

      setSuccess(response.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      setIsConfirming(false);
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Error al conectar con el servidor. Intenta de nuevo.");
      }
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

      <div className="w-full max-w-2xl bg-brand-card border border-brand-border rounded-4xl p-10 relative shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-brand-text font-jakarta mb-2">
            Registro de Donador
          </h1>
          <p className="text-brand-muted">
            Únete a la red de intercambio de alimentos
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-500 transition-all">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-xl flex items-center gap-3 text-green-500 transition-all">
            <CheckCircle size={20} className="shrink-0" />
            <p className="text-sm font-medium">
              {success}. Redirigiendo al login...
            </p>
          </div>
        )}

        {!isConfirming ? (
          <form onSubmit={handleInitialSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="nombreEmpresa"
                  className="text-sm font-medium text-brand-muted ml-1"
                >
                  Nombre de la empresa
                </label>
                <input
                  id="nombreEmpresa"
                  name="nombreEmpresa"
                  type="text"
                  value={formData.nombreEmpresa}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
                  placeholder="Ej. Restaurante El Sabor"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="nit"
                  className="text-sm font-medium text-brand-muted ml-1"
                >
                  NIT
                </label>
                <input
                  id="nit"
                  name="nit"
                  type="text"
                  value={formData.nit}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
                  placeholder="Sin guiones ni puntos"
                  required
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label
                  htmlFor="nombreEncargado"
                  className="text-sm font-medium text-brand-muted ml-1"
                >
                  Nombre completo del encargado
                </label>
                <input
                  id="nombreEncargado"
                  name="nombreEncargado"
                  type="text"
                  value={formData.nombreEncargado}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
                  placeholder="Nombre y apellidos"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="celular"
                  className="text-sm font-medium text-brand-muted ml-1"
                >
                  Celular
                </label>
                <input
                  id="celular"
                  name="celular"
                  type="text"
                  value={formData.celular}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
                  placeholder="10 dígitos"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="departamento"
                  className="text-sm font-medium text-brand-muted ml-1"
                >
                  Departamento
                </label>
                <select
                  id="departamento"
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors appearance-none"
                  required
                >
                  <option value="" disabled>
                    Selecciona un departamento
                  </option>
                  <option value="Antioquia">Antioquia</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="ciudad"
                  className="text-sm font-medium text-brand-muted ml-1"
                >
                  Ciudad
                </label>
                <select
                  id="ciudad"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors appearance-none"
                  required
                >
                  <option value="" disabled>
                    Selecciona una ciudad
                  </option>
                  <option value="Giraldo">Giraldo</option>
                  <option value="Medellín">Medellín</option>
                  <option value="Yarumal">Yarumal</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label
                  htmlFor="direccion"
                  className="text-sm font-medium text-brand-muted ml-1"
                >
                  Dirección del establecimiento
                </label>
                <input
                  id="direccion"
                  name="direccion"
                  type="text"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
                  placeholder="Ej. Calle Principal 123"
                  required
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-brand-muted ml-1"
                >
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
                  placeholder="correo@proveedor.com"
                  required
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-brand-muted ml-1"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors pr-12"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 flex items-center justify-center gap-2 py-4 text-lg font-medium bg-brand-accent text-white rounded-xl hover:bg-brand-accent-light transition-all shadow-[0_0_20px_rgba(255,0,85,0.15)] group"
            >
              Revisar Datos
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-brand-background border border-brand-border rounded-xl p-6 w-full text-center">
              <h3 className="text-xl font-medium text-brand-text mb-2 font-jakarta">
                Confirmar Registro
              </h3>
              <p className="text-brand-muted mb-6">
                Verifica que tus datos sean correctos. Una vez creada la cuenta,
                podrás publicar alimentos excedentes en tu zona.
              </p>
              <div className="flex gap-4 w-full">
                <button
                  type="button"
                  onClick={() => setIsConfirming(false)}
                  className="flex-1 py-3 font-medium border border-brand-border text-brand-text rounded-xl hover:bg-brand-background transition-colors"
                >
                  Regresar
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="flex-1 py-3 font-medium bg-brand-accent text-white rounded-xl hover:bg-brand-accent-light transition-all shadow-[0_0_20px_rgba(255,0,85,0.15)]"
                >
                  Aceptar y Crear
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-brand-muted">
            ¿Ya tienes una cuenta?{" "}
            <Link
              to="/login"
              className="text-brand-accent hover:text-brand-accent-light font-medium transition-colors"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
