import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AnnouncementListPageRoutingModule } from './announcement-list-routing.module';
import { AnnouncementListPage } from './announcement-list.page';

@NgModule({
  imports: [CommonModule, IonicModule, AnnouncementListPageRoutingModule],
  declarations: [AnnouncementListPage],
})
export class AnnouncementListPageModule {}
