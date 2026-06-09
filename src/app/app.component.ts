import { Component, OnDestroy } from '@angular/core';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { shieldCheckmarkOutline, cloudOfflineOutline } from 'ionicons/icons';
import { LoadingService } from './services/loading.service';
import { OfflineService } from './services/offline.service';
import { NetworkService } from './services/network.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnDestroy {
  isLoading = false;
  showChatbot = true;

  private readonly chatbotExcludedRoutes = [
    '/welcome',
    '/register',
  ];
  private readonly subs: Subscription[] = [];

  constructor(
    private readonly router: Router,
    private readonly loadingService: LoadingService,
    public readonly offline: OfflineService,
    public readonly network: NetworkService,
  ) {
    addIcons({ shieldCheckmarkOutline, cloudOfflineOutline });

    this.subs.push(
      this.loadingService.loading$.subscribe((loading) => {
        this.isLoading = loading;
      })
    );

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loadingService.show();
      }

      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => {
          this.loadingService.hide();
        }, 400);
      }

      if (event instanceof NavigationEnd) {
        this.showChatbot = !this.chatbotExcludedRoutes.some(
          (route) => event.urlAfterRedirects === route
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
