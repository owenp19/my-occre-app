import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnnouncementListPage } from './announcement-list.page';

const routes: Routes = [
  { path: '', component: AnnouncementListPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnnouncementListPageRoutingModule {}
