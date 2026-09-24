import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReservacionesRoutingModule } from './reservaciones-routing.module';
import { ReservaFormComponent } from './reserva-form/reserva-form.component';
import { ReservaListComponent } from './reserva-list/reserva-list.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';

@NgModule({
  declarations: [
    ReservaFormComponent,
    ReservaListComponent
  ],
  imports: [
    CommonModule,
    ReservacionesRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule
  ]
})
export class ReservacionesModule { }
