export const ESTADOS_RESERVA = [
  'CONFIRMADA',
  'EN_CURSO',
  'FINALIZADA',
  'CANCELADA'
] as const;

export type EstadoReserva = typeof ESTADOS_RESERVA[number];

// Códigos oficiales según el README (1-4)
export const ESTADO_RESERVA_CODIGO: Record<EstadoReserva, number> = {
  CONFIRMADA: 1,
  EN_CURSO: 2,
  FINALIZADA: 3,
  CANCELADA: 4
};

export const ESTADO_RESERVA_LABELS: Record<EstadoReserva, string> = {
  CONFIRMADA: 'Confirmada',
  EN_CURSO: 'En curso',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada'
};

export const ESTADOS_RESERVA_CATALOGO: { id: EstadoReserva; label: string }[] =
  ESTADOS_RESERVA.map(e => ({ id: e, label: ESTADO_RESERVA_LABELS[e] }));

export interface ReservaRequest {
  idHuesped: number;
  idHabitacion: number;
  fechaEntrada: string; // YYYY-MM-DD (LocalDate)
  fechaSalida: string;  // YYYY-MM-DD (LocalDate)
}

export interface ReservaResponse {
  idReserva: number;
  idHuesped: number;
  idHabitacion: number;
  fechaEntrada: string;
  fechaSalida: string;
  estadoReserva: EstadoReserva;
  estadoRegistro: 'ACTIVO' | 'ELIMINADO';
}
