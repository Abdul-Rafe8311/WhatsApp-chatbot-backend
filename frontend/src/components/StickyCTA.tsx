import { WhatsAppCTA } from "@/components/WhatsAppCTA";
import { copy } from "@/config/copy";

/**
 * One of the three prominent CTAs, and the only one that follows the scroll:
 * a gold-hairline pill fixed in the thumb zone. Constant shape and position,
 * so at any point on the page there is exactly one thing that means
 * "message us".
 *
 * Always rendered rather than scroll-triggered: no client JS, no layout
 * shift, nothing to animate on a static export.
 */
export function StickyCTA() {
  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <WhatsAppCTA
        prefill={copy.cta.generalPrefill}
        label={copy.cta.label}
        size="sm"
        // A ground of its own so the hairline and label stay legible over
        // whatever is scrolling behind it.
        className="bg-surface/90 backdrop-blur-sm"
      />
    </div>
  );
}
