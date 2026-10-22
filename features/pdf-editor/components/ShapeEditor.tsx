"use client";

import { Trash } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import type { ShapeAnnotation } from "@/features/pdf-editor/stores/annotationsStore";

type Props = {
  annotation: ShapeAnnotation;
  onChange: (patch: Partial<ShapeAnnotation>) => void;
  onClone?: () => void;
  onDelete?: () => void;
};

const EditorLabel = ({ children }: { children: React.ReactNode }) => (
  <Label className="text-sm font-semibold text-hub-fg">{children}</Label>
);

export function ShapeEditor({ annotation, onChange, onClone, onDelete }: Props) {
  const t = useTranslations("pdfEditor");
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="glass-card flex min-w-fit flex-col gap-3 rounded-2xl p-3"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex flex-row gap-3 items-end">
        <div className="flex flex-col gap-1">
          <EditorLabel>{t("widthPx")}</EditorLabel>
          <input
            type="number"
            min={20}
            max={2000}
            step={5}
            className="glass-field h-11 w-24 rounded-2xl px-2 py-1 text-sm text-hub-fg outline-none"
            value={Math.round(annotation.width)}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (!Number.isFinite(value)) return;
              onChange({ width: Math.max(20, value) });
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <EditorLabel>{t("heightPx")}</EditorLabel>
          <input
            type="number"
            min={20}
            max={2000}
            step={5}
            className="glass-field h-11 w-24 rounded-2xl px-2 py-1 text-sm text-hub-fg outline-none"
            value={Math.round(annotation.height)}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (!Number.isFinite(value)) return;
              onChange({ height: Math.max(20, value) });
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <EditorLabel>{t("fill")}</EditorLabel>
          <input
            type="color"
            className="h-11 w-11 cursor-pointer rounded-xl border border-hub-border bg-white/80 p-1"
            value={annotation.fill}
            onChange={(e) => onChange({ fill: e.target.value })}
            title={t("fill")}
          />
        </div>
        <div className="flex flex-col gap-1">
          <EditorLabel>{t("stroke")}</EditorLabel>
          <input
            type="color"
            className="h-11 w-11 cursor-pointer rounded-xl border border-hub-border bg-white/80 p-1"
            value={annotation.stroke}
            onChange={(e) => onChange({ stroke: e.target.value })}
            title={t("stroke")}
          />
        </div>
        {(onClone || onDelete) && (
          <div className="flex flex-col gap-2">
            <div className="h-4"></div>
            {onClone && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onClone();
                }}
                className="whitespace-nowrap"
                title="Duplicar este recuadro"
              >
                Duplicar
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="whitespace-nowrap border-hub-danger text-hub-danger hover:bg-red-50"
                title={t("deleteElement")}
              >
                <Trash size={18} aria-hidden="true" /> {t("deleteElement")}
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
