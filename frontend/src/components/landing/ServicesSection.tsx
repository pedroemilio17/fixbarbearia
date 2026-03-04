import { ShoppingCart } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import type { Service } from "../../types";
import { formatBRL } from "../../lib/utils";

// Services keeps a dark premium mood even when global theme is light.
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

  return (
    <article
      ref={ref}
      className={`glass-card overflow-hidden transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 70}ms` }}
    >
      <div className="grid md:grid-cols-[1.15fr_1fr]">
        <img src={service.image} alt={service.name} className="h-60 w-full object-cover md:h-full" loading="lazy" />

        <div className="p-6 md:p-8 lg:p-10">
          <h3 className="font-display text-3xl tracking-wide text-white">{service.name}</h3>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">{service.description}</p>

          <button
            type="button"
            onClick={() => onSelect(service)}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-sm font-semibold text-blue-100 transition-colors hover:bg-blue-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Selecionar ${service.name}`}
          >
            <ShoppingCart size={16} />
            {formatBRL(service.price)}
          </button>
        </div>
      </div>
    </article>
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
    <section id="servicos" className="dark section-flat py-20 md:py-24">
      <div className="container px-4">
        <div className="mb-12 text-center">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-blue-300">O que oferecemos</p>
          <h2 className="mt-3 font-display text-4xl text-white md:text-5xl">NOSSOS SERVIÇOS</h2>
        </div>

        {loading ? (
          <p className="text-center text-slate-300">Carregando serviços...</p>
        ) : error ? (
          <p className="text-center text-red-300">{error}</p>
        ) : (
          <div className="mx-auto flex max-w-6xl flex-col gap-6">
            {services.map((s, i) => (
              <ServiceItem key={s.id} service={s} index={i} onSelect={onSelectService} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
