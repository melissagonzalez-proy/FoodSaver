import { useEffect, useRef } from "react";
import { Leaf, Instagram, Linkedin, Github, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 90%",
            once: true,
          },
        },
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="mt-20 lg:mt-32 pt-16 lg:pt-20 border-t border-brand-border"
    >
      <div ref={contentRef} className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12 lg:mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-brand-accent rounded-full flex items-center justify-center">
                <Leaf size={20} className="text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-brand-text font-jakarta">
                FoodSaver
              </span>
            </div>
            <p className="text-brand-muted leading-relaxed mb-6 max-w-sm">
              Comprometidos con la reducción del desperdicio alimentario y la
              construcción de una comunidad más solidaria y sostenible en
              Antioquia.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-brand-card border border-brand-border rounded-full flex items-center justify-center text-brand-muted hover:text-brand-accent hover:border-brand-accent/50 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-brand-text font-medium mb-4 font-jakarta">
              Plataforma
            </h4>
            <ul className="space-y-3">
              {footerLinks.plataforma.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-brand-muted hover:text-brand-text transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-brand-text font-medium mb-4 font-jakarta">
              Proyecto
            </h4>
            <ul className="space-y-3">
              {footerLinks.proyecto.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-brand-muted hover:text-brand-text transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-brand-text font-medium mb-4 font-jakarta">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-brand-muted hover:text-brand-text transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-2xl p-6 lg:p-8 mb-12 lg:mb-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h4 className="text-xl font-medium text-brand-text font-jakarta mb-2">
                ¿Listo para hacer la diferencia?
              </h4>
              <p className="text-brand-muted text-sm">
                Únete hoy mismo a nuestra red y empieza a rescatar alimentos en
                tu zona.
              </p>
            </div>
            <Link
              to="/selection"
              className="flex items-center gap-2 h-12 px-8 bg-brand-accent text-white rounded-full font-medium hover:bg-brand-accent-light transition-colors whitespace-nowrap shadow-[0_0_20px_rgba(255,0,85,0.15)] group"
            >
              Crear cuenta{" "}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-8 text-sm text-brand-muted">
          <p>© {new Date().getFullYear()} FoodSaver.</p>
          <p className="flex items-center gap-1">
            Desarrollado con <Leaf size={14} className="text-brand-accent" />{" "}
            para reducir el desperdicio.
          </p>
        </div>
      </div>
    </footer>
  );
}
