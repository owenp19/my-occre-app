import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ValidarTarjetaTurismoPageRoutingModule } from './validar-tarjeta-turismo-routing.module';
import { ValidarTarjetaTurismoPage } from './validar-tarjeta-turismo.page';
import { SharedModule } from '../../../shared/shared-module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
    ValidarTarjetaTurismoPageRoutingModule
  ],
  declarations: [
    ValidarTarjetaTurismoPage
  ]
})
export class ValidarTarjetaTurismoPageModule {}
