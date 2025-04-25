import { toZonedTime } from "date-fns-tz";
import { addDays, parse, format } from "date-fns";

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
 * Convierte una expresión relativa en una fecha absoluta.
 * @param input - La entrada del usuario (por ejemplo, "mañana a las 4pm").
 * @param currentDate - La fecha y hora actuales.
 * @returns Una fecha absoluta en formato yyyy/MM/dd HH:mm:ss.
 */
export const parseRelativeDate = (input: string, currentDate: Date): string => {
  const lowerInput = input.toLowerCase();

  // Manejar "mañana"
  if (lowerInput.includes("mañana")) {
    const timeMatch = lowerInput.match(/(\d{1,2}(?:am|pm))/);
    if (timeMatch) {
      const time = timeMatch[0];
      const parsedTime = parse(time, "h:mma", currentDate);
      const tomorrow = addDays(currentDate, 1);
      return format(
        new Date(
          tomorrow.getFullYear(),
          tomorrow.getMonth(),
          tomorrow.getDate(),
          parsedTime.getHours(),
          parsedTime.getMinutes()
        ),
        "yyyy/MM/dd HH:mm:ss"
      );
    }
  }

  // Manejar días específicos (por ejemplo, "el jueves")
  const daysOfWeek = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
  ];
  for (let i = 0; i < daysOfWeek.length; i++) {
    if (lowerInput.includes(daysOfWeek[i])) {
      const timeMatch = lowerInput.match(/(\d{1,2}(?:am|pm))/);
      if (timeMatch) {
        const time = timeMatch[0];
        const parsedTime = parse(time, "h:mma", currentDate);
        const currentDay = currentDate.getDay();
        const targetDay = i;
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7; // Asegura que sea en el futuro
        const targetDate = addDays(currentDate, daysToAdd);
        return format(
          new Date(
            targetDate.getFullYear(),
            targetDate.getMonth(),
            targetDate.getDate(),
            parsedTime.getHours(),
            parsedTime.getMinutes()
          ),
          "yyyy/MM/dd HH:mm:ss"
        );
      }
    }
  }

  // Si no se encuentra una coincidencia, lanzar un error
  throw new Error("No se pudo interpretar la fecha relativa.");
};
