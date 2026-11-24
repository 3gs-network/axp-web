import { env } from "../_core/env";

/**
 * SendByte (https://sendbyte.africa), for transactional email.
 *
 * Plain `fetch` against the REST API the official @sendbyte/node SDK wraps:
 * POST /v1/emails with `Authorization: Bearer <key>`. An `sk_test_` key runs in
 * SendByte's sandbox -- the call behaves the same but nothing is delivered.
 * `SENDBYTE_FROM` must be on a domain verified in SendByte.
 */

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
  /** Makes a retried send safe: SendByte sends at most one email per key. */
  idempotencyKey: string;
  tags?: string[];
};

export class EmailSendError extends Error {
  /** SendByte's error code and HTTP status. Never the recipient. */
  readonly code: string;
  readonly status: number;
  constructor(code: string, status: number) {
    super(`Email send failed (${code}, ${status}).`);
    this.name = "EmailSendError";
    this.code = code;
    this.status = status;
  }
}

export function isEmailConfigured() {
  return Boolean(env.SENDBYTE_API_KEY && env.SENDBYTE_FROM);
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  let response: Response;
  try {
    response = await fetch(`${env.SENDBYTE_BASE_URL.replace(/\/+$/, "")}/v1/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.SENDBYTE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: env.SENDBYTE_FROM,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
        tags: message.tags,
        idempotency_key: message.idempotencyKey
      }),
      signal: controller.signal
    });
  } catch {
    throw new EmailSendError("unreachable", 0);
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: { code?: unknown } } | null;
    const code = typeof body?.error?.code === "string" ? body.error.code : "request_failed";
    throw new EmailSendError(code, response.status);
  }
}
