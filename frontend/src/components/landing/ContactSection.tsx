import { MapPin, Phone, Clock, Instagram } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

export function ContactSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="contato" className="relative py-20 md:py-28 section-flat">
      <div
        ref={ref}
        className={`container mx-auto px-4 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="text-center mb-14">
          <p className="text-primary font-display tracking-[0.3em] uppercase text-sm mb-3">Fale conosco</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">CONTATO</h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={16} className="text-primary" /> Rua Exemplo, 123 - Centro
            </span>
            <span className="flex items-center gap-2 text-muted-foreground">
              <Phone size={16} className="text-primary" /> (11) 99999-9999
            </span>
            <span className="flex items-center gap-2 text-muted-foreground">
              <Clock size={16} className="text-primary" /> Seg-Sáb: 9h às 20h
            </span>
          </div>

          <div className="flex justify-center">
            <a
              href="https://instagram.com/fixbarbearia"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-display tracking-wider text-sm"
            >
              <Instagram size={18} />
              @fixbarbearia
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
