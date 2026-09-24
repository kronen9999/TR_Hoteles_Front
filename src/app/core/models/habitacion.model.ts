export const TIPOS_HABITACION = [
  'SENCILLA',
  'DOBLE',
  'SUITE',
  'ESTANDAR'
] as const;

export type TipoHabitacion = typeof TIPOS_HABITACION[number];

export const TIPO_HABITACION_LABELS: Record<TipoHabitacion, string> = {
  SENCILLA: 'Sencilla',
  DOBLE: 'Doble',
  SUITE: 'Suite',
  ESTANDAR: 'Estandar'
};

export const TIPOS_HABITACION_CATALOGO: { id: TipoHabitacion; label: string }[] =
  TIPOS_HABITACION.map(t => ({ id: t, label: TIPO_HABITACION_LABELS[t] }));

export const ESTADOS_HABITACION = [
  'DISPONIBLE',
  'OCUPADA',
  'LIMPIEZA',
  'MANTENIMIENTO'
] as const;

export type EstadoHabitacion = typeof ESTADOS_HABITACION[number];

// Códigos oficiales según el README (1-4)
export const ESTADO_HABITACION_CODIGO: Record<EstadoHabitacion, number> = {
  DISPONIBLE: 1,
  OCUPADA: 2,
  LIMPIEZA: 3,
  MANTENIMIENTO: 4
};

export const ESTADO_HABITACION_LABELS: Record<EstadoHabitacion, string> = {
  DISPONIBLE: 'Disponible',
  OCUPADA: 'Ocupada',
  LIMPIEZA: 'En limpieza',
  MANTENIMIENTO: 'En mantenimiento'
};

export const ESTADOS_HABITACION_CATALOGO: { id: EstadoHabitacion; label: string }[] =
  ESTADOS_HABITACION.map(e => ({ id: e, label: ESTADO_HABITACION_LABELS[e] }));

export interface HabitacionRequest {
  numeroHabitacion: number;
  tipoHabitacion: TipoHabitacion;
  precio: number;
  capacidad: number;
}

export interface HabitacionResponse {
  idHabitacion: number;
  numeroHabitacion: number;
  tipoHabitacion: TipoHabitacion;
  precio: number;
  capacidad: number;
  estadoHabitacion: EstadoHabitacion;
  estadoRegistro: 'ACTIVO' | 'ELIMINADO';
}
