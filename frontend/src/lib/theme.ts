/**
 * Runs before first paint, inlined into <head>.
 *
 * A static export ships pre-rendered HTML, so without this a visitor whose
 * stored choice is dark would get a white flash before React could correct
 * it. This has to be a blocking inline script in the head: anything
 * deferred, bundled or hydration-driven is already too late. (next/script's
 * beforeInteractive is not an option — it queues the code in self.__next_s
 * and drains it after load, which is the flash all over again.)
 *
 * Light is the unconditional default. `prefers-color-scheme` is deliberately
 * NOT consulted: the light palette is the brand identity, not a preference.
 * Most visitors arrive from the Instagram bio link and see this page once, so
 * a bride whose phone is in dark mode would otherwise never see the design
 * the salon is actually being sold. Only an explicit stored choice — made by
 * pressing the toggle — turns the dark theme on.
 */
export const THEME_INIT_SCRIPT = `(function(){try{if(localStorage.getItem("theme")==="dark"){document.documentElement.classList.add("dark")}}catch(e){}})();`;
