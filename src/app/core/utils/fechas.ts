/**
 * Utilidades de fechas. La API maneja las fechas de calendario como texto AAAA-MM-DD
 * y las horas como HH:MM; los datepickers de Material trabajan con Date.
 */

const dosDigitos = (numero: number) => String(numero).padStart(2, '0');

/** AAAA-MM-DD en hora local, sin desfasajes por zona horaria. */
export function aIso(fecha: Date): string {
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
}

/** Convierte AAAA-MM-DD en un Date local a la medianoche. */
export function desdeIso(iso: string): Date {
  const [anio, mes, dia] = iso.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

export function hoyIso(): string {
  return aIso(new Date());
}

/** Suma (o resta, con un número negativo) días a una fecha AAAA-MM-DD. */
export function sumarDias(iso: string, dias: number): string {
  const fecha = desdeIso(iso);
  fecha.setDate(fecha.getDate() + dias);
  return aIso(fecha);
}

/** Fecha y hora de un turno como Date local, para ordenar y comparar con el momento actual. */
export function aFechaHora(fecha: string, hora: string): Date {
  const [horas, minutos] = hora.split(':').map(Number);
  const resultado = desdeIso(fecha);
  resultado.setHours(horas, minutos);
  return resultado;
}

/** Edad cumplida al día de hoy a partir de la fecha de nacimiento (AAAA-MM-DD). */
export function calcularEdad(fechaNacimiento: string): number {
  const nacimiento = desdeIso(fechaNacimiento);
  const hoy = new Date();
  const edad = hoy.getFullYear() - nacimiento.getFullYear();
  const cumplioEsteAnio =
    hoy.getMonth() > nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() >= nacimiento.getDate());
  return cumplioEsteAnio ? edad : edad - 1;
}

/** Horas que se ofrecen al cargar agenda: de 06:00 a 22:00, cada 30 minutos (la duración de un turno). */
export const HORARIOS: readonly string[] = Array.from({ length: 33 }, (_, indice) => {
  const minutos = 6 * 60 + indice * 30;
  return `${dosDigitos(Math.floor(minutos / 60))}:${dosDigitos(minutos % 60)}`;
});
