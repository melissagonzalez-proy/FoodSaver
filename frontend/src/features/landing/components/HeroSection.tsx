import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  MapPin,
  Clock,
  HeartHandshake,
  Store,
  ShieldCheck,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
    <section ref={sectionRef}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-4">
        <div
          ref={heroCardRef}
          className="bg-brand-card border border-brand-border rounded-4xl lg:rounded-[2.5rem] p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden min-h-100 lg:min-h-125"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-brand-accent/10 to-transparent pointer-events-none" />
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-semibold text-brand-text mb-6 tracking-tight font-jakarta leading-[1.1] text-balance">
            Menos desperdicio, <br />
            <span className="text-brand-accent">más solidaridad.</span>
          </h1>
          <p className="text-base lg:text-lg text-brand-muted max-w-xl mb-8 lg:mb-10 leading-relaxed">
            Conectamos hogares y establecimientos comerciales de Antioquia que
            tienen alimentos excedentes aptos para el consumo, con personas que
            los necesitan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 px-6 lg:px-8 py-3.5 lg:py-4 text-base lg:text-lg font-medium bg-brand-accent text-white rounded-full hover:bg-brand-accent-light transition-all shadow-[0_0_40px_rgba(255,0,85,0.2)]"
            >
              Unirme a la red <ArrowRight size={20} />
            </Link>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 px-6 lg:px-8 py-3.5 lg:py-4 text-base lg:text-lg font-medium border border-brand-border text-brand-text rounded-full hover:bg-brand-border transition-colors"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        <div
          ref={imageCardRef}
          className="relative rounded-4xl lg:rounded-[2.5rem] overflow-hidden min-h-75 lg:min-h-100 border border-brand-border group"
        >
          <img
            src="/01.jpg"
            alt="Vegetales frescos"
            className="absolute w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-linear-to-t from-brand-background via-brand-background/20 to-transparent" />
          <div className="absolute bottom-6 lg:bottom-8 left-6 lg:left-8 right-6 lg:right-8">
            <div className="inline-flex items-center gap-2 bg-brand-background/80 backdrop-blur-md border border-brand-border px-4 py-2 rounded-full text-brand-text text-sm font-medium mb-3">
              <MapPin size={16} className="text-brand-accent" /> Giraldo y
              Medellín
            </div>
            <p className="text-lg lg:text-xl text-brand-text font-medium font-jakarta">
              Rescatando alimentos frescos todos los días.
            </p>
          </div>
        </div>
      </div>

      <div
        ref={featureCardsRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-6 lg:mt-8"
      >
        <div className="md:col-span-2 bg-brand-card border border-brand-border rounded-4xl lg:rounded-[2.5rem] p-8 lg:p-10 flex flex-col md:flex-row gap-6 lg:gap-8 items-center hover:border-brand-accent/50 transition-colors group">
          <div className="flex-1">
            <div className="w-12 lg:w-14 h-12 lg:h-14 bg-brand-background border border-brand-border text-brand-text rounded-full flex items-center justify-center mb-4 lg:mb-6 group-hover:text-brand-accent transition-colors">
              <Clock size={24} />
            </div>
            <h3 className="text-2xl lg:text-3xl font-medium text-brand-text mb-3 lg:mb-4 font-jakarta">
              Acción Rápida
            </h3>
            <p className="text-brand-muted leading-relaxed text-base lg:text-lg">
              La logística de recolección es vital. Publica alimentos excedentes
              en menos de 5 clics. Nuestro objetivo es que el 90% de los
              productos sean recolectados antes de su expiración.
            </p>
          </div>
          <div className="flex-1 w-full h-48 md:h-full min-h-45 rounded-2xl overflow-hidden border border-brand-border relative">
            <img
              src="/02.jpg"
              alt="Supermercado de Alimentos"
              className="absolute w-full h-full object-cover opacity-80"
            />
          </div>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-4xl lg:rounded-[2.5rem] p-8 lg:p-10 flex flex-col items-start hover:border-brand-accent/50 transition-colors group">
          <div className="w-12 lg:w-14 h-12 lg:h-14 bg-brand-background border border-brand-border text-brand-text rounded-full flex items-center justify-center mb-4 lg:mb-6 group-hover:text-brand-accent transition-colors">
            <HeartHandshake size={24} />
          </div>
          <h3 className="text-xl lg:text-2xl font-medium text-brand-text mb-3 lg:mb-4 font-jakarta">
            Conexión Directa
          </h3>
          <p className="text-brand-muted leading-relaxed">
            Conectamos donadores con beneficiarios de manera eficiente,
            optimizando las notificaciones en tiempo real para agilizar las
            entregas.
          </p>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-4xl lg:rounded-[2.5rem] p-8 lg:p-10 flex flex-col items-start hover:border-brand-accent/50 transition-colors group">
          <div className="w-12 lg:w-14 h-12 lg:h-14 bg-brand-background border border-brand-border text-brand-text rounded-full flex items-center justify-center mb-4 lg:mb-6 group-hover:text-brand-accent transition-colors">
            <Store size={24} />
          </div>
          <h3 className="text-xl lg:text-2xl font-medium text-brand-text mb-3 lg:mb-4 font-jakarta">
            Comercio Local
          </h3>
          <p className="text-brand-muted leading-relaxed">
            Buscamos vincular establecimientos locales a la plataforma de manera
            constante para asegurar un flujo estable de donaciones.
          </p>
        </div>

        <div className="md:col-span-2 bg-brand-card border border-brand-border rounded-4xl lg:rounded-[2.5rem] p-8 lg:p-10 flex flex-col items-start hover:border-brand-accent/50 transition-colors group">
          <div className="w-12 lg:w-14 h-12 lg:h-14 bg-brand-background border border-brand-border text-brand-text rounded-full flex items-center justify-center mb-4 lg:mb-6 group-hover:text-brand-accent transition-colors">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-2xl lg:text-3xl font-medium text-brand-text mb-3 lg:mb-4 font-jakarta">
            Transparencia Total
          </h3>
          <p className="text-brand-muted leading-relaxed text-base lg:text-lg max-w-2xl">
            Nuestra plataforma cuenta con un sistema de reportes automáticos que
            cuantifica el volumen de alimentos rescatados y las familias
            beneficiadas, generando datos de valor para instituciones y aliados.
          </p>
        </div>
      </div>
    </section>
  );
}
