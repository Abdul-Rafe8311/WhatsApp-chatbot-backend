import { PRICE_CURRENCY, PRICE_ON_REQUEST } from "@/config/salon";

type Priceable = {
  priceMin: number | null;
  priceMax: number | null;
  priceNote: string;
};

/**
 * Formats a price for display. Never invents one: a null min still renders
 * the config's priceNote ("On request"), because a null means nobody has
 * told us the price — not that the service is free.
 *
 * Ranges render "PKR 30,000 – 55,000"; a fixed price renders one figure.
 */
export function formatPrice(service: Priceable): string {
  const { priceMin, priceMax } = service;
  if (priceMin === null) return service.priceNote ?? PRICE_ON_REQUEST;

  const n = (v: number) => v.toLocaleString("en-PK");
  if (priceMax === null || priceMax === priceMin) {
    return `${PRICE_CURRENCY} ${n(priceMin)}`;
  }
  return `${PRICE_CURRENCY} ${n(priceMin)} – ${n(priceMax)}`;
}
