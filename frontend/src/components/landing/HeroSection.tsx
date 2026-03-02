import heroImg from "../../assets/barbershop-hero.jpg";
import { Button } from "../ui/button";

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image + subtle blur overlay (Velvet) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${heroImg})` }}
      />
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />

      {/* Decorative glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      {/* Content */}
      <div
        className="relative z-10 text-center px-4 max-w-3xl mx-auto animate-fade-up"
        style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
      >
        <p className="text-primary font-medium tracking-[0.3em] uppercase text-sm mb-4 font-display">
          Barbearia Premium
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-tight mb-6">
          ESTILO & TRADIÇÃO
          <br />
          <span className="text-primary">EM CADA CORTE</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl mb-8 max-w-xl mx-auto font-body">
          Experiência única em barbearia masculina. Profissionais qualificados, ambiente exclusivo.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="font-display tracking-wider text-base px-8"
            onClick={() => scrollTo("servicos")}
          >
            Agendar Agora
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="font-display tracking-wider text-base px-8"
            onClick={() => scrollTo("planos")}
          >
            Nossos Planos
          </Button>
        </div>
      </div>
    </section>
  );
}
