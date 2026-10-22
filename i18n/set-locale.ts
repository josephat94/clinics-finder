"use server";

import { cookies } from "next/headers";
import { resolveLocale, type AppLocale } from "./locales";

export async function setLocale(locale: AppLocale) {
  const store = await cookies();
  store.set("locale", resolveLocale(locale), {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}
