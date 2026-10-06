import type { IntegrationAdapter, IntegrationStatus } from "./types";

export interface PaymentAdapter extends IntegrationAdapter {
  createCheckout(amount: number, currency: string, metadata: Record<string, string>): Promise<{ url: string; sessionId: string }>;
  verifyPayment(sessionId: string): Promise<{ paid: boolean; amount: number }>;
  createSubscription(clientId: string, planId: string): Promise<{ subscriptionId: string }>;
}

export function createPaymentAdapter(): PaymentAdapter {
  return {
    name: "Payment Gateway",
    isConfigured: async () => false,
    getStatus: async (): Promise<IntegrationStatus> => ({
      connected: false,
      lastSyncAt: null,
      error: "Payment gateway not configured. Set PAYMENT_API_KEY.",
    }),
    createCheckout: async () => {
      throw new Error("Payment gateway not configured.");
    },
    verifyPayment: async () => ({ paid: false, amount: 0 }),
    createSubscription: async () => ({ subscriptionId: "" }),
  };
}
