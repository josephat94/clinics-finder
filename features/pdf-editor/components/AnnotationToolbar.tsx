"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  CircleNotch,
  DownloadSimple,
  Eraser,
  Rectangle,
  Signature,
  TextT,
} from "@phosphor-icons/react";
import { Button } from "@/features/pdf-editor/components/ui/button";
import { Tooltip } from "@/features/pdf-editor/components/ui/tooltip";

type Tool = "none" | "text" | "image" | "shape";

type Props = {
  activeTool: Tool;
  isExporting: boolean;
  onAddText: () => void;
  onAddSignature: () => void;
  onAddShape: () => void;
  onClear: () => void;
  onExport: () => void;
};

export function AnnotationToolbar({
  activeTool,
  isExporting,
  onAddText,
  onAddSignature,
  onAddShape,
  onClear,
  onExport,
}: Props) {
  const t = useTranslations("pdfEditor");
  return (
    <div className="flex flex-row flex-wrap items-center justify-center gap-2 p-3 lg:flex-col">
      <ToolButton
        label={activeTool === "text" ? t("placeHint") : t("addText")}
        pressed={activeTool === "text"}
        onClick={onAddText}
      >
        <TextT size={22} aria-hidden="true" />
      </ToolButton>

      <ToolButton
        label={activeTool === "image" ? t("placeHint") : t("addSignature")}
        pressed={activeTool === "image"}
        onClick={onAddSignature}
      >
        <Signature size={22} aria-hidden="true" />
      </ToolButton>

      <ToolButton
        label={activeTool === "shape" ? t("placeHint") : t("addShape")}
        pressed={activeTool === "shape"}
        onClick={onAddShape}
      >
        <Rectangle size={22} aria-hidden="true" />
      </ToolButton>

      <div className="mx-1 h-6 w-px bg-[#fde68a] lg:my-1 lg:h-px lg:w-6" />

      <ToolButton label={t("clear")} onClick={onClear}>
        <Eraser size={22} aria-hidden="true" />
      </ToolButton>

      <ToolButton
        label={isExporting ? t("exporting") : t("export")}
        onClick={onExport}
        variant="primary"
        disabled={isExporting}
      >
        {isExporting ? (
          <CircleNotch size={22} className="motion-safe:animate-spin" aria-hidden="true" />
        ) : (
          <DownloadSimple size={22} aria-hidden="true" />
        )}
      </ToolButton>
    </div>
  );
}

function ToolButton({
  label,
  pressed,
  variant = "outline",
  disabled,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  variant?: "primary" | "outline";
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip label={label}>
      <Button
        type="button"
        size="icon"
        variant={pressed ? "primary" : variant}
        aria-label={label}
        aria-pressed={pressed}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </Button>
    </Tooltip>
  );
}
