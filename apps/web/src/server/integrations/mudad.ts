import type { IntegrationAdapter, IntegrationStatus } from "./types";

export interface MudadAdapter extends IntegrationAdapter {
  syncPayroll(month: number, year: number, records: Array<{ employeeId: string; netPay: number }>): Promise<void>;
  getComplianceStatus(): Promise<{ compliant: boolean; issues: string[] }>;
}

export function createMudadAdapter(): MudadAdapter {
  return {
    name: "Mudad",
    isConfigured: async () => false,
    getStatus: async (): Promise<IntegrationStatus> => ({
      connected: false,
      lastSyncAt: null,
      error: "Mudad API credentials not configured",
    }),
    syncPayroll: async () => {
      throw new Error("Mudad integration not configured. Set MUDAD_API_KEY.");
    },
    getComplianceStatus: async () => ({ compliant: true, issues: [] }),
  };
}
