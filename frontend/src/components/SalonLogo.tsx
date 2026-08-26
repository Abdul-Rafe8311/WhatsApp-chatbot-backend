import { salon } from "@/config/salon";

/**
 * The salon's own logo mark — gold monogram on black — used in the header in
 * place of the typeset <Wordmark>.
 *
 * The supplied file is a black square, not a transparent cut-out, so it cannot
 * simply sit on the page ground: at 44px a hard black rectangle in the light
 * rose header reads as an unstyled asset. Two things fix that:
 *
 *   - `rounded-full` turns the square into a disc. The asset in public/ was
 *     padded with black to 6% on each side before being scaled down, so the
 *     clip lands on that padding — the gold ring in the artwork runs to the
 *     edge of the original file and would otherwise be shaved.
 *   - A gold hairline ring. In light mode it softens the black edge into the
 *     same gold-seam language the rest of the page uses. In dark mode it is
 *     load-bearing rather than decorative: the disc measures 1.11:1 against
 *     the aubergine ground, so without an edge the mark has no boundary at
 *     all. The ring goes to 70% there, which measures ~4:1 against --surface
 *     and clears the 3:1 threshold for a non-text boundary; 45% would sit at
 *     roughly 2.3:1 and read as a smudge.
 *
 * One asset serves both themes: the artwork is gold on black, which is legible
 * against either palette once it has an edge.
 *
 * Sized in a fixed box with width/height on the img so the header cannot shift
 * as it loads, and eager rather than lazy because it is above the fold.
 */
export function SalonLogo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`flex h-11 w-11 shrink-0 overflow-hidden rounded-full bg-black ring-1 ring-gold/45 dark:ring-gold/70 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element --
          images.unoptimized is set for the static export, so next/image adds a
          wrapper and a lazy shim without ever resizing the file. Same reasoning
          as <SalonImage>; a plain img is the honest equivalent. */}
      <img
        src="/images/logo-ss-salon.png"
        alt={salon.info.name}
        width={256}
        height={256}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        className="h-full w-full object-cover"
      />
    </span>
  );
}
