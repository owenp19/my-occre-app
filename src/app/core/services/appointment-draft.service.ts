import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const DRAFT_KEY = 'occre_appointment_draft';

import { SelectedDocument } from './document-native.service';

export interface AppointmentDraft {
  serviceId: number;
  officeId: number;
  date: string;
  time: string;
  citizen: {
    documentType: string;
    documentNumber: string;
    fullName: string;
    email: string;
    phone: string;
    confirmEmail: string;
  };
  documents: SelectedDocument[];
  lastStep: number;
}

@Injectable({ providedIn: 'root' })
export class AppointmentDraftService {

  async saveDraft(draft: AppointmentDraft): Promise<void> {
    try {
      await Preferences.set({ key: DRAFT_KEY, value: JSON.stringify(draft) });
    } catch (err) {
      console.warn('Error saving draft:', err);
    }
  }

  async getDraft(): Promise<AppointmentDraft | null> {
    try {
      const { value } = await Preferences.get({ key: DRAFT_KEY });
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  async clearDraft(): Promise<void> {
    try {
      await Preferences.remove({ key: DRAFT_KEY });
    } catch (err) {
      console.warn('Error clearing draft:', err);
    }
  }
}
