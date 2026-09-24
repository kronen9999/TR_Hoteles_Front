import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HuespedResponse, DOCUMENTO_LABELS, Documento } from '../../core/models/huesped.model';
import { HuespedFormComponent } from '../huesped-form/huesped-form.component';
import { HuespedService } from '../huesped.service';
import { HttpErrorHelper } from '../../core/utils/http-error.helper';

@Component({
  selector: 'app-huesped-list',
  standalone: false,
  templateUrl: './huesped-list.component.html',
  styleUrl: './huesped-list.component.scss'
})
export class HuespedListComponent implements OnInit {

  columnas = ['nombre', 'email', 'telefono', 'documento', 'nacionalidad', 'acciones'];
  cargando = false;
  huespedes: HuespedResponse[] = [];
  filtro = '';

  readonly docLabels = DOCUMENTO_LABELS;

  constructor(
    private huespedService: HuespedService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.buscar();
  }

  get huespedesFiltrados(): HuespedResponse[] {
    const filtro = this.filtro.trim().toLowerCase();
    if (!filtro) {
      return this.huespedes;
    }
    return this.huespedes.filter(h =>
      h.nombre.toLowerCase().includes(filtro) ||
      h.email.toLowerCase().includes(filtro) ||
      h.telefono.includes(filtro) ||
      h.nacionalidad.toLowerCase().includes(filtro)
    );
  }

  getDocumentoLabel(doc: Documento): string {
    return this.docLabels[doc] ?? doc;
  }

  buscar(): void {
    this.cargando = true;
    this.huespedService.listar().subscribe({
      next: (data) => {
        this.huespedes = data;
        this.cargando = false;
      },
      error: (err) => {
        this.mostrarMensaje(HttpErrorHelper.obtenerMensaje(err));
        this.cargando = false;
      }
    });
  }

  abrirFormulario(huesped?: HuespedResponse): void {
    const ref = this.dialog.open(HuespedFormComponent, {
      width: '520px',
      data: huesped ?? null
    });

    ref.afterClosed().subscribe((guardado) => {
      if (guardado) this.buscar();
    });
  }

  eliminar(huesped: HuespedResponse): void {
    if (!confirm(`¿Eliminar al huésped "${huesped.nombre}"?`)) return;

    this.huespedService.eliminar(huesped.idHuesped).subscribe({
      next: () => {
        this.mostrarMensaje('Huésped eliminado correctamente');
        this.buscar();
      },
      error: (err) => this.mostrarMensaje(HttpErrorHelper.obtenerMensaje(err))
    });
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
  }
}
