import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Leaf, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { apiUrl } from "../../../lib/api";
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

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback({ type: null, message: "" });

    if (password !== confirmPassword) {
      setFeedback({ type: "error", message: "Las contraseñas no coinciden." });
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setFeedback({
        type: "error",
        message: "La contraseña debe tener al menos 6 caracteres.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        apiUrl(`/api/auth/reset-password/${token}`),
        { newPassword: password },
      );
      setFeedback({ type: "success", message: response.data.message });
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      setFeedback({
        type: "error",
        message:
          error.response?.data?.message ||
          "Hubo un error al restablecer la contraseña. El enlace puede haber expirado.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -right-24 h-64 w-64 rounded-full bg-brand-accent/10 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-brand-accent-light/10 blur-3xl" />
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
              Nueva contraseña
            </CardTitle>
            <CardDescription>
              Ingresa y confirma tu nueva contraseña para acceder a FoodSaver.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {feedback.type && (
              <div
                className={`mb-6 flex items-start gap-3 rounded-lg border px-3 py-2 text-sm ${
                  feedback.type === "success"
                    ? "border-green-500/30 bg-green-500/10 text-green-600"
                    : "border-destructive/30 bg-destructive/10 text-destructive"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle size={18} className="mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                )}
                <p className="font-medium">{feedback.message}</p>
              </div>
            )}

            {feedback.type !== "success" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nueva contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Confirmar contraseña
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    autoComplete="new-password"
                    className={
                      passwordsMismatch
                        ? "border-destructive focus-visible:ring-destructive/50"
                        : passwordsMatch
                        ? "border-green-500 focus-visible:ring-green-500/50"
                        : ""
                    }
                  />
                  {passwordsMismatch && (
                    <p className="text-xs text-destructive">
                      Las contraseñas no coinciden.
                    </p>
                  )}
                  {passwordsMatch && (
                    <p className="text-xs text-green-600">
                      Las contraseñas coinciden.
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isLoading || !password || !confirmPassword || passwordsMismatch}
                >
                  {isLoading ? "Guardando..." : "Guardar contraseña"}
                </Button>
              </form>
            ) : (
              <div className="flex justify-center">
                <Button asChild variant="outline" size="lg">
                  <Link to="/login">
                    Ir a iniciar sesión
                    <ArrowRight size={18} className="ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-xs text-muted-foreground text-center">
              Por seguridad, este enlace expira tras su primer uso.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
