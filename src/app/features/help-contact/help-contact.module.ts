import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { HelpContactPageRoutingModule } from './help-contact-routing.module';
import { HelpContactPage } from './help-contact.page';
import { SharedModule } from '../../shared/shared-module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    HelpContactPageRoutingModule,
    SharedModule,
  ],
  declarations: [HelpContactPage],
})
export class HelpContactPageModule {}
