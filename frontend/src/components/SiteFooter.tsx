import { Seal } from "@/components/Seal";
import { Wordmark } from "@/components/Wordmark";
import { copy } from "@/config/copy";
import { salon } from "@/config/salon";
import { whatsappReady } from "@/lib/whatsapp";

const SOCIALS = [
  { href: salon.info.instagram, label: copy.footer.instagram },
  { href: salon.info.facebook, label: copy.footer.facebook },
];

export function SiteFooter() {
  return (
    <footer className="seam bg-ink">
      <div className="wrap flex flex-col gap-8 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Seal className="text-2xl" />
            <Wordmark className="text-xl" />
          </div>
          <p className="type-meta text-ivory/60">{salon.info.city}</p>
        </div>

        <nav>
          <ul className="flex flex-col gap-3 sm:items-end">
            {SOCIALS.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="type-meta inline-flex min-h-[44px] items-center text-ivory/75 hover:text-ivory transition-colors duration-200"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* The only place the unset number is surfaced — quietest type on the
          page, and it disappears on its own once a real number is set. */}
      {!whatsappReady && (
        <div className="wrap">
          <p className="text-xs leading-relaxed text-ivory/35">
            {copy.footer.demoNotice}
          </p>
        </div>
      )}

      {/* Clearance for the fixed sticky CTA, so it never covers the last of
          the footer content at the bottom of the scroll. */}
      <div aria-hidden="true" className="h-24" />
    </footer>
  );
}
