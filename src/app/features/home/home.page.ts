import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  menuOutline,
  notificationsOutline,
  chevronForwardOutline,
  searchOutline,
  optionsOutline,
  homeOutline,
  documentTextOutline,
  folderOpenOutline,
  personOutline,
  helpCircleOutline,
  closeOutline,
  idCardOutline,
  briefcaseOutline,
  cardOutline,
  peopleOutline,
  airplaneOutline,
  businessOutline,
  settingsOutline,
  logOutOutline,
  informationCircleOutline,
  calendarOutline,
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { NotificationsService } from '../../services/notifications.service';
import { environment } from '../../../environments/environment';

interface HeroSlide {
  image: string;
  kicker: string;
  title: string;
  description: string;
  actionLabel: string;
  route: string;
}

interface MenuOption {
  label: string;
  icon: string;
  route: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  photoUrl: string | null;
}

interface OccreProcedure {
  title: string;
  description: string;
  icon: string;
  route: string;
  colorClass: string;
  category: string;
  slug: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  public readonly brandImagePath = 'assets/images/logo-occre.png';

  public currentUser: UserProfile = {
    firstName: '',
    lastName: '',
    photoUrl: null,
  };

  public notificationCount = 0;

  public activeSlideIndex = 0;
  public searchTerm = '';

  public readonly heroSlides: HeroSlide[] = [
    {
      image: 'assets/images/welcome-bg-1.jpg',
      kicker: '¡Bienvenido!',
      title: 'Estamos para orientarte',
      description:
        'Consulta, inicia y realiza seguimiento a tus trámites OCCRE de forma ágil, segura y en línea.',
      actionLabel: 'Explorar trámites',
      route: '/procedures',
    },
    {
      image: 'assets/images/welcome-bg-2.jpg',
      kicker: 'Información importante',
      title: 'Prepara tus documentos',
      description:
        'Revisa los requisitos de cada trámite antes de iniciar tu solicitud y evita devoluciones por información incompleta.',
      actionLabel: 'Ver requisitos',
      route: '/procedures',
    },
    {
      image: 'assets/images/welcome-bg-3.jpg',
      kicker: 'Seguimiento en línea',
      title: 'Consulta el estado de tu trámite',
      description:
        'Verifica el avance de tu solicitud usando el número de radicado o tu documento de identidad.',
      actionLabel: 'Consultar estado',
      route: '/procedures',
    },
  ];

  public readonly menuOptions: MenuOption[] = [
    {
      label: 'Mis trámites',
      icon: 'folder-open-outline',
      route: '/my-procedures',
    },
    {
      label: 'Consulta de radicado',
      icon: 'search-outline',
      route: '/record-search',
    },
    {
      label: 'Agendar cita',
      icon: 'calendar-outline',
      route: '/appointments',
    },
    {
      label: 'Notificaciones',
      icon: 'notifications-outline',
      route: '/notifications',
    },
    {
      label: 'Ayuda y contacto',
      icon: 'help-circle-outline',
      route: '/help-contact',
    },
    {
      label: 'Información legal',
      icon: 'information-circle-outline',
      route: '/legal',
    },
    {
      label: 'Configuración',
      icon: 'settings-outline',
      route: '/settings',
    },
    {
      label: 'Cerrar sesión',
      icon: 'log-out-outline',
      route: 'logout',
    },
  ];

  public readonly occreProcedures: OccreProcedure[] = [
    {
      title: 'Mi Primera Tarjeta OCCRE',
      description:
        'Solicitud inicial de tarjeta de residencia para residentes del Archipiélago.',
      icon: 'id-card-outline',
      route: '/procedures',
      colorClass: 'is-blue',
      category: 'Residencia',
      slug: 'mi-primera-tarjeta-occre',
    },
    {
      title: 'Cambio de Tarjeta de Identidad a Cédula',
      description:
        'Actualización del documento de identidad asociado a la Tarjeta OCCRE.',
      icon: 'person-outline',
      route: '/procedures',
      colorClass: 'is-green',
      category: 'Actualización',
      slug: 'cambio-tarjeta-identidad-cedula',
    },
    {
      title: 'Requisitos para Inversionistas',
      description:
        'Información documental para personas o empresas inversionistas.',
      icon: 'briefcase-outline',
      route: '/procedures',
      colorClass: 'is-orange',
      category: 'Inversionistas',
      slug: 'requisitos-inversionistas',
    },
    {
      title: 'Duplicado Tarjeta OCCRE',
      description:
        'Solicitud de duplicado por pérdida, deterioro u otra causal.',
      icon: 'card-outline',
      route: '/procedures',
      colorClass: 'is-purple',
      category: 'Duplicado',
      slug: 'duplicado-tarjeta-occre',
    },
    {
      title: 'Independiente Primera Vez',
      description:
        'Checklist para solicitantes independientes que realizan el trámite inicial.',
      icon: 'document-text-outline',
      route: '/procedures',
      colorClass: 'is-blue',
      category: 'Residencia',
      slug: 'independiente-primera-vez',
    },
    {
      title: 'Residencia por Convivencia',
      description:
        'Trámite para beneficiario y otorgante por vínculo de convivencia.',
      icon: 'people-outline',
      route: '/procedures',
      colorClass: 'is-orange',
      category: 'Convivencia',
      slug: 'residencia-convivencia',
    },
    {
      title: 'Pasajero en Comisión',
      description:
        'Orientación para comisión temporal, entidad solicitante y familiares.',
      icon: 'airplane-outline',
      route: '/procedures',
      colorClass: 'is-purple',
      category: 'Comisión',
      slug: 'pasajero-comision',
    },
    {
      title: 'Trabajador Foráneo o Trámite Especial',
      description:
        'Requisitos para trabajador foráneo, empresa contratante y núcleo familiar.',
      icon: 'business-outline',
      route: '/procedures',
      colorClass: 'is-blue',
      category: 'Trabajador foráneo',
      slug: 'trabajador-foraneo-tramite-especial',
    },
  ];

