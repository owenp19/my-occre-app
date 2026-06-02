import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HelpContactPage } from './help-contact.page';

const routes: Routes = [
  {
    path: '',
    component: HelpContactPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HelpContactPageRoutingModule {}
