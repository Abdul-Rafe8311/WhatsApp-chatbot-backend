import type { ReactNode } from "react";
import { whatsappHref } from "@/lib/whatsapp";

type Props = {
  /** Message the visitor's WhatsApp opens with. Compose via copy.cta.*. */
  prefill: string;
  /** Accessible name. Required — these links carry varied visible content. */
  ariaLabel: string;
  className?: string;
  children: ReactNode;
};

/**
 * The gate, with no styling of its own.
 *
 * Every WhatsApp destination on the site routes through here: the three
 * prominent pills via <WhatsAppCTA>, and the service rows directly. One place
 * decides link-or-inert, so a new entry point cannot accidentally ship
 * ungated.
 *
 * Inert state is <button aria-disabled="true"> rather than `disabled`, which
 * would drop it out of tab order and let the UA restyle it. Children must be
 * phrasing content — a heading may wrap this, never the other way round.
 */
export function WhatsAppLink({
  prefill,
  ariaLabel,
  className = "",
  children,
}: Props) {
  const href = whatsappHref(prefill);

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      aria-disabled="true"
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </button>
  );
}
