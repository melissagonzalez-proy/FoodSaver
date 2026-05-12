import axios from "axios";
import { apiUrl } from "../../../lib/api";
import { AlertCircle, CheckCircle, Leaf } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const RegisterBeneficiaryPage = () => {
  const navigate = useNavigate();

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
    grupoSisben: "",
    documentoIdentidad: null as File | null,
    sisben: null as File | null,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "confirm" | "otp" | "success">(
    "form",
  );
  const [otp, setOtp] = useState("");

  

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ¡AHORA SÍ SE USA ESTA FUNCIÓN!
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      setError("El archivo no puede superar los 5MB");
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: file }));
  };

  const handleInitialSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (!validateDocument(formData.tipoDocumento, formData.numeroDocumento)) {
      setError(
        "El número de documento no es válido para el tipo seleccionado.",
      );
      return;
    }

    if (!formData.grupoSisben) {
      setError("El grupo SISBÉN es obligatorio.");
      return;
    }

    if (!formData.documentoIdentidad || !formData.sisben) {
      setError(
        "Debes adjuntar el documento de identidad y el soporte de SISBÉN.",
      );
      return;
    }

    setStep("confirm");
  };

  const handlePreRegister = async () => {
    setError("");
    setLoading(true);

    if (!formData.celular || !formData.email) {
      setError("Faltan datos obligatorios.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        apiUrl("/api/auth/beneficiary/pre-register"),
        {
          numeroDocumento: formData.numeroDocumento,
          tipoDocumento: formData.tipoDocumento,
          nombre: `${formData.nombres} ${formData.apellidos}`,
          sisbenGrupo: formData.grupoSisben,
          municipio: formData.ciudad,
          celular: formData.celular,
          email: formData.email,
          password: formData.password,
          departamento: formData.departamento,
          ciudad: formData.ciudad,
          direccion: formData.direccion,
        },
      );

      if (response.data.sisbenValid && response.data.otpSent) {
        setStep("otp");
      } else {
        setError("No se pudo validar el SISBÉN o enviar el OTP.");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Error en el pre-registro.");
      } else {
        setError("Error en el pre-registro.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        apiUrl("/api/auth/beneficiary/verify"),
        {
          otp,
          beneficiaryData: {
            nombres: formData.nombres,
            apellidos: formData.apellidos,
            tipoDocumento: formData.tipoDocumento,
            numeroDocumento: formData.numeroDocumento,
            sisbenGrupo: formData.grupoSisben,
            celular: formData.celular,
            email: formData.email,
            password: formData.password,
            departamento: formData.departamento,
            ciudad: formData.ciudad,
            direccion: formData.direccion,
            role: "beneficiary",
          },
        },
      );

      const userId = response.data.userId;

      // Subir documentos usando la API real
      if (formData.documentoIdentidad || formData.sisben) {
        const data = new FormData();
        data.append("userId", userId);
        if (formData.documentoIdentidad)
          data.append("documentoIdentidad", formData.documentoIdentidad);
        if (formData.sisben) data.append("sisben", formData.sisben);

        await axios.post(
          apiUrl("/api/auth/register-beneficiary"),
          data,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
      }

      setStep("success");
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("OTP inválido o expirado.");
      }
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

      <div className="w-full max-w-2xl bg-brand-card border border-brand-border rounded-4xl p-10 relative shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-brand-text font-jakarta mb-2">
            Registro de Beneficiario
          </h1>
          <p className="text-brand-muted">
            Únete a FoodSaver para solicitar donaciones de alimentos.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-500">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* ========================= */}
        {/* STEP 1: FORM */}
        {/* ========================= */}
        {step === "form" && (
          <form
            onSubmit={handleInitialSubmit}
            className="flex flex-col gap-6 animate-in fade-in"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-brand-muted ml-1">
                  Nombres
                </label>
                <input
                  name="nombres"
                  type="text"
                  value={formData.nombres}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-brand-muted ml-1">
                  Apellidos
                </label>
                <input
                  name="apellidos"
                  type="text"
                  value={formData.apellidos}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text"
                  required
                />
              </div>

              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-sm font-medium text-brand-muted ml-1">
                  Documento de identidad
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    name="tipoDocumento"
                    value={formData.tipoDocumento}
                    onChange={handleChange}
                    className="bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text sm:w-1/3"
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
                    className="flex-1 bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text"
                    placeholder="Número de documento"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-medium text-brand-muted ml-1">
                  Grupo SISBÉN
                </label>
                <input
                  name="grupoSisben"
                  value={formData.grupoSisben}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text"
                  placeholder="Ej: B3"
                  required
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
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
                  <option value="Medellín">Medellín</option>
                  <option value="Apartadó">Apartadó</option>
                  <option value="Giraldo">Giraldo</option>
                  <option value="Yarumal">Yarumal</option>
                </select>
              </div>

              <div className="md:col-span-2 flex flex-col gap-2">
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

              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-sm font-medium text-brand-muted ml-1">
                  Email
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

              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-sm font-medium text-brand-muted ml-1">
                  Contraseña
                </label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>

              {/* === NUEVOS CAMPOS PARA ARCHIVOS === */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-medium text-brand-muted ml-1">
                  Soporte de Documento de Identidad
                </label>
                <input
                  type="file"
                  name="documentoIdentidad"
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-2.5 text-brand-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-accent/10 file:text-brand-accent hover:file:bg-brand-accent/20 cursor-pointer"
                  required
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-medium text-brand-muted ml-1">
                  Soporte de SISBÉN
                </label>
                <input
                  type="file"
                  name="sisben"
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-2.5 text-brand-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-accent/10 file:text-brand-accent hover:file:bg-brand-accent/20 cursor-pointer"
                  required
                />
              </div>
              {/* ===================================== */}
            </div>

            <button
              type="submit"
              className="w-full mt-4 flex items-center justify-center gap-2 py-4 text-lg font-medium bg-brand-accent text-white hover:bg-brand-accent-light transition-colors rounded-xl"
            >
              Revisar Datos
            </button>
          </form>
        )}

        {/* ========================= */}
        {/* STEP 2: CONFIRM */}
        {/* ========================= */}
        {step === "confirm" && (
          <div className="flex flex-col items-center gap-6 animate-in slide-in-from-right-4">
            <div className="bg-brand-background border border-brand-border rounded-xl p-6 w-full text-center">
              <h3 className="text-xl font-medium text-brand-text mb-2">
                Confirmar Registro
              </h3>
              <p className="text-brand-muted mb-4">
                Verifica tus datos antes de continuar con la validación de
                SISBÉN y OTP.
              </p>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="flex-1 py-3 border border-brand-border rounded-xl text-brand-text hover:bg-brand-border/50 transition-colors"
                >
                  Regresar
                </button>
                <button
                  type="button"
                  onClick={handlePreRegister}
                  disabled={loading}
                  className="flex-1 py-3 bg-brand-accent text-white rounded-xl disabled:opacity-50 hover:bg-brand-accent-light transition-colors"
                >
                  {loading ? "Procesando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================= */}
        {/* STEP 3: OTP */}
        {/* ========================= */}
        {step === "otp" && (
          <div className="flex flex-col items-center gap-6 animate-in slide-in-from-right-4">
            <h3 className="text-xl font-medium text-brand-text">
              Verificación OTP
            </h3>
            <p className="text-brand-muted text-center">
              Ingresa el código enviado a tu celular
            </p>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              maxLength={6}
              className="w-full border border-brand-border bg-brand-background p-4 rounded-xl text-center text-3xl tracking-widest text-brand-text outline-none focus:border-brand-accent"
              placeholder="123456"
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 4}
              className="w-full py-4 bg-brand-accent text-white rounded-xl font-medium disabled:opacity-50 hover:bg-brand-accent-light transition-colors"
            >
              {loading ? "Verificando..." : "Verificar código"}
            </button>
          </div>
        )}

        {/* ========================= */}
        {/* STEP 4: SUCCESS */}
        {/* ========================= */}
        {step === "success" && (
          <div className="flex flex-col items-center gap-4 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-2">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h3 className="text-2xl font-semibold text-brand-text">
              ¡Registro exitoso!
            </h3>
            <p className="text-brand-muted">
              Tu cuenta ha sido creada. Serás redirigido al inicio de sesión...
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-brand-muted">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-brand-accent hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
