"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchIntoInvetory } from "@/components/search-into-inventory/SearchIntoInvetory";
import { Container } from "@/components/ui/container/Container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clinic } from "@/types/clinic";
import { secondsToMinutesAndSeconds } from "@/utils/time";
import { Button } from "@/components/ui/button";
import { FaAt, FaFax, FaGlobe, FaInfo, FaListAlt, FaMapMarkerAlt, FaPhone, FaPhoneAlt, FaPlus, FaPrint, FaTable } from "react-icons/fa";
import { ClinicModal } from "@/components/clinics/ClinicModal";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useClinicsStore, useUIStore, type ClinicWithTravelTime } from "@/stores";

interface ClinicsPageClientProps {
  initialClinics: Clinic[];
  availableStates: { code: string; name: string }[];
}

export function ClinicsPageClient({
  initialClinics,
  availableStates,
}: ClinicsPageClientProps) {
  // Stores
  const { filteredClinics, setInitialClinics, setFilteredClinics } = useClinicsStore();
  const { viewMode, setViewMode, isCreateModalOpen, openCreateModal, closeCreateModal } = useUIStore();

  // Estado para el modal de confirmación de eliminación
  const [clinicToDelete, setClinicToDelete] = useState<ClinicWithTravelTime | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estado para el modal de edición
  const [clinicToEdit, setClinicToEdit] = useState<ClinicWithTravelTime | null>(null);

  // Inicializar clínicas en el store
  useEffect(() => {
    setInitialClinics(initialClinics);
  }, [initialClinics, setInitialClinics]);

  // Función para manejar la eliminación
  const handleDeleteClick = (clinic: ClinicWithTravelTime) => {
    setClinicToDelete(clinic);
  };

  const handleConfirmDelete = async () => {
    if (!clinicToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/clinics/${clinicToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la clínica');
      }

      // Actualizar las clínicas filtradas removiendo la eliminada
      setFilteredClinics(
        filteredClinics.filter((clinic) => clinic.id !== clinicToDelete.id)
      );

      // Cerrar el modal
      setClinicToDelete(null);
    } catch (error) {
      console.error('Error al eliminar la clínica:', error);
      alert('Error al eliminar la clínica. Por favor, intenta de nuevo.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Función para manejar la edición
  const handleEditClick = (clinic: ClinicWithTravelTime) => {
    setClinicToEdit(clinic);
  };

  const handleModalSuccess = () => {
    // Recargar la página para mostrar los cambios
    window.location.reload();
  };

  const getBadgeVariantFromMinutes = (minutes: number) => {
    if (minutes < 16) return "success";
    if (minutes < 31) return "warning";
    return "danger";
  }

  const gridCols= viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1";

  return (
    <Container className="min-h-screen bg-zinc-50 dark:bg-black py-16 px-4 flex flex-col gap-8">
      <SearchIntoInvetory
        options={availableStates}
        initialClinics={initialClinics}
      />

<div className="flex items-center justify-end w-full gap-6" >

  <div className="flex items-center gap-2">
  <Button disabled={viewMode === "list"} variant="outline" size="md" onClick={() => setViewMode("list")}>
  <FaListAlt />
    </Button>
    <Button disabled={viewMode === "grid"} variant="outline" size="md" onClick={() => setViewMode("grid")}>
    <FaTable />
    </Button>
  </div>
    <Button variant="outline" size="md" onClick={openCreateModal}>
      <FaPlus/>
      Agregar Clínica
    </Button>
</div>
      <div className={viewMode === "list" ? "w-full" : "w-full"}>
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-8">
          Clínicas
        </h1>

        {filteredClinics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-zinc-400">
              No hay clínicas registradas aún.
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${gridCols} ${viewMode === "list" ? "w-full" : "w-full"} items-stretch`}>
            <AnimatePresence mode="popLayout">
              {filteredClinics.map((clinic, index) => {
                // Determinar la variante basada en si tiene travelTime y su posición
                const hasTravelTime = clinic.travelTime !== undefined;
                let variant: "normal" | "first" | "second" | "third" = "normal";

                let variantFloatingBadge: "success" | "warning" | "danger" | "info" = "success";

                if (hasTravelTime) {
                  if (index === 0){
                    variant = "first";
                    const minutes= secondsToMinutesAndSeconds(clinic.travelTime?.duration.value ?? 0);
                    variantFloatingBadge =  getBadgeVariantFromMinutes(minutes?.minutes ?? 0);
                  } 
                  else if (index === 1){
                    variant = "second";
                    const minutes= secondsToMinutesAndSeconds(clinic.travelTime?.duration.value ?? 0);
                    variantFloatingBadge =  getBadgeVariantFromMinutes(minutes?.minutes ?? 0);
                  }
                  else if (index === 2){
                    variant = "third";
                    const minutes= secondsToMinutesAndSeconds(clinic.travelTime?.duration.value ?? 0);
                    variantFloatingBadge =  getBadgeVariantFromMinutes(minutes?.minutes ?? 0);
                  }
                }

                // Animaciones base para todas las cards
                const baseVariants = {
                  hidden: {
                    opacity: 0,
                    y: 20,
                    scale: 0.95,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      duration: 0.3,
                      delay: index * 0.05,
                    },
                  },
                  exit: {
                    opacity: 0,
                    scale: 0.95,
                    y: -20,
                    transition: {
                      duration: 0.2,
                    },
                  },
                };

                // Animaciones especiales para variantes destacadas
                const specialVariants: Record<string, any> = {
                  first: {
                    hidden: {
                      opacity: 0,
                      y: 30,
                      scale: 0.9,
                    },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        delay: index * 0.1,
                      },
                    },
                    exit: {
                      opacity: 0,
                      scale: 0.9,
                      y: -30,
                      transition: {
                        duration: 0.2,
                      },
                    },
                  },
                  second: {
                    hidden: {
                      opacity: 0,
                      y: 25,
                      scale: 0.92,
                    },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 280,
                        damping: 22,
                        delay: index * 0.08,
                      },
                    },
                    exit: {
                      opacity: 0,
                      scale: 0.92,
                      y: -25,
                      transition: {
                        duration: 0.2,
                      },
                    },
                  },
                  third: {
                    hidden: {
                      opacity: 0,
                      y: 25,
                      scale: 0.92,
                    },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 260,
                        damping: 24,
                        delay: index * 0.06,
                      },
                    },
                    exit: {
                      opacity: 0,
                      scale: 0.92,
                      y: -25,
                      transition: {
                        duration: 0.2,
                      },
                    },
                  },
                };

                const animationVariants = 
                  variant === "first" || variant === "second" || variant === "third"
                    ? specialVariants[variant]
                    : baseVariants;

                return (
                  <motion.div
                    key={clinic.id}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={animationVariants}
                    layout
                    className="h-full"
                  >
                    <Card
                showOptions={true}
                onEdit={() => handleEditClick(clinic)}
                onDelete={() => handleDeleteClick(clinic)}
                  key={clinic.id}
                  variant={variant}
                  travelTime={clinic.travelTime}
                  floatingBadge={
                    hasTravelTime ? (
                      <>
                        <Badge variant={variantFloatingBadge} size="lg">
                          {clinic.travelTime?.duration.text}
                        </Badge>
                      </>
                    ) : undefined
                  }
                  className={clinic.banned ? "opacity-80 border-red-500 dark:border-red-600 bg-red-50/30 dark:bg-red-950/20" : ""}

                  badges={
                    <>
                    <div className="flex gap-2">
                    {clinic.banned && (
                      <Badge variant="danger" size="sm">
                        Baneada
                      </Badge>
                    )}
                    {!clinic.enabled && (
                      <Badge variant="warning" size="sm">
                        Deshabilitada
                      </Badge>
                    )}
                  </div>
                    </>
                  }
                >
                  <div className="flex items-start justify-between mb-2">
                    <h2 className={`text-xl font-semibold ${clinic.banned ? "line-through text-zinc-500 dark:text-zinc-500" : "text-black dark:text-zinc-50"}`}>
                      {clinic.name}
                    </h2>
 
                  </div>
                  {clinic.address && (
                        <div className="flex items-start gap-1 w-full">
                          <FaMapMarkerAlt />
                    <p className={`mb-1 text-sm ${clinic.banned ? "text-zinc-400 dark:text-zinc-600" : "text-gray-600 dark:text-zinc-400"}`}>
                            {clinic.address}
                      {clinic.state && `, ${clinic.state}`}
                      {clinic.zipcode && ` ${clinic.zipcode}`}
                    </p>
                        </div>
                  )}
                  <div className="flex flex-col gap-1 mt-2">

                        <div className="flex items-center justify-between gap-6">
                    {clinic.phone && (
                            <div className="flex items-start gap-1">
                              <FaPhoneAlt />
                              <p className={`text-sm ${clinic.banned ? "text-zinc-400 dark:text-zinc-600" : "text-gray-600 dark:text-zinc-400"}`}>
                                Tel: {clinic.phone}
                              </p>
                            </div>
                    )}
                    {clinic.fax && (
                            <div className="flex items-start gap-1">
                              <FaPrint />
                      <p className={`text-sm ${clinic.banned ? "text-zinc-400 dark:text-zinc-600" : "text-gray-600 dark:text-zinc-400"}`}>
                                Fax: {clinic.fax}
                      </p>
                            </div>
                    )}
                        </div>

                    {clinic.email && (
                          <div className="flex items-start gap-1">
                            <FaAt />
                      <p className={`text-sm ${clinic.banned ? "text-zinc-400 dark:text-zinc-600" : "text-gray-600 dark:text-zinc-400"}`}>
                              {clinic.email}
                            </p>
                          </div>
                    )}
                    {clinic.website && (
                          <div className="flex items-start gap-1">
                            <FaGlobe /> 
                      <p className={`text-sm ${clinic.banned ? "text-zinc-400 dark:text-zinc-600" : "text-gray-600 dark:text-zinc-400"}`}>
                              Sitio Web:{" "}
                        <a
                          href={clinic.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${clinic.banned ? "text-zinc-500 dark:text-zinc-600 line-through cursor-not-allowed" : "text-blue-600 dark:text-blue-400 hover:underline"}`}
                        >
                          {clinic.website}
                        </a>
                      </p>
                          </div>
                    )}
                  </div>
                  {clinic.notes && (
                        <div className="flex items-start gap-1">

                          <p className={`text-xs mt-3 pt-3 border-t ${clinic.banned ? "text-zinc-400 dark:text-zinc-600 border-zinc-300 dark:border-zinc-800" : "text-gray-500 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700"}`}>
                            *NOTAS:    {clinic.notes}
                          </p>
                        </div>
                  )}

                  {clinic.travelTime ? (
                    <div
                      className="flex items-center gap-3 mt-4"
                    >
                 
                      <Badge variant="secondary" size="sm">
                      Distancia:  {clinic.travelTime.distance.value} Millas
                      </Badge>
                    </div>
                  ) : undefined}
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <ClinicModal
        open={isCreateModalOpen}
        onClose={closeCreateModal}
        onSuccess={handleModalSuccess}
      />

      <ClinicModal
        open={!!clinicToEdit}
        onClose={() => setClinicToEdit(null)}
        onSuccess={handleModalSuccess}
        clinic={clinicToEdit}
      />

      <ConfirmationModal
        open={!!clinicToDelete}
        onClose={() => setClinicToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Clínica"
        message={`¿Estás seguro de que deseas eliminar la clínica "${clinicToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </Container>
  );
}
