import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ConsultarTarjetaTurismoPageRoutingModule } from './consultar-tarjeta-turismo-routing.module';
import { ConsultarTarjetaTurismoPage } from './consultar-tarjeta-turismo.page';
import { SharedModule } from '../../../shared/shared-module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
    ConsultarTarjetaTurismoPageRoutingModule
  ],
  declarations: [
    ConsultarTarjetaTurismoPage
  ]
})
export class ConsultarTarjetaTurismoPageModule {}
