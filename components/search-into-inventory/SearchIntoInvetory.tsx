"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("clinics");
  // Stores
  const { state, search, setState, setSearch, clearFilters } = useFiltersStore();
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

    // Navegar a la página de búsqueda con los query params
    router.push(`/search-clinic?${params.toString()}`);
  };

  const handleClearFilters = () => {
    clearFilters();
    resetFilters();
  };

  return (
    <div className="flex items-center gap-4 flex-col md:flex-row">
      <div className="flex items-center h-full min-w-[300px] w-full md:w-auto">
        <Select
          options={options.map((option) => ({
            value: option.code,
            label: `${option.code} - ${option.name}`,
          }))}
          id="state"
          label={t("state")}
          placeholder={t("selectState")}
          value={state}
          onChange={setState}
        ></Select>
      </div>
      <Input
        label={t("searchByAddress")}
        placeholder={t("addressSearchPlaceholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && state && search) {
            handleSearch();
          }
        }}
      />
      <div>
        <label className="block text-sm font-medium mb-1.5 text-zinc-900 dark:text-zinc-100 invisible">
          acciones
        </label>
        <div className="flex items-center gap-3 justify-end md:justify-start">
          <Button
            onClick={handleSearch}
            disabled={!state || !search}
            size="md"
            title={t("search")}
          >
            <FaSearch />
            <span className="block md:hidden">{t("search")}</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleClearFilters}
            disabled={!state && !search}
            size="md"
            title={t("clearFilters")}
          >
            <span className="block md:hidden">{t("clearFilters")}</span>
            <FaTrash />
          </Button>
        </div>
      </div>
    </div>
  );
};
