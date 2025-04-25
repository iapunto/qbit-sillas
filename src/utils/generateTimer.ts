/**
 * Genera un número entero aleatorio entre min y max (ambos incluidos).
 * @param min - El valor mínimo del rango.
 * @param max - El valor máximo del rango.
 * @returns Un número entero aleatorio dentro del rango [min, max].
 * @throws Error si min es mayor que max.
 */
function generateTimer(min: number, max: number): number {
  // Validar que min sea menor o igual que max
  if (min > max) {
    throw new Error("El valor de 'min' debe ser menor o igual que 'max'.");
  }

  // Generar un número aleatorio en el rango [min, max]
  const numSal = Math.random(); // Genera un número entre 0 (incluido) y 1 (excluido)
  const numeroAleatorio = Math.floor(numSal * (max - min + 1)) + min;

  return numeroAleatorio;
}

export { generateTimer };
