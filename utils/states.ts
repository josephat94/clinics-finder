/**
 * Lista de estados de Estados Unidos con sus códigos de dos letras
 * Formato: { code: string, name: string }
 */
export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'Distrito de Columbia' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
] as const;

/**
 * Tipo para los códigos de estado
 */
export type USStateCode = typeof US_STATES[number]['code'];

/**
 * Función helper para obtener el nombre de un estado por su código
 */
export function getStateName(code: string): string | undefined {
  return US_STATES.find((state) => state.code === code)?.name;
}

/**
 * Función helper para obtener el código de un estado por su nombre
 */
export function getStateCode(name: string): string | undefined {
  return US_STATES.find(
    (state) => state.name.toLowerCase() === name.toLowerCase()
  )?.code;
}

/**
 * Obtiene la lista de estados filtrados basados en los códigos de estado proporcionados
 * @param stateCodes - Array de códigos de estado (ej: ['IL', 'NY', 'FL'])
 * @returns Array de estados filtrados, ordenados alfabéticamente por nombre
 */
export function getStatesByCodes(stateCodes: (string | null)[]): typeof US_STATES[number][] {
  // Filtrar valores nulos y obtener códigos únicos
  const uniqueCodes = Array.from(
    new Set(stateCodes.filter((code): code is string => code !== null && code !== undefined))
  );

  // Filtrar US_STATES para solo incluir los estados que tienen clínicas
  const filteredStates = US_STATES.filter((state) =>
    uniqueCodes.includes(state.code)
  );

  // Ordenar alfabéticamente por nombre
  return filteredStates.sort((a, b) => a.name.localeCompare(b.name));
}
