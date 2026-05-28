import { useEffect, useRef } from "react";
import {
  Upload,
  Bell,
  MapPinned,
  HandHeart,
  Search,
  CalendarCheck,
  Navigation,
  Package,
  type LucideIcon,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Card } from "@/components/ui/card";

gsap.registerPlugin(ScrollTrigger);

type Step = { icon: LucideIcon; title: string; description: string };

const donorSteps: Step[] = [
  {
    icon: Upload,
    title: "Publica tu excedente",
    description:
      "Sube los alimentos disponibles con fotos, cantidad y fecha de vencimiento en segundos.",
  },
  {
    icon: Bell,
    title: "Recibe confirmación",
    description:
      "Te notificamos cuando un beneficiario reserve tu donación para recolección.",
  },
  {
    icon: MapPinned,
    title: "Coordina entrega",
    description:
      "El beneficiario acuerda contigo el horario de recolección más conveniente.",
  },
  {
    icon: HandHeart,
    title: "Entrega solidaria",
    description:
      "Entrega los alimentos y recibe tu certificado de donación automáticamente.",
  },
];

const beneficiarySteps: Step[] = [
  {
    icon: Search,
    title: "Explora donaciones",
    description:
      "Navega por el mapa interactivo y encuentra alimentos disponibles cerca de ti.",
  },
  {
    icon: CalendarCheck,
    title: "Reserva tu pedido",
    description:
      "Selecciona los productos que necesitas y reserva antes de que expiren.",
  },
  {
    icon: Navigation,
    title: "Dirígete al punto",
    description:
      "Recibe indicaciones precisas para llegar al establecimiento donador.",
  },
  {
    icon: Package,
    title: "Recoge tus alimentos",
    description:
      "Presenta tu código de reserva y recibe los alimentos en perfecto estado.",
  },
];

function StepsGroup({
  title,
  icon: HeaderIcon,
  steps,
  groupRef,
  headingId,
}: {
  title: string;
  icon: LucideIcon;
  steps: Step[];
  groupRef: React.Ref<HTMLOListElement>;
  headingId: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6 lg:mb-8">
        <div className="w-10 h-10 bg-brand-accent rounded-full flex items-center justify-center shrink-0">
          <HeaderIcon size={18} className="text-white" aria-hidden="true" />
        </div>
        <h3
          id={headingId}
          className="text-xl lg:text-2xl font-medium text-brand-text font-jakarta"
        >
          {title}
        </h3>
      </div>

      <ol
        ref={groupRef}
        aria-labelledby={headingId}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 list-none p-0"
      >
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <li key={step.title}>
              <Card className="h-full bg-brand-card border-brand-border rounded-2xl lg:rounded-3xl p-6 lg:p-8 hover:border-brand-accent/50 transition-colors group relative overflow-hidden shadow-none">
                <span
                  aria-hidden="true"
                  className="absolute top-4 right-4 text-5xl lg:text-6xl font-bold text-brand-border/60 font-jakarta leading-none"
                >
                  {index + 1}
                </span>
                <div className="w-12 h-12 bg-brand-background border border-brand-border text-brand-text rounded-xl flex items-center justify-center mb-4 group-hover:text-brand-accent group-hover:border-brand-accent/50 transition-colors">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <h4 className="text-base sm:text-lg font-medium text-brand-text mb-2 font-jakarta">
                  <span className="sr-only">Paso {index + 1}: </span>
                  {step.title}
                </h4>
                <p className="text-brand-muted text-sm leading-relaxed">
                  {step.description}
                </p>
              </Card>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const donorCardsRef = useRef<HTMLOListElement>(null);
  const beneficiaryCardsRef = useRef<HTMLOListElement>(null);

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
        donorCardsRef.current?.children || [],
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: donorCardsRef.current,
            start: "top 80%",
            once: true,
          },
        },
      );

      gsap.fromTo(
        beneficiaryCardsRef.current?.children || [],
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: beneficiaryCardsRef.current,
            start: "top 80%",
            once: true,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="como-funciona"
      aria-labelledby="hiw-title"
      className="pt-20 lg:pt-32 scroll-mt-24"
    >
      <div ref={titleRef} className="text-center mb-12 lg:mb-16">
        <span className="inline-block px-4 py-1.5 bg-brand-accent/10 text-brand-accent rounded-full text-sm font-medium mb-4">
          Proceso Simple
        </span>
        <h2
          id="hiw-title"
          className="text-3xl md:text-4xl lg:text-5xl font-semibold text-brand-text font-jakarta mb-4 text-balance"
        >
          ¿Cómo funciona FoodSaver?
        </h2>
        <p className="text-brand-muted text-base lg:text-lg max-w-2xl mx-auto">
          Un proceso sencillo tanto para donadores como para beneficiarios,
          diseñado para maximizar el rescate de alimentos.
        </p>
      </div>

      <div className="mb-12 lg:mb-16">
        <StepsGroup
          title="Para Donadores"
          icon={Upload}
          steps={donorSteps}
          groupRef={donorCardsRef}
          headingId="hiw-donors"
        />
      </div>

      <StepsGroup
        title="Para Beneficiarios"
        icon={HandHeart}
        steps={beneficiarySteps}
        groupRef={beneficiaryCardsRef}
        headingId="hiw-beneficiaries"
      />
    </section>
  );
}
