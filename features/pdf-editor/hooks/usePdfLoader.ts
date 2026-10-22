import { useCallback } from "react";
import { type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { usePdfStore } from "@/features/pdf-editor/stores/pdfStore";
import { useAnnotationsStore } from "@/features/pdf-editor/stores/annotationsStore";

export const MAX_SIZE_MB = 20;

export function usePdfLoader() {
  const {
    file,
    error,
    numPages,
    setFile,
    setError,
    setNumPages,
    setIsLoading,
    reset,
  } = usePdfStore();

  const { clearAll } = useAnnotationsStore();
  const t = useTranslations("pdfEditor");

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextFile = event.target.files?.[0];
      if (!nextFile) return;

      reset();

      if (nextFile.type !== "application/pdf") {
        setError(t("pdfOnly"));
        return;
      }

      if (nextFile.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(t("fileTooLarge", { max: MAX_SIZE_MB }));
        return;
      }

      setError(null);
      setIsLoading(true);
      setNumPages(0);
      clearAll();
      setFile(nextFile);
    },
    [reset, setError, setFile, setIsLoading, setNumPages, clearAll, t]
  );

  const handleLoadSuccess = useCallback(
    ({ numPages: pages }: { numPages: number }) => {
      setNumPages(pages);
      setIsLoading(false);
    },
    [setIsLoading, setNumPages]
  );

  const handleLoadError = useCallback(
    (err: Error) => {
      setIsLoading(false);
      setError(err.message);
    },
    [setError, setIsLoading]
  );

  return {
    file,
    error,
    numPages,
    handleFileChange,
    handleLoadSuccess,
    handleLoadError,
  };
}
