import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PagoTurismoPageRoutingModule } from './pago-turismo-routing.module';
import { PagoTurismoPage } from './pago-turismo.page';
import { SharedModule } from '../../../shared/shared-module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
    PagoTurismoPageRoutingModule,
  ],
  declarations: [
    PagoTurismoPage,
  ],
})
export class PagoTurismoPageModule {}
