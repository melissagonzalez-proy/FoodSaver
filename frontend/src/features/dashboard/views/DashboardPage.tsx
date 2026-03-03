import { useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, HeartHandshake, Package } from "lucide-react";

export const DashboardPage = () => {
  const navigate = useNavigate();

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : { nombres: "Usuario" };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-brand-background font-sans text-brand-text flex">
      <aside className="w-64 border-r border-brand-border bg-brand-background p-6 flex flex-col h-screen sticky top-0">
        <div className="flex items-center gap-2 text-brand-accent mb-12">
          <HeartHandshake size={28} />
          <span className="text-2xl font-bold tracking-tight font-jakarta">
            FoodSaver
          </span>
        </div>

        <nav className="flex flex-col gap-4 flex-1">
          <button className="flex items-center gap-3 text-brand-text bg-brand-card border border-brand-border px-4 py-3 rounded-xl transition-colors">
            <LayoutDashboard size={20} className="text-brand-accent" />
            <span className="font-medium">Inicio</span>
          </button>
          <button className="flex items-center gap-3 text-brand-muted hover:text-brand-text px-4 py-3 rounded-xl transition-colors">
            <Package size={20} />
            <span className="font-medium">Publicaciones</span>
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-brand-muted hover:text-red-500 mt-auto px-4 py-3 rounded-xl transition-colors group"
        >
          <LogOut
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </aside>

      <main className="flex-1 p-10">
        <header className="mb-10">
          <h1 className="text-4xl font-semibold font-jakarta mb-2">
            Hola, <span className="text-brand-accent">{user.nombres}</span>
          </h1>
          <p className="text-brand-muted">
            Bienvenido a tu panel de control de FoodSaver.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-brand-card border border-brand-border rounded-4xl p-8 flex flex-col justify-center min-h-50">
            <h3 className="text-xl font-medium mb-2 font-jakarta">
              Tu Impacto
            </h3>
            <p className="text-brand-muted">
              Aquí mostraremos los kilogramos de alimentos que has ayudado a
              rescatar.
            </p>
          </div>

          <div className="bg-brand-card border border-brand-border rounded-4xl p-8 flex flex-col justify-center min-h-50">
            <h3 className="text-xl font-medium mb-2 font-jakarta">
              Actividad Reciente
            </h3>
            <p className="text-brand-muted">
              Aún no tienes publicaciones ni solicitudes activas.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
