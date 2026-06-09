import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RequestTrackingPage } from './request-tracking.page';

const routes: Routes = [
  {
    path: '',
    component: RequestTrackingPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RequestTrackingPageRoutingModule {}
