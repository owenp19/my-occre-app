import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RecordSearchPageRoutingModule } from './record-search-routing.module';
import { RecordSearchPage } from './record-search.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RecordSearchPageRoutingModule,
  ],
  declarations: [RecordSearchPage],
})
export class RecordSearchPageModule {}
