import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { RequestDetailPageRoutingModule } from './request-detail-routing.module';
import { RequestDetailPage } from './request-detail.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RequestDetailPageRoutingModule,
  ],
  declarations: [RequestDetailPage],
})
export class RequestDetailPageModule {}
