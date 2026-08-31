import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Fusionne des classes conditionnelles (clsx) puis résout les
// conflits Tailwind (twMerge) — ex: cn("p-4", condition && "p-6")
// donne bien "p-6" au lieu d'empiler les deux classes.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}