import { MessageCircle } from "lucide-react";

interface HeroProps {
  onServicesClick: () => void;
}

export default function Hero({ onServicesClick }: HeroProps) {
  const handleWhatsApp = () => {
    window.open("https://wa.me/5565996903121", "_blank");
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden bg-background"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-[rgba(214,168,96,0.18)] blur-3xl" />
        <div className="absolute bottom-[-6rem] left-[-4rem] h-80 w-80 rounded-full bg-[rgba(0,0,0,0.08)] blur-3xl dark:bg-[rgba(255,255,255,0.08)]" />
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <p className="text-xs uppercase tracking-[0.4em] text-gray-500 dark:text-gray-400 mb-5">
          Barberia minimal & premium
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-semibold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
          <span className="block">FIX Barber</span>
          <span className="block text-primary">Studio</span>
        </h1>
        <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Experiência contemporânea em grooming clássico, com precisão e cuidado
          em cada detalhe.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={handleWhatsApp} className="btn btn-primary">
            <MessageCircle className="h-5 w-5" />
            Agendar via WhatsApp
          </button>
          <button onClick={onServicesClick} className="btn btn-outline">
            Ver serviços
          </button>
        </div>
      </div>
    </section>
  );
}
