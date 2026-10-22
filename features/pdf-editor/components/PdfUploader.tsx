"use client";

import { useTranslations } from "next-intl";
import {
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type DragEvent as ReactDragEvent,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { usePdfLoader, MAX_SIZE_MB } from "@/features/pdf-editor/hooks/usePdfLoader";
import { useAnnotationsStore } from "@/features/pdf-editor/stores/annotationsStore";
import { AnnotationItem } from "./AnnotationItem";
import { ImageAnnotationItem } from "./ImageAnnotationItem";
import { ShapeAnnotationItem } from "./ShapeAnnotationItem";

// El worker tiene que ser la misma versión de pdfjs que usa react-pdf (6.3.289).
// Si no coincide, el documento nunca termina de cargar.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export function PdfUploader() {
  const t = useTranslations("pdfEditor");
  const {
    file,
    error,
    numPages,
    handleFileChange,
    handleLoadSuccess,
    handleLoadError,
  } = usePdfLoader();
  const {
    items,
    activeTool,
    selectedSignature,
    addText,
    addImage,
    addShape,
    stopTool,
    moveAnnotation,
    updateAnnotation,
    cloneAnnotation,
    removeAnnotation,
  } = useAnnotationsStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const draggingRef = useRef<{
    id: string;
    page: number;
  } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const handleDelete = (id: string) => {
    removeAnnotation(id);
    setSelectedId((current) => (current === id ? null : current));
  };
  const previousSelectedId = useRef<string | null>(null);

  useEffect(() => {
    const previousId = previousSelectedId.current;
    if (previousId && previousId !== selectedId) {
      const previous = items.find((item) => item.id === previousId);
      if (previous?.type === "text" && previous.text.trim() === "") {
        removeAnnotation(previousId);
      }
    }
    previousSelectedId.current = selectedId;
  }, [selectedId, items, removeAnnotation]);
  const [pageHeights, setPageHeights] = useState<Record<number, number>>({});
  const [isDragging, setIsDragging] = useState(false);

  const annotationsByPage = useMemo(() => {
    const map = new Map<number, typeof items>();
    for (const ann of items) {
      const list = map.get(ann.page) ?? [];
      list.push(ann);
      map.set(ann.page, list);
    }
    return map;
  }, [items]);

  const registerPageHeight = useCallback(
    (pageIndex: number, el: HTMLDivElement | null) => {
      if (!el) return;
      const h = el.clientHeight;
      setPageHeights((prev) => {
        if (prev[pageIndex] === h) return prev;
        return { ...prev, [pageIndex]: h };
      });
    },
    []
  );

  const handlePageClick = useCallback(
    (pageIndex: number) => (event: ReactMouseEvent<HTMLDivElement>) => {
      if (activeTool === "none") {
        setSelectedId(null);
        return;
      }

      event.stopPropagation();

      // Usamos el currentTarget (el div de la página) ya que las anotaciones
      // se posicionan relativas a este elemento
      const pageDiv = event.currentTarget;
      const pageDivRect = pageDiv.getBoundingClientRect();

      // Pero también necesitamos el canvas para saber el tamaño real del PDF renderizado
      const canvas = pageDiv.querySelector("canvas");
      const canvasRect = canvas ? canvas.getBoundingClientRect() : pageDivRect;

      // Calculamos las coordenadas relativas al canvas (que es lo que vemos)
      const canvasX = Math.min(
        Math.max((event.clientX - canvasRect.left) / canvasRect.width, 0),
        1
      );
      const canvasY = Math.min(
        Math.max((event.clientY - canvasRect.top) / canvasRect.height, 0),
        1
      );

      if (activeTool === "text") {
        const id = addText({
          page: pageIndex + 1,
          x: canvasX,
          y: canvasY,
          text: "",
          color: "#111111",
          fontSize: 12,
          fontFamily: "Inter, system-ui, sans-serif",
          displayWidth: canvasRect.width,
          displayHeight: canvasRect.height,
        });
        setSelectedId(id);
        stopTool();
      } else if (activeTool === "image" && selectedSignature) {
        // Cargar la imagen para obtener sus dimensiones
        const img = new Image();
        img.onload = () => {
          // Usar un tamaño por defecto razonable (ej: 150px de ancho)
          const defaultWidth = 150;
          const aspectRatio = img.height / img.width;
          const defaultHeight = defaultWidth * aspectRatio;

          const id = addImage({
            page: pageIndex + 1,
            x: canvasX,
            y: canvasY,
            imageSrc: selectedSignature,
            width: defaultWidth,
            height: defaultHeight,
            displayWidth: canvasRect.width,
            displayHeight: canvasRect.height,
          });
          setSelectedId(id);
          stopTool();
        };
        img.src = selectedSignature;
      } else if (activeTool === "shape") {
        const id = addShape({
          page: pageIndex + 1,
          x: canvasX,
          y: canvasY,
          width: 180,
          height: 72,
          fill: "#ffffff",
          stroke: "#ffffff",
          strokeWidth: 2,
          displayWidth: canvasRect.width,
          displayHeight: canvasRect.height,
        });
        setSelectedId(id);
        stopTool();
      }
    },
    [activeTool, selectedSignature, addText, addImage, addShape, stopTool]
  );

  const handleAnnotationPointerDown = useCallback(
    (annPage: number, annId: string) =>
      (event: ReactPointerEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement | null;
        if (target?.closest("[data-resize-handle]")) return;
        event.stopPropagation();
        draggingRef.current = { id: annId, page: annPage };
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      },
    []
  );

  const handleAnnotationPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-resize-handle]")) return;
      event.stopPropagation();
      if (
        event.currentTarget.hasPointerCapture &&
        event.currentTarget.hasPointerCapture(event.pointerId)
      ) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      draggingRef.current = null;
    },
    []
  );

  const handleAnnotationDoubleClick = useCallback(
    (annId: string) => (event: ReactMouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      setSelectedId(annId);
    },
    []
  );

  const handlePagePointerMove = useCallback(
    (pageIndex: number) => (event: ReactPointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-resize-handle]")) return;
      if (!draggingRef.current) return;
      if (draggingRef.current.page !== pageIndex + 1) return;

      // Usamos el canvas para calcular las coordenadas
      const pageDiv = event.currentTarget;
      const canvas = pageDiv.querySelector("canvas");
      const canvasRect = canvas
        ? canvas.getBoundingClientRect()
        : pageDiv.getBoundingClientRect();

      const x = Math.min(
        Math.max((event.clientX - canvasRect.left) / canvasRect.width, 0),
        1
      );
      const y = Math.min(
        Math.max((event.clientY - canvasRect.top) / canvasRect.height, 0),
        1
      );
      moveAnnotation(draggingRef.current.id, { x, y });
      setSelectedId(draggingRef.current.id);
    },
    [moveAnnotation]
  );

  const handlePagePointerUp = useCallback(() => {
    draggingRef.current = null;
  }, []);

  const selectedAnnotation = useMemo(
    () => items.find((ann) => ann.id === selectedId) ?? null,
    [items, selectedId]
  );

  const [pageWidth, setPageWidth] = useState(900);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || numPages < 1) return;

    const measure = () => {
      const width = el.clientWidth;
      if (width > 0) setPageWidth(Math.min(width, 900));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [numPages]);

  const triggerFileDialog = () => fileInputRef.current?.click();

  const handleDragOver = useCallback((e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: ReactDragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles && droppedFiles.length > 0) {
        const droppedFile = droppedFiles[0];
        // Verificar que sea un PDF
        if (droppedFile.type === "application/pdf") {
          // Crear un evento sintético para usar el mismo handler
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(droppedFile);
          const syntheticEvent = {
            target: { files: dataTransfer.files },
          } as React.ChangeEvent<HTMLInputElement>;
          handleFileChange(syntheticEvent);
        }
      }
    },
    [handleFileChange]
  );

  return (
    <div className="flex w-full flex-col gap-6 pt-4">
      <Card
        className={`relative overflow-hidden p-4 transition-shadow duration-200 ${
          isDragging ? "ring-2 ring-hub-accent" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!file && (
          <>
            <CardHeader className="pb-2 relative z-10">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-hub-muted">
                {t("uploadEyebrow")}
              </p>
              <CardTitle>{t("uploadTitle")}</CardTitle>
              <CardDescription>
                {isDragging ? t("dropHere") : t("uploadHelp")}
              </CardDescription>
            </CardHeader>
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className="flex flex-col items-center gap-4 text-[#15803d]">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-hub-primary/30 blur-xl motion-safe:animate-pulse"></div>
                    <svg
                      className="relative h-16 w-16"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-hub-fg">
                      {t("dropToLoad")}
                    </p>
                    <p className="mt-1 text-sm text-hub-muted">
                      {t("dropHint")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <CardContent
          className={`space-y-4 relative z-10 transition-opacity duration-300 ${
            isDragging ? "opacity-30" : ""
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <Label>{t("file")}</Label>
              <p className="text-sm text-hub-muted">
                {file
                  ? `${file.name} • ${(file.size / 1024 / 1024).toFixed(2)} MB`
                  : t("noFile")}
              </p>
            </div>
            <Button size="sm" onClick={triggerFileDialog}>
              {t("browse")}
            </Button>
          </div>
          <Input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-sm text-hub-muted">
            {t("pdfOnlyHint", { max: MAX_SIZE_MB })}
          </p>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-hub-danger">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {file && (
      <Card>
        <CardHeader className="pb-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-hub-muted">
            {t("previewEyebrow")}
          </p>
          <CardTitle className="text-xl">{t("document")}</CardTitle>
          <CardDescription>{t("renderedWith")}</CardDescription>
        </CardHeader>
        <CardContent
          ref={containerRef}
          data-pdf-stage
          className="relative min-h-[400px] w-full overflow-hidden rounded-2xl border border-white/80 bg-white/80 p-4"
          onClick={() => setSelectedId(null)}
        >
          <div className="flex flex-col gap-4">
              <Document
                file={file}
                suspense={false}
                onLoadSuccess={handleLoadSuccess}
                onLoadError={handleLoadError}
                loading={
                  <div className="text-sm text-hub-muted">{t("loadingDocument")}</div>
                }
                onSourceError={handleLoadError}
                className="flex flex-col gap-6"
              >
                {Array.from(new Array(numPages), (_, index) => {
                  const pageAnnotations =
                    annotationsByPage.get(index + 1) ?? [];
                  return (
                    <div
                      key={`page_${index + 1}`}
                      ref={(el) => registerPageHeight(index + 1, el)}
                      className="relative overflow-hidden"
                    >
                      <div
                        onClick={handlePageClick(index)}
                        onPointerMove={handlePagePointerMove(index)}
                        onPointerUp={handlePagePointerUp}
                        className="relative inline-block"
                      >
                        <Page
                          pageNumber={index + 1}
                          width={pageWidth}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                        {/* Anotaciones superpuestas - ahora relativas al Page/canvas */}
                        {pageAnnotations.map((ann) => {
                          const isSelected = selectedId === ann.id;
                          if (ann.type === "text") {
                            return (
                              <AnnotationItem
                                key={ann.id}
                                annotation={ann}
                                isSelected={isSelected}
                                onPointerDown={(a) =>
                                  handleAnnotationPointerDown(a.page, a.id)
                                }
                                onPointerUp={handleAnnotationPointerUp}
                                onDoubleClick={(a) =>
                                  handleAnnotationDoubleClick(a.id)
                                }
                                onSelect={setSelectedId}
                                onChange={updateAnnotation}
                                onClone={(id) => {
                                  const newId = cloneAnnotation(id);
                                  if (newId) {
                                    setSelectedId(newId);
                                  }
                                }}
                                onDelete={handleDelete}
                                onMeasure={(id, box) =>
                                  updateAnnotation(id, {
                                    boxWidth: box.width,
                                    boxHeight: box.height,
                                  })
                                }
                              />
                            );
                          } else if (ann.type === "image") {
                            return (
                              <ImageAnnotationItem
                                key={ann.id}
                                annotation={ann}
                                isSelected={isSelected}
                                onPointerDown={(a) =>
                                  handleAnnotationPointerDown(a.page, a.id)
                                }
                                onPointerUp={handleAnnotationPointerUp}
                                onSelect={setSelectedId}
                                onChange={updateAnnotation}
                                onClone={(id) => {
                                  const newId = cloneAnnotation(id);
                                  if (newId) {
                                    setSelectedId(newId);
                                  }
                                }}
                                onDelete={handleDelete}
                              />
                            );
                          } else if (ann.type === "shape") {
                            return (
                              <ShapeAnnotationItem
                                key={ann.id}
                                annotation={ann}
                                isSelected={isSelected}
                                onPointerDown={(a) =>
                                  handleAnnotationPointerDown(a.page, a.id)
                                }
                                onPointerUp={handleAnnotationPointerUp}
                                onSelect={setSelectedId}
                                onChange={updateAnnotation}
                                onClone={(id) => {
                                  const newId = cloneAnnotation(id);
                                  if (newId) {
                                    setSelectedId(newId);
                                  }
                                }}
                                onDelete={handleDelete}
                              />
                            );
                          }
                          return null;
                        })}
                      </div>
                      <div className="pointer-events-none absolute inset-0 border border-transparent" />
                    </div>
                  );
                })}
              </Document>
            </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
