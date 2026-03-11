import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  UtensilsCrossed,
  Home,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const partners = [
  {
    icon: Building2,
    title: "Supermercados",
    description:
      "Grandes cadenas y tiendas locales que donan productos próximos a vencer pero en perfecto estado.",
    benefits: [
      "Reducción de pérdidas",
      "Beneficio fiscal",
      "Imagen responsable",
    ],
    count: 45,
  },
  {
    icon: UtensilsCrossed,
    title: "Restaurantes",
    description:
      "Establecimientos gastronómicos que comparten sus excedentes diarios con quienes más lo necesitan.",
    benefits: ["Cero desperdicio", "Impacto social", "Comunidad conectada"],
    count: 62,
  },
  {
    icon: Home,
    title: "Hogares",
    description:
      "Familias comprometidas que donan alimentos antes de que se desperdicien en sus hogares.",
    benefits: ["Ayuda a vecinos", "Consumo consciente", "Red solidaria"],
    count: 234,
  },
];

export function CommunitySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 85%",
            once: true,
          },
        },
      );

      gsap.fromTo(
        cardsRef.current?.children || [],
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 80%",
            once: true,
          },
        },
      );

      gsap.fromTo(
        ctaRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 85%",
            once: true, // Optimización de rendimiento
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="comunidad" className="pt-20 lg:pt-32">
      <div ref={titleRef} className="text-center mb-12 lg:mb-16">
        <span className="inline-block px-4 py-1.5 bg-brand-accent/10 text-brand-accent rounded-full text-sm font-medium mb-4">
          Nuestra Red
        </span>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-brand-text font-jakarta mb-4 text-balance">
          Comunidad y Alianzas
        </h2>
        <p className="text-brand-muted text-base lg:text-lg max-w-2xl mx-auto">
          Una red diversa de colaboradores comprometidos con la reducción del
          desperdicio alimentario en nuestra región.
        </p>
      </div>

      <div
        ref={cardsRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-12 lg:mb-16"
      >
        {partners.map((partner) => (
          <div
            key={partner.title}
            className="bg-brand-card border border-brand-border rounded-2xl lg:rounded-3xl p-8 hover:border-brand-accent/50 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-brand-accent/5 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-brand-background border border-brand-border text-brand-text rounded-2xl flex items-center justify-center group-hover:text-brand-accent group-hover:border-brand-accent/50 transition-colors">
                <partner.icon size={26} />
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-brand-accent font-jakarta">
                  {partner.count}
                </span>
                <p className="text-xs text-brand-muted">activos</p>
              </div>
            </div>

            <h3 className="text-xl lg:text-2xl font-medium text-brand-text font-jakarta mb-3">
              {partner.title}
            </h3>
            <p className="text-brand-muted text-sm leading-relaxed mb-6">
              {partner.description}
            </p>

            <div className="space-y-2">
              {partner.benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-2 text-sm text-brand-muted"
                >
                  <CheckCircle2 size={16} className="text-brand-accent" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        ref={ctaRef}
        className="bg-linear-to-br from-brand-card to-brand-background border border-brand-border rounded-2xl lg:rounded-3xl p-8 lg:p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-brand-accent/5 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-brand-text font-jakarta mb-4 text-balance">
              ¿Tienes un establecimiento?
            </h3>
            <p className="text-brand-muted text-base lg:text-lg max-w-xl">
              Únete a nuestra red de donadores y contribuye a reducir el
              desperdicio alimentario mientras generas un impacto positivo en tu
              comunidad.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/selection"
              className="flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium bg-brand-accent text-white rounded-full hover:bg-brand-accent-light transition-all shadow-[0_0_40px_rgba(255,0,85,0.2)]"
            >
              Registrar mi negocio <ArrowRight size={20} />
            </Link>
            <a
              href="#como-funciona"
              className="flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium border border-brand-border text-brand-text rounded-full hover:bg-brand-border transition-colors"
            >
              Saber más
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
