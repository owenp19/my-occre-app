import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { TarjetaTurismoPageRoutingModule } from './tarjeta-turismo-routing.module';
import { TarjetaTurismoPage } from './tarjeta-turismo.page';
import { SharedModule } from '../../../shared/shared-module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    SharedModule,
    TarjetaTurismoPageRoutingModule
  ],
  declarations: [
    TarjetaTurismoPage
  ]
})
export class TarjetaTurismoPageModule {}
