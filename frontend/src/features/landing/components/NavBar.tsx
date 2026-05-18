import { Leaf, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      aria-label="Navegación principal"
      className="w-full bg-brand-background/80 backdrop-blur-md border-b border-brand-border px-4 md:px-8 py-3 md:py-4 flex justify-between items-center fixed top-0 z-50"
    >
      <Link
        to="/"
        className="flex items-center gap-2 text-brand-accent rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-background"
        aria-label="FoodSaver - Ir al inicio"
      >
        <Leaf size={28} aria-hidden="true" />
        <span className="text-xl md:text-2xl font-bold tracking-tight text-brand-text font-jakarta">
          FoodSaver
        </span>
      </Link>

      <div className="hidden md:flex gap-2 items-center">
        <Button
          asChild
          variant="ghost"
          className="rounded-full text-brand-muted hover:text-brand-text hover:bg-brand-border/50"
        >
          <Link to="/login">Iniciar Sesión</Link>
        </Button>
        <Button
          asChild
          className="rounded-full bg-brand-text text-brand-background hover:bg-brand-muted px-5"
        >
          <Link to="/selection">Crear Cuenta</Link>
        </Button>
      </div>

      <button
        type="button"
        className="md:hidden text-brand-text p-2 -mr-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent min-h-11 min-w-11 inline-flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        {isOpen ? <X size={28} aria-hidden="true" /> : <Menu size={28} aria-hidden="true" />}
      </button>

      {isOpen && (
        <div
          id="mobile-menu"
          role="menu"
          className="absolute top-full left-0 w-full bg-brand-background/95 backdrop-blur-xl border-b border-brand-border flex flex-col items-center py-8 gap-4 md:hidden shadow-2xl animate-in slide-in-from-top-2 duration-200"
        >
          <Link
            to="/login"
            role="menuitem"
            className="text-lg font-medium text-brand-muted hover:text-brand-text transition-colors py-2 px-4 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            onClick={() => setIsOpen(false)}
          >
            Iniciar Sesión
          </Link>
          <Button
            asChild
            className="w-10/12 h-12 rounded-full bg-brand-text text-brand-background hover:bg-brand-muted text-base"
          >
            <Link to="/register" role="menuitem" onClick={() => setIsOpen(false)}>
              Crear Cuenta
            </Link>
          </Button>
        </div>
      )}
    </nav>
  );
};
