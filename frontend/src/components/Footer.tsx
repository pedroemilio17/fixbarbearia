import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-300 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-gray-900"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M7 3h10v2H7V3zm0 16h10v2H7v-2zm6-12c-2.21 0-4 1.79-4 4 0 1.86 1.27 3.43 3 3.87V19h2v-4.13c1.73-.44 3-2.01 3-3.87 0-2.21-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-7 0H4v2h2v-2zm14 0v2h2v-2h-2zM3 9h2v2H3V9zm16 0h2v2h-2V9z" />
                </svg>
              </div>
              <span className="text-xl font-bold">FIX</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              A sua barbearia de confiança, oferecendo serviços premium e
              experiência de classe mundial.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contato</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <Phone className="h-5 w-5" />
                <span>+55 (65) 99690-3121</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
                <span>contato@fixbarbearia.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer">
                <MessageCircle className="h-5 w-5" />
                <button onClick={() => window.open('https://wa.me/5565996903121', '_blank')}>
                  WhatsApp
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Endereço</h3>
            <div className="flex items-start gap-3 text-gray-400">
              <MapPin className="h-5 w-5 mt-1 flex-shrink-0" />
              <div>
                <p>Av. Paulista, 1000</p>
                <p>São Paulo, SP - 01311-100</p>
                <p className="mt-4 font-semibold text-white">Horários</p>
                <p className="text-sm mt-2">Seg-Sex: 09:00 - 19:00</p>
                <p className="text-sm">Sábado: 09:00 - 18:00</p>
                <p className="text-sm">Domingo: Fechado</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2024 FIX Barbearia. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
