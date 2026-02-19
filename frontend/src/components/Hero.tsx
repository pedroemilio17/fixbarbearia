import { MessageCircle } from 'lucide-react';

interface HeroProps {
  onServicesClick: () => void;
}

export default function Hero({ onServicesClick }: HeroProps) {
  const handleWhatsApp = () => {
    window.open('https://wa.me/5565996903121', '_blank');
  };

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20"
    >
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          FIX Barbearia
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Onde tradição encontra estilo. Experiência em grooming clássico com excelência.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg transition-all transform hover:scale-105 font-semibold"
          >
            <MessageCircle className="h-5 w-5" />
            Agendar via WhatsApp
          </button>
          <button
            onClick={onServicesClick}
            className="border-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100 px-8 py-4 rounded-lg hover:bg-gray-900 hover:text-white dark:hover:bg-gray-100 dark:hover:text-gray-900 transition-all font-semibold"
          >
            Ver Serviços
          </button>
        </div>
      </div>
    </section>
  );
}
