import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  timeOutline,
  documentTextOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { ProcedureService, ProcedureType } from '../../services/procedure.service';

@Component({
  selector: 'app-procedures',
  templateUrl: './procedures.page.html',
  styleUrls: ['./procedures.page.scss'],
  standalone: false,
})
export class ProceduresPage implements OnInit {
  public procedures: ProcedureType[] = [];
  public filteredProcedures: ProcedureType[] = [];
  public searchQuery = '';
  public isLoading = true;
  public error = '';

  constructor(
    private readonly navCtrl: NavController,
    private readonly procedureService: ProcedureService,
  ) {
    addIcons({ searchOutline, timeOutline, documentTextOutline, alertCircleOutline });
  }

  async ngOnInit(): Promise<void> {
    await this.loadProcedures();
  }

  async loadProcedures(): Promise<void> {
    this.isLoading = true;
    this.error = '';
    try {
      const res = await firstValueFrom(this.procedureService.getAll());
      this.procedures = res.procedures.filter(p => p.isActive);
      this.filteredProcedures = [...this.procedures];
    } catch {
      this.error = 'Error al cargar los trámites. Verifica tu conexión.';
    } finally {
      this.isLoading = false;
    }
  }

  onSearch(event: any): void {
    this.searchQuery = (event.detail.value || '').toLowerCase();
    this.filterProcedures();
  }

  filterProcedures(): void {
    if (!this.searchQuery.trim()) {
      this.filteredProcedures = [...this.procedures];
      return;
    }
    this.filteredProcedures = this.procedures.filter(p =>
      p.name.toLowerCase().includes(this.searchQuery)
    );
  }

  goToDetail(slug: string): void {
    void this.navCtrl.navigateForward(`/procedures/${slug}`);
  }

  async doRefresh(event: any): Promise<void> {
    await this.loadProcedures();
    event.target.complete();
  }
}
