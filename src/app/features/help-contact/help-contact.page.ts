import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  locationOutline,
  callOutline,
  mailOutline,
  timeOutline,
  chevronForwardOutline,
  chevronDownOutline,
  documentTextOutline,
  globeOutline,
} from 'ionicons/icons';

interface ContactInfo {
  icon: string;
  label: string;
  value: string;
  href?: string;
}

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-help-contact',
  templateUrl: './help-contact.page.html',
  styleUrls: ['./help-contact.page.scss'],
  standalone: false,
})
export class HelpContactPage {
  public readonly contactInfo: ContactInfo[] = [
    {
      icon: 'location-outline',
      label: 'help.address',
      value: 'Av. 20 de Julio, San Andrés Islas, Colombia',
    },
    {
      icon: 'call-outline',
      label: 'help.phone',
      value: '(608) 513 0801 ext. 413',
      href: 'tel:+6085130801',
    },
    {
      icon: 'mail-outline',
      label: 'help.email',
      value: 'occre@sanandres.gov.co',
      href: 'mailto:occre@sanandres.gov.co',
    },
    {
      icon: 'time-outline',
      label: 'help.hours',
      value: 'Lunes a viernes — 8:00 a. m. a 12:00 p. m. y 2:00 p. m. a 5:00 p. m.',
    },
    {
      icon: 'globe-outline',
      label: 'help.website',
      value: 'www.occre.gov.co',
      href: 'https://occre.gov.co',
    },
  ];

  public readonly faqItems: FaqItem[] = [
    {
      question: '¿Cómo radicar un trámite?',
      answer:
        'Puedes radicar tus trámites de forma presencial en la oficina de la OCCRE o a través de la ventanilla virtual en el sitio web oficial. Recuerda llevar los documentos requeridos según el tipo de trámite.',
      open: false,
    },
    {
      question: '¿Necesito cita previa?',
      answer:
        'Algunos trámites requieren cita previa. Te recomendamos consultar los canales oficiales de la OCCRE antes de desplazarte para confirmar si el trámite que necesitas requiere agendamiento.',
      open: false,
    },
    {
      question: '¿Cómo consultar el estado de mi solicitud?',
      answer:
        'Debes conservar el número de radicado de tu solicitud. Con ese número puedes consultar el estado a través de los canales oficiales de la OCCRE o comunicándote directamente con la oficina.',
      open: false,
    },
    {
      question: '¿Cuánto tiempo tarda un trámite?',
      answer:
        'Los tiempos de respuesta varían según el tipo de trámite. Para información específica sobre tiempos, consulta directamente con la OCCRE o revisa la información del trámite en su sitio web.',
      open: false,
    },
  ];

  constructor(private readonly navCtrl: NavController) {
    addIcons({
      arrowBackOutline,
      locationOutline,
      callOutline,
      mailOutline,
      timeOutline,
      chevronForwardOutline,
      chevronDownOutline,
      documentTextOutline,
      globeOutline,
    });
  }

  public goBack(): void {
    void this.navCtrl.back();
  }

  public toggleFaq(item: FaqItem): void {
    item.open = !item.open;
  }

  public openLink(url?: string): void {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
