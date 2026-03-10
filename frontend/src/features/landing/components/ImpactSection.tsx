import { useEffect, useRef, useState } from "react";
import { Leaf, Recycle, Users, TrendingUp } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const metrics = [
  {
    icon: Leaf,
    value: 12450,
    suffix: "kg",
    label: "Alimentos Rescatados",
    description: "Comida salvada del desperdicio",
  },
  {
    icon: TrendingUp,
    value: 94,
    suffix: "%",
    label: "Tasa de Éxito",
    description: "Recolectados antes de vencer",
  },
  {
    icon: Users,
    value: 3200,
    suffix: "+",
    label: "Familias Beneficiadas",
    description: "Hogares que reciben apoyo",
  },
  {
    icon: Recycle,
    value: 8.5,
    suffix: "t",
    label: "CO₂ Evitado",
    description: "Toneladas de emisiones reducidas",
  },
];

function AnimatedCounter({
  value,
  suffix,
  shouldAnimate,
}: {
  value: number;
  suffix: string;
  shouldAnimate: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldAnimate) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current * 10) / 10);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, shouldAnimate]);

  const displayValue = Number.isInteger(value)
    ? Math.floor(count).toLocaleString()
    : count.toFixed(1);

  return (
    <span>
      {displayValue}
      {suffix}
    </span>
  );
}

export function ImpactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const bentoRef = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

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

      ScrollTrigger.create({
        trigger: metricsRef.current,
        start: "top 80%",
        once: true,
        onEnter: () => setShouldAnimate(true),
      });

      gsap.fromTo(
        metricsRef.current?.children || [],
        { y: 30, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: metricsRef.current,
            start: "top 80%",
            once: true,
          },
        },
      );

      gsap.fromTo(
        bentoRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: bentoRef.current,
            start: "top 85%",
            once: true,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="impacto" className="pt-20 lg:pt-32">
      <div ref={titleRef} className="text-center mb-12 lg:mb-16">
        <span className="inline-block px-4 py-1.5 bg-brand-accent/10 text-brand-accent rounded-full text-sm font-medium mb-4">
          Nuestro Impacto
        </span>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-brand-text font-jakarta mb-4 text-balance">
          Reduciendo la huella ecológica
        </h2>
        <p className="text-brand-muted text-base lg:text-lg max-w-2xl mx-auto">
          Cada alimento rescatado es un paso hacia un futuro más sostenible.
          Mira el impacto que juntos estamos generando.
        </p>
      </div>

      <div
        ref={metricsRef}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8"
      >
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="bg-brand-card border border-brand-border rounded-2xl lg:rounded-3xl p-6 lg:p-8 text-center hover:border-brand-accent/50 transition-colors group"
          >
            <div className="w-12 h-12 bg-brand-accent/10 text-brand-accent rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-accent group-hover:text-white transition-colors">
              <metric.icon size={22} />
            </div>
            <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-text font-jakarta mb-2">
              <AnimatedCounter
                value={metric.value}
                suffix={metric.suffix}
                shouldAnimate={shouldAnimate}
              />
            </div>
            <h4 className="text-sm lg:text-base font-medium text-brand-text mb-1">
              {metric.label}
            </h4>
            <p className="text-xs lg:text-sm text-brand-muted">
              {metric.description}
            </p>
          </div>
        ))}
      </div>

      <div
        ref={bentoRef}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6"
      >
        <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-2xl lg:rounded-3xl p-8 lg:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-brand-accent/10 to-transparent rounded-full blur-3xl" />
          <h3 className="text-2xl lg:text-3xl font-medium text-brand-text font-jakarta mb-4 relative z-10">
            Objetivo 2026
          </h3>
          <p className="text-brand-muted leading-relaxed max-w-xl mb-6 relative z-10">
            Nuestra meta es rescatar más de{" "}
            <span className="text-brand-accent font-semibold">
              50,000 kilogramos
            </span>{" "}
            de alimentos y reducir significativamente las emisiones de CO₂ en la
            región de Antioquia. Cada donación cuenta.
          </p>
          <div className="flex items-center gap-4 relative z-10">
            <div className="flex-1 h-3 bg-brand-border rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-brand-accent to-brand-accent-light rounded-full"
                style={{ width: "25%" }}
              />
            </div>
            <span className="text-brand-text font-medium">25%</span>
          </div>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-2xl lg:rounded-3xl p-8 lg:p-10 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-brand-accent/10 text-brand-accent rounded-xl flex items-center justify-center mb-4">
              <Recycle size={22} />
            </div>
            <h3 className="text-xl lg:text-2xl font-medium text-brand-text font-jakarta mb-3">
              Economía Circular
            </h3>
            <p className="text-brand-muted text-sm leading-relaxed">
              Transformamos excedentes en oportunidades, creando un ciclo
              virtuoso que beneficia a toda la comunidad y reduce el impacto
              ambiental.
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-brand-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-brand-muted">Establecimientos activos</span>
              <span className="text-brand-text font-medium">127</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
