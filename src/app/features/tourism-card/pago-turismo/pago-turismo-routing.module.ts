import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagoTurismoPage } from './pago-turismo.page';

const routes: Routes = [
  {
    path: '',
    component: PagoTurismoPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagoTurismoPageRoutingModule {}
