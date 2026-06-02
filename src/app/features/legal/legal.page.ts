import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  shieldCheckmarkOutline,
  documentTextOutline,
  informationCircleOutline,
  eyeOutline,
  lockClosedOutline,
  chevronForwardOutline,
  chevronDownOutline,
} from 'ionicons/icons';

interface LegalSection {
  title: string;
  icon: string;
  content: string;
  open: boolean;
}

@Component({
  selector: 'app-legal',
  templateUrl: './legal.page.html',
  styleUrls: ['./legal.page.scss'],
  standalone: false,
})
export class LegalPage {
  public readonly sections: LegalSection[] = [
    {
      title: 'Aviso de privacidad',
      icon: 'eye-outline',
      open: false,
      content:
        'La OCCRE, en cumplimiento de la Ley 1581 de 2012 y sus decretos reglamentarios, actúa como responsable del tratamiento de los datos personales suministrados por los ciudadanos a través de sus canales de atención. Los datos recopilados son utilizados exclusivamente para los fines relacionados con los trámites de circulación, residencia y control en el Departamento Archipiélago de San Andrés, Providencia y Santa Catalina.',
    },
    {
      title: 'Tratamiento de datos',
      icon: 'lock-closed-outline',
      open: false,
      content:
        'Los datos personales proporcionados serán tratados con estrictas medidas de seguridad técnicas, administrativas y jurídicas para garantizar su confidencialidad, integridad y disponibilidad. El titular de los datos tiene derecho a conocer, actualizar, rectificar y solicitar la eliminación de su información en cualquier momento, así como a revocar la autorización otorgada para su tratamiento.',
    },
    {
      title: 'Términos de uso',
      icon: 'document-text-outline',
      open: false,
      content:
        'El uso de esta aplicación y sus servicios implica la aceptación de los términos y condiciones aquí descritos. La OCCRE se reserva el derecho de actualizar o modificar estos términos en cualquier momento. Se recomienda a los usuarios revisar periódicamente esta sección para mantenerse informados sobre cualquier cambio. El acceso no autorizado, la alteración o el mal uso de la información contenida en esta plataforma está prohibido y podrá ser sancionado conforme a la ley.',
    },
    {
      title: 'Política de cookies',
      icon: 'information-circle-outline',
      open: false,
      content:
        'Esta aplicación utiliza cookies y tecnologías similares para mejorar la experiencia del usuario, analizar el tráfico y personalizar el contenido. Al utilizar la aplicación, el usuario acepta el uso de cookies conforme a esta política. El usuario puede configurar su navegador para rechazar todas las cookies o para indicar cuándo se envía una cookie. Sin embargo, algunas funcionalidades de la aplicación podrían verse afectadas.',
    },
  ];

  constructor(private readonly navCtrl: NavController) {
    addIcons({
      arrowBackOutline,
      shieldCheckmarkOutline,
      documentTextOutline,
      informationCircleOutline,
      eyeOutline,
      lockClosedOutline,
      chevronForwardOutline,
      chevronDownOutline,
    });
  }

  public goBack(): void {
    void this.navCtrl.back();
  }

  public toggleSection(section: LegalSection): void {
    section.open = !section.open;
  }
}
