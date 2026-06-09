import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RequestCreatePage } from './request-create.page';

const routes: Routes = [
  {
    path: '',
    component: RequestCreatePage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RequestCreatePageRoutingModule {}
