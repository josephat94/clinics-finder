"use client";

import { Button, Input, Select } from "../ui";
import { FaSearch, FaTrash } from "react-icons/fa";
import { useFiltersStore, useClinicsStore, ClinicWithTravelTime } from "@/stores";
import type { Clinic } from "@/types/clinic";

export interface SearchIntoInvetoryProps {
  options: {
    code: string;
    name: string;
  }[];
  initialClinics: Clinic[];
}

export const SearchIntoInvetory = ({
  options,
  initialClinics,
}: SearchIntoInvetoryProps) => {
  // Stores
  const { state, search, extraFilter, setState, setSearch, setExtraFilter, clearFilters } = useFiltersStore();
  const { setIsLoading, setFilteredClinics, resetFilters, isLoading } = useClinicsStore();

  const handleSearch = async () => {
    if (!state) {
      // Si no hay estado seleccionado, no hacer nada o mostrar todas
      return;
    }

    setIsLoading(true);
    try {
      // Llamar a la API para filtrar por estado
      const response = await fetch(
        `/api/clinics?state=${state}&search=${search}&extraFilter=${extraFilter}`
      );

      if (!response.ok) {
        throw new Error("Error al buscar clínicas");
      }

      const data = await response.json();
      const clinics: Clinic[] = data.clinics || [];

      // Filtrar por búsqueda de texto si existe
      


      const clinicsWithTravelTime= clinics as ClinicWithTravelTime[];
    
      const sortedClinics= clinicsWithTravelTime.sort((a, b) => {
        // Primero, separar las que tienen travelTime de las que no
        const aHasTravelTime = a.travelTime?.duration.value !== undefined && a.travelTime?.duration.value !== null;
        const bHasTravelTime = b.travelTime?.duration.value !== undefined && b.travelTime?.duration.value !== null;
        
        // Si una tiene travelTime y la otra no, la que tiene travelTime va primero
        if (aHasTravelTime && !bHasTravelTime) return -1;
        if (!aHasTravelTime && bHasTravelTime) return 1;
        
        // Si ambas tienen travelTime, ordenar por duración
        if (aHasTravelTime && bHasTravelTime) {
          return (a.travelTime!.duration.value) - (b.travelTime!.duration.value);
        }
        
        // Si ninguna tiene travelTime, mantener el orden original
        return 0;
      });
  
      console.log(":::::: SORTED CLINICS ::::::", sortedClinics);
      // Actualizar clínicas filtradas en el store
      setFilteredClinics(sortedClinics as any);
    } catch (error) {
      console.error("Error al buscar clínicas:", error);
      setFilteredClinics([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    clearFilters();
    resetFilters();
  };

  return (
    <div className="grid grid-cols-[3fr_4fr_2fr_4fr] gap-4 items-start">
      <div className="flex items-center h-full">
        <Select
          options={options.map((option) => ({
            value: option.code,
            label: option.name,
          }))}
          id="state"
          label="Estado"
          placeholder="Selecciona un estado"
          value={state}
          onChange={setState}
        >
          
        </Select>
      </div>
      <Input
        label="Buscar clínica"
        placeholder="Buscar clínica"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Input
        label="Filtro extra en Nombre"
        placeholder="Filtrar por Nombre"
        value={extraFilter}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setExtraFilter(e.target.value)
        }
      />
      <div>
        <label className="block text-sm font-medium mb-1.5 text-zinc-900 dark:text-zinc-100 invisible">
          acciones
        </label>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSearch}
            disabled={isLoading || !state}
            className="w-full"
          >
            <FaSearch/>
            {isLoading ? "Buscando..." : "Buscar"}
          </Button>
          <Button
            variant="outline"
            onClick={handleClearFilters}
            disabled={!state && !search && !extraFilter}
            className="w-full"
          >
            <FaTrash/>
            Limpiar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
};
