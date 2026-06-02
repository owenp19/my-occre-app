import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { BottomMenuComponent } from './components/bottom-menu/bottom-menu.component';
import { OccreChatbotComponent } from './components/occre-chatbot/occre-chatbot.component';
import { TranslatePipe } from '../pipes/translate.pipe';

@NgModule({
  declarations: [
    BottomMenuComponent,
    OccreChatbotComponent,
    TranslatePipe,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
  ],
  exports: [
    BottomMenuComponent,
    OccreChatbotComponent,
    TranslatePipe,
  ],
})
export class SharedModule {}