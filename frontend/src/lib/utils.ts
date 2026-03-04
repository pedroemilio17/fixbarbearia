import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Shared utility helpers for styling and money formatting.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
