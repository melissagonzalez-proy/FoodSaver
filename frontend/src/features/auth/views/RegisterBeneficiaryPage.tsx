import axios from "axios";
import { AlertCircle, CheckCircle, Leaf } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const RegisterBeneficiaryPage = () => {
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

  const [docName, setDocName] = useState("");
  const [sisbenName, setSisbenName] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [step, setStep] = useState<"form" | "confirm" | "otp" | "success">(
    "form",
  );
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;

    const file = files[0];

    if (file.size > 5 * 1024 * 1024) {
      setError("El archivo no puede superar los 5MB");
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: file }));

    if (name === "documentoIdentidad") setDocName(file.name);
    if (name === "sisben") setSisbenName(file.name);
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

    setStep("confirm");
  };

  const handlePreRegister = async () => {
    setError("");

    // 🔍 Validación rápida (extra seguridad)
    if (!formData.celular || !formData.email) {
      setError("Faltan datos obligatorios.");
      setLoading(false);
      return;
    }

    try {
      console.log(formData);
      const response = await axios.post(
        "http://localhost:5000/api/auth/beneficiary/pre-register",
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

      // ✅ Validación de respuesta
      if (response.data.sisbenValid && response.data.otpSent) {
        setLoading(false);
        setStep("otp");
      } else {
        setError("No se pudo validar el SISBÉN o enviar el OTP.");
        setLoading(false);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log("STATUS:", err.response?.status);
        console.log("DATA:", err.response?.data);
        console.log("MESSAGE:", err.message);

        setError(err.response?.data?.message || "Error en el pre-registro.");
      } else {
        console.log(err);
        setError("Error en el pre-registro.");
      }
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setLoading(true);
    console.log("CLICK OTP"); // 👈 DEBUG

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/beneficiary/verify",
        {
          otp,
          beneficiaryData: {
            nombres: formData.nombres,
            apellidos: formData.apellidos,
            tipoDocumento: formData.tipoDocumento,
            numeroDocumento: formData.numeroDocumento,
            sisbenGrupo: formData.grupoSisben, // 🔥 CORREGIDO
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

      const uploadDocuments = async (userId: string) => {
        const data = new FormData();

        data.append("userId", userId);

        if (formData.documentoIdentidad) {
          data.append("documentoIdentidad", formData.documentoIdentidad);
        }

        if (formData.sisben) {
          data.append("sisben", formData.sisben);
        }

        try {
          await axios.post(
            "http://localhost:5000/api/auth/register-beneficiary",
            data,
            {
              headers: { "Content-Type": "multipart/form-data" },
            },
          );
        } catch (err) {
          console.error("Error subiendo documentos:", err);
          setError("Error al subir documentos.");
        }
      };

      const userId = response.data.userId;
      setUserId(userId);

      // 🔥 subir documentos después de crear usuario
      await uploadDocuments(userId);

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
      {/* HEADER */}
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
        {/* TITULO */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-brand-text font-jakarta mb-2">
            Registro de Beneficiario
          </h1>
          <p className="text-brand-muted">
            Únete a FoodSaver para solicitar donaciones de alimentos.
          </p>
        </div>

        {/* ERRORES */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-500">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-xl flex items-center gap-3 text-green-500">
            <CheckCircle size={20} />
            <p className="text-sm font-medium">
              {success}. Redirigiendo al login...
            </p>
          </div>
        )}

        {/* ========================= */}
        {/* STEP 1: FORM */}
        {/* ========================= */}
        {step === "form" && (
          <form onSubmit={handleInitialSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NOMBRES */}
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

              {/* APELLIDOS */}
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

              {/* DOCUMENTO */}
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

              {/* SISBÉN */}
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

              {/* CELULAR */}
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
                  required
                />
              </div>

              {/* DEPARTAMENTO */}
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

              {/* CIUDAD */}
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

              {/* DIRECCIÓN */}
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

              {/* EMAIL */}
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

              {/* PASSWORD */}
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
            </div>

            {/* BOTÓN */}
            <button
              type="submit"
              className="w-full mt-4 flex items-center justify-center gap-2 py-4 text-lg font-medium bg-brand-accent text-white rounded-xl"
            >
              Revisar Datos
            </button>
          </form>
        )}

        {/* ========================= */}
        {/* STEP 2: CONFIRM */}
        {/* ========================= */}
        {step === "confirm" && (
          <div className="flex flex-col items-center gap-6">
            <div className="bg-brand-background border border-brand-border rounded-xl p-6 w-full text-center">
              <h3 className="text-xl font-medium text-brand-text mb-2">
                Confirmar Registro
              </h3>

              <p className="text-brand-muted mb-4">
                Verifica tus datos antes de continuar con validación SISBÉN y
                OTP.
              </p>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="flex-1 py-3 border border-brand-border rounded-xl"
                >
                  Regresar
                </button>

                <button
                  type="button"
                  onClick={handlePreRegister}
                  disabled={loading}
                  className="flex-1 py-3 bg-brand-accent text-white rounded-xl"
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
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-xl font-medium text-brand-text">
              Verificación OTP
            </h3>

            <p className="text-brand-muted text-center">
              Ingresa el código enviado a tu celular
            </p>

            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="border border-brand-border p-3 rounded-xl text-center tracking-widest"
              placeholder="123456"
            />

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full py-3 bg-brand-accent text-white rounded-xl"
            >
              {loading ? "Verificando..." : "Verificar OTP"}
            </button>
          </div>
        )}

        {/* ========================= */}
        {/* STEP 4: SUCCESS */}
        {/* ========================= */}
        {step === "success" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle size={40} className="text-green-500" />

            <h3 className="text-xl font-medium text-brand-text">
              Registro exitoso
            </h3>

            <p className="text-brand-muted">Serás redirigido al login...</p>
          </div>
        )}

        {/* LOGIN LINK */}
        <div className="mt-8 text-center">
          <p className="text-sm text-brand-muted">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-brand-accent">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
