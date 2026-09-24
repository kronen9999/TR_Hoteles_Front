import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { guestGuard } from './core/guards/guestGuard';
import { authGuard } from './core/guards/authGuard';
import { roleGuard } from './core/guards/roleGuard';
import { ROLES } from './core/models/usuario.model';

const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      {
        path: 'habitaciones',
        loadChildren: () => import('./habitaciones/habitaciones.module').then(m => m.HabitacionesModule)
      },
      {
        path: 'huespedes',
        loadChildren: () => import('./huespedes/huespedes.module').then(m => m.HuespedesModule)
      },
      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: { roles: [ROLES[0]]},
        loadChildren: () => import('./usuarios/usuarios.module').then(m => m.UsuariosModule)
      }
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }