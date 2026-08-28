import { WhatsAppLink } from "@/components/WhatsAppLink";

type Size = "lg" | "sm";

type Props = {
  prefill: string;
  label: string;
  /** Defaults to the visible label; set where several CTAs share one. */
  ariaLabel?: string;
  size?: Size;
  /**
   * "onImage" swaps to the photograph palette. The default tone uses text-fg,
   * which is near-black in the light theme and would vanish on the hero's
   * dark scrim.
   */
  tone?: "default" | "onImage";
  className?: string;
};

/**
 * The prominent call to action. Deliberately rare: the hero, the hours
 * section, and the sticky pill — three on the whole page.
 *
 * Thirteen of these in the services list was the single loudest thing making
 * the page read as generated; real sites do not ask sixteen times. Service
 * rows still open WhatsApp, but through <WhatsAppLink> with recessive styling
 * so the service name dominates its row, not a button.
 *
 * No seal here. Inside a pill beside text the raised apostrophe reads as a
 * stray comma; it belongs in the wordmark, where it is a mark rather than
 * punctuation floating next to a word.
 *
 * Both states share one class string, so the inert button is pixel-identical
 * to the live link. The gate is behavioural, never visual.
 */
export function WhatsAppCTA({
  prefill,
  label,
  ariaLabel,
  size = "lg",
  tone = "default",
  className = "",
}: Props) {
  const sizing =
    size === "lg" ? "px-7 py-4 text-base" : "px-5 py-3 text-[0.9375rem]";

  const classes = [
    // whitespace-nowrap so the label can never wrap and burst the pill if
    // the button is ever placed in a narrow container.
    "type-cta inline-flex items-center justify-center whitespace-nowrap",
    "min-h-[44px] rounded-full border",
    // Filled on hover AND focus-visible, so a keyboard user gets the same
    // affordance as a pointer user. The label flips to --surface rather than
    // --fg: on the light theme the gold is a deep bronze and near-black text
    // on it measures only 3.76:1, while paper on the same bronze is 4.71:1.
    // Because --surface flips with the theme, one pair of classes is legible
    // on both the bronze and the bright gold.
    tone === "onImage"
      ? "border-gold-on-image text-on-image hover:bg-gold-on-image hover:text-scrim-ink focus-visible:bg-gold-on-image focus-visible:text-scrim-ink"
      : "border-gold text-fg hover:bg-gold hover:text-surface focus-visible:bg-gold focus-visible:text-surface",
    "transition-colors duration-200 ease-out",
    // The global focus ring is gold, which would sit invisibly on this
    // element's own gold border. Ivory at a wider offset instead.
    tone === "onImage"
      ? "focus-visible:outline-on-image focus-visible:outline-offset-4"
      : "focus-visible:outline-fg focus-visible:outline-offset-4",
    sizing,
    className,
  ].join(" ");

  return (
    <WhatsAppLink
      prefill={prefill}
      ariaLabel={ariaLabel ?? label}
      className={classes}
    >
      {label}
    </WhatsAppLink>
  );
}
