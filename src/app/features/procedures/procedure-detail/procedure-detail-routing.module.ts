import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProcedureDetailPage } from './procedure-detail.page';

const routes: Routes = [
  {
    path: '',
    component: ProcedureDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProcedureDetailPageRoutingModule {}
