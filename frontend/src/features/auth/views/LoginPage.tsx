import axios from "axios";
import { AlertCircle, ArrowRight, Leaf } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { apiUrl } from "../../../lib/api";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor, ingresa tu correo y contraseña.");
      return;
    }

    try {
      const response = await axios.post(apiUrl("/api/auth/login"), {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      const userRole = response.data.user.role;

      if (userRole === "admin") {
        navigate("/dashboard-admin");
      } else if (userRole === "donor") {
        navigate("/dashboard-donor");
      } else if (userRole === "beneficiary") {
        navigate("/dashboard-beneficiary");
      } else {
        navigate("/");
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Error al conectar con el servidor. Intenta de nuevo.");
      }
    }
  };

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
          <span className="text-2xl font-semibold tracking-tight text-brand-text font-jakarta">
            FoodSaver
          </span>
        </Link>

        <Card className="w-full max-w-md bg-brand-card/90 shadow-xl ring-1 ring-foreground/5 backdrop-blur">
          <CardHeader className="gap-1 text-center">
            <CardTitle className="text-2xl font-semibold">
              Bienvenido de nuevo
            </CardTitle>
            <CardDescription>
              Ingresa a tu cuenta para continuar
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive">
                <AlertCircle size={18} className="shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" size="lg" className="w-full cursor-pointer">
                Ingresar
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-3">
            <div className="flex w-full items-center justify-between text-sm">
              <Link
                to="/forgot-password"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                ¿Olvidaste tu contraseña?
              </Link>
              <Link
                to="/selection"
                className="font-medium text-brand-accent transition-colors hover:text-brand-accent-light"
              >
                Regístrate
              </Link>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground text-center">
              Protegemos tu información con cifrado y controles de acceso.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
