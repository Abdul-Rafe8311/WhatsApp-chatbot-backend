const RATIO_CLASS = {
  "4:5": "aspect-[4/5]",
  "1:1": "aspect-square",
  "3:2": "aspect-[3/2]",
  "16:9": "aspect-[16/9]",
} as const;

type Props = {
  /** Path under public/, e.g. "/images/hero-bridal.webp". Null → placeholder. */
  src: string | null;
  /** Required whenever src is set; null renders alt="" for the empty slot. */
  alt: string | null;
  ratio: keyof typeof RATIO_CLASS;
  className?: string;
  /** Hero only — everything else lazy-loads, which is the 3G budget. */
  priority?: boolean;
  /** Absolutely fill the positioned parent instead of holding its own box. */
  fill?: boolean;
  /** Responsive hint so the browser can skip oversized candidates later. */
  sizes?: string;
};

/**
 * An image slot that holds its shape whether or not a photograph exists.
 *
 * With no src it renders a tonal panel one step off the page ground — close
 * enough to recede, distinct enough to read as deliberate space rather than a
 * failed load. The aspect box lives on the wrapper, so dropping in a real
 * photograph shifts nothing and costs no layout.
 */
export function SalonImage({
  src,
  alt,
  ratio,
  className = "",
  priority = false,
  fill = false,
  sizes,
}: Props) {
  const box = fill
    ? `absolute inset-0 h-full w-full overflow-hidden ${className}`
    : `${RATIO_CLASS[ratio]} w-full overflow-hidden ${className}`;

  if (!src) {
    return (
      <div
        // Decorative while empty: a slot awaiting a photo is nothing a screen
        // reader should be told about.
        aria-hidden="true"
        className={`${box} bg-surface-2 ring-1 ring-gold/20 ring-inset`}
      />
    );
  }

  return (
    <div className={box}>
      {/* eslint-disable-next-line @next/next/no-img-element --
          images.unoptimized is set for the static export, so next/image would
          add a wrapper and a lazy shim without ever resizing a file. A plain
          img with explicit loading/decoding is the honest equivalent. */}
      <img
        src={src}
        alt={alt ?? ""}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        sizes={sizes}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
