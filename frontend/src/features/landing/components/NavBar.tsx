import { useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, Menu, X } from "lucide-react";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-brand-background/80 backdrop-blur-md border-b border-brand-border px-4 md:px-8 py-4 flex justify-between items-center fixed top-0 z-50">
      <div className="flex items-center gap-2 text-brand-accent">
        <Leaf size={28} />
        <span className="text-xl md:text-2xl font-bold tracking-tight text-brand-text font-jakarta">
          FoodSaver
        </span>
      </div>

      <div className="hidden md:flex gap-6 items-center">
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

      <button
        className="md:hidden text-brand-text p-1 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Alternar menú"
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-brand-background/95 backdrop-blur-xl border-b border-brand-border flex flex-col items-center py-8 gap-6 md:hidden shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <Link
            to="/login"
            className="text-lg font-medium text-brand-muted hover:text-brand-text transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Iniciar Sesión
          </Link>
          <Link
            to="/register"
            className="w-10/12 text-center py-3 text-lg font-medium bg-brand-text text-brand-background rounded-full hover:bg-brand-muted transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Crear Cuenta
          </Link>
        </div>
      )}
    </nav>
  );
};
