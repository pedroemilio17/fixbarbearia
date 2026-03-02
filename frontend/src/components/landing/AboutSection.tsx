import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import heroImg from "../../assets/barbershop-hero.jpg";

export function AboutSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="sobre" className="relative py-20 md:py-28 overflow-hidden">
      <div
        ref={ref}
        className={`container mx-auto px-4 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          {/* Image */}
          <div className="relative">
            <div className="glass-card overflow-hidden rounded-2xl">
              <img
                src={heroImg}
                alt="Interior da FixBarbearia"
                className="w-full h-80 md:h-[420px] object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-2 border-primary/30 rounded-2xl -z-10" />
          </div>

          {/* Text */}
          <div>
            <p className="text-primary font-display tracking-[0.3em] uppercase text-sm mb-3">Quem somos</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              MAIS QUE UMA
              <br />
              <span className="text-primary">BARBEARIA</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A FixBarbearia nasceu da paixão por oferecer uma experiência completa de cuidado masculino.
              Nosso espaço foi pensado para que você se sinta em casa, com ambiente acolhedor e profissionais qualificados.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos as melhores técnicas e produtos do mercado para garantir que cada cliente saia com o visual que deseja,
              com atendimento personalizado e atenção aos detalhes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
