import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Leaf, Lock, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

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
        `http://localhost:5000/api/auth/reset-password/${token}`,
        {
          newPassword: password,
        },
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
    <div className="min-h-screen bg-brand-background flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-brand-accent/20 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md bg-brand-card border border-brand-border rounded-4xl p-8 shadow-2xl z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-brand-accent/10 rounded-2xl flex items-center justify-center mb-4 border border-brand-accent/20">
            <Leaf size={32} className="text-brand-accent" />
          </div>
          <h1 className="text-2xl font-bold text-brand-text font-jakarta">
            Nueva Contraseña
          </h1>
          <p className="text-brand-muted text-center mt-2 text-sm">
            Ingresa tu nueva contraseña para acceder a FoodSaver.
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

        {feedback.type !== "success" ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="relative">
              <label className="text-sm font-semibold text-brand-text mb-1.5 block">
                Nueva Contraseña
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted"
                  size={20}
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-brand-background border border-brand-border rounded-xl pl-12 pr-4 py-3 text-brand-text focus:border-brand-accent outline-none transition-colors"
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-sm font-semibold text-brand-text mb-1.5 block">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted"
                  size={20}
                />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  className="w-full bg-brand-background border border-brand-border rounded-xl pl-12 pr-4 py-3 text-brand-text focus:border-brand-accent outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              className="w-full py-3 bg-brand-accent text-white rounded-xl font-medium hover:bg-brand-accent-light transition-all shadow-lg shadow-brand-accent/20 disabled:opacity-50 mt-2"
            >
              {isLoading ? "Guardando..." : "Guardar contraseña"}
            </button>
          </form>
        ) : (
          <div className="text-center mt-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-background border border-brand-border text-brand-text rounded-xl hover:border-brand-accent transition-colors font-medium"
            >
              Ir a Iniciar Sesión <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
