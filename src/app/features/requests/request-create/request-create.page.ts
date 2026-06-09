import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { NavController, ActionSheetController } from '@ionic/angular';
import { Camera, CameraSource, CameraResultType } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  cameraOutline,
  cloudUploadOutline,
  sendOutline,
  closeOutline,
  checkmarkOutline,
  documentOutline,
  alertCircleOutline,
  imageOutline,
} from 'ionicons/icons';
import { ProcedureService, ProcedureType } from '../../../services/procedure.service';
import { RequestService } from '../../../services/request.service';
import { DocumentService } from '../../../services/document.service';

@Component({
  selector: 'app-request-create',
  templateUrl: './request-create.page.html',
  styleUrls: ['./request-create.page.scss'],
  standalone: false,
})
export class RequestCreatePage implements OnInit {

  public procedure: ProcedureType | null = null;
  public procedureTypeId = 0;
  public notes = '';
  public isLoading = true;
  public isSubmitting = false;
  public error = '';
  public selectedFiles: { file: File; name: string }[] = [];
  public successData: { trackingNumber: string; requestId: number } | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly navCtrl: NavController,
    private readonly actionSheetCtrl: ActionSheetController,
    private readonly procedureService: ProcedureService,
    private readonly requestService: RequestService,
    private readonly documentService: DocumentService,
  ) {
    addIcons({
      checkmarkCircleOutline,
      cameraOutline,
      cloudUploadOutline,
      sendOutline,
      closeOutline,
      checkmarkOutline,
      documentOutline,
      alertCircleOutline,
      imageOutline,
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('procedureId');
    if (!id) {
      this.error = 'No se especificó el trámite.';
      this.isLoading = false;
      return;
    }
    this.procedureTypeId = Number(id);
    void this.loadProcedure();
  }

  private async loadProcedure(): Promise<void> {
    this.isLoading = true;
    this.error = '';
    try {
      const res = await firstValueFrom(this.procedureService.getById(this.procedureTypeId));
      this.procedure = res.procedure;
    } catch {
      this.error = 'Error al cargar la información del trámite.';
    } finally {
      this.isLoading = false;
    }
  }

  async addFile(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.onchange = (event) => {
        const target = event.target as HTMLInputElement;
        if (target.files) {
          for (let i = 0; i < target.files.length; i++) {
            this.selectedFiles.push({ file: target.files[i], name: target.files[i].name });
          }
        }
      };
      input.click();
      return;
    }

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Agregar documento',
      buttons: [
        {
          text: 'Cámara',
          icon: 'camera-outline',
          handler: () => this.capturePhoto(),
        },
        {
          text: 'Galería',
          icon: 'image-outline',
          handler: () => this.selectFromGallery(),
        },
        { text: 'Cancelar', role: 'cancel' },
      ],
    });
    await actionSheet.present();
  }

  private async capturePhoto(): Promise<void> {
    try {
      const image = await Camera.getPhoto({
        source: CameraSource.Camera,
        quality: 80,
        resultType: CameraResultType.Uri,
      });
      if (image.path) {
        const response = await fetch(image.path);
        const blob = await response.blob();
        const ext = image.format === 'png' ? 'png' : 'jpg';
        this.selectedFiles.push({
          file: new File([blob], `foto_${Date.now()}.${ext}`, { type: `image/${ext}` }),
          name: `foto_${Date.now()}.${ext}`,
        });
      }
    } catch {
      console.warn('[Camera] Captura cancelada');
    }
  }

  private async selectFromGallery(): Promise<void> {
    try {
      const image = await Camera.getPhoto({
        source: CameraSource.Photos,
        quality: 80,
        resultType: CameraResultType.Uri,
      });
      if (image.path) {
        const response = await fetch(image.path);
        const blob = await response.blob();
        const ext = image.format === 'png' ? 'png' : 'jpg';
        this.selectedFiles.push({
          file: new File([blob], `galeria_${Date.now()}.${ext}`, { type: `image/${ext}` }),
          name: `galeria_${Date.now()}.${ext}`,
        });
      }
    } catch {
      console.warn('[Gallery] Selección cancelada');
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  async submitRequest(): Promise<void> {
    if (this.isSubmitting || !this.procedure) return;
    this.isSubmitting = true;
    this.error = '';

    try {
      const res = await firstValueFrom(
        this.requestService.create(this.procedureTypeId, this.notes || undefined)
      );

      const requestId = res.requestId;
      const trackingNumber = res.trackingNumber;

      if (this.selectedFiles.length > 0 && requestId) {
        for (const item of this.selectedFiles) {
          try {
            await firstValueFrom(this.documentService.uploadDocument(requestId, item.file));
          } catch {
            // Silently fail for individual file uploads
          }
        }
      }

      this.successData = { trackingNumber, requestId };
    } catch (err: any) {
      this.error = err.error?.error || 'Error al enviar la solicitud. Intenta de nuevo.';
    } finally {
      this.isSubmitting = false;
    }
  }

  goToTracking(): void {
    if (!this.successData) return;
    void this.navCtrl.navigateForward(`/request-tracking/${this.successData.trackingNumber}`);
  }

  goBack(): void {
    void this.navCtrl.back();
  }
}
