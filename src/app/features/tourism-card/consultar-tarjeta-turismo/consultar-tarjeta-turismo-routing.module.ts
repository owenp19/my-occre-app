import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ConsultarTarjetaTurismoPage } from './consultar-tarjeta-turismo.page';

const routes: Routes = [
  {
    path: '',
    component: ConsultarTarjetaTurismoPage
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class ConsultarTarjetaTurismoPageRoutingModule {}
