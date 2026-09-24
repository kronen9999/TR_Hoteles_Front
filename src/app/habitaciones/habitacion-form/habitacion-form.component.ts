import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  HabitacionResponse,
  HabitacionRequest,
  TIPOS_HABITACION_CATALOGO
} from '../../core/models/habitacion.model';
import { HabitacionService } from '../habitacion.service';
import { HttpErrorHelper } from '../../core/utils/http-error.helper';

@Component({
  selector: 'app-habitacion-form',
  standalone: false,
  templateUrl: './habitacion-form.component.html',
  styleUrl: './habitacion-form.component.scss'
})
export class HabitacionFormComponent implements OnInit {

  guardando = false;
  esEdicion = false;
  form: FormGroup;
  readonly tiposCatalogo = TIPOS_HABITACION_CATALOGO;

  constructor(
    private fb: FormBuilder,
    private habitacionService: HabitacionService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<HabitacionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HabitacionResponse | null
  ) {
    this.form = this.fb.group({
      numeroHabitacion: [null, [Validators.required, Validators.min(1), Validators.max(99999)]],
      tipoHabitacion: ['', [Validators.required, Validators.pattern(/^(SENCILLA|DOBLE|SUITE|ESTANDAR)$/)]],
      precio: [null, [Validators.required, Validators.min(0.01), Validators.max(99999999.99)]],
      capacidad: [null, [Validators.required, Validators.min(1), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.esEdicion = true;

      this.form.patchValue({
        numeroHabitacion: this.data.numeroHabitacion,
        tipoHabitacion: this.data.tipoHabitacion,
        precio: this.data.precio,
        capacidad: this.data.capacidad
      });

      // El número es único entre ACTIVOS: se esconde para evitar confusión
      this.form.get('numeroHabitacion')?.disable();
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;

    // En edición el número está deshabilitado: se conserva el original
    const valor = this.form.getRawValue();
    const request: HabitacionRequest = {
      numeroHabitacion: valor.numeroHabitacion,
      tipoHabitacion: valor.tipoHabitacion,
      precio: Number(valor.precio),
      capacidad: valor.capacidad
    };

    const obs = this.esEdicion
      ? this.habitacionService.actualizar(this.data!.idHabitacion, request)
      : this.habitacionService.registrar(request);

    obs.subscribe({
      next: (res) => {
        this.guardando = false;
        this.dialogRef.close(true);
        this.mostrarMensaje(`Habitación: ${res.numeroHabitacion} ${this.esEdicion ? 'actualizada' : 'registrada'}`);
      },
      // 409: número duplicado entre ACTIVOS (lo valida el backend)
      error: (err) => {
        this.guardando = false;
        this.mostrarMensaje(HttpErrorHelper.obtenerMensaje(err));
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
  }
}
