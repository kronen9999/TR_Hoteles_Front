import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  HuespedResponse,
  HuespedRequest,
  DOCUMENTOS_CATALOGO
} from '../../core/models/huesped.model';
import { HuespedService } from '../huesped.service';
import { HttpErrorHelper } from '../../core/utils/http-error.helper';

@Component({
  selector: 'app-huesped-form',
  standalone: false,
  templateUrl: './huesped-form.component.html',
  styleUrl: './huesped-form.component.scss'
})
export class HuespedFormComponent implements OnInit {

  guardando = false;
  esEdicion = false;
  form: FormGroup;
  readonly documentoCatalogo = DOCUMENTOS_CATALOGO;

  constructor(
    private fb: FormBuilder,
    private huespedService: HuespedService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<HuespedFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HuespedResponse | null
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apellidoMaterno: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      documento: ['', [Validators.required, Validators.pattern(/^(CREDENCIAL|PASAPORTE|CARTILLA_MILITAR|CURP)$/)]],
      numDocumento: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      nacionalidad: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(30)]]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.esEdicion = true;

      const partes = this.data.nombre.split(' ');
      const nombre = partes[0] ?? '';
      const apellidoMaterno = partes.length > 2 ? partes.pop()! : '';
      const apellidoPaterno = partes.slice(1).join(' ');

      this.form.patchValue({
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        email: this.data.email,
        telefono: this.data.telefono,
        documento: this.data.documento,
        numDocumento: this.data.numDocumento,
        nacionalidad: this.data.nacionalidad
      });
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    const request: HuespedRequest = this.form.value;

    const obs = this.esEdicion
      ? this.huespedService.actualizar(this.data!.idHuesped, request)
      : this.huespedService.registrar(request);

    obs.subscribe({
      next: (res) => {
        this.guardando = false;
        this.dialogRef.close(true);
        this.mostrarMensaje(`Huésped: ${res.nombre} ${this.esEdicion ? 'actualizado' : 'registrado'}`);
      },
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
