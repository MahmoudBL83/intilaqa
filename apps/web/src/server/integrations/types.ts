export interface IntegrationAdapter {
  name: string;
  isConfigured(): Promise<boolean>;
  getStatus(): Promise<IntegrationStatus>;
}

export interface IntegrationStatus {
  connected: boolean;
  lastSyncAt: Date | null;
  error: string | null;
}

export interface QiwaContractStatus {
  employeeId: string;
  status: "active" | "expired" | "pending" | "not_found";
  contractNumber?: string;
  expiryDate?: Date;
}
