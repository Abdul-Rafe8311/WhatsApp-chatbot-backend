import { CinematicLanding } from "@/components/cinematic/CinematicLanding";
import { HoursLocation } from "@/components/HoursLocation";
import { SECTIONS } from "@/lib/sections";

/**
 * SCAFFOLD STEP 1 — sticky stage and scroll mapping, no styling.
 *
 * The stage is a client component; everything handed to it is rendered on the
 * server and passed through as elements, so the reduced-motion fallback is the
 * existing stacked page rather than a second implementation of it.
 */
export default function Home() {
  const stacked = SECTIONS.map(({ id, Component }) => (
    <Component key={id} id={id} />
  ));

  return (
    <main className="flex flex-1 flex-col">
      <CinematicLanding
        fallback={stacked}
        contact={<HoursLocation id="hours" />}
      />
    </main>
  );
}
