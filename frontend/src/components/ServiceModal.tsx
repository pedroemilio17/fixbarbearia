import { Service } from '../types';
import { X, Clock, DollarSign } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface ServiceModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ServiceModal({
  service,
  isOpen,
  onClose,
}: ServiceModalProps) {
  const { addItem } = useCart();

  if (!isOpen || !service) return null;

  const handleAddToCart = () => {
    addItem(service.id, service.name, service.price);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors z-10"
        >
          <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        </button>

        <div className="aspect-video overflow-hidden bg-gray-200 dark:bg-gray-700">
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {service.name}
          </h2>

          <div className="flex items-center gap-6 mb-6 text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>Duração: {service.duration} minutos</span>
            </div>
            <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold text-lg">
              <DollarSign className="h-5 w-5" />
              <span>{service.price}</span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Descrição
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {service.description}
            </p>
          </div>

          <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              O que inclui:
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>✓ Atendimento personalizado</li>
              <li>✓ Produtos premium de qualidade</li>
              <li>✓ Acabamento impecável</li>
              <li>✓ Dicas de cuidado incluídas</li>
            </ul>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-semibold text-lg"
          >
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  );
}
