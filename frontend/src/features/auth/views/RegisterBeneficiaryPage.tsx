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

export const RegisterBenefiaryPage = () => {
  const [formData, setFormData] = useState({
    tipoDocumento: "",
    numeroDocumento: "",
    nombres: "",
    apellidos: "",
    departamento: "",
    ciudad: "",
    direccion: "",
    email: "",
    celular: "",
    password: "",
    documentoIdentidad: null,
  sisben: null
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const navigate = useNavigate();

  const documentTypes = [
    "Registro Civil",
    "Tarjeta de Identidad",
    "Cédula de Ciudadanía",
    "Cédula de extranjería",
    "DNI (País de origen)",
    "DNI (Pasaporte)",
    "Salvoconducto para refugiado",
    "Permiso Especial de Permanencia",
    "Permiso por Protección Temporal",
  ];

  const validateDocument = (tipo: string, numero: string) => {
    const onlyNumbers = /^[0-9]+$/;

    switch (tipo) {
      case "Registro Civil":
        return onlyNumbers.test(numero) && numero.length >= 10;

      case "Tarjeta de Identidad":
        return onlyNumbers.test(numero) && numero.length >= 10;

      case "Cédula de Ciudadanía":
        return (
          onlyNumbers.test(numero) && numero.length >= 6 && numero.length <= 10
        );

      case "Cédula de extranjería":
        return (
          onlyNumbers.test(numero) && numero.length >= 6 && numero.length <= 12
        );

      case "DNI (País de origen)":
        return numero.length >= 5;

      case "DNI (Pasaporte)":
        return /^[A-Za-z0-9]+$/.test(numero);

      case "Salvoconducto para refugiado":
        return numero.length >= 6;

      case "Permiso Especial de Permanencia":
        return onlyNumbers.test(numero) && numero.length === 15;

      case "Permiso por Protección Temporal":
        return onlyNumbers.test(numero) && numero.length === 15;

      default:
        return false;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInitialSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const isValidDocument = validateDocument(
      formData.tipoDocumento,
      formData.numeroDocumento,
    );

    if (!isValidDocument) {
      setError(
        "El número de documento no es válido para el tipo seleccionado.",
      );
      return;
    }

    setIsConfirming(true);
  };

  const handleFinalSubmit = async () => {
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {

  const { name, files } = e.target;

  if (!files || files.length === 0) return;

  const file = files[0];

  if (file.size > 5 * 1024 * 1024) {
    setError("El archivo no puede superar los 5MB");
    return;
  }

  setFormData((prev) => ({
    ...prev,
    [name]: file
  }));
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
            Crear Cuenta
          </h1>
          <p className="text-brand-muted">
            Únete a FoodSaver para recibir beneficios de alimentación.
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
                  htmlFor="nombres"
                  className="text-sm font-medium text-brand-muted ml-1"
                >
                  Nombres
                </label>
                <input
                  id="nombres"
                  name="nombres"
                  type="text"
                  value={formData.nombres}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
                  placeholder="Tus nombres"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="apellidos"
                  className="text-sm font-medium text-brand-muted ml-1"
                >
                  Apellidos
                </label>
                <input
                  id="apellidos"
                  name="apellidos"
                  type="text"
                  value={formData.apellidos}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
                  placeholder="Tus apellidos"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <label className="text-sm font-medium text-brand-muted ml-1">
                  Documento de identidad
                </label>

                <div className=" flex flex-col-2 gap-2">
                  <select
                    name="tipoDocumento"
                    value={formData.tipoDocumento}
                    onChange={handleChange}
                    className="bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text"
                    required
                  >
                    <option value="">Seleccionar</option>

                    {documentTypes.map((doc) => (
                      <option key={doc} value={doc}>
                        {doc}
                      </option>
                    ))}
                  </select>

                  <input
                    name="numeroDocumento"
                    type="text"
                    value={formData.numeroDocumento}
                    onChange={handleChange}
                    placeholder="Número de documento"
                    className="bg-brand-background border border-brand-border rounded-xl px-8 py-3 text-brand-text flex flex-col"
                  />
                </div>
              </div>

              <div className="col-span-2 flex flex-col gap-2">
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
                  <option value="Giraldo">Apartadó</option>
                  <option value="Giraldo">Giraldo</option>
                  <option value="Medellín">Medellín</option>
                  <option value="Medellín">Yarumal</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label
                  htmlFor="direccion"
                  className="text-sm font-medium text-brand-muted ml-1"
                >
                  Dirección
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
                    placeholder="Al menos 1 decimal y 1 carácter especial"
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

            <div className="col-span-2 flex flex-col gap-6 mt-4">

  <h3 className="text-lg font-semibold text-brand-text">
    Documentación requerida
  </h3>

  {/* Documento de identidad */}
  <label className="cursor-pointer border-2 border-dashed border-brand-border rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-brand-accent transition">

    <input
      type="file"
      name="documentoIdentidad"
      accept=".pdf,.jpg,.jpeg,.png"
      onChange={handleFileChange}
      className="hidden"
    />

    <div className="text-brand-accent text-3xl mb-2">📎</div>

    <p className="text-brand-text font-medium">
      Adjuntar documento de identidad
    </p>

    <p className="text-sm text-brand-muted">
      PDF, JPG o PNG (Max. 5MB)
    </p>

  </label>


  {/* Documento SISBEN */}
  <label className="cursor-pointer border-2 border-dashed border-brand-border rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-brand-accent transition">

    <input
      type="file"
      name="sisben"
      accept=".pdf,.jpg,.jpeg,.png"
      onChange={handleFileChange}
      className="hidden"
    />

    <div className="text-brand-accent text-3xl mb-2">📄</div>

    <p className="text-brand-text font-medium">
      Adjuntar SISBEN
    </p>

    <p className="text-sm text-brand-muted">
      PDF, JPG o PNG (Max. 5MB)
    </p>

  </label>

</div>
            <button
              type="submit"
              className="w-full mt-4 flex items-center justify-center gap-2 py-4 text-lg font-medium bg-brand-text text-brand-background rounded-xl hover:bg-brand-muted transition-all group"
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
              <p className="text-brand-muted mb-4">
                Verifica que tus datos sean correctos. Una vez creada la cuenta,
                podrás publicar o solicitar alimentos.
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
