import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  menuOutline,
  notificationsOutline,
  chevronDownOutline,
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
  shieldCheckmarkOutline,
} from 'ionicons/icons';

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

interface QuickSearchOption {
  label: string;
  icon: string;
  value: string;
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
    firstName: 'Juan',
    lastName: 'Díaz',
    photoUrl: null,
  };

  public readonly notificationCount = 2;

  public activeSlideIndex = 0;
  public searchTerm = '';
  public isQuickSearchOpen = false;

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
      label: 'Inicio',
      icon: 'home-outline',
      route: '/home',
    },
    {
      label: 'Trámites',
      icon: 'document-text-outline',
      route: '/procedures',
    },
    {
      label: 'Mi perfil',
      icon: 'person-outline',
      route: '/profile',
    },
    {
      label: 'Ayuda y contacto',
      icon: 'help-circle-outline',
      route: '/help-contact',
    },
  ];

  public readonly quickSearchOptions: QuickSearchOption[] = [
    {
      label: 'Buscar trámites',
      icon: 'document-text-outline',
      value: 'tramites',
      route: '/procedures',
    },
    {
      label: 'Consultar estado',
      icon: 'search-outline',
      value: 'estado',
      route: '/procedures',
    },
    {
      label: 'Ver requisitos',
      icon: 'folder-open-outline',
      value: 'requisitos',
      route: '/procedures',
    },
  ];

  public readonly occreProcedures: OccreProcedure[] = [
    {
      title: 'Mi primera tarjeta OCCRE',
      description:
        'Orientación para solicitar por primera vez la tarjeta OCCRE.',
      icon: 'id-card-outline',
      route: '/procedures',
      colorClass: 'is-blue',
      category: 'Residencia',
      slug: 'first-occre-card',
    },
    {
      title: 'Cambio de tarjeta de identidad a cédula',
      description:
        'Requisitos para actualizar el documento asociado a la OCCRE.',
      icon: 'person-outline',
      route: '/procedures',
      colorClass: 'is-green',
      category: 'Actualización',
      slug: 'id-card-change',
    },
    {
      title: 'Requisitos para inversionistas',
      description:
        'Información documental para personas o empresas inversionistas.',
      icon: 'briefcase-outline',
      route: '/procedures',
      colorClass: 'is-orange',
      category: 'Inversionistas',
      slug: 'investors',
    },
    {
      title: 'Duplicado de tarjeta OCCRE',
      description:
        'Solicitud de duplicado por pérdida, deterioro u otra causal.',
      icon: 'card-outline',
      route: '/procedures',
      colorClass: 'is-purple',
      category: 'Duplicado',
      slug: 'duplicate-card',
    },
    {
      title: 'Independiente primera vez',
      description:
        'Checklist para solicitantes independientes que realizan el trámite inicial.',
      icon: 'document-text-outline',
      route: '/procedures',
      colorClass: 'is-blue',
      category: 'Residencia',
      slug: 'independent-first-time',
    },
    {
      title: 'Corrección de tarjeta OCCRE',
      description:
        'Corrección de datos, tipo de residencia u otra información registrada.',
      icon: 'document-text-outline',
      route: '/procedures',
      colorClass: 'is-green',
      category: 'Corrección',
      slug: 'card-correction',
    },
    {
      title: 'Residencia por convivencia',
      description:
        'Trámite para beneficiario y otorgante por vínculo de convivencia.',
      icon: 'people-outline',
      route: '/procedures',
      colorClass: 'is-orange',
      category: 'Convivencia',
      slug: 'residence-cohabitation',
    },
    {
      title: 'Pasajero en comisión',
      description:
        'Orientación para comisión temporal, entidad solicitante y familiares.',
      icon: 'airplane-outline',
      route: '/procedures',
      colorClass: 'is-purple',
      category: 'Comisión',
      slug: 'commission-passenger',
    },
    {
      title: 'Trabajador foráneo o tratamiento especial',
      description:
        'Requisitos para trabajador, empresa contratante y núcleo familiar.',
      icon: 'business-outline',
      route: '/procedures',
      colorClass: 'is-blue',
      category: 'Trabajador foráneo',
      slug: 'foreign-worker',
    },
  ];

  private carouselInterval?: ReturnType<typeof setInterval>;

  constructor(
    private readonly router: Router,
    private readonly menuController: MenuController
  ) {
    addIcons({
      menuOutline,
      notificationsOutline,
      chevronDownOutline,
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
      shieldCheckmarkOutline,
    });
  }

  public ngOnInit(): void {
    this.startCarousel();
  }

  public ngOnDestroy(): void {
    this.stopCarousel();
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

  public submitSearch(): void {
    const query = this.searchTerm.trim();

    if (!query) {
      return;
    }

    this.isQuickSearchOpen = false;

    void this.router.navigate(['/procedures'], {
      queryParams: {
        search: query,
      },
    });
  }

  public toggleQuickSearchOptions(): void {
    this.isQuickSearchOpen = !this.isQuickSearchOpen;
  }

  public selectQuickSearch(option: QuickSearchOption): void {
    this.searchTerm = option.label;
    this.isQuickSearchOpen = false;

    void this.router.navigate([option.route], {
      queryParams: {
        filter: option.value,
      },
    });
  }

  public goToProcedure(procedure: OccreProcedure): void {
    void this.router.navigate([procedure.route], {
      queryParams: {
        procedure: procedure.slug,
        category: procedure.category,
      },
    });
  }

  public clearSearch(): void {
    this.searchTerm = '';
    this.isQuickSearchOpen = false;
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