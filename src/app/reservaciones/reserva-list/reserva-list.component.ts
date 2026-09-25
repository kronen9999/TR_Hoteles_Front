import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { ReservaService } from '../reserva.service';
import { ReservaFormComponent } from '../reserva-form/reserva-form.component';
import { HuespedService } from '../../huespedes/huesped.service';
import { HabitacionService } from '../../habitaciones/habitacion.service';
import { ReservaResponse, EstadoReserva } from '../../core/models/reserva.model';
import { HttpErrorHelper } from '../../core/utils/http-error.helper';
import { AuthService } from '../../core/services/auth.service';
import { ROLES } from '../../core/models/usuario.model';

@Component({
  selector: 'app-reserva-list',
  standalone: false,
  templateUrl: './reserva-list.component.html',
  styleUrl: './reserva-list.component.scss'
})
export class ReservaListComponent implements OnInit {

  columnas = ['idReserva', 'huesped', 'habitacion', 'fechas', 'estado', 'acciones'];
  cargando = false;
  reservas: ReservaResponse[] = [];
  filtroEstado = '';

  nombresHuespedes: Record<number, string> = {};
  numerosHabitaciones: Record<number, number> = {};
  isAdmin = false;

  constructor(
    private reservaService: ReservaService,
    private huespedService: HuespedService,
    private habitacionService: HabitacionService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole(ROLES[0]);
    this.buscar();
  }

  get reservasFiltradas(): ReservaResponse[] {
    // Demo (solo front): el usuario normal no ve las reservas CANCELADAS
    let listado = this.isAdmin ? this.reservas : this.reservas.filter(r => r.estadoReserva !== 'CANCELADA');
    if (!this.filtroEstado) {
      return listado;
    }
    return listado.filter(r => r.estadoReserva === this.filtroEstado);
  }

  nombreHuesped(idHuesped: number): string {
    return this.nombresHuespedes[idHuesped] ?? `Huésped #${idHuesped}`;
  }

  textoHabitacion(idHabitacion: number): string {
    const numero = this.numerosHabitaciones[idHabitacion];
    return numero == null ? `Habitación #${idHabitacion}` : `Habitación ${numero}`;
  }

  // Reglas de visibilidad según estado (README):
  puedeCheckIn(r: ReservaResponse): boolean {
    return r.estadoReserva === 'CONFIRMADA';
  }

  puedeCheckOut(r: ReservaResponse): boolean {
    return r.estadoReserva === 'EN_CURSO';
  }

  puedeCancelar(r: ReservaResponse): boolean {
    return r.estadoReserva === 'CONFIRMADA';
  }

  puedeEditar(r: ReservaResponse): boolean {
    return r.estadoReserva === 'CONFIRMADA' || r.estadoReserva === 'EN_CURSO';
  }

  puedeEliminar(r: ReservaResponse): boolean {
    // Demo (solo front): solo el admin puede eliminar
    return this.isAdmin && r.estadoReserva === 'CONFIRMADA';
  }

  buscar(): void {
    this.cargando = true;
    forkJoin({
      reservas: this.reservaService.listar(),
      huespedes: this.huespedService.listar(),
      habitaciones: this.habitacionService.listar()
    }).subscribe({
      next: ({ reservas, huespedes, habitaciones }) => {
        this.nombresHuespedes = Object.fromEntries(
          huespedes.map(h => [h.idHuesped, h.nombre])
        );
        this.numerosHabitaciones = Object.fromEntries(
          habitaciones.map(h => [h.idHabitacion, h.numeroHabitacion])
        );
        this.reservas = reservas;
        this.cargando = false;
      },
      error: (err) => {
        this.mostrarMensaje(HttpErrorHelper.obtenerMensaje(err));
        this.cargando = false;
      }
    });
  }

  abrirFormulario(reserva?: ReservaResponse): void {
    const ref = this.dialog.open(ReservaFormComponent, {
      width: '520px',
      data: reserva ?? null
    });

    ref.afterClosed().subscribe((guardado) => {
      if (guardado) this.buscar();
    });
  }

  hacerCheckIn(reserva: ReservaResponse): void {
    // Check-in: CONFIRMADA → EN_CURSO (código 2). La habitación sigue OCUPADA.
    this.reservaService.cambiarEstado(reserva.idReserva, 'EN_CURSO').subscribe({
      next: () => {
        this.mostrarMensaje(`Check-in realizado. Reserva #${reserva.idReserva} en curso`);
        this.buscar();
      },
      error: (err) => this.mostrarMensaje(HttpErrorHelper.obtenerMensaje(err))
    });
  }

  hacerCheckOut(reserva: ReservaResponse): void {
    // Check-out: EN_CURSO → FINALIZADA (código 3). La habitación pasa a DISPONIBLE.
    this.reservaService.cambiarEstado(reserva.idReserva, 'FINALIZADA').subscribe({
      next: () => {
        this.mostrarMensaje(`Check-out realizado. Reserva #${reserva.idReserva} finalizada`);
        this.buscar();
      },
      error: (err) => this.mostrarMensaje(HttpErrorHelper.obtenerMensaje(err))
    });
  }

  cancelar(reserva: ReservaResponse): void {
    if (!confirm(`¿Cancelar la reserva #${reserva.idReserva}? La habitación quedará disponible.`)) return;

    // Cancelación: solo permitida en CONFIRMADA (código 4). Backend 409 si no.
    this.reservaService.cambiarEstado(reserva.idReserva, 'CANCELADA').subscribe({
      next: () => {
        this.mostrarMensaje('Reserva cancelada correctamente');
        this.buscar();
      },
      // 409: cancelar EN_CURSO u otro no permitido
      error: (err) => this.mostrarMensaje(HttpErrorHelper.obtenerMensaje(err))
    });
  }

  eliminar(reserva: ReservaResponse): void {
    if (!this.puedeEliminar(reserva)) {
      this.mostrarMensaje('Solo se pueden eliminar reservas confirmadas. Las reservas históricas son de solo consulta.');
      return;
    }
    if (!confirm(`¿Eliminar la reserva #${reserva.idReserva}?`)) return;

    this.reservaService.eliminar(reserva.idReserva).subscribe({
      next: () => {
        this.mostrarMensaje('Reserva eliminada correctamente');
        this.buscar();
      },
      // 409: el estado actual de la reserva no permite eliminarla
      error: (err) => this.mostrarMensaje(HttpErrorHelper.obtenerMensaje(err))
    });
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
  }
}
