import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { LoginPageRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    LoginPageRoutingModule
  ],
  declarations: [
    LoginComponent
  ]
})
export class LoginPageModule {}