"use client";

import { Lock, LockOpen, Copy } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import type { ImageAnnotation } from "@/features/pdf-editor/stores/annotationsStore";

type Props = {
  annotation: ImageAnnotation;
  onChange: (patch: Partial<ImageAnnotation>) => void;
  onClone?: () => void;
};

const EditorLabel = ({ children }: { children: React.ReactNode }) => (
  <Label className="text-sm font-semibold text-hub-fg">{children}</Label>
);

export function ImageEditor({ annotation, onChange, onClone }: Props) {
  const t = useTranslations("pdfEditor");
  const [aspectRatio, setAspectRatio] = useState(
    annotation.width / annotation.height
  );
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  // Calcular aspect ratio inicial cuando se carga la imagen
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      setAspectRatio(ratio);
    };
    img.src = annotation.imageSrc;
  }, [annotation.imageSrc]);

  const handleWidthChange = (newWidth: number) => {
    if (lockAspectRatio) {
      const newHeight = newWidth / aspectRatio;
      onChange({ width: newWidth, height: newHeight });
    } else {
      onChange({ width: newWidth });
    }
  };

  const handleHeightChange = (newHeight: number) => {
    if (lockAspectRatio) {
      const newWidth = newHeight * aspectRatio;
      onChange({ width: newWidth, height: newHeight });
    } else {
      onChange({ height: newHeight });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="glass-card flex min-w-fit flex-col gap-3 rounded-2xl p-3"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-row gap-3 items-end">
        <div className="flex flex-col gap-1">
          <EditorLabel>{t("widthPx")}</EditorLabel>
          <input
            type="number"
            min={20}
            max={1000}
            step={5}
            className="glass-field h-11 w-24 rounded-2xl px-2 py-1 text-sm text-hub-fg outline-none"
            value={Math.round(annotation.width)}
            onChange={(e) => {
              const value = Number(e.target.value) || annotation.width;
              handleWidthChange(value);
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <EditorLabel>{t("heightPx")}</EditorLabel>
          <input
            type="number"
            min={20}
            max={1000}
            step={5}
            className="glass-field h-11 w-24 rounded-2xl px-2 py-1 text-sm text-hub-fg outline-none"
            value={Math.round(annotation.height)}
            onChange={(e) => {
              const value = Number(e.target.value) || annotation.height;
              handleHeightChange(value);
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="h-4"></div>
          <Button
            variant={lockAspectRatio ? "primary" : "outline"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setLockAspectRatio(!lockAspectRatio);
            }}
            className="whitespace-nowrap"
            aria-label={lockAspectRatio ? t("unlockRatio") : t("lockRatio")}
            title={lockAspectRatio ? t("unlockRatio") : t("lockRatio")}
          >
            {lockAspectRatio ? (
              <Lock size={18} aria-hidden="true" />
            ) : (
              <LockOpen size={18} aria-hidden="true" />
            )}
          </Button>
        </div>
        {onClone && (
          <div className="flex flex-col gap-1">
            <div className="h-4"></div>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClone();
              }}
              className="whitespace-nowrap"
              title="Clonar esta firma"
            >
              <Copy size={18} aria-hidden="true" /> Duplicar
            </Button>
          </div>
        )}
      </div>
      <div className="text-sm text-hub-muted">
        {lockAspectRatio
          ? t("ratioLocked")
          : t("ratioFree")}
      </div>
    </motion.div>
  );
}
