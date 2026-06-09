import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  megaphoneOutline,
  alertCircleOutline,
  informationCircleOutline,
  calendarOutline,
} from 'ionicons/icons';
import { AnnouncementService, Announcement } from '../../../services/announcement.service';

@Component({
  selector: 'app-announcement-detail',
  templateUrl: './announcement-detail.page.html',
  styleUrls: ['./announcement-detail.page.scss'],
  standalone: false,
})
export class AnnouncementDetailPage implements OnInit {
  public announcement: Announcement | null = null;
  public isLoading = true;
  public error = '';

  public readonly typeIcons: Record<string, string> = {
    info: 'information-circle-outline',
    alert: 'warning-outline',
    important: 'megaphone-outline',
  };

  public readonly typeLabels: Record<string, string> = {
    info: 'Informativo',
    alert: 'Alerta',
    important: 'Importante',
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly navCtrl: NavController,
    private readonly announcementService: AnnouncementService,
  ) {
    addIcons({
      arrowBackOutline, megaphoneOutline, alertCircleOutline,
      informationCircleOutline, calendarOutline,
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Comunicado no encontrado.';
      this.isLoading = false;
      return;
    }
    void this.load(id);
  }

  private async load(id: number): Promise<void> {
    this.isLoading = true;
    this.error = '';
    try {
      const res = await firstValueFrom(this.announcementService.getActive());
      this.announcement = res.announcements.find(a => a.id === id) || null;
      if (!this.announcement) this.error = 'Comunicado no encontrado.';
    } catch {
      this.error = 'Error al cargar el comunicado.';
    } finally {
      this.isLoading = false;
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  goBack(): void {
    void this.navCtrl.back();
  }
}
