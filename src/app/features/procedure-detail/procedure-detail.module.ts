import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ProcedureDetailPageRoutingModule } from './procedure-detail-routing.module';
import { ProcedureDetailPage } from './procedure-detail.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ProcedureDetailPageRoutingModule,
  ],
  declarations: [ProcedureDetailPage],
})
export class ProcedureDetailPageModule {}
