import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { BottomMenuComponent } from './components/bottom-menu/bottom-menu.component';
import { OccreChatbotComponent } from './components/occre-chatbot/occre-chatbot.component';

@NgModule({
  declarations: [
    BottomMenuComponent,
    OccreChatbotComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
  ],
  exports: [
    BottomMenuComponent,
    OccreChatbotComponent,
  ],
})
export class SharedModule {}