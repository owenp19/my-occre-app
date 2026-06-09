import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AppointmentsPage } from './appointments.page';
import { AppointmentsPageRoutingModule } from './appointments-routing.module';
import { SharedModule } from '../../shared/shared-module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    AppointmentsPageRoutingModule,
    SharedModule,
  ],
  declarations: [AppointmentsPage],
})
export class AppointmentsPageModule {}
