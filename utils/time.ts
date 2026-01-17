/**
 * Convierte segundos a minutos
 * @param seconds - Número de segundos a convertir
 * @returns Número de minutos (puede incluir decimales)
 */
export function secondsToMinutes(seconds: number): number {
  return seconds / 60;
}

/**
 * Convierte segundos a minutos y retorna un objeto con minutos y segundos restantes
 * @param seconds - Número de segundos a convertir
 * @returns Objeto con { minutes: number, seconds: number }
 */
export function secondsToMinutesAndSeconds(seconds: number): {
  minutes: number;
  seconds: number;
} {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return { minutes, seconds: remainingSeconds };
}

/**
 * Convierte segundos a una cadena formateada (ej: "5 min 30 seg")
 * @param seconds - Número de segundos a convertir
 * @param format - Formato de salida: 'short' (5m 30s) o 'long' (5 min 30 seg)
 * @returns Cadena formateada
 */
export function formatSeconds(
  seconds: number,
  format: 'short' | 'long' = 'long'
): string {
  const { minutes, seconds: remainingSeconds } = secondsToMinutesAndSeconds(seconds);

  if (format === 'short') {
    if (minutes === 0) return `${remainingSeconds}s`;
    if (remainingSeconds === 0) return `${minutes}m`;
    return `${minutes}m ${remainingSeconds}s`;
  }

  // long format
  if (minutes === 0) return `${remainingSeconds} seg`;
  if (remainingSeconds === 0) return `${minutes} min`;
  return `${minutes} min ${remainingSeconds} seg`;
}
