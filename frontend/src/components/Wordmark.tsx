import { salon } from "@/config/salon";

/**
 * "Sonia's" set in the display face with the apostrophe raised and struck in
 * gold — a flat echo of a carved apostrophe catching light differently from
 * the letters around it.
 *
 * The text is derived from `salon.info.name`, never retyped: the first word
 * of the salon name, split on its apostrophe. If the name ever loses its
 * apostrophe the mark degrades to plain text rather than breaking.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  // ASSUMPTION: the wordmark is the first word of `salon.info.name`, which
  // today is "Sonia's Makeup Salon" → "Sonia's". This holds as long as the
  // name keeps the possessive first. If the client ever renames the salon
  // (e.g. to "Salon Sonia") this silently renders the wrong word — it will
  // not error. Revisit here if `salon.info.name` changes shape.
  const firstWord = salon.info.name.split(" ")[0];
  const parts = firstWord.match(/^(.*?)(['’])(.*)$/);

  return (
    <span className={`font-display text-fg leading-none ${className}`}>
      {parts ? (
        <>
          {parts[1]}
          {/* Not aria-hidden — the apostrophe is part of the name, and a
              screen reader should still read "Sonia's". */}
          <span
            className="text-gold inline-block align-baseline"
            style={{ transform: "translateY(-0.15em) scale(1.15)" }}
          >
            &rsquo;
          </span>
          {parts[3]}
        </>
      ) : (
        firstWord
      )}
    </span>
  );
}
