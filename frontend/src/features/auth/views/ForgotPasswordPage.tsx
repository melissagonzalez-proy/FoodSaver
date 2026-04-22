import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Leaf, Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

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
      const response = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email },
      );
      setFeedback({ type: "success", message: response.data.message });
      setEmail(""); // Limpiamos el campo
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
    <div className="min-h-screen bg-brand-background flex flex-col justify-center items-center p-6 font-sans relative overflow-hidden">
      {/* Círculos decorativos de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-accent/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-accent/10 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md bg-brand-card border border-brand-border rounded-4xl p-10 shadow-2xl z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-brand-accent/10 rounded-2xl flex items-center justify-center mb-4 border border-brand-accent/20">
            <Leaf size={32} className="text-brand-accent" />
          </div>
          <h1 className="text-2xl font-bold text-brand-text font-jakarta">
            Recuperar Cuenta
          </h1>
          <p className="text-brand-muted text-center mt-2 text-sm">
            Ingresa tu correo electrónico y te enviaremos un enlace para
            restablecer tu contraseña.
          </p>
        </div>

        {feedback.type && (
          <div
            className={`p-4 rounded-xl mb-6 flex items-start gap-3 text-sm ${feedback.type === "success" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}
          >
            {feedback.type === "success" ? (
              <CheckCircle size={20} className="shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
            )}
            <p>{feedback.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="relative">
            <label className="text-sm font-semibold text-brand-text mb-1.5 block">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted"
                size={20}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full bg-brand-background border border-brand-border rounded-xl pl-12 pr-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full py-4 text-lg bg-brand-accent text-white rounded-xl font-medium hover:bg-brand-accent-light transition-all shadow-[0_0_20px_rgba(255,0,85,0.15)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-text transition-colors"
          >
            <ArrowLeft size={16} /> Volver a Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
};
