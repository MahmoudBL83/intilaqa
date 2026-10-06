export * from "./types";
export { createQiwaAdapter, type QiwaAdapter } from "./qiwa";
export { createMudadAdapter, type MudadAdapter } from "./mudad";
export { createGosiAdapter, type GosiAdapter } from "./gosi";
export { createSmsAdapter, type SmsAdapter } from "./sms";
export { createPaymentAdapter, type PaymentAdapter } from "./payment";
export { createBiometricAdapter, type BiometricAdapter } from "./biometric";

import { createQiwaAdapter } from "./qiwa";
import { createMudadAdapter } from "./mudad";
import { createGosiAdapter } from "./gosi";
import { createSmsAdapter } from "./sms";
import { createPaymentAdapter } from "./payment";
import { createBiometricAdapter } from "./biometric";

export const integrations = {
  qiwa: createQiwaAdapter(),
  mudad: createMudadAdapter(),
  gosi: createGosiAdapter(),
  sms: createSmsAdapter(),
  payment: createPaymentAdapter(),
  biometric: createBiometricAdapter(),
} as const;

export type IntegrationName = keyof typeof integrations;
