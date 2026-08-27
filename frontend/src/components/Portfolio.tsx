import { SalonImage } from "@/components/SalonImage";
import { copy } from "@/config/copy";
import { salon } from "@/config/salon";

type Item = (typeof salon.portfolio.items)[number];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/**
 * The largest section on the page, because for a makeup salon the work is the
 * product and everything else is supporting argument.
 *
 * Two deliberate non-choices:
 *
 * Filtering is radio inputs plus sibling CSS, not React state. It costs no
 * JavaScript, works before hydration, and is keyboard operable for free. The
 * per-category rules are generated from the config below, so the CSS never
 * has to be edited when a filter is added.
 *
 * The lightbox is :target driven for the same reason. It also means the Back
 * button closes it, which is what a phone user already expects — a scripted
 * lightbox has to reimplement that, usually badly.
 *
 * Everything lazy-loads. At 24 tiles this section would otherwise dominate
 * the 3G budget on its own.
 */
export function Portfolio({ id }: { id: string }) {
  const { filters } = salon.portfolio;
  const all: ReadonlyArray<Item> = salon.portfolio.items;
  const filled = all.filter((item) => item.image);

  /**
   * Once any photograph exists, render only the slots that have one.
   *
   * Real photographs mixed with empty placeholders is the one arrangement
   * that reads as broken — a page that failed to load rather than a page
   * still being built. All-empty reads as a deliberate design preview, and
   * all-filled reads as a gallery. Never both at once.
   *
   * This is why a partial image set degrades cleanly: the config can declare
   * far more slots than there are files, and the section simply shows what
   * exists.
   */
  const items = filled.length > 0 ? filled : all;

  // A filter with one populated category has nothing to do, and a filter
  // whose buttons lead to empty grids is worse than no filter.
  const present = filters.filter((f) =>
    items.some((item) => item.category === f),
  );
  const showFilter = present.length > 1;

  // Three columns needs enough tiles to fill them or the masonry reads as a
  // thin row. Derived from the item count, not hardcoded.
  const few = items.length <= 4;

  const filterCss = present
    .map(
      (f) =>
        `#pf-${slug(f)}:checked ~ .pf-grid > li:not([data-cat="${f}"]){display:none}`,
    )
    .join("");

  return (
    <section id={id} className="seam bg-surface">
      <div className="wrap flex flex-col gap-8 py-16 sm:py-24">
        <div className="flex flex-col gap-2">
          <h2 className="type-h2">{copy.portfolio.heading}</h2>
          <p className="type-body text-fg/70">{copy.portfolio.intro}</p>
        </div>

        {showFilter && <style>{filterCss}</style>}

        <div>
          {showFilter && (
          <fieldset className="border-0 p-0">
            <legend className="sr-only">
              {copy.portfolio.filterGroupLabel}
            </legend>

            {/* Inputs must precede .pf-grid — the generated CSS uses a
                sibling combinator to do the filtering. */}
            <input
              type="radio"
              name="pf"
              id="pf-all"
              defaultChecked
              className="pf-input sr-only"
            />
            {present.map((f) => (
              <input
                key={f}
                type="radio"
                name="pf"
                id={`pf-${slug(f)}`}
                className="pf-input sr-only"
              />
            ))}

            <div className="mb-8 flex flex-wrap items-center gap-2">
              <label
                htmlFor="pf-all"
                className="pf-filter-label type-meta inline-flex min-h-[44px] items-center rounded-full border border-gold/40 px-4 text-fg/70 transition-colors duration-200 hover:text-fg"
              >
                {copy.portfolio.filterAllLabel}
              </label>
              {present.map((f) => (
                <label
                  key={f}
                  htmlFor={`pf-${slug(f)}`}
                  className="pf-filter-label type-meta inline-flex min-h-[44px] items-center rounded-full border border-gold/40 px-4 text-fg/70 transition-colors duration-200 hover:text-fg"
                >
                  {f}
                </label>
              ))}
            </div>
          </fieldset>
          )}

          <ul className={`pf-grid${few ? " pf-grid--few" : ""}`}>
            {items.map((item: Item) => (
              <li key={item.id} data-cat={item.category}>
                {item.image ? (
                  <a
                    href={`#lb-${item.id}`}
                    aria-label={copy.portfolio.openLabel(
                      item.imageAlt ?? item.category,
                    )}
                    className="block transition-opacity duration-200 hover:opacity-90"
                  >
                    <SalonImage
                      src={item.image}
                      alt={item.imageAlt}
                      ratio={item.ratio}
                      sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                    />
                  </a>
                ) : (
                  /* No photograph yet, so nothing to enlarge. An empty slot
                     that opens a larger empty slot is not a feature. */
                  <SalonImage
                    src={item.image}
                    alt={item.imageAlt}
                    ratio={item.ratio}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Lightboxes live outside the grid so the columns are not disturbed.
          Each is display:none until targeted, so the browser never fetches
          its image until it is opened. */}
      {items.filter((item: Item) => item.image).map((item: Item) => (
        <div
          key={item.id}
          id={`lb-${item.id}`}
          className="lb fixed inset-0 z-[60] items-center justify-center bg-surface/95 p-4 backdrop-blur-sm"
        >
          <a
            href={`#${id}`}
            aria-label={copy.portfolio.closeLabel}
            className="absolute inset-0"
          />
          <div className="relative max-h-full w-full max-w-3xl">
            <SalonImage
              src={item.image}
              alt={item.imageAlt}
              ratio={item.ratio}
            />
          </div>
          <a
            href={`#${id}`}
            /* Underlined text, not a bordered pill — the three gold pills on
               this page are the WhatsApp CTAs and nothing else may borrow
               that shape. */
            className="type-meta absolute top-4 right-4 inline-flex min-h-[44px] items-center px-2 text-fg underline underline-offset-4 hover:text-gold"
          >
            {copy.portfolio.closeLabel}
          </a>
        </div>
      ))}
    </section>
  );
}
