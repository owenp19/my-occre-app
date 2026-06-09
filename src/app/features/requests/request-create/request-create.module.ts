import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { RequestCreatePageRoutingModule } from './request-create-routing.module';
import { RequestCreatePage } from './request-create.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RequestCreatePageRoutingModule,
  ],
  declarations: [RequestCreatePage],
})
export class RequestCreatePageModule {}
