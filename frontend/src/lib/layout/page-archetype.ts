/**
 * Page archetypes — one interface system for the authenticated app.
 * See `getAppPageMeta` in `@/lib/navigation/app-page-meta` for route → archetype mapping.
 */
export type PageArchetype = "workspace" | "builder" | "studio";

export const DEFAULT_PAGE_ARCHETYPE: PageArchetype = "workspace";

/** Extra classes applied to `<main>` (with width + horizontal padding from the layout frame). */
export function archetypeMainClasses(archetype: PageArchetype): string {
  switch (archetype) {
    case "workspace":
      return "min-h-0 py-5 sm:py-6";
    case "builder":
      return "min-h-0 py-5 sm:py-6";
    case "studio":
      return "flex min-h-0 flex-1 flex-col py-3 sm:py-4";
  }
}

/** Horizontal padding: studio uses slightly tighter gutters for document balance. */
export function archetypeMainXPadding(archetype: PageArchetype): string {
  return archetype === "studio" ? "px-3 sm:px-4" : "px-4 sm:px-6";
}
