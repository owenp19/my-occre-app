import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AnnouncementDetailPageRoutingModule } from './announcement-detail-routing.module';
import { AnnouncementDetailPage } from './announcement-detail.page';

@NgModule({
  imports: [CommonModule, IonicModule, AnnouncementDetailPageRoutingModule],
  declarations: [AnnouncementDetailPage],
})
export class AnnouncementDetailPageModule {}
