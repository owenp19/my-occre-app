import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ValidarTarjetaTurismoPage } from './validar-tarjeta-turismo.page';

const routes: Routes = [
  {
    path: '',
    component: ValidarTarjetaTurismoPage
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
export class ValidarTarjetaTurismoPageRoutingModule {}
