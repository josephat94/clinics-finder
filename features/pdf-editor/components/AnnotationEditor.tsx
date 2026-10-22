import { useTranslations } from "next-intl";
import { Copy, Trash } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import type { TextAnnotation } from "@/features/pdf-editor/stores/annotationsStore";

type Props = {
  annotation: TextAnnotation;
  onChange: (patch: Partial<TextAnnotation>) => void;
  onClone?: () => void;
  onDelete?: () => void;
};

const EditorLabel = ({ children }: { children: React.ReactNode }) => (
  <Label className="text-sm font-semibold text-hub-fg">{children}</Label>
);

export function AnnotationEditor({ annotation, onChange, onClone, onDelete }: Props) {
  const t = useTranslations("pdfEditor");
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="glass-card flex min-w-fit flex-col-reverse gap-3 rounded-2xl p-3"
    >
      <div className="flex flex-col gap-1">
        <EditorLabel>{t("text")}</EditorLabel>
        <textarea
          className="glass-field resize-none rounded-2xl px-3 py-2 text-sm text-hub-fg outline-none"
          value={annotation.text}
          onChange={(e) => onChange({ text: e.target.value })}
          rows={3}
          cols={30}
          autoFocus={annotation.text.length === 0}
          placeholder={t("textPlaceholder")}
        />
        <div className="flex gap-1 mt-1">
          <Button
            variant={
              annotation.textAlign === "left" || !annotation.textAlign
                ? "primary"
                : "outline"
            }
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onChange({ textAlign: "left" });
            }}
            className="flex-1"
            title="Alinear a la izquierda"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="15" y2="12" />
              <line x1="3" y1="18" x2="18" y2="18" />
            </svg>
          </Button>
          <Button
            variant={annotation.textAlign === "center" ? "primary" : "outline"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onChange({ textAlign: "center" });
            }}
            className="flex-1"
            title="Centrar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="6" y1="12" x2="18" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </Button>
          <Button
            variant={annotation.textAlign === "right" ? "primary" : "outline"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onChange({ textAlign: "right" });
            }}
            className="flex-1"
            title="Alinear a la derecha"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="9" y1="12" x2="21" y2="12" />
              <line x1="6" y1="18" x2="21" y2="18" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="flex flex-row gap-3 items-end">
        <div className="flex flex-col gap-1">
          <EditorLabel>{t("size")}</EditorLabel>
          <input
            type="number"
            min={8}
            max={72}
            className="glass-field h-11 w-24 rounded-2xl px-2 py-1 text-sm text-hub-fg outline-none"
            value={annotation.fontSize}
            onChange={(e) =>
              onChange({
                fontSize: Number(e.target.value) || annotation.fontSize,
              })
            }
          />
        </div>
        <div className="flex flex-col gap-1">
          <EditorLabel>{t("spacing")}</EditorLabel>
          <input
            type="number"
            min={0.8}
            max={3.0}
            step={0.1}
            className="glass-field h-11 w-20 rounded-2xl px-2 py-1 text-sm text-hub-fg outline-none"
            value={annotation.lineHeight ?? 1.2}
            onChange={(e) =>
              onChange({
                lineHeight: Number(e.target.value) || 1.2,
              })
            }
            title={t("spacingTitle")}
          />
        </div>
        <div className="flex flex-col gap-1">
          <EditorLabel>{t("font")}</EditorLabel>
          <select
            className="glass-field h-11 rounded-2xl px-2 py-1 text-sm text-hub-fg outline-none"
            value={annotation.fontFamily}
            onChange={(e) => onChange({ fontFamily: e.target.value })}
          >
            <option value="Inter, system-ui, sans-serif">Inter</option>
            <option value="Arial, sans-serif">Arial</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="Courier New, monospace">Courier New</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <EditorLabel>{t("color")}</EditorLabel>
          <input
            type="color"
            className="h-11 w-11 cursor-pointer rounded-xl border border-hub-border bg-white/80 p-1"
            value={annotation.color}
            onChange={(e) => onChange({ color: e.target.value })}
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
                title="Clonar este texto"
              >
                <Copy size={18} aria-hidden="true" /> Duplicar
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