  private carouselInterval?: ReturnType<typeof setInterval>;

  constructor(
    private readonly router: Router,
    private readonly menuController: MenuController,
    private readonly authService: AuthService,
    private readonly notificationsService: NotificationsService,
  ) {
    addIcons({
      menuOutline,
      notificationsOutline,
      chevronForwardOutline,
      searchOutline,
      optionsOutline,
      homeOutline,
      documentTextOutline,
      folderOpenOutline,
      personOutline,
      helpCircleOutline,
      closeOutline,
      idCardOutline,
      briefcaseOutline,
      cardOutline,
      peopleOutline,
      airplaneOutline,
      businessOutline,
      settingsOutline,
      logOutOutline,
      informationCircleOutline,
      calendarOutline,
    });
  }

  public ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.currentUser = {
        firstName: user.firstName,
        lastName: user.lastName,
        photoUrl: user.photoUrl || null,
      };
      if (!environment.useFallback) {
        this.notificationsService.getUnreadCount().subscribe({
          next: (res) => { this.notificationCount = res.count; },
          error: () => { this.notificationCount = 0; },
        });
      }
    }
    this.startCarousel();
  }

  public ngOnDestroy(): void {
    this.stopCarousel();
  }

  public get filteredProcedures(): OccreProcedure[] {
    const query = this.searchTerm.trim().toLowerCase();
    if (!query) {
      return this.occreProcedures;
    }
    return this.occreProcedures.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  }

  public get activeSlide(): HeroSlide {
    return this.heroSlides[this.activeSlideIndex];
  }

  public get userInitials(): string {
    return this.buildInitials(
      this.currentUser.firstName,
      this.currentUser.lastName
    );
  }

  public get profileImageUrl(): string | null {
    return this.currentUser.photoUrl;
  }

  public async openMenu(): Promise<void> {
    await this.menuController.open('home-menu');
  }

  public async closeMenu(): Promise<void> {
    await this.menuController.close('home-menu');
  }

  public async goTo(route: string): Promise<void> {
    await this.closeMenu();
    if (route === 'logout') {
      this.authService.logout();
      return;
    }
    await this.router.navigate([route]);
  }

  public goToActiveSlideRoute(): void {
    void this.router.navigate([this.activeSlide.route]);
  }

  public selectSlide(index: number): void {
    if (index < 0 || index >= this.heroSlides.length) {
      return;
    }

    this.activeSlideIndex = index;
    this.restartCarousel();
  }

  public openNotifications(): void {
    void this.router.navigate(['/notifications']);
  }

  public openProfile(): void {
    void this.router.navigate(['/profile']);
  }

  public goToProcedure(procedure: OccreProcedure): void {
    void this.router.navigate(['/procedures', procedure.slug]);
  }

  private startCarousel(): void {
    this.stopCarousel();

    if (this.heroSlides.length <= 1) {
      return;
    }

    this.carouselInterval = setInterval(() => {
      this.activeSlideIndex =
        (this.activeSlideIndex + 1) % this.heroSlides.length;
    }, 6000);
  }

  private stopCarousel(): void {
    if (!this.carouselInterval) {
      return;
    }

    clearInterval(this.carouselInterval);
    this.carouselInterval = undefined;
  }

  private restartCarousel(): void {
    this.stopCarousel();
    this.startCarousel();
  }

  private buildInitials(firstName: string, lastName: string): string {
    const firstInitial = firstName.trim().charAt(0);
    const lastInitial = lastName.trim().charAt(0);

    if (!firstInitial && !lastInitial) {
      return 'US';
    }

    return `${firstInitial}${lastInitial}`.toUpperCase();
  }
}