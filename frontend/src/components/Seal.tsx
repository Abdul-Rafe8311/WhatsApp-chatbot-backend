/**
 * The seal — the raised apostrophe lifted out of the "Sonia's" wordmark and
 * used on its own. Their carved sign is the only real brand asset that
 * exists, and this is the detail taken from it.
 *
 * Decorative in every placement: the text beside it always carries the
 * meaning, so it stays aria-hidden.
 */
export function Seal({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`font-display text-gold leading-none select-none ${className}`}
    >
      &rsquo;
    </span>
  );
}
