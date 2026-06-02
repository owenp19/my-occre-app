import { Component } from '@angular/core';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  isLoading = false;
  showChatbot = true;

  private readonly chatbotExcludedRoutes = [
    '/welcome',
    '/login',
    '/register',
  ];

  constructor(private readonly router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
      }

      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => {
          this.isLoading = false;
        }, 500);
      }

      if (event instanceof NavigationEnd) {
        this.showChatbot = !this.chatbotExcludedRoutes.some(
          (route) => event.urlAfterRedirects === route
        );
      }
    });
  }
}
