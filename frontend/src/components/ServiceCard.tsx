import { Service } from '../types';
import { Clock, DollarSign } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
}

export default function ServiceCard({ service, onSelect }: ServiceCardProps) {
  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-sm hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col"
      onClick={() => onSelect(service)}
    >
      <div className="aspect-video overflow-hidden bg-gray-200/70 dark:bg-white/10">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {service.name}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1">
          {service.description}
        </p>

        <div className="flex items-center justify-between mb-4 pt-3 border-t border-black/5 dark:border-white/10">
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
          className="w-full btn btn-outline"
        >
          Detalhes
        </button>
      </div>
    </div>
  );
}
