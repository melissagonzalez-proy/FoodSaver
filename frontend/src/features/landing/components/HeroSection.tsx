import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  MapPin,
  Clock,
  HeartHandshake,
  Store,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

gsap.registerPlugin(ScrollTrigger);

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  wide?: boolean;
  image?: string;
  imageAlt?: string;
};

const features: Feature[] = [
  {
    icon: Clock,
    title: "Acción Rápida",
    description:
      "La logística de recolección es vital. Publica alimentos excedentes en menos de 5 clics. Nuestro objetivo es que el 90% de los productos sean recolectados antes de su expiración.",
    wide: true,
    image: "/02.jpg",
    imageAlt: "Supermercado de alimentos",
  },
  {
    icon: HeartHandshake,
    title: "Conexión Directa",
    description:
      "Conectamos donadores con beneficiarios de manera eficiente, optimizando las notificaciones en tiempo real para agilizar las entregas.",
  },
  {
    icon: Store,
    title: "Comercio Local",
    description:
      "Buscamos vincular establecimientos locales a la plataforma de manera constante para asegurar un flujo estable de donaciones.",
  },
  {
    icon: ShieldCheck,
    title: "Transparencia Total",
    description:
      "Nuestra plataforma cuenta con un sistema de reportes automáticos que cuantifica el volumen de alimentos rescatados y las familias beneficiadas, generando datos de valor para instituciones y aliados.",
    wide: true,
  },
];

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const heroCardRef = useRef<HTMLDivElement>(null);
  const imageCardRef = useRef<HTMLDivElement>(null);
  const featureCardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroCardRef.current,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out" },
      );

      gsap.fromTo(
        imageCardRef.current,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.4, ease: "power3.out" },
      );

      gsap.fromTo(
        featureCardsRef.current?.children || [],
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: featureCardsRef.current,
            start: "top 85%",
            once: true,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} aria-labelledby="hero-title">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-4">
        <Card
          ref={heroCardRef}
          className="bg-brand-card border-brand-border rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden min-h-96 lg:min-h-128 shadow-none"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-br from-brand-accent/10 to-transparent pointer-events-none"
          />
          <h1
            id="hero-title"
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-brand-text mb-6 tracking-tight font-jakarta leading-[1.1] text-balance relative"
          >
            Menos desperdicio, <br />
            <span className="text-brand-accent">más solidaridad.</span>
          </h1>
          <p className="text-base lg:text-lg text-brand-muted max-w-xl mb-8 lg:mb-10 leading-relaxed relative">
            Conectamos hogares y establecimientos comerciales de Antioquia que
            tienen alimentos excedentes aptos para el consumo, con personas que
            los necesitan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 relative">
            <Button
              size="lg"
              className="rounded-full h-12 lg:h-14 px-6 lg:px-8 text-base lg:text-lg bg-brand-accent text-white hover:bg-brand-accent-light shadow-(--shadow-brand-accent)"
            >
              <Link to="/selection">
                Unirme a la red <ArrowRight size={20} aria-hidden="true" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full h-12 lg:h-14 px-6 lg:px-8 text-base lg:text-lg border-brand-border text-brand-text hover:bg-brand-border/60 bg-transparent"
            >
              <Link to="/login">Ya tengo cuenta</Link>
            </Button>
          </div>
        </Card>

        <div
          ref={imageCardRef}
          className="relative rounded-3xl lg:rounded-[2.5rem] overflow-hidden min-h-72 lg:min-h-96 border border-brand-border group"
        >
          <img
            src="/01.jpg"
            alt="Vegetales frescos recién cosechados"
            loading="lazy"
            className="absolute w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-t from-brand-background via-brand-background/20 to-transparent"
          />
          <div className="absolute bottom-6 lg:bottom-8 left-6 lg:left-8 right-6 lg:right-8">
            <div className="inline-flex items-center gap-2 bg-brand-background/80 backdrop-blur-md border border-brand-border px-4 py-2 rounded-full text-brand-text text-sm font-medium mb-3">
              <MapPin size={16} className="text-brand-accent" aria-hidden="true" />
              <span>Yarumal, Giraldo, Apartado y Medellín</span>
            </div>
            <p className="text-lg lg:text-xl text-brand-text font-medium font-jakarta">
              Rescatando alimentos frescos todos los días.
            </p>
          </div>
        </div>
      </div>

      <div
        ref={featureCardsRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-6 lg:mt-8"
      >
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <Card
              key={f.title}
              className={`bg-brand-card border-brand-border rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 flex hover:border-brand-accent/50 transition-colors group shadow-none ${
                f.wide ? "md:col-span-2 flex-col md:flex-row gap-6 lg:gap-8 items-center" : "flex-col items-start"
              }`}
            >
              <div className="flex-1 w-full">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-brand-background border border-brand-border text-brand-text rounded-full flex items-center justify-center mb-4 lg:mb-6 group-hover:text-brand-accent group-hover:border-brand-accent/50 transition-colors">
                  <Icon size={24} aria-hidden="true" />
                </div>
                <h2
                  className={`font-medium text-brand-text mb-3 lg:mb-4 font-jakarta ${
                    f.wide ? "text-2xl lg:text-3xl" : "text-xl lg:text-2xl"
                  }`}
                >
                  {f.title}
                </h2>
                <p
                  className={`text-brand-muted leading-relaxed ${
                    f.wide ? "text-base lg:text-lg max-w-2xl" : "text-sm sm:text-base"
                  }`}
                >
                  {f.description}
                </p>
              </div>
              {f.image && (
                <div className="flex-1 w-full h-48 md:h-full min-h-48 rounded-2xl overflow-hidden border border-brand-border relative">
                  <img
                    src={f.image}
                    alt={f.imageAlt ?? ""}
                    loading="lazy"
                    className="absolute w-full h-full object-cover opacity-90"
                  />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
