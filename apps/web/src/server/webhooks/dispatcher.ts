import { prisma } from "@intilaqa/db";
import type { WebhookEventType } from "./types";

export async function dispatchWebhook(eventType: WebhookEventType, payload: Record<string, unknown>) {
  const jsonPayload = payload as Record<string, unknown> & object;
  const registries = await prisma.webhookRegistry.findMany({
    where: {
      isActive: true,
      events: { has: eventType },
    },
  });

  for (const registry of registries) {
    const delivery = await prisma.webhookDelivery.create({
      data: {
        registryId: registry.id,
        eventType,
        payload: jsonPayload,
        attemptCount: 1,
      },
    });

    try {
      const response = await fetch(registry.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": await createSignature(registry.secret, JSON.stringify(payload)),
          "X-Webhook-Event": eventType,
        },
        body: JSON.stringify(payload),
      });

      await prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          success: response.ok,
          responseCode: response.status,
          errorMessage: response.ok ? null : `HTTP ${response.status}`,
        },
      });
    } catch (error) {
      await prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          success: false,
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }
}

async function createSignature(secret: string, body: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
