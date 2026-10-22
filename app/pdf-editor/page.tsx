"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/features/pdf-editor/components/ui/card";
import { usePdfStore } from "@/features/pdf-editor/stores/pdfStore";
import { useAnnotationsStore } from "@/features/pdf-editor/stores/annotationsStore";
import { exportAnnotatedPdf } from "@/features/pdf-editor/lib/exportPdf";
import { SignatureSelector } from "@/features/pdf-editor/components/SignatureSelector";
import { AnnotationToolbar } from "@/features/pdf-editor/components/AnnotationToolbar";

const PdfUploader = dynamic(
  () =>
    import("@/features/pdf-editor/components/PdfUploader").then(
      (m) => m.PdfUploader
    ),
  {
    ssr: false,
    loading: () => <PdfViewerFallback />,
  }
);

function PdfViewerFallback() {
  const t = useTranslations("pdfEditor");
  return <div className="text-sm text-hub-muted">{t("loadingViewer")}</div>;
}

export default function PdfEditorPage() {
  const t = useTranslations("pdfEditor");
  const { file, setError } = usePdfStore();
  const {
    items,
    startTextPlacement,
    startImagePlacement,
    startShapePlacement,
    activeTool,
    clearAll,
  } = useAnnotationsStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  const handleExport = async () => {
    if (!file) return;
    try {
      setIsExporting(true);
      await exportAnnotatedPdf(file, items);
    } catch (err) {
      console.error(err);
      setError(t("exportError"));
      alert(t("exportErrorDetail"));
    } finally {
      setIsExporting(false);
    }
  };
  return (
    <main className="hub-shell font-body min-h-screen px-4 py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-hub-fg">
            {t("title")}
          </h1>
          <p className="mt-2 text-hub-muted">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex flex-col items-start gap-6 lg:flex-row">
          <div className="order-2 w-full min-w-0 flex-1 lg:order-1">
            <PdfUploader />
          </div>

          {file && (
            <Card className="order-1 h-fit w-full lg:sticky lg:top-6 lg:order-2 lg:w-auto">
              <AnnotationToolbar
                activeTool={activeTool}
                isExporting={isExporting}
                onAddText={startTextPlacement}
                onAddSignature={() => setIsSignatureModalOpen(true)}
                onAddShape={startShapePlacement}
                onClear={clearAll}
                onExport={handleExport}
              />
            </Card>
          )}
        </div>
      </div>

      <SignatureSelector
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSelect={(imagePath) => {
          startImagePlacement(imagePath);
        }}
      />
    </main>
  );
}
