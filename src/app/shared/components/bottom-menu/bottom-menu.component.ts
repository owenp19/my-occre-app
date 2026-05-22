import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  documentTextOutline,
  personOutline,
} from 'ionicons/icons';

type BottomMenuItem = 'home' | 'procedures' | 'profile';

interface BottomMenuOption {
  id: BottomMenuItem;
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-bottom-menu',
  templateUrl: './bottom-menu.component.html',
  styleUrls: ['./bottom-menu.component.scss'],
  standalone: false,
})
export class BottomMenuComponent {
  @Input() public active: BottomMenuItem = 'home';

  public readonly menuOptions: BottomMenuOption[] = [
    {
      id: 'home',
      label: 'Inicio',
      icon: 'home-outline',
      route: '/home',
    },
    {
      id: 'procedures',
      label: 'Trámites',
      icon: 'document-text-outline',
      route: '/procedures',
    },
    {
      id: 'profile',
      label: 'Mi perfil',
      icon: 'person-outline',
      route: '/profile',
    },
  ];

  constructor(private readonly router: Router) {
    addIcons({
      homeOutline,
      documentTextOutline,
      personOutline,
    });
  }

  public goTo(route: string): void {
    void this.router.navigate([route]);
  }

  public isActive(option: BottomMenuOption): boolean {
    return option.id === this.active;
  }
}
