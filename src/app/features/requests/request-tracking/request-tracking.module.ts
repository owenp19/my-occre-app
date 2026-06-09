import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { RequestTrackingPageRoutingModule } from './request-tracking-routing.module';
import { RequestTrackingPage } from './request-tracking.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RequestTrackingPageRoutingModule,
  ],
  declarations: [RequestTrackingPage],
})
export class RequestTrackingPageModule {}
