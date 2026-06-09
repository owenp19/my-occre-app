import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RecordSearchPage } from './record-search.page';

const routes: Routes = [
  { path: '', component: RecordSearchPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecordSearchPageRoutingModule {}
