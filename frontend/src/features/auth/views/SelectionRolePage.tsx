import { Leaf, HeartHandshake, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SelectionRolePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-background flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-4xl">
        <div className="rounded-4xl shadow-2xl border border-brand-border bg-brand-card p-10 text-center">
          <div className="flex flex-col items-center gap-4 mb-8">
            <Leaf className="w-12 h-12 text-brand-accent" />
            <h1 className="text-4xl md:text-5xl font-bold text-brand-text font-jakarta tracking-tight">
              Bienvenido a FoodSaver
            </h1>
            <p className="text-lg text-brand-muted max-w-2xl">
              Conectamos personas que desean donar alimentos con quienes los
              necesitan. Juntos reducimos el desperdicio y construimos una
              comunidad más solidaria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <div
              className="border border-brand-border rounded-2xl p-8 bg-brand-background shadow-md hover:border-brand-accent/50 transition-all cursor-pointer group flex flex-col h-full"
              onClick={() => navigate("/register-donor")}
            >
              <HeartHandshake className="w-12 h-12 text-brand-text group-hover:text-brand-accent mx-auto mb-4 transition-colors" />
              <h2 className="text-2xl font-bold text-brand-text mb-3 font-jakarta">
                Quiero ser Donador
              </h2>
              <p className="text-brand-muted mb-6 flex-1">
                Publica tus excedentes de comida y ayuda a personas en situación
                vulnerable.
              </p>
              <button className="w-full py-3 text-lg rounded-xl bg-brand-accent text-white font-semibold hover:bg-brand-accent-light transition-all shadow-[0_0_20px_rgba(255,0,85,0.15)]">
                Continuar como Donador
              </button>
            </div>

            <div
              className="border border-brand-border rounded-2xl p-8 bg-brand-background shadow-md hover:border-brand-accent/50 transition-all cursor-pointer group flex flex-col h-full"
              onClick={() => navigate("/register-beneficiary")}
            >
              <ShoppingBag className="w-12 h-12 text-brand-text group-hover:text-brand-accent mx-auto mb-4 transition-colors" />
              <h2 className="text-2xl font-bold text-brand-text mb-3 font-jakarta">
                Quiero ser Beneficiario
              </h2>
              <p className="text-brand-muted mb-6 flex-1">
                Solicita alimentos disponibles cerca de ti de manera sencilla y
                segura.
              </p>
              <button className="w-full py-3 text-lg rounded-xl border-2 border-brand-accent text-brand-text font-semibold group-hover:bg-brand-accent group-hover:text-white transition-all">
                Continuar como Beneficiario
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
