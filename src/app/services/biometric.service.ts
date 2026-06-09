import { Injectable } from '@angular/core';
import { BiometricAuth, BiometryType, BiometryErrorType } from '@aparajita/capacitor-biometric-auth';

export interface BiometricResult {
  success: boolean;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class BiometricService {
  async isAvailable(): Promise<boolean> {
    try {
      const result = await BiometricAuth.checkBiometry();
      return result.isAvailable;
    } catch {
      return false;
    }
  }

  async getBiometryType(): Promise<BiometryType | null> {
    try {
      const result = await BiometricAuth.checkBiometry();
      if (result.isAvailable) {
        return result.biometryType;
      }
      return null;
    } catch {
      return null;
    }
  }

  async authenticate(reason?: string): Promise<BiometricResult> {
    try {
      await BiometricAuth.authenticate({
        reason: reason || 'Inicia sesión con tu huella o Face ID',
        cancelTitle: 'Cancelar',
        allowDeviceCredential: true,
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de autenticación biométrica' };
    }
  }

  async getBiometryLabel(): Promise<string> {
    try {
      const result = await BiometricAuth.checkBiometry();
      if (!result.isAvailable) return 'No disponible';

      switch (result.biometryType) {
        case BiometryType.faceId: return 'Face ID';
        case BiometryType.touchId: return 'Touch ID';
        case BiometryType.fingerprintAuthentication: return 'Huella digital';
        case BiometryType.faceAuthentication: return 'Reconocimiento facial';
        case BiometryType.irisAuthentication: return 'Iris';
        default: return 'Biometría';
      }
    } catch {
      return 'No disponible';
    }
  }
}
