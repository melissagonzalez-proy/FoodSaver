import { Navbar } from "../components/NavBar";
import { ArrowRight, HeartHandshake, ShieldCheck, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-brand-background pt-28 pb-12 font-sans selection:bg-brand-accent selection:text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 flex flex-col gap-6">
        <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-12 md:p-24 flex flex-col items-center text-center relative overflow-hidden">
          <h1 className="text-5xl md:text-7xl font-semibold text-brand-text mb-6 tracking-tight font-jakarta">
            Menos desperdicio, <br />
            <span className="text-brand-accent">más solidaridad.</span>
          </h1>
          <p className="text-lg text-brand-muted max-w-2xl mx-auto mb-12 leading-relaxed">
            Conectamos hogares y establecimientos comerciales que tienen
            alimentos excedentes aptos para el consumo humano, con personas que
            los necesitan. Únete a nuestra red de economía colaborativa.
          </p>
          <Link
            to="/register"
            className="flex items-center gap-2 px-8 py-4 text-lg font-medium bg-brand-accent text-white rounded-full hover:bg-brand-accent-light transition-all shadow-[0_0_40px_rgba(255,0,85,0.2)]"
          >
            Quiero ser parte <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-10 flex flex-col items-start hover:border-brand-accent/50 transition-colors group">
            <div className="w-14 h-14 bg-brand-background border border-brand-border text-brand-text rounded-full flex items-center justify-center mb-8 group-hover:text-brand-accent transition-colors">
              <Clock size={28} />
            </div>
            <h3 className="text-2xl font-medium text-brand-text mb-4 font-jakarta">
              Acción Rápida
            </h3>
            <p className="text-brand-muted leading-relaxed">
              Publica alimentos excedentes en menos de 5 clics antes de su
              vencimiento.
            </p>
          </div>

          <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-10 flex flex-col items-start hover:border-brand-accent/50 transition-colors group">
            <div className="w-14 h-14 bg-brand-background border border-brand-border text-brand-text rounded-full flex items-center justify-center mb-8 group-hover:text-brand-accent transition-colors">
              <HeartHandshake size={28} />
            </div>
            <h3 className="text-2xl font-medium text-brand-text mb-4 font-jakarta">
              Conexión Directa
            </h3>
            <p className="text-brand-muted leading-relaxed">
              Conectamos donadores con beneficiarios de manera eficiente en
              entornos urbanos.
            </p>
          </div>

          <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-10 flex flex-col items-start hover:border-brand-accent/50 transition-colors group">
            <div className="w-14 h-14 bg-brand-background border border-brand-border text-brand-text rounded-full flex items-center justify-center mb-8 group-hover:text-brand-accent transition-colors">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-2xl font-medium text-brand-text mb-4 font-jakarta">
              Transparencia
            </h3>
            <p className="text-brand-muted leading-relaxed">
              Métricas en tiempo real del impacto social y ambiental generado
              por la comunidad.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
