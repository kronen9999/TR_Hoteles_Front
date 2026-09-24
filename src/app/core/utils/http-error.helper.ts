import { HttpErrorResponse } from '@angular/common/http';

export class HttpErrorHelper {

  static obtenerMensaje(error: HttpErrorResponse): string {
    const mensajeBackend = error?.error?.message || error?.error?.detalle;

    if (mensajeBackend) {
      return mensajeBackend;
    }

    switch (error?.status) {
      case 400:
        return 'Datos inválidos. Verifica el formulario.';
      case 401:
        return 'Tu sesión ha expirado. Inicia sesión nuevamente.';
      case 403:
        return 'No cuentas con permisos para realizar esta acción.';
      case 404:
        return 'El recurso solicitado no existe o fue eliminado.';
      case 409:
        return 'Conflicto con las reglas de negocio. Revisa los datos duplicados o el estado del registro.';
      case 500:
        return 'Error interno del servidor. Intenta más tarde.';
      case 0:
        return 'No se pudo conectar con el servidor.';
      default:
        return `Error inesperado (${error?.status ?? 'desconocido'})`;
    }
  }
}
