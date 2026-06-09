import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export interface SelectedDocument {
  name: string;
  data: string;
  type: string;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class DocumentNativeService {
  selectedDocuments: SelectedDocument[] = [];

  async pickFromCamera(): Promise<void> {
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });
      if (image.dataUrl) {
        this.selectedDocuments.push({
          name: `photo_${Date.now()}.jpg`,
          data: image.dataUrl,
          type: 'image/jpeg',
          size: this.dataUrlSize(image.dataUrl),
        });
      }
    } catch {
      console.warn('Camera cancelled or unavailable');
      throw new Error('No se pudo acceder a la cámara');
    }
  }

  async pickFromGallery(): Promise<void> {
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });
      if (image.dataUrl) {
        this.selectedDocuments.push({
          name: `gallery_${Date.now()}.jpg`,
          data: image.dataUrl,
          type: 'image/jpeg',
          size: this.dataUrlSize(image.dataUrl),
        });
      }
    } catch {
      console.warn('Gallery cancelled or unavailable');
      throw new Error('No se pudo acceder a la galería');
    }
  }

  async pickFromFiles(): Promise<void> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
      input.multiple = true;
      input.onchange = async () => {
        const files = Array.from(input.files ?? []);
        for (const file of files) {
          const dataUrl = await this.fileToDataUrl(file);
          this.selectedDocuments.push({
            name: file.name,
            data: dataUrl,
            type: file.type,
            size: file.size,
          });
        }
        resolve();
      };
      input.onerror = () => reject(new Error('Error al seleccionar archivos'));
      input.click();
    });
  }

  removeDocument(index: number): void {
    this.selectedDocuments.splice(index, 1);
  }

  buildFormData(): FormData | null {
    if (this.selectedDocuments.length === 0) return null;
    const formData = new FormData();
    for (const doc of this.selectedDocuments) {
      const blob = this.dataUrlToBlob(doc.data, doc.type);
      formData.append('documents', blob, doc.name);
    }
    return formData;
  }

  clearDocuments(): void {
    this.selectedDocuments = [];
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private dataUrlToBlob(dataUrl: string, mime: string): Blob {
    const parts = dataUrl.split(',');
    const byteString = atob(parts[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mime });
  }

  private dataUrlSize(dataUrl: string): number {
    const base64 = dataUrl.split(',')[1] || dataUrl;
    return Math.round((base64.length * 3) / 4);
  }
}
