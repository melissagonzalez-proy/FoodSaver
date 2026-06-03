import axios from "axios";
import { apiUrl } from "../../../lib/api";
import { AlertCircle, CheckCircle, Leaf } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

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
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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

      if (formData.documentoIdentidad || formData.sisben) {
        const data = new FormData();
        data.append("userId", userId);
        if (formData.documentoIdentidad)
          data.append("documentoIdentidad", formData.documentoIdentidad);
        if (formData.sisben) data.append("sisben", formData.sisben);

        await axios.post(apiUrl("/api/auth/register-beneficiary"), data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
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

  const stepIndex = { form: 0, confirm: 1, otp: 2, success: 3 };

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
              Registro de Beneficiario
            </CardTitle>
            <CardDescription>
              Únete a FoodSaver para solicitar donaciones de alimentos.
            </CardDescription>

            {/* Progress bar */}
            {step !== "success" && (
              <div className="mt-4 flex justify-center gap-2">
                {["Datos", "Confirmación", "Verificación"].map((label, i) => (
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
                    <span className="text-xs text-muted-foreground">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive">
                <AlertCircle size={18} className="shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {step === "form" && (
              <form onSubmit={handleInitialSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nombres">Nombres</Label>
                    <Input
                      id="nombres"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apellidos">Apellidos</Label>
                    <Input
                      id="apellidos"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Documento de identidad</Label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Select
                        value={formData.tipoDocumento}
                        onValueChange={(v) =>
                          handleSelectChange("tipoDocumento", v || "")
                        }
                      >
                        <SelectTrigger className="sm:w-2/5">
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes.map((doc) => (
                            <SelectItem key={doc} value={doc}>
                              {doc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        name="numeroDocumento"
                        value={formData.numeroDocumento}
                        onChange={handleChange}
                        placeholder="Número de documento"
                        className="flex-1"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="grupoSisben">Grupo SISBÉN</Label>
                    <Input
                      id="grupoSisben"
                      name="grupoSisben"
                      value={formData.grupoSisben}
                      onChange={handleChange}
                      placeholder="Ej: B3"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
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
                    <Label htmlFor="departamento">Departamento</Label>
                    <Select
                      value={formData.departamento}
                      onValueChange={(v) =>
                        handleSelectChange("departamento", v || "")
                      }
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
                    >
                      <SelectTrigger id="ciudad">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Medellín">Medellín</SelectItem>
                        <SelectItem value="Apartadó">Apartadó</SelectItem>
                        <SelectItem value="Giraldo">Giraldo</SelectItem>
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

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mínimo 6 caracteres"
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="documentoIdentidad">
                      Soporte de Documento de Identidad
                    </Label>
                    <Input
                      id="documentoIdentidad"
                      type="file"
                      name="documentoIdentidad"
                      accept=".pdf,image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-brand-accent/10 file:px-3 file:py-1 file:text-sm file:font-medium file:text-brand-accent hover:file:bg-brand-accent/20"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      PDF o imagen — Máx. 5 MB
                    </p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="sisben">Soporte de SISBÉN</Label>
                    <Input
                      id="sisben"
                      type="file"
                      name="sisben"
                      accept=".pdf,image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-brand-accent/10 file:px-3 file:py-1 file:text-sm file:font-medium file:text-brand-accent hover:file:bg-brand-accent/20"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      PDF o imagen — Máx. 5 MB
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <input
                    id="terms-beneficiary"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border border-input bg-background text-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    required
                  />
                  <Label
                    htmlFor="terms-beneficiary"
                    className="text-sm leading-relaxed text-muted-foreground block"
                  >
                    Autorizo el tratamiento de mis datos personales, incluyendo
                    datos sensibles como mi grupo SISBÉN y documentos de
                    identidad, conforme a la{" "}
                    <Link
                      to="/privacy"
                      className="text-brand-accent underline-offset-4 hover:underline"
                    >
                      Política de Tratamiento de Datos
                    </Link>{" "}
                    de FoodSaver, de acuerdo con la Ley 1581 de 2012 y el
                    Decreto 1377 de 2013. Esta información se usará únicamente
                    para verificar mi elegibilidad como beneficiario.
                  </Label>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={!acceptedTerms}
                >
                  Revisar datos
                </Button>
              </form>
            )}

            {step === "confirm" && (
              <div className="space-y-5">
                <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Verifica que todos tus datos sean correctos antes de
                    continuar. Se validará tu SISBÉN y se enviará un código OTP
                    a tu celular.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setStep("form")}
                    className="w-full"
                  >
                    Regresar
                  </Button>
                  <Button
                    size="lg"
                    onClick={handlePreRegister}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Procesando..." : "Confirmar"}
                  </Button>
                </div>
              </div>
            )}

            {step === "otp" && (
              <div className="flex flex-col items-center gap-5">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Ingresa el código enviado a tu celular.
                  </p>
                </div>
                <Input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  placeholder="123456"
                  className="w-full text-center text-3xl font-bold tracking-[0.5em] h-16"
                  autoComplete="one-time-code"
                />
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length < 4}
                >
                  {loading ? "Verificando..." : "Verificar código"}
                </Button>
              </div>
            )}

            {step === "success" && (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle size={40} className="text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  ¡Registro exitoso!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tu cuenta ha sido creada. Serás redirigido al inicio de
                  sesión...
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/login"
                className="font-medium text-brand-accent transition-colors hover:text-brand-accent/80"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
