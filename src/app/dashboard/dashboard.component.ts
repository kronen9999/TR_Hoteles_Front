import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../usuarios/usuario.service';
import { AuthService } from '../core/services/auth.service';
import { ROLES } from '../core/models/usuario.model';
import { HuespedService } from '../huespedes/huesped.service';
import { HabitacionService } from '../habitaciones/habitacion.service';
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
  totalHabitacionesDisponibles = 0;
  cargandoUsuarios = true;
  cargandoHuespedes = true;
  cargandoHabitaciones = true;
  isAdmin = false;

  constructor(
    private usuarioService: UsuarioService,
    private huespedService: HuespedService,
    private habitacionService: HabitacionService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole(ROLES[0]);
    if (this.isAdmin) {
      this.listarUsuarios();
    }
    this.listarHuespedes();
    this.listarHabitaciones();
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

  listarHabitaciones(): void {
    this.habitacionService.listar().subscribe({
      next: (data) => {
        this.totalHabitacionesDisponibles = data.filter(h => h.estadoHabitacion === 'DISPONIBLE').length;
        this.cargandoHabitaciones = false;
      },
      error: (err) => {
        this.cargandoHabitaciones = false;
        this.snackBar.open(HttpErrorHelper.obtenerMensaje(err), 'Cerrar', { duration: 3000 });
      }
    });
  }
}
