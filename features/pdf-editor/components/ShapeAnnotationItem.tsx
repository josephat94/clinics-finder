"use client";

import {
  useRef,
  useEffect,
  useState,
  useLayoutEffect,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence } from "motion/react";
import type { ShapeAnnotation } from "@/features/pdf-editor/stores/annotationsStore";
import { ShapeEditor } from "./ShapeEditor";

type ResizeDir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

type Props = {
  annotation: ShapeAnnotation;
  isSelected: boolean;
  onPointerDown: (
    ann: ShapeAnnotation
  ) => (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onSelect: (id: string) => void;
  onChange: (id: string, patch: Partial<ShapeAnnotation>) => void;
  onClone?: (id: string) => void;
};

const HANDLES: { dir: ResizeDir; className: string; cursor: string }[] = [
  { dir: "nw", className: "left-0 top-0 -translate-x-1/2 -translate-y-1/2", cursor: "nwse-resize" },
  { dir: "ne", className: "right-0 top-0 translate-x-1/2 -translate-y-1/2", cursor: "nesw-resize" },
  { dir: "sw", className: "left-0 bottom-0 -translate-x-1/2 translate-y-1/2", cursor: "nesw-resize" },
  { dir: "se", className: "right-0 bottom-0 translate-x-1/2 translate-y-1/2", cursor: "nwse-resize" },
  { dir: "n", className: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2", cursor: "ns-resize" },
  { dir: "s", className: "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2", cursor: "ns-resize" },
  { dir: "w", className: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2", cursor: "ew-resize" },
  { dir: "e", className: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2", cursor: "ew-resize" },
];

const MIN_SIZE = 20;

function findCanvas(el: HTMLElement | null): HTMLCanvasElement | null {
  let current: HTMLElement | null = el;
  while (current) {
    if (current.classList.contains("inline-block")) {
      return current.querySelector("canvas");
    }
    current = current.parentElement;
  }
  return null;
}

export function ShapeAnnotationItem({
  annotation,
  isSelected,
  onPointerDown,
  onPointerUp,
  onSelect,
  onChange,
  onClone,
}: Props) {
  const t = useTranslations("pdfEditor");
  const boxRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const resizeRef = useRef<{
    dir: ResizeDir;
    startX: number;
    startY: number;
    origW: number;
    origH: number;
    origX: number;
    origY: number;
    canvasW: number;
    canvasH: number;
  } | null>(null);
  const [editorPosition, setEditorPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });

  useEffect(() => {
    if (!isSelected) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
      ) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }

      event.preventDefault();

      const canvas = findCanvas(boxRef.current);
      if (!canvas) return;
      const canvasRect = canvas.getBoundingClientRect();
      const pixelIncrement = event.shiftKey ? 10 : 1;
      const xIncrement = pixelIncrement / canvasRect.width;
      const yIncrement = pixelIncrement / canvasRect.height;

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
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSelected, annotation.id, annotation.x, annotation.y, onChange]);

  useLayoutEffect(() => {
    if (!isSelected || !boxRef.current) return;

    const update = () => {
      if (!boxRef.current) return;
      const rect = boxRef.current.getBoundingClientRect();
      const editorWidth = editorRef.current?.offsetWidth ?? 280;
      const margin = 8;
      let left = rect.left;
      let top = rect.bottom + margin;
      const maxLeft = window.innerWidth - editorWidth - 8;
      left = Math.max(8, Math.min(left, maxLeft));
      if (top + 80 > window.innerHeight) {
        top = Math.max(8, rect.top - 80 - margin);
      }
      setEditorPosition({ top, left });
    };

    update();
    const timeoutId = setTimeout(update, 10);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isSelected, annotation.x, annotation.y, annotation.width, annotation.height]);

  const handleResizePointerDown =
    (dir: ResizeDir) => (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      event.preventDefault();
      const canvas = findCanvas(boxRef.current);
      if (!canvas) return;
      const canvasRect = canvas.getBoundingClientRect();
      const pointerId = event.pointerId;
      const handle = event.currentTarget;
      resizeRef.current = {
        dir,
        startX: event.clientX,
        startY: event.clientY,
        origW: annotation.width,
        origH: annotation.height,
        origX: annotation.x,
        origY: annotation.y,
        canvasW: canvasRect.width,
        canvasH: canvasRect.height,
      };

      const applyResize = (clientX: number, clientY: number) => {
        const current = resizeRef.current;
        if (!current) return;

        const dx = clientX - current.startX;
        const dy = clientY - current.startY;
        let width = current.origW;
        let height = current.origH;
        let x = current.origX;
        let y = current.origY;

        const growEast = dir === "e" || dir === "ne" || dir === "se";
        const growWest = dir === "w" || dir === "nw" || dir === "sw";
        const growSouth = dir === "s" || dir === "se" || dir === "sw";
        const growNorth = dir === "n" || dir === "ne" || dir === "nw";

        if (growEast) width = Math.max(MIN_SIZE, current.origW + dx);
        if (growWest) {
          width = Math.max(MIN_SIZE, current.origW - dx);
          x = current.origX + (current.origW - width) / current.canvasW;
        }
        if (growSouth) height = Math.max(MIN_SIZE, current.origH + dy);
        if (growNorth) {
          height = Math.max(MIN_SIZE, current.origH - dy);
          y = current.origY + (current.origH - height) / current.canvasH;
        }

        x = Math.min(1, Math.max(0, x));
        y = Math.min(1, Math.max(0, y));

        const box = boxRef.current;
        const frame = box?.parentElement;
        if (box && frame) {
          box.style.width = `${width}px`;
          box.style.height = `${height}px`;
          frame.style.left = `${x * 100}%`;
          frame.style.top = `${y * 100}%`;
        }

        onChangeRef.current(annotation.id, { width, height, x, y });
      };

      const endResize = () => {
        if (!resizeRef.current) return;
        resizeRef.current = null;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", endResize, true);
        window.removeEventListener("mouseup", endResize, true);
        window.removeEventListener("pointercancel", endResize, true);
        if (handle.hasPointerCapture(pointerId)) {
          handle.releasePointerCapture(pointerId);
        }
      };

      const onMove = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        if (ev.buttons === 0) {
          endResize();
          return;
        }
        ev.preventDefault();
        applyResize(ev.clientX, ev.clientY);
      };

      try {
        handle.setPointerCapture(pointerId);
      } catch {
        // Si el navegador no acepta la captura, el arrastre sigue por los eventos de window.
      }
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", endResize, true);
      window.addEventListener("mouseup", endResize, true);
      window.addEventListener("pointercancel", endResize, true);
    };

  return (
    <div
      style={{
        left: `${annotation.x * 100}%`,
        top: `${annotation.y * 100}%`,
      }}
      className="absolute"
    >
      <div
        ref={boxRef}
        onPointerDown={onPointerDown(annotation)}
        onPointerUp={onPointerUp}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(annotation.id);
        }}
        className={`relative cursor-move border-solid ${
          isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""
        }`}
        style={{
          width: `${annotation.width}px`,
          height: `${annotation.height}px`,
          backgroundColor: annotation.fill,
          borderColor: annotation.stroke,
          borderWidth: `${annotation.strokeWidth}px`,
        }}
      >
        {isSelected &&
          HANDLES.map((handle) => (
            <button
              key={handle.dir}
              type="button"
              aria-label={t("resize", { dir: handle.dir })}
              data-resize-handle="true"
              className={`absolute z-10 h-3.5 w-3.5 touch-none rounded-sm border border-hub-accent bg-white ${handle.className}`}
              style={{ cursor: handle.cursor }}
              onPointerDown={handleResizePointerDown(handle.dir)}
              onClick={(e) => e.stopPropagation()}
            />
          ))}
      </div>
      <AnimatePresence>
        {isSelected && (
          <div
            key={annotation.id}
            ref={editorRef}
            className="fixed"
            style={{
              left: `${editorPosition.left}px`,
              top: `${editorPosition.top}px`,
              zIndex: 1000,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ShapeEditor
              annotation={annotation}
              onChange={(patch) => onChange(annotation.id, patch)}
              onClone={onClone ? () => onClone(annotation.id) : undefined}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
