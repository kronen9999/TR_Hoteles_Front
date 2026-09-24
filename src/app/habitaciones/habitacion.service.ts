import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { HabitacionRequest, HabitacionResponse, EstadoHabitacion, ESTADO_HABITACION_CODIGO } from '../core/models/habitacion.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HabitacionService {

  private readonly baseUrl = `${environment.apiUrl}/api/habitaciones`;

  constructor(private http: HttpClient) { }

  listar(): Observable<HabitacionResponse[]> {
    return this.http.get<HabitacionResponse[]>(this.baseUrl);
  }

  obtenerPorId(id: number): Observable<HabitacionResponse> {
    return this.http.get<HabitacionResponse>(`${this.baseUrl}/id-habitacion/${id}`);
  }

  registrar(request: HabitacionRequest): Observable<HabitacionResponse> {
    return this.http.post<HabitacionResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: HabitacionRequest): Observable<HabitacionResponse> {
    return this.http.put<HabitacionResponse>(`${this.baseUrl}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  cambiarEstado(id: number, estado: EstadoHabitacion): Observable<HabitacionResponse> {
    return this.http.put<HabitacionResponse>(
      `${this.baseUrl}/${id}/estado/${ESTADO_HABITACION_CODIGO[estado]}`,
      {}
    );
  }
}
