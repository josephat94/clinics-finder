"use client";

import { useRouter } from "next/navigation";
import { Button, Input, Select } from "../ui";
import { FaSearch, FaTrash } from "react-icons/fa";
import { useFiltersStore, useClinicsStore } from "@/stores";
import { Clinic } from "@/types/clinic";

export interface SearchIntoInvetoryProps {
  options: {
    code: string;
    name: string;
  }[];
  initialClinics?: Clinic[]; // Opcional ya que no se usa en esta versión
}

export const SearchIntoInvetory = ({
  options,
}: SearchIntoInvetoryProps) => {
  // Stores
  const { state, search, extraFilter, setState, setSearch, setExtraFilter, clearFilters } = useFiltersStore();
  const { resetFilters } = useClinicsStore();
  const router = useRouter();

  const handleSearch = () => {
    if (!state || !search) {
      return;
    }

    // Construir los query params
    const params = new URLSearchParams({
      state,
      search,
    });

    if (extraFilter) {
      params.append('extraFilter', extraFilter);
    }

    // Navegar a la página de búsqueda con los query params
    router.push(`/search-clinic?${params.toString()}`);
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
        label="Buscar por dirección"
        placeholder="Ingresa tu dirección o ciudad"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && state && search) {
            handleSearch();
          }
        }}
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
            disabled={!state || !search}
            className="w-full"
          >
            <FaSearch/>
            Buscar
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
