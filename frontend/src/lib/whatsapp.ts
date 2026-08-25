import { salon } from "@/config/salon";

/**
 * A number is dialable only if it is all digits, country code included.
 * The current config value ("92XXXXXXXXXX") fails on the non-digit test, as
 * does null or an empty string — so the CTA gate closes automatically and
 * reopens the moment a real number is set. Nothing else needs changing.
 */
export function isDialable(value: string | null | undefined): boolean {
  if (typeof value !== "string") return false;
  return /^\d{8,15}$/.test(value);
}

const rawNumber: string | null = salon.info.whatsappNumber;

/** True once a real number is configured. Drives the footer demo notice. */
export const whatsappReady: boolean = isDialable(rawNumber);

/**
 * Builds the wa.me deep link, or returns null when the number is unusable.
 * A null return is what makes <WhatsAppCTA> render an inert button instead of
 * a link — a visitor can never tap through to an unset or test number.
 */
export function whatsappHref(prefill: string): string | null {
  if (!isDialable(rawNumber)) return null;
  return `https://wa.me/${rawNumber}?text=${encodeURIComponent(prefill)}`;
}
