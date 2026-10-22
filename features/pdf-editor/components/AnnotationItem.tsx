import { useTranslations } from "next-intl";
import { placeFloatingEditor } from "@/features/pdf-editor/lib/placeFloatingEditor";
import { AnnotationEditor } from "./AnnotationEditor";
import type { TextAnnotation } from "@/features/pdf-editor/stores/annotationsStore";
import { AnimatePresence } from "motion/react";
import {
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";

type Props = {
  annotation: TextAnnotation;
  isSelected: boolean;
  onPointerDown: (
    ann: TextAnnotation
  ) => (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onDoubleClick: (
    ann: TextAnnotation
  ) => (event: ReactMouseEvent<HTMLDivElement>) => void;
  onSelect: (id: string) => void;
  onChange: (id: string, patch: Partial<TextAnnotation>) => void;
  onClone?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMeasure?: (id: string, box: { width: number; height: number }) => void;
};

export function AnnotationItem({
  annotation,
  isSelected,
  onPointerDown,
  onPointerUp,
  onDoubleClick,
  onSelect,
  onChange,
  onClone,
  onDelete,
  onMeasure,
}: Props) {
  const t = useTranslations("pdfEditor");
  const divRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorPosition, setEditorPosition] = useState<{
    top: number;
    left: number;
    placement: "above" | "below";
  }>({ top: 0, left: 0, placement: "above" });

  useLayoutEffect(() => {
    if (!onMeasure) return;
    const el = divRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (
      Math.abs((annotation.boxWidth ?? 0) - rect.width) > 0.5 ||
      Math.abs((annotation.boxHeight ?? 0) - rect.height) > 0.5
    ) {
      onMeasure(annotation.id, { width: rect.width, height: rect.height });
    }
  }, [
    annotation.boxHeight,
    annotation.boxWidth,
    annotation.fontFamily,
    annotation.fontSize,
    annotation.lineHeight,
    annotation.textAlign,
    annotation.text,
    onMeasure,
    annotation.id,
  ]);

  // Mover anotación con las flechas del teclado
  useEffect(() => {
    if (!isSelected) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Solo procesar si son teclas de flecha
      if (
        !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      // Prevenir el scroll de la página
      event.preventDefault();

      // Encontrar el contenedor principal para calcular el incremento relativo
      const container = divRef.current?.closest("[data-pdf-stage]");
      if (!(container instanceof HTMLElement)) return;

      const containerRect = container.getBoundingClientRect();

      // Incremento en píxeles (1px normal, 10px con Shift)
      const pixelIncrement = event.shiftKey ? 10 : 1;

      // Convertir píxeles a porcentaje relativo al contenedor
      const xIncrement = pixelIncrement / containerRect.width;
      const yIncrement = pixelIncrement / containerRect.height;

      let newX = annotation.x;
      let newY = annotation.y;

      switch (event.key) {
        case "ArrowLeft":
          newX = Math.max(0, annotation.x - xIncrement);
          break;
        case "ArrowRight":
          newX = Math.min(1, annotation.x + xIncrement);
          break;
        case "ArrowUp":
          newY = Math.max(0, annotation.y - yIncrement);
          break;
        case "ArrowDown":
          newY = Math.min(1, annotation.y + yIncrement);
          break;
      }

      onChange(annotation.id, { x: newX, y: newY });
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSelected, annotation.id, annotation.x, annotation.y, onChange]);

  // Calcular posición del editor para evitar que se salga del contenedor
  useLayoutEffect(() => {
    if (!isSelected || !divRef.current) {
      return;
    }

    const stageEl = divRef.current.closest("[data-pdf-stage]");
    const stage = stageEl instanceof HTMLElement ? stageEl : null;

    const calculatePosition = () => {
      if (!divRef.current || !editorRef.current) return;
      setEditorPosition(
        placeFloatingEditor(
          divRef.current,
          editorRef.current,
          stage
        )
      );
    };

    // Ejecutar inmediatamente
    calculatePosition();

    // Ejecutar después de que el DOM se actualice
    const timeoutId = setTimeout(calculatePosition, 10);

    // Observar cambios de tamaño del editor y del contenedor
    let resizeObserver: ResizeObserver | null = null;
    let containerResizeObserver: ResizeObserver | null = null;

    if (editorRef.current) {
      resizeObserver = new ResizeObserver(calculatePosition);
      resizeObserver.observe(editorRef.current);
    }

    // Observar cambios en el contenedor principal (CardContent)
    if (stage) {
      containerResizeObserver = new ResizeObserver(calculatePosition);
      containerResizeObserver.observe(stage);
    }

    // Observar scroll del contenedor principal y de la ventana
    const handleScroll = () => calculatePosition();
    if (stage) {
      stage.addEventListener("scroll", handleScroll, {
        passive: true,
      });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      resizeObserver?.disconnect();
      containerResizeObserver?.disconnect();
      if (stage) {
        stage.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isSelected, annotation.x, annotation.y, annotation.text]);

  return (
    <div
      style={{
        left: `${annotation.x * 100}%`,
        top: `${annotation.y * 100}%`,
      }}
      className="absolute"
    >
      <div
        ref={divRef}
        onPointerDown={onPointerDown(annotation)}
        onPointerUp={onPointerUp}
        onDoubleClick={onDoubleClick(annotation)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(annotation.id);
        }}
        className="cursor-move rounded bg-transparent whitespace-pre-wrap"
        style={{
          color: annotation.color,
          fontSize: `${annotation.fontSize}px`,
          fontFamily: annotation.fontFamily,
          lineHeight: annotation.lineHeight ?? 1.2,
          textAlign: annotation.textAlign ?? "left",
        }}
      >
        {annotation.text || (
          <span className="italic text-hub-muted">{t("writeText")}</span>
        )}
      </div>
      <AnimatePresence>
        {isSelected && (
          <div
            key={annotation.id}
            ref={editorRef}
            className="fixed pb-2"
            style={{
              left: `${editorPosition.left}px`,
              top: `${editorPosition.top}px`,
              zIndex: 1000,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <AnnotationEditor
              annotation={annotation}
              onChange={(patch) => onChange(annotation.id, patch)}
              onClone={onClone ? () => onClone(annotation.id) : undefined}
              onDelete={onDelete ? () => onDelete(annotation.id) : undefined}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
