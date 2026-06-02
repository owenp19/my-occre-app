import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ProceduresPageRoutingModule } from './procedures-routing.module';

import { ProceduresPage } from './procedures.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ProceduresPageRoutingModule,
  ],
  declarations: [ProceduresPage],
})
export class ProceduresPageModule {}
