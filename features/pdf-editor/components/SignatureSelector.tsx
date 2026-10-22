"use client";

import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

const AVAILABLE_SIGNATURES = [
  { name: "William Green", path: "/signs/William.png", states: ["Georgia"] },
  { name: "Amy", path: "/signs/Amy.png", states: ["Illinois"] },
  {
    name: "Brian Felicetti",
    path: "/signs/Brian.png",
    states: ["New York", "North Carolina"],
  },
  /*   {
    name: "Paul Rodriguez",
    path: "/signs/kristopher_amundsen.png",
    states: ["Arizona"],
  }, */
  {
    name: "kristopher Amundsen",
    path: "/signs/kristopher_amundsen.png",
    states: ["Arizona", "California"],
  },
  {
    name: "Raveena Dhami",
    path: "/signs/Raveena.png",
    states: ["Florida", "Texas", "Any Other State"],
  },
  {
    name: "Tristan Gillespie",
    path: "/signs/Tristan.png",
    states: ["New Jersey"],
  },
  {
    name: "Stacy Hansen",
    path: "/signs/Stacy-hansen.png",
    states: ["Alabama", "Colorado", "Maryland", "D.C"],
  },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imagePath: string) => void;
};

export function SignatureSelector({ isOpen, onClose, onSelect }: Props) {
  const t = useTranslations("pdfEditor");
  const common = useTranslations("common");
  const reduceMotion = useReducedMotion();
  const handleSelect = (path: string) => {
    onSelect(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          {/* Modal */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>{t("selectSignature")}</CardTitle>
                <CardDescription>
                  {t("selectSignatureHelp")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {AVAILABLE_SIGNATURES.map((signature) => (
                    <button
                      key={signature.name}
                      type="button"
                      onClick={() => handleSelect(signature.path)}
                      className="glass-field group relative cursor-pointer overflow-hidden rounded-2xl text-left transition-[box-shadow,background-color] duration-200 hover:ring-2 hover:ring-hub-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a] focus-visible:ring-offset-2 focus-visible:ring-offset-hub-bg"
                    >
                      <div className="relative aspect-video p-4">
                        <Image
                          src={signature.path}
                          alt={signature.name}
                          fill
                          unoptimized
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-contain p-4"
                        />
                      </div>
                      <div className="p-2 text-center">
                        <p className="text-sm font-semibold text-hub-fg">
                          {signature.name}
                        </p>
                        <p className="text-sm text-hub-muted">
                          {signature.states.join(", ")}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" onClick={onClose}>
                    {common("cancel")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
