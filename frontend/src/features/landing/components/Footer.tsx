import { useEffect, useRef } from "react";
import { Leaf, Instagram, Linkedin, Github, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

gsap.registerPlugin(ScrollTrigger);

const footerLinks = {
  plataforma: [
    { label: "Inicio", href: "/" },
    { label: "Cómo Funciona", href: "#como-funciona" },
    { label: "Impacto", href: "#impacto" },
    { label: "Comunidad", href: "#comunidad" },
  ],
  proyecto: [
    { label: "Acerca de", href: "#" },
    { label: "Repositorio GitHub", href: "#" },
    { label: "Documentación", href: "#" },
  ],
  legal: [
    { label: "Términos de Uso", href: "#" },
    { label: "Privacidad", href: "#" },
  ],
};

const socialLinks = [
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Instagram, href: "#", label: "Instagram" },
];

function LinkColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <nav aria-label={title}>
      <h3 className="text-brand-text font-medium mb-4 font-jakarta">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-brand-muted hover:text-brand-text transition-colors text-sm rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-background"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: footerRef.current, start: "top 90%", once: true },
        },
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      aria-labelledby="footer-title"
      className="mt-20 lg:mt-32 pt-16 lg:pt-20 border-t border-brand-border"
    >
      <h2 id="footer-title" className="sr-only">Pie de página</h2>
      <div ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12 lg:mb-16">
          <div className="sm:col-span-2 lg:col-span-2">
            <Link
              to="/"
              className="flex items-center gap-2 mb-6 w-fit rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
              aria-label="FoodSaver - Inicio"
            >
              <div className="w-10 h-10 bg-brand-accent rounded-full flex items-center justify-center">
                <Leaf size={20} className="text-white" aria-hidden="true" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-brand-text font-jakarta">
                FoodSaver
              </span>
            </Link>
            <p className="text-brand-muted leading-relaxed mb-6 max-w-sm">
              Comprometidos con la reducción del desperdicio alimentario y la
              construcción de una comunidad más solidaria y sostenible en
              Antioquia.
            </p>
            <ul className="flex items-center gap-3" aria-label="Redes sociales">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 bg-brand-card border border-brand-border rounded-full flex items-center justify-center text-brand-muted hover:text-brand-accent hover:border-brand-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-background"
                      aria-label={`FoodSaver en ${social.label}`}
                    >
                      <Icon size={18} aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <LinkColumn title="Plataforma" links={footerLinks.plataforma} />
          <LinkColumn title="Proyecto" links={footerLinks.proyecto} />
          <LinkColumn title="Legal" links={footerLinks.legal} />
        </div>

        <Card className="bg-brand-card border-brand-border rounded-2xl p-6 lg:p-8 mb-12 lg:mb-16 shadow-none">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h3 className="text-xl font-medium text-brand-text font-jakarta mb-2">
                ¿Listo para hacer la diferencia?
              </h3>
              <p className="text-brand-muted text-sm">
                Únete hoy mismo a nuestra red y empieza a rescatar alimentos en
                tu zona.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="rounded-full h-12 px-8 bg-brand-accent text-white hover:bg-brand-accent-light whitespace-nowrap shadow-[var(--shadow-brand-accent)] group w-full sm:w-auto"
            >
              <Link to="/selection">
                Crear cuenta{" "}
                <ArrowRight
                  size={18}
                  aria-hidden="true"
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </Button>
          </div>
        </Card>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-8 text-sm text-brand-muted">
          <p>© {new Date().getFullYear()} FoodSaver.</p>
          <p className="flex items-center gap-1">
            Desarrollado con <Leaf size={14} className="text-brand-accent" aria-hidden="true" />{" "}
            para reducir el desperdicio.
          </p>
        </div>
      </div>
    </footer>
  );
}
