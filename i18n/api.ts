import { getTranslations } from "next-intl/server";

export async function apiMessage(
  key: string,
  values?: Record<string, string | number>
) {
  const t = await getTranslations("api");
  return t(key, values);
}
