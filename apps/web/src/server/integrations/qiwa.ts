import type { IntegrationAdapter, IntegrationStatus, QiwaContractStatus } from "./types";

export interface QiwaAdapter extends IntegrationAdapter {
  syncEmployee(employeeId: string, data: Record<string, unknown>): Promise<void>;
  syncAttendance(records: Array<{ employeeId: string; date: string; checkIn: string; checkOut: string }>): Promise<void>;
  validateContract(employeeId: string): Promise<QiwaContractStatus>;
}

export function createQiwaAdapter(): QiwaAdapter {
  return {
    name: "Qiwa",
    isConfigured: async () => false,
    getStatus: async (): Promise<IntegrationStatus> => ({
      connected: false,
      lastSyncAt: null,
      error: "Qiwa API credentials not configured",
    }),
    syncEmployee: async () => {
      throw new Error("Qiwa integration not configured. Set QIWA_API_KEY and QIWA_API_SECRET.");
    },
    syncAttendance: async () => {
      throw new Error("Qiwa integration not configured.");
    },
    validateContract: async () => ({
      employeeId: "",
      status: "not_found",
    }),
  };
}
