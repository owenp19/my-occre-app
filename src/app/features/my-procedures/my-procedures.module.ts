import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MyProceduresPageRoutingModule } from './my-procedures-routing.module';
import { MyProceduresPage } from './my-procedures.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    MyProceduresPageRoutingModule,
  ],
  declarations: [MyProceduresPage],
})
export class MyProceduresPageModule {}
