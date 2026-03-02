import { useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Por favor, ingresa tu usuario y contraseña.");
      return;
    }

    // La llamada al backend para validar y recibir el JWT va aquí
    console.log("Intentando iniciar sesión con:", { username, password });
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

      <div className="w-full max-w-md bg-brand-card border border-brand-border rounded-4xl p-10 relative overflow-hidden shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-brand-text font-jakarta mb-2">
            Bienvenido
          </h1>
          <p className="text-brand-muted">Ingresa a tu cuenta para continuar</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-500">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="username"
              className="text-sm font-medium text-brand-muted ml-1"
            >
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
              placeholder="Ingresa tu usuario"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-brand-muted ml-1"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent transition-colors pr-12"
                placeholder="••••••••"
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

          <button
            type="submit"
            className="w-full mt-4 flex items-center justify-center gap-2 py-4 text-lg font-medium bg-brand-accent text-white rounded-xl hover:bg-brand-accent-light transition-all shadow-[0_0_20px_rgba(255,0,85,0.15)] group"
          >
            Ingresar
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-brand-muted">
            ¿No tienes una cuenta?{" "}
            <Link
              to="/register"
              className="text-brand-accent hover:text-brand-accent-light font-medium transition-colors"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
