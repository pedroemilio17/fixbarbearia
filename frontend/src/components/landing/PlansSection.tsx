import { Check } from "lucide-react";
import { Button } from "../ui/button";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

const plans = [
  {
    name: "Básico",
    price: "R$ 89",
    period: "/mês",
    features: ["2 cortes por mês", "Desconto em produtos", "Agendamento prioritário"],
    highlight: false,
  },
  {
    name: "Premium",
    price: "R$ 149",
    period: "/mês",
    features: ["4 cortes por mês", "Barba inclusa", "Produtos grátis", "Prioridade máxima"],
    highlight: true,
  },
  {
    name: "VIP",
    price: "R$ 199",
    period: "/mês",
    features: ["Cortes ilimitados", "Barba ilimitada", "Todos os serviços", "Atendimento exclusivo"],
    highlight: false,
  },
];

export function PlansSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="planos" className="relative py-20 md:py-28 section-flat">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="tracking-[0.3em] uppercase text-sm mb-3 font-display text-primary">Assine e economize</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">PLANOS DE ASSINATURA</h2>
        </div>

        <div
          ref={ref}
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`glass-card p-8 flex flex-col relative group hover:scale-[1.03] transition-transform duration-300 ${
                plan.highlight ? "ring-2 ring-primary" : ""
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-display tracking-wider px-4 py-1 rounded-full">
                  MAIS POPULAR
                </span>
              )}
              <h3 className="font-display text-xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="font-display text-4xl font-bold text-primary">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button variant={plan.highlight ? "default" : "outline"} className="w-full font-display tracking-wider">
                Assinar
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
