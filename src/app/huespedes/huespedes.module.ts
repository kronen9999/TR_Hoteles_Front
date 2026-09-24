import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HuespedesRoutingModule } from './huespedes-routing.module';
import { HuespedFormComponent } from './huesped-form/huesped-form.component';
import { HuespedListComponent } from './huesped-list/huesped-list.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';

@NgModule({
  declarations: [
    HuespedFormComponent,
    HuespedListComponent
  ],
  imports: [
    CommonModule,
    HuespedesRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule
  ]
})
export class HuespedesModule { }
