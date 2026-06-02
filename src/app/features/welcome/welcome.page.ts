import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

interface WelcomeSlide {
  image: string;
  alt: string;
}

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: false,
})
export class WelcomePage {
  public isStarting = false;

  public readonly slides: WelcomeSlide[] = [
    {
      image: 'assets/images/welcome-bg-1.jpg',
      alt: 'Vista turística de San Andrés Islas',
    },
    {
      image: 'assets/images/welcome-bg-2.jpg',
      alt: 'Paisaje costero de San Andrés, Providencia y Santa Catalina',
    },
    {
      image: 'assets/images/welcome-bg-3.jpg',
      alt: 'Entorno institucional y turístico del Archipiélago',
    },
  ];

  constructor(private readonly navCtrl: NavController) {}

  public async startJourney(): Promise<void> {
    if (this.isStarting) return;

    this.isStarting = true;

    try {
      await this.navCtrl.navigateRoot('/login');
    } catch (error) {
      console.error('Error al navegar hacia login:', error);
      this.isStarting = false;
    }
  }
}
