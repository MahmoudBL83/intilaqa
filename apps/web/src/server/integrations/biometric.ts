import type { IntegrationAdapter, IntegrationStatus } from "./types";

export interface BiometricAdapter extends IntegrationAdapter {
  syncDevices(): Promise<Array<{ deviceId: string; name: string; online: boolean }>>;
  pullAttendance(deviceId: string, from: Date, to: Date): Promise<Array<{ employeeId: string; timestamp: Date; type: "in" | "out" }>>;
  registerEmployee(deviceId: string, employeeId: string, name: string): Promise<void>;
}

export function createBiometricAdapter(): BiometricAdapter {
  return {
    name: "Biometric Device",
    isConfigured: async () => false,
    getStatus: async (): Promise<IntegrationStatus> => ({
      connected: false,
      lastSyncAt: null,
      error: "Biometric device not configured. Set BIOMETRIC_ENDPOINT.",
    }),
    syncDevices: async () => [],
    pullAttendance: async () => [],
    registerEmployee: async () => {
      throw new Error("Biometric device not configured.");
    },
  };
}
