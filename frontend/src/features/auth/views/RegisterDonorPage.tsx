/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  FileText,
  Leaf,
  UploadCloud,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl } from "../../../lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type Step = "FORM" | "OTP" | "DOCUMENTS";

export const RegisterDonorPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("FORM");
  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [createdUserId, setCreatedUserId] = useState<string | null>(null);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
  ) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments({ ...documents, [field]: e.target.files[0] });
    }
  };

  const handlePreRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }
  };

  const handleFinalSubmit = async () => {
    setError("");
    try {
      const res = await axios.post(
        apiUrl("/api/auth/donor/pre-register"),
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

  const handleVerifyOtp = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(apiUrl("/api/auth/donor/verify"), {
        otp,
        donorData: formData,
      });

      if (res.data.user?._id) {
        setCreatedUserId(res.data.user._id);
      } else if (res.data.userId) {
        setCreatedUserId(res.data.userId);
      }

      setSuccess("Celular verificado. Por favor, sube tus documentos.");
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
      if (createdUserId) data.append("userId", createdUserId);
      data.append("rut", documents.rut);
      data.append("camaraComercio", documents.camaraComercio);
      await axios.post(apiUrl("/api/auth/donor/upload-docs"), data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("¡Registro completado! Redirigiendo al inicio de sesión...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al subir documentos.");
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = { FORM: 0, OTP: 1, DOCUMENTS: 2 };

  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-24 h-64 w-64 rounded-full bg-brand-accent/10 blur-3xl" />
        <div className="absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-brand-accent-light/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-10">
        <Link
          to="/"
          className="mb-8 flex items-center gap-2 text-brand-accent transition-opacity hover:opacity-80"
        >
          <Leaf size={30} />
          <span className="font-jakarta text-2xl font-semibold tracking-tight text-brand-text">
            FoodSaver
          </span>
        </Link>

        <Card className="w-full max-w-2xl bg-brand-card/90 shadow-xl ring-1 ring-foreground/5 backdrop-blur">
          <CardHeader className="gap-1 text-center">
            <CardTitle className="font-jakarta text-2xl font-semibold">
              {step === "DOCUMENTS"
                ? "Validación de empresa"
                : "Registro de Donador"}
            </CardTitle>
            <CardDescription>
              Únete a FoodSaver para donar excedentes de alimentos.
            </CardDescription>

            {/* Progress bar */}
            <div className="mt-4 flex justify-center gap-2">
              {["Datos", "Verificación", "Documentos"].map((label, i) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <div
                    className={`h-1.5 w-16 rounded-full transition-colors ${
                      i < stepIndex[step]
                        ? "bg-green-500"
                        : i === stepIndex[step]
                          ? "bg-brand-accent"
                          : "bg-muted"
                    }`}
                  />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive">
                <AlertCircle size={18} className="shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-green-600">
                <CheckCircle size={18} className="shrink-0" />
                <p className="text-sm font-medium">{success}</p>
              </div>
            )}

            {step === "FORM" && (
              <form onSubmit={handlePreRegister} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nombreEmpresa">Nombre de la empresa</Label>
                    <Input
                      id="nombreEmpresa"
                      name="nombreEmpresa"
                      value={formData.nombreEmpresa}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nit">NIT</Label>
                    <Input
                      id="nit"
                      name="nit"
                      value={formData.nit}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="nombreEncargado">
                      Nombre del encargado
                    </Label>
                    <Input
                      id="nombreEncargado"
                      name="nombreEncargado"
                      value={formData.nombreEncargado}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="celular">Celular</Label>
                    <Input
                      id="celular"
                      name="celular"
                      value={formData.celular}
                      onChange={handleChange}
                      placeholder="+573001234567"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="departamento">Departamento</Label>
                    <Select
                      value={formData.departamento}
                      onValueChange={(v) =>
                        handleSelectChange("departamento", v || "")
                      }
                      required
                    >
                      <SelectTrigger id="departamento">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Antioquia">Antioquia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ciudad">Ciudad</Label>
                    <Select
                      value={formData.ciudad}
                      onValueChange={(v) =>
                        handleSelectChange("ciudad", v || "")
                      }
                      required
                    >
                      <SelectTrigger id="ciudad">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Apartadó">Apartadó</SelectItem>
                        <SelectItem value="Giraldo">Giraldo</SelectItem>
                        <SelectItem value="Medellín">Medellín</SelectItem>
                        <SelectItem value="Yarumal">Yarumal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Mínimo 6 caracteres"
                        className="pr-11"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={
                          showPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <input
                    id="terms-donor"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border border-input bg-background text-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    required
                  />
                  <Label
                    htmlFor="terms-donor"
                    className="text-sm leading-relaxed text-muted-foreground block"
                  >
                    Autorizo el tratamiento de mis datos personales y los de mi
                    empresa conforme a la{" "}
                    <Link
                      to="/privacy"
                      className="text-brand-accent underline-offset-4 hover:underline"
                    >
                      Política de Tratamiento de Datos
                    </Link>{" "}
                    de FoodSaver, de acuerdo con la Ley 1581 de 2012 y el
                    Decreto 1377 de 2013. Los datos serán usados exclusivamente
                    para la gestión de donaciones.
                  </Label>
                </div>

                <Button
                  onClick={handleFinalSubmit}
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading || !acceptedTerms}
                >
                  {loading ? "Validando..." : "Continuar"}
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </form>
            )}

            {step === "OTP" && (
              <div className="flex flex-col items-center gap-5">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Ingresa el código enviado a tu correo electrónico.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Si no lo ves, revisa la carpeta de SPAM.
                  </p>
                </div>
                <Input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full text-center text-3xl font-bold tracking-[0.5em] h-16"
                  autoComplete="one-time-code"
                />
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleVerifyOtp}
                  disabled={otp.length < 4 || loading}
                >
                  {loading ? "Verificando..." : "Verificar código"}
                </Button>
              </div>
            )}

            {step === "DOCUMENTS" && (
              <form onSubmit={handleUploadDocuments} className="space-y-5">
                <p className="text-sm text-muted-foreground text-center">
                  Para finalizar, adjunta la documentación legal de la empresa.
                </p>

                <div className="space-y-2">
                  <Label>RUT de la empresa</Label>
                  <label
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                      documents.rut
                        ? "border-green-500 bg-green-500/5"
                        : "border-border hover:border-brand-accent"
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "rut")}
                    />
                    {documents.rut ? (
                      <FileText size={28} className="mb-2 text-green-500" />
                    ) : (
                      <UploadCloud
                        size={28}
                        className="mb-2 text-brand-accent"
                      />
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {documents.rut ? documents.rut.name : "Subir RUT"}
                    </span>
                    {!documents.rut && (
                      <span className="mt-1 text-xs text-muted-foreground">
                        PDF o imagen — Máx. 5 MB
                      </span>
                    )}
                  </label>
                </div>

                <div className="space-y-2">
                  <Label>Cámara de Comercio</Label>
                  <label
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                      documents.camaraComercio
                        ? "border-green-500 bg-green-500/5"
                        : "border-border hover:border-brand-accent"
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "camaraComercio")}
                    />
                    {documents.camaraComercio ? (
                      <FileText size={28} className="mb-2 text-green-500" />
                    ) : (
                      <UploadCloud
                        size={28}
                        className="mb-2 text-brand-accent"
                      />
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {documents.camaraComercio
                        ? documents.camaraComercio.name
                        : "Subir Cámara de Comercio"}
                    </span>
                    {!documents.camaraComercio && (
                      <span className="mt-1 text-xs text-muted-foreground">
                        PDF o imagen — Máx. 5 MB
                      </span>
                    )}
                  </label>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Subiendo..." : "Finalizar registro"}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/login"
                className="font-medium text-brand-accent transition-colors hover:text-brand-accent/80"
              >
                Inicia sesión
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
