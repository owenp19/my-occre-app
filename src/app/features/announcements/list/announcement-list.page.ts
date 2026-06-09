import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  megaphoneOutline,
  alertCircleOutline,
  informationCircleOutline,
  warningOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { AnnouncementService, Announcement } from '../../../services/announcement.service';

@Component({
  selector: 'app-announcement-list',
  templateUrl: './announcement-list.page.html',
  styleUrls: ['./announcement-list.page.scss'],
  standalone: false,
})
export class AnnouncementListPage implements OnInit {
  public announcements: Announcement[] = [];
  public isLoading = true;
  public error = '';

  public readonly typeIcons: Record<string, string> = {
    info: 'information-circle-outline',
    alert: 'warning-outline',
    important: 'megaphone-outline',
  };

  public readonly typeColors: Record<string, string> = {
    info: 'primary',
    alert: 'warning',
    important: 'danger',
  };

  constructor(
    private readonly navCtrl: NavController,
    private readonly announcementService: AnnouncementService,
  ) {
    addIcons({
      arrowBackOutline, megaphoneOutline, alertCircleOutline,
      informationCircleOutline, warningOutline, chevronForwardOutline,
    });
  }

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.isLoading = true;
    this.error = '';
    try {
      const res = await firstValueFrom(this.announcementService.getActive());
      this.announcements = res.announcements;
    } catch {
      this.error = 'Error al cargar comunicados.';
    } finally {
      this.isLoading = false;
    }
  }

  goToDetail(id: number): void {
    void this.navCtrl.navigateForward(`/announcements/${id}`);
  }

  goBack(): void {
    void this.navCtrl.back();
  }
}
