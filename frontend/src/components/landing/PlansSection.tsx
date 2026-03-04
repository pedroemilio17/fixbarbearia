import { Check } from "lucide-react";
import { Button } from "../ui/button";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

// Premium dark plans section to keep contrast and hierarchy.
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
    <section id="planos" className="dark section-flat py-20 md:py-24">
      <div className="container px-4">
        <div className="mb-12 text-center">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-blue-300">Assine e economize</p>
          <h2 className="mt-3 font-display text-4xl text-white md:text-5xl">PLANOS DE ASSINATURA</h2>
        </div>

        <div
          ref={ref}
          className={`mx-auto grid max-w-5xl gap-6 md:grid-cols-3 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`glass-card p-7 ${plan.highlight ? "border-blue-300/50 bg-blue-900/20" : ""}`}
            >
              <h3 className="font-display text-3xl text-white">{plan.name}</h3>
              <p className="mt-3">
                <span className="font-display text-4xl text-blue-200">{plan.price}</span>
                <span className="text-slate-300">{plan.period}</span>
              </p>

              <ul className="mt-6 space-y-3 text-sm text-slate-200">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-300" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button className="mt-8 w-full" variant={plan.highlight ? "default" : "outline"}>
                Escolher plano
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
