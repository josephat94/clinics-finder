import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { resolveLocale } from "./locales";

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = resolveLocale(store.get("locale")?.value);

  const messages =
    locale === "en"
      ? (await import("../messages/en.json")).default
      : (await import("../messages/es.json")).default;

  return {
    locale,
    messages,
  };
});
