import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../usuarios/usuario.service';
import { AuthService } from '../core/services/auth.service';
import { ROLES } from '../core/models/usuario.model';
import { HuespedService } from '../huespedes/huesped.service';
import { HttpErrorHelper } from '../core/utils/http-error.helper';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  totalUsuarios = 0;
  totalHuespedesActivos = 0;
  cargandoUsuarios = true;
  cargandoHuespedes = true;
  isAdmin = false;

  constructor(
    private usuarioService: UsuarioService,
    private huespedService: HuespedService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole(ROLES[0]);
    if (this.isAdmin) {
      this.listarUsuarios();
    }
    this.listarHuespedes();
  }

  listarUsuarios(): void {
    this.usuarioService.listar().subscribe({
      next: (data) => {
        this.totalUsuarios = data.length;
        this.cargandoUsuarios = false;
      },
      error: (err) => {
        this.cargandoUsuarios = false;
        this.snackBar.open(HttpErrorHelper.obtenerMensaje(err), 'Cerrar', { duration: 3000 });
      }
    });
  }

  listarHuespedes(): void {
    this.huespedService.listar().subscribe({
      next: (data) => {
        this.totalHuespedesActivos = data.length;
        this.cargandoHuespedes = false;
      },
      error: (err) => {
        this.cargandoHuespedes = false;
        this.snackBar.open(HttpErrorHelper.obtenerMensaje(err), 'Cerrar', { duration: 3000 });
      }
    });
  }
}
