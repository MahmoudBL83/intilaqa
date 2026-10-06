import type { IntegrationAdapter, IntegrationStatus } from "./types";

export interface SmsAdapter extends IntegrationAdapter {
  send(phone: string, message: string): Promise<{ messageId: string }>;
  sendBulk(recipients: Array<{ phone: string; message: string }>): Promise<{ sent: number; failed: number }>;
}

export function createSmsAdapter(): SmsAdapter {
  return {
    name: "SMS Provider",
    isConfigured: async () => false,
    getStatus: async (): Promise<IntegrationStatus> => ({
      connected: false,
      lastSyncAt: null,
      error: "SMS provider not configured. Set SMS_API_KEY.",
    }),
    send: async () => {
      throw new Error("SMS integration not configured.");
    },
    sendBulk: async () => ({ sent: 0, failed: 0 }),
  };
}
