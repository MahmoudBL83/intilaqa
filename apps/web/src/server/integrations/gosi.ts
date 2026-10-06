import type { IntegrationAdapter, IntegrationStatus } from "./types";

export interface GosiAdapter extends IntegrationAdapter {
  syncContributions(month: number, year: number, employees: Array<{ employeeId: string; salary: number }>): Promise<void>;
  getEmployeeStatus(employeeId: string): Promise<{ registered: boolean; gosiNumber?: string }>;
}

export function createGosiAdapter(): GosiAdapter {
  return {
    name: "GOSI",
    isConfigured: async () => false,
    getStatus: async (): Promise<IntegrationStatus> => ({
      connected: false,
      lastSyncAt: null,
      error: "GOSI API credentials not configured",
    }),
    syncContributions: async () => {
      throw new Error("GOSI integration not configured. Set GOSI_API_KEY.");
    },
    getEmployeeStatus: async () => ({ registered: false }),
  };
}
