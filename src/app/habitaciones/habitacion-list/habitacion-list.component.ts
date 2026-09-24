import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HabitacionService } from '../habitacion.service';
import { HabitacionFormComponent } from '../habitacion-form/habitacion-form.component';
import {
  HabitacionResponse,
  ESTADO_HABITACION_LABELS,
  TIPO_HABITACION_LABELS,
  EstadoHabitacion,
  ESTADOS_HABITACION_CATALOGO
} from '../../core/models/habitacion.model';
import { HttpErrorHelper } from '../../core/utils/http-error.helper';
import { AuthService } from '../../core/services/auth.service';
import { ROLES } from '../../core/models/usuario.model';

@Component({
  selector: 'app-habitacion-list',
  standalone: false,
  templateUrl: './habitacion-list.component.html',
  styleUrl: './habitacion-list.component.scss'
})
export class HabitacionListComponent implements OnInit {

  columnas = ['numero', 'tipo', 'precio', 'capacidad', 'estado', 'acciones'];
  cargando = false;
  habitaciones: HabitacionResponse[] = [];
  filtroEstado: EstadoHabitacion | '' = '';

  readonly estadosCatalogo = ESTADOS_HABITACION_CATALOGO;
  readonly estadoLabels = ESTADO_HABITACION_LABELS;
  readonly tipoLabels = TIPO_HABITACION_LABELS;
  isAdmin = false;

  constructor(
    private habitacionService: HabitacionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole(ROLES[0]);
    this.buscar();
  }

  get habitacionesFiltradas(): HabitacionResponse[] {
    if (!this.filtroEstado) {
      return this.habitaciones;
    }
    return this.habitaciones.filter(h => h.estadoHabitacion === this.filtroEstado);
  }

  getEstadoLabel(estado: EstadoHabitacion): string {
    return this.estadoLabels[estado] ?? estado;
  }

  getTipoLabel(tipo: string): string {
    return (this.tipoLabels as Record<string, string>)[tipo] ?? tipo;
  }

  getColorEstado(estado: EstadoHabitacion): string {
    switch (estado) {
      case 'DISPONIBLE': return 'primary';
      case 'OCUPADA': return 'warn';
      case 'LIMPIEZA': return 'accent';
      default: return 'basic';
    }
  }

  buscar(): void {
    this.cargando = true;
    this.habitacionService.listar().subscribe({
      next: (data) => {
        this.habitaciones = data;
        this.cargando = false;
      },
      error: (err) => {
        this.mostrarMensaje(HttpErrorHelper.obtenerMensaje(err));
        this.cargando = false;
      }
    });
  }

  abrirFormulario(habitacion?: HabitacionResponse): void {
    const ref = this.dialog.open(HabitacionFormComponent, {
      width: '500px',
      data: habitacion ?? null
    });

    ref.afterClosed().subscribe((guardado) => {
      if (guardado) this.buscar();
    });
  }

  cambiarEstado(habitacion: HabitacionResponse, estado: EstadoHabitacion): void {
    this.habitacionService.cambiarEstado(habitacion.idHabitacion, estado).subscribe({
      next: (res) => {
        this.mostrarMensaje(`Habitación ${res.numeroHabitacion}: estado = ${this.getEstadoLabel(res.estadoHabitacion)}`);
        this.buscar();
      },
      // 409: no se puede pasar de OCUPADA a DISPONIBLE (lo maneja el backend)
      error: (err) => this.mostrarMensaje(HttpErrorHelper.obtenerMensaje(err))
    });
  }

  eliminar(habitacion: HabitacionResponse): void {
    if (habitacion.estadoHabitacion === 'OCUPADA') {
      this.mostrarMensaje('No se puede eliminar una habitación OCUPADA');
      return;
    }
    if (!confirm(`¿Eliminar la habitación "${habitacion.numeroHabitacion}"?`)) return;

    this.habitacionService.eliminar(habitacion.idHabitacion).subscribe({
      next: () => {
        this.mostrarMensaje('Habitación eliminada correctamente');
        this.buscar();
      },
      error: (err) => this.mostrarMensaje(HttpErrorHelper.obtenerMensaje(err))
    });
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
  }
}
