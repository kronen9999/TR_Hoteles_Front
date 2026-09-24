import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ReservaRequest, ReservaResponse, EstadoReserva, ESTADO_RESERVA_CODIGO } from '../core/models/reserva.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {

  private readonly baseUrl = `${environment.apiUrl}/api/reservas`;

  constructor(private http: HttpClient) { }

  listar(): Observable<ReservaResponse[]> {
    return this.http.get<ReservaResponse[]>(this.baseUrl);
  }

  obtenerPorId(id: number): Observable<ReservaResponse> {
    return this.http.get<ReservaResponse>(`${this.baseUrl}/${id}`);
  }

  registrar(request: ReservaRequest): Observable<ReservaResponse> {
    return this.http.post<ReservaResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: ReservaRequest): Observable<ReservaResponse> {
    return this.http.put<ReservaResponse>(`${this.baseUrl}/${id}`, request);
  }

  cambiarEstado(idReserva: number, estado: EstadoReserva): Observable<ReservaResponse> {
    return this.http.patch<ReservaResponse>(
      `${this.baseUrl}/${idReserva}/estado/${ESTADO_RESERVA_CODIGO[estado]}`,
      {}
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
