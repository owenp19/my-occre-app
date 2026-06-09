import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReciboTurismoPage } from './recibo-turismo.page';

const routes: Routes = [
  {
    path: '',
    component: ReciboTurismoPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReciboTurismoPageRoutingModule {}
