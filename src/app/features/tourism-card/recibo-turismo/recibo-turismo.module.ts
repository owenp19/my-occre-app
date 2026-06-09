import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { ReciboTurismoPageRoutingModule } from './recibo-turismo-routing.module';
import { ReciboTurismoPage } from './recibo-turismo.page';
import { SharedModule } from '../../../shared/shared-module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    SharedModule,
    ReciboTurismoPageRoutingModule,
  ],
  declarations: [ReciboTurismoPage],
})
export class ReciboTurismoPageModule {}
