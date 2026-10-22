"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "@/i18n/set-locale";
import type { AppLocale } from "@/i18n/locales";

const options: AppLocale[] = ["es", "en"];

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const change = (next: AppLocale) => {
    if (next === locale || pending) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  };

  return (
    <div
      className="inline-flex items-center rounded-full border border-hub-fg/10 p-0.5"
      role="group"
      aria-label={t("language")}
    >
      {options.map((option) => {
        const active = locale === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => change(option)}
            disabled={pending}
            aria-pressed={active}
            className={`min-h-9 cursor-pointer rounded-full px-2.5 text-xs font-semibold tracking-wide transition-colors ${
              active
                ? "bg-hub-fg text-white"
                : "text-hub-muted hover:text-hub-fg"
            }`}
          >
            {option.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
