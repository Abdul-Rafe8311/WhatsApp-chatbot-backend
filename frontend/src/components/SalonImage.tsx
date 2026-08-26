const RATIO_CLASS = {
  "4:5": "aspect-[4/5]",
  "1:1": "aspect-square",
  "3:2": "aspect-[3/2]",
  "16:9": "aspect-[16/9]",
} as const;

type Props = {
  /** Path under public/, e.g. "/images/hero-bridal.webp". Null → placeholder. */
  src: string | null;
  /** Required whenever src is set — enforced by the union below. */
  alt: string | null;
  ratio: keyof typeof RATIO_CLASS;
  className?: string;
  /** Set on the hero image only; everything else lazy-loads. */
  priority?: boolean;
};

/**
 * An image slot that holds its shape whether or not a photograph exists.
 *
 * With no src it renders a tonal panel one step off the page ground — close
 * enough to recede, distinct enough to read as a deliberate space rather than
 * a failed load. The saturated colour blocks this replaced did the opposite:
 * a flat crimson rectangle looks like a broken image, and a page of them
 * looks like a page of broken images.
 *
 * The aspect box lives on the wrapper, so swapping a placeholder for a real
 * photograph shifts nothing and costs no layout.
 */
export function SalonImage({
  src,
  alt,
  ratio,
  className = "",
  priority = false,
}: Props) {
  const box = `${RATIO_CLASS[ratio]} w-full overflow-hidden ${className}`;

  if (!src) {
    return (
      <div
        // Decorative while empty: there is nothing here to announce, and a
        // screen reader should not be told about a slot awaiting a photo.
        aria-hidden="true"
        className={`${box} bg-surface-2 ring-1 ring-gold/20 ring-inset`}
      />
    );
  }

  return (
    <div className={box}>
      {/* eslint-disable-next-line @next/next/no-img-element --
          images.unoptimized is set for the static export, so next/image would
          add a wrapper and a lazy-loading shim without ever resizing a file.
          A plain img with explicit loading/decoding is the honest equivalent. */}
      <img
        src={src}
        alt={alt ?? ""}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
