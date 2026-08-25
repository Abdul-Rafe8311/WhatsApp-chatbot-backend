import { Seal } from "@/components/Seal";
import { whatsappHref } from "@/lib/whatsapp";

type Size = "lg" | "sm";

type Props = {
  /** Message the visitor's WhatsApp opens with. Compose via copy.cta.*. */
  prefill: string;
  label: string;
  /**
   * Overrides the accessible name where several CTAs share one visible
   * label — service swatches, for instance, all read "Book on WhatsApp".
   */
  ariaLabel?: string;
  size?: Size;
  className?: string;
};

/**
 * The single call-to-action on this site. Every CTA — hero, sticky pill,
 * service swatch, contact — renders through here. No section builds a wa.me
 * URL of its own.
 *
 * The gate is behavioural, not visual. When the number is unusable this
 * renders an inert <button aria-disabled="true"> that looks *identical* to
 * the live link: same border, same colour, same cursor, full opacity. The
 * design stays reviewable, and nobody can tap through to an unset number.
 *
 * Deliberately not `disabled` — that would drop it out of tab order and let
 * the UA restyle it. `aria-disabled` keeps it focusable and announced while
 * a `type="button"` with no handler does nothing on click.
 */
export function WhatsAppCTA({
  prefill,
  label,
  ariaLabel,
  size = "lg",
  className = "",
}: Props) {
  const href = whatsappHref(prefill);

  const sizing =
    size === "lg"
      ? "gap-2.5 px-6 py-4 text-base"
      : "gap-2 px-4 py-3 text-[0.9375rem]";

  // One class string for both states — this is what keeps them identical.
  const classes = [
    "type-cta inline-flex items-center justify-center",
    "min-h-[44px] rounded-full border border-gold text-ivory",
    "transition-colors duration-200 hover:bg-gold/10",
    // The global focus ring is gold, which would sit invisibly on this
    // element's own gold border. Ivory at a wider offset instead.
    "focus-visible:outline-ivory focus-visible:outline-offset-4",
    sizing,
    className,
  ].join(" ");

  const content = (
    <>
      <Seal className="text-[1.25em]" />
      <span>{label}</span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={classes}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      aria-disabled="true"
      aria-label={ariaLabel}
      className={classes}
    >
      {content}
    </button>
  );
}
