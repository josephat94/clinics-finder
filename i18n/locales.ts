export const locales = ["es", "en"] as const;

export type AppLocale = (typeof locales)[number];

export function resolveLocale(value: string | undefined | null): AppLocale {
  return value === "en" ? "en" : "es";
}
