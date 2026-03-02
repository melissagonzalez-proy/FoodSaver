import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="w-full bg-brand-background/80 backdrop-blur-md border-b border-brand-border px-8 py-5 flex justify-between items-center fixed top-0 z-50">
      <div className="flex items-center gap-2 text-brand-accent">
        <Leaf size={28} />
        <span className="text-2xl font-bold tracking-tight text-brand-text font-jakarta">
          FoodSaver
        </span>
      </div>

      <div className="flex gap-6 items-center">
        <Link
          to="/login"
          className="text-sm font-medium text-brand-muted hover:text-brand-text transition-colors"
        >
          Iniciar Sesión
        </Link>
        <Link
          to="/register"
          className="px-5 py-2 text-sm font-medium bg-brand-text text-brand-background rounded-full hover:bg-brand-muted transition-colors"
        >
          Crear Cuenta
        </Link>
      </div>
    </nav>
  );
};
