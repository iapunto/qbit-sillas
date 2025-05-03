import { format } from "date-fns";
import * as chrono from "chrono-node";

/**
 * Obtiene la fecha y hora actuales en formato yyyy/MM/dd HH:mm:ss.
 * @returns Fecha y hora actuales.
 */
export const getCurrentDateTime = (): string => {
  return format(new Date(), "yyyy/MM/dd HH:mm:ss");
};

/**
 * Agrega minutos a una fecha dada.
 * @param date - La fecha inicial.
 * @param minutes - Los minutos a agregar.
 * @returns La nueva fecha.
 */
export const addMinutesToDate = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60000);
};

/**
 * Convierte una expresión relativa en una fecha absoluta usando chrono-node.
 * @param input - La entrada del usuario (por ejemplo, "mañana a las 4pm").
 * @param currentDate - La fecha y hora actuales (opcional, por defecto ahora).
 * @returns Una fecha absoluta en formato yyyy/MM/dd HH:mm:ss.
 * @throws Error si no se puede interpretar la fecha relativa.
 */
export const parseRelativeDate = (
  input: string,
  currentDate: Date = new Date()
): string => {
  // Usar el parser en español de chrono-node
  const results = chrono.es.parse(input, currentDate);
  if (results.length === 0 || !results[0].start) {
    throw new Error("No se pudo interpretar la fecha relativa.");
  }
  const date = results[0].start.date();
  return format(date, "yyyy/MM/dd HH:mm:ss");
};
