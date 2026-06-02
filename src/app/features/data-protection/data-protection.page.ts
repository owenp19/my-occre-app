import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  shieldCheckmarkOutline,
  lockClosedOutline,
  eyeOutline,
  serverOutline,
  documentTextOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';

interface ProtectionItem {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-data-protection',
  templateUrl: './data-protection.page.html',
  styleUrls: ['./data-protection.page.scss'],
  standalone: false,
})
export class DataProtectionPage {
  public readonly items: ProtectionItem[] = [
    {
      icon: 'lock-closed-outline',
      title: 'Encriptación de datos',
      description:
        'Toda la información personal se almacena y transmite bajo estrictos estándares de encriptación para garantizar que solo tú y las autoridades competentes puedan acceder a ella.',
    },
    {
      icon: 'eye-outline',
      title: 'Confidencialidad',
      description:
        'Tus datos no serán compartidos con terceros sin tu consentimiento explícito, salvo por obligaciones legales o requerimientos de autoridades judiciales.',
    },
    {
      icon: 'server-outline',
      title: 'Almacenamiento seguro',
      description:
        'La información se aloja en servidores con medidas de seguridad físicas y lógicas que cumplen la normativa colombiana de protección de datos (Ley 1581 de 2012).',
    },
    {
      icon: 'checkmark-circle-outline',
      title: 'Control de tus datos',
      description:
        'Puedes solicitar en cualquier momento la actualización, rectificación o eliminación de tus datos personales a través de los canales oficiales de la OCCRE.',
    },
  ];

  constructor(private readonly navCtrl: NavController) {
    addIcons({
      arrowBackOutline,
      shieldCheckmarkOutline,
      lockClosedOutline,
      eyeOutline,
      serverOutline,
      documentTextOutline,
      checkmarkCircleOutline,
    });
  }

  public goBack(): void {
    void this.navCtrl.back();
  }
}
