import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TarjetaTurismoPage } from './tarjeta-turismo.page';

const routes: Routes = [
  {
    path: '',
    component: TarjetaTurismoPage
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
export class TarjetaTurismoPageRoutingModule {}
