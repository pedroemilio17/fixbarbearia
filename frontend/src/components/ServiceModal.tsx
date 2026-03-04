import type { Service } from "../types";
import { X, Clock, DollarSign } from "lucide-react";
import { useCart } from "../context/CartContext";
import { Button } from "./ui/button";
import { formatBRL } from "../lib/utils";

// Modal presents service details and preserves add-to-cart behavior.

interface ServiceModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}


export default function ServiceModal({ service, isOpen, onClose }: ServiceModalProps) {
  const { addItem } = useCart();

  if (!isOpen || !service) return null;

  const handleAddToCart = () => {
    addItem(service.id, service.name, service.price);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fechar modal"
      />

      <div className="relative glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 h-10 w-10 rounded-full border border-border bg-background/40 hover:bg-background/60 transition-colors z-10 grid place-items-center"
          aria-label="Fechar"
        >
          <X className="h-5 w-5 text-foreground/80" />
        </button>

        <div className="aspect-video overflow-hidden bg-muted">
          {service.image ? (
            <img src={service.image} alt={service.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full" />
          )}
        </div>

        <div className="p-6">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">{service.name}</h2>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>Duração: {service.duration} min</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-semibold text-lg">
              <DollarSign className="h-5 w-5" />
              <span>{formatBRL(service.price)}</span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-display text-lg font-semibold text-foreground mb-3 tracking-wide">Descrição</h3>
            <p className="text-muted-foreground leading-relaxed">{service.description}</p>
          </div>

          <div className="mb-8 p-4 glass-card rounded-xl">
            <h3 className="font-display font-semibold text-foreground mb-2 tracking-wide">O que inclui</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>✓ Atendimento personalizado</li>
              <li>✓ Produtos premium</li>
              <li>✓ Acabamento impecável</li>
              <li>✓ Dicas de cuidado</li>
            </ul>
          </div>

          <Button onClick={handleAddToCart} className="w-full font-display tracking-wider" size="lg">
            Adicionar ao carrinho
          </Button>
        </div>
      </div>
    </div>
  );
}
