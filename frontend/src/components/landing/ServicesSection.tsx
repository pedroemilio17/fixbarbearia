import { ShoppingCart } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import type { Service } from "../../types";

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function ServiceItem({
  service,
  index,
  onSelect,
}: {
  service: Service;
  index: number;
  onSelect: (service: Service) => void;
}) {
  const { ref, isVisible } = useScrollAnimation();
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={`relative w-full overflow-hidden transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div
        className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} min-h-[300px] md:min-h-[380px]`}
      >
        {/* Image side */}
        <div className="relative w-full md:w-[55%] min-h-[240px] md:min-h-full overflow-hidden">
          <div className="absolute inset-0 bg-background/60 z-10" />
          <img
            src={service.image}
            alt={service.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Content side — overlaps the image */}
        <div
          className={`relative w-full md:w-[50%] flex items-center z-20 ${
            isEven ? "md:-ml-[5%]" : "md:-mr-[5%]"
          }`}
        >
          <div
            className={`w-full h-full flex items-center px-8 py-10 md:px-14 md:py-16 ${
              isEven
                ? "bg-gradient-to-r from-background via-background/98 to-background/70"
                : "bg-gradient-to-l from-background via-background/98 to-background/70"
            }`}
          >
            <div className={`max-w-lg ${isEven ? "" : "md:ml-auto md:text-right"}`}>
              <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-wide uppercase">
                {service.name}
              </h3>

              <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-4 mb-8 max-w-md">
                {service.description}
              </p>

              <button
                type="button"
                onClick={() => onSelect(service)}
                className={`inline-flex items-center gap-3 rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 px-5 py-2.5 text-sm font-medium text-foreground transition-colors ${
                  isEven ? "" : "md:ml-auto"
                }`}
                aria-label={`Selecionar ${service.name}`}
              >
                <ShoppingCart size={16} className="text-primary" />
                <span className="font-display tracking-wider">{formatBRL(service.price)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ServicesSection({
  services,
  loading,
  error,
  onSelectService,
}: {
  services: Service[];
  loading: boolean;
  error: string | null;
  onSelectService: (service: Service) => void;
}) {
  return (
    <section id="servicos" className="relative py-20 md:py-28">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent to-primary/30" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-primary font-display tracking-[0.3em] uppercase text-sm mb-3">O que oferecemos</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">NOSSOS SERVIÇOS</h2>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Carregando serviços...</p>
        ) : error ? (
          <p className="text-center text-destructive">{error}</p>
        ) : (
          <div className="flex flex-col gap-0 max-w-6xl mx-auto">
            {services.map((s, i) => (
              <ServiceItem key={s.id} service={s} index={i} onSelect={onSelectService} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
