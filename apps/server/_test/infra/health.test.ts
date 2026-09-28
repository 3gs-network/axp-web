// T4-infra: /api/health route
//
// The quickest check that a deploy's API function is up and routed.

import { describe, expect, it } from "vitest";
import app from "../../_core/create-app";

describe("health: /api/health", () => {
  it("GET returns 200", async () => {
    const res = await app.fetch(new Request("http://localhost/api/health"));
    expect(res.status).toBe(200);
  });

  it("GET returns JSON with service + runtime identifiers", async () => {
    const res = await app.fetch(new Request("http://localhost/api/health"));
    const body = (await res.json()) as {
      data?: { service?: string; runtime?: string };
      service?: string;
      runtime?: string;
    };

    // apiSuccess wraps payloads under `data`; tolerate both shapes pending a
    // contract lock.
    const service = body.data?.service ?? body.service;
    const runtime = body.data?.runtime ?? body.runtime;

    expect(service).toBe("server");
    expect(runtime).toBe("hono");
  });
});
