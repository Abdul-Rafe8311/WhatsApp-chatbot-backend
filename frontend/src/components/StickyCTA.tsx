import { WhatsAppCTA } from "@/components/WhatsAppCTA";
import { copy } from "@/config/copy";

/**
 * The signature element: one gold-hairline pill carrying the seal and the
 * words, fixed in the thumb zone while ink / emerald / crimson panels scroll
 * behind it. Constant shape, constant position — at any point in the scroll
 * there is exactly one thing on screen that means "message us".
 *
 * Always rendered, never scroll-triggered: no client JS, no layout shift, and
 * nothing to animate. The seal alone was the earlier plan and was rejected —
 * a bare mark does not tell a bride what tapping does.
 */
export function StickyCTA() {
  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <WhatsAppCTA
        prefill={copy.cta.generalPrefill}
        label={copy.cta.label}
        size="sm"
        // A ground of its own so the hairline and label stay legible over
        // whichever colour panel happens to be behind it.
        className="bg-ink/90 backdrop-blur-sm"
      />
    </div>
  );
}
