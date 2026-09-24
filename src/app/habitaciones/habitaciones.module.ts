import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HabitacionesRoutingModule } from './habitaciones-routing.module';
import { HabitacionFormComponent } from './habitacion-form/habitacion-form.component';
import { HabitacionListComponent } from './habitacion-list/habitacion-list.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';

@NgModule({
  declarations: [
    HabitacionFormComponent,
    HabitacionListComponent
  ],
  imports: [
    CommonModule,
    HabitacionesRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule
  ]
})
export class HabitacionesModule { }
