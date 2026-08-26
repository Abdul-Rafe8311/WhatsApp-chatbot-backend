import { SECTIONS } from "@/lib/sections";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {SECTIONS.map(({ id, Component }) => (
        <Component key={id} id={id} />
      ))}
    </main>
  );
}
