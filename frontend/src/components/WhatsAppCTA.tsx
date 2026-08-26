import { WhatsAppLink } from "@/components/WhatsAppLink";

type Size = "lg" | "sm";

type Props = {
  prefill: string;
  label: string;
  /** Defaults to the visible label; set where several CTAs share one. */
  ariaLabel?: string;
  size?: Size;
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
  className = "",
}: Props) {
  const sizing =
    size === "lg" ? "px-7 py-4 text-base" : "px-5 py-3 text-[0.9375rem]";

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
