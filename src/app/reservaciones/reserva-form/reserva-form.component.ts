import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { ReservaService } from '../reserva.service';
import { HuespedService } from '../../huespedes/huesped.service';
import { HabitacionService } from '../../habitaciones/habitacion.service';
import { ReservaResponse, ReservaRequest } from '../../core/models/reserva.model';
import { HttpErrorHelper } from '../../core/utils/http-error.helper';

// Regla del README: siempre debe cumplirse fechaEntrada < fechaSalida
export function fechasConsistentesValidator(group: AbstractControl): ValidationErrors | null {
  const entrada = group.get('fechaEntrada')?.value;
  const salida = group.get('fechaSalida')?.value;
  if (!entrada || !salida) return null;

  // Regla: la fecha de entrada no puede ser anterior a hoy
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (entrada instanceof Date && entrada < hoy) {
    return { fechasPasadas: true };
  }

  return entrada < salida ? null : { fechasInconsistentes: true };
}

@Component({
  selector: 'app-reserva-form',
  standalone: false,
  templateUrl: './reserva-form.component.html',
  styleUrl: './reserva-form.component.scss'
})
export class ReservaFormComponent implements OnInit {

  guardando = false;
  cargandoDatos = true;
  huespedes: { idHuesped: number; nombre: string }[] = [];
  habitacionesDisponibles: { idHabitacion: number; numeroHabitacion: number }[] = [];
  form: FormGroup;

  readonly fechaMinima = new Date(new Date().setHours(0, 0, 0, 0));
  readonly fechaValida = (d: Date | null) =>
    !!d && d.getTime() >= new Date(new Date().setHours(0, 0, 0, 0)).getTime();

  constructor(
    private fb: FormBuilder,
    private reservaService: ReservaService,
    private huespedService: HuespedService,
    private habitacionService: HabitacionService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ReservaFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReservaResponse | null
  ) {
    this.form = this.fb.group({
      idHuesped: [null, [Validators.required]],
      idHabitacion: [null, [Validators.required]],
      fechaEntrada: ['', [Validators.required]],
      fechaSalida: ['', [Validators.required]]
    }, { validators: fechasConsistentesValidator });
  }

  get esEdicion(): boolean {
    return !!this.data;
  }

  get esEnCurso(): boolean {
    return this.data?.estadoReserva === 'EN_CURSO';
  }

  get numeroHabitacionActual(): number | null {
    const op = this.habitacionesDisponibles.find(h => h.idHabitacion === this.data?.idHabitacion);
    return op?.numeroHabitacion ?? null;
  }

  ngOnInit(): void {
    forkJoin({
      huespedes: this.huespedService.listar(),
      habitaciones: this.habitacionService.listar()
    }).subscribe({
      next: ({ huespedes, habitaciones }) => {
        this.huespedes = huespedes.map(h => ({ idHuesped: h.idHuesped, nombre: h.nombre }));
        this.prepararHabitaciones(habitaciones);
        this.cargandoDatos = false;
      },
      error: (err) => {
        this.cargandoDatos = false;
        this.mostrarMensaje(HttpErrorHelper.obtenerMensaje(err));
      }
    });

    if (this.esEdicion) {
      this.form.patchValue({
        idHuesped: this.data!.idHuesped,
        idHabitacion: this.data!.idHabitacion,
        fechaEntrada: this.charAtFecha(this.data!.fechaEntrada),
        fechaSalida: this.charAtFecha(this.data!.fechaSalida)
      });

      // Reglas del README: huésped y habitación NUNCA se pueden cambiar en una reserva
      this.form.get('idHuesped')?.disable();
      this.form.get('idHabitacion')?.disable();

      // Con check-in (EN_CURSO): solo se puede modificar la fecha de salida
      if (this.esEnCurso) {
        this.form.get('fechaEntrada')?.disable();
      }
    }
  }

  // Al CREAR solo se listan habitaciones DISPONIBLES (regla del README).
  // En edición se conserva la habitación asignada aunque ya no esté disponible.
  private prepararHabitaciones(habitaciones: {
    idHabitacion: number;
    numeroHabitacion: number;
    estadoHabitacion: string;
  }[]): void {
    const disponibles = habitaciones
      .filter(h => h.estadoHabitacion === 'DISPONIBLE')
      .map(h => ({ idHabitacion: h.idHabitacion, numeroHabitacion: h.numeroHabitacion }));

    if (this.esEdicion) {
      const actual = habitaciones.find(h => h.idHabitacion === this.data!.idHabitacion);
      this.habitacionesDisponibles = actual
        ? [{ idHabitacion: actual.idHabitacion, numeroHabitacion: actual.numeroHabitacion }]
        : [];
    } else {
      this.habitacionesDisponibles = disponibles;
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;

    // getRawValue() INCLUYE los controles deshabilitados de edición
    const valor = this.form.getRawValue();

    const request: ReservaRequest = {
      idHuesped: valor.idHuesped,
      idHabitacion: valor.idHabitacion,
      fechaEntrada: this.esEnCurso ? this.data!.fechaEntrada : this.fechaAString(valor.fechaEntrada),
      fechaSalida: this.fechaAString(valor.fechaSalida)
    };

    const obs = this.esEdicion
      ? this.reservaService.actualizar(this.data!.idReserva, request)
      : this.reservaService.registrar(request);

    obs.subscribe({
      next: (res) => {
        this.guardando = false;
        this.dialogRef.close(true);
        this.mostrarMensaje(`Reserva #${res.idReserva} ${this.esEdicion ? 'actualizada' : 'registrada'}`);
      },
      // 409: habitación no disponible, cambio de huésped/habitación, u otra regla
      error: (err) => {
        this.guardando = false;
        this.mostrarMensaje(HttpErrorHelper.obtenerMensaje(err));
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  private charAtFecha(fecha: string): Date | string {
    if (!fecha || typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return fecha;
    }
    const [y, m, d] = fecha.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  private fechaAString(fecha: Date | string | null): string {
    if (!fecha) return '';
    if (typeof fecha === 'string') return fecha;
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
  }
}
