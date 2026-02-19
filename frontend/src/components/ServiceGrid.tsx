import { Service } from "../types";
import ServiceCard from "./ServiceCard";

interface ServiceGridProps {
  services: Service[];
  onServiceSelect: (service: Service) => void;
}

export default function ServiceGrid({ services, onServiceSelect }: ServiceGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onSelect={onServiceSelect}
        />
      ))}
    </div>
  );
}
