import { Service } from '../types';
import { Clock, DollarSign } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
}

export default function ServiceCard({ service, onSelect }: ServiceCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full flex flex-col"
      onClick={() => onSelect(service)}
    >
      <div className="aspect-video overflow-hidden bg-gray-200 dark:bg-gray-700">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {service.name}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1">
          {service.description}
        </p>

        <div className="flex items-center justify-between mb-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{service.duration} min</span>
          </div>
          <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold">
            <DollarSign className="h-4 w-4" />
            <span className="text-lg">{service.price}</span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(service);
          }}
          className="w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium"
        >
          Detalhes
        </button>
      </div>
    </div>
  );
}
