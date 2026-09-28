// T4-infra: CORS contract
//
// Production is same-origin, but a local build pointed at a deployed backend
// via VITE_API_BASE_URL relies on the API answering cross-origin calls.

import { describe, expect, it } from "vitest";
import app from "../../_core/create-app";

const ORIGIN = "https://client.example.com";

describe("cors", () => {
  it("answers a preflight for POST /api/leads from any origin", async () => {
    const res = await app.fetch(
      new Request("http://localhost/api/leads", {
        method: "OPTIONS",
        headers: {
          origin: ORIGIN,
          "access-control-request-method": "POST",
          "access-control-request-headers": "content-type"
        }
      })
    );

    expect(res.status).toBeLessThan(300);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
    expect((res.headers.get("access-control-allow-methods") ?? "").toUpperCase()).toContain("POST");
  });

  it("allows any origin on a plain GET", async () => {
    const res = await app.fetch(new Request("http://localhost/api/health", { headers: { origin: ORIGIN } }));
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
  });
});
