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
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellidoMaterno: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      documento: ['', [Validators.required, Validators.pattern(/^(CREDENCIAL|PASAPORTE|CURP)$/)]],
      numDocumento: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      nacionalidad: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(30)]]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.esEdicion = true;

      // Los campos separados conservan nombres y apellidos compuestos sin inferencias.
      // Compatibilidad con respuestas anteriores que solo contienen el nombre completo.
      const partes = this.data.nombre.trim().split(/\s+/);
      const apellidoMaterno = this.data.apellidoMaterno ?? (partes.length > 2 ? partes.pop()! : '');
      const apellidoPaterno = this.data.apellidoPaterno ?? (partes.length > 1 ? partes.pop()! : '');
      const nombre = this.data.nombrePila ?? partes.join(' ');

      this.form.patchValue({
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        email: this.data.email,
        telefono: this.data.telefono,
        documento: this.data.documento.toUpperCase().replace(/ /g, '_'),
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

  soloNumeros(event: Event): void {
    const input = event.target as HTMLInputElement;
    const limpio = input.value.replace(/\D/g, '');
    if (input.value !== limpio) {
      input.value = limpio;
      this.form.get('telefono')?.setValue(limpio, { emitEvent: false });
    }
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
  }
}
