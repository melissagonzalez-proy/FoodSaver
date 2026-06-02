import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Leaf, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
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

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback({ type: null, message: "" });

    try {
      const response = await axios.post(apiUrl("/api/auth/forgot-password"), {
        email,
      });
      setFeedback({ type: "success", message: response.data.message });
      setEmail("");
    } catch (error: any) {
      setFeedback({
        type: "error",
        message:
          error.response?.data?.message ||
          "Hubo un error al intentar enviar el correo.",
      });
    } finally {
      setIsLoading(false);
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
              Recuperar cuenta
            </CardTitle>
            <CardDescription>
              Ingresa tu correo y te enviaremos un enlace para restablecer tu
              contraseña.
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                  disabled={feedback.type === "success"}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isLoading || !email || feedback.type === "success"}
              >
                {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft size={16} />
              Volver a iniciar sesión
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
