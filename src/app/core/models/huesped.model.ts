export const DOCUMENTOS = [
  'CREDENCIAL',
  'PASAPORTE',
  'CURP'
] as const;

export type Documento = typeof DOCUMENTOS[number];

export const DOCUMENTO_LABELS: Record<Documento, string> = {
  CREDENCIAL: 'Credencial',
  PASAPORTE: 'Pasaporte',
  CURP: 'CURP'
};

export const DOCUMENTOS_CATALOGO: { id: Documento; label: string }[] =
  DOCUMENTOS.map(d => ({ id: d, label: DOCUMENTO_LABELS[d] }));

export interface HuespedRequest {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  telefono: string;
  documento: Documento;
  numDocumento: string;
  nacionalidad: string;
}

export interface HuespedResponse {
  idHuesped: number;
  nombre: string;
  email: string;
  telefono: string;
  documento: Documento;
  numDocumento: string;
  nacionalidad: string;
}
