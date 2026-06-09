import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyProceduresPage } from './my-procedures.page';

const routes: Routes = [
  { path: '', component: MyProceduresPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyProceduresPageRoutingModule {}
