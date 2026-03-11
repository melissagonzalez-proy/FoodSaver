import { Leaf, HeartHandshake } from "lucide-react";

export default function RoleSelectionPage() {
    const goToDonorRegister = () => {
    window.location.href = "/register-donor";
    };

    const goToBeneficiaryRegister = () => {
    window.location.href = "/register-beneficiary";
    };

    return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-6">
        <div className="w-full max-w-4xl ">
        <div className="rounded-2xl shadow-2xl border border-brand-border bg-brand-card p-10 text-center">
            <div className="flex flex-col items-center gap-4 mb-8">
            <Leaf className="w-12 h-12 text-brand-accent" />
            <h1 className="text-4xl font-bold text-brand-text">
                Bienvenido a FoodSaver
            </h1>
            <p className="text-lg text-brand-muted max-w-2xl">
                Conectamos personas que desean donar alimentos con quienes los necesitan.
                Juntos reducimos el desperdicio y construimos una comunidad más solidaria.
            </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">

            {/* Donante */}
            <div className="border border-gray-800 rounded-2xl p-8 bg-darkCard shadow-md hover:scale-105 transition-transform">
                <HeartHandshake className="w-10 h-10 text-brand-accent mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-brand-text mb-3">
                Quiero ser Donante
                </h2>
                <p className="text-lg text-brand-muted mb-6">
                Publica tus excedentes de comida y ayuda a personas en situación vulnerable.
                </p>

                <button
                className="border-2 border-brand-accent w-full py-3 text-lg rounded-xl bg-primary text-white font-semibold hover:bg-brand-accent transition-all shadow-[0_0_40px_rgba(255,0,85,0.2)]"
                onClick={goToDonorRegister}
                >
                Continuar como Donante
                </button>
            </div>

            {/* Beneficiario */}
            <div className="border border-gray-800 rounded-2xl p-8 bg-darkCard shadow-md hover:scale-105 transition-transform">
                <HeartHandshake className="w-10 h-10 text-brand-accent mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-brand-text mb-3">
                Quiero ser Beneficiario
                </h2>
                <p className="text-lg text-brand-muted mb-6">
                Solicita alimentos disponibles cerca de ti de manera sencilla y segura.
                </p>

                <button
                className="border-2 border-brand-accent w-full py-3 text-lg rounded-xl bg-primary text-white font-semibold hover:bg-brand-accent transition-all shadow-[0_0_40px_rgba(255,0,85,0.2)]"
                onClick={goToBeneficiaryRegister}
                >
                Continuar como Beneficiario
                </button>
            </div>

            </div>
        </div>
        </div>
    </div>
    );
}
