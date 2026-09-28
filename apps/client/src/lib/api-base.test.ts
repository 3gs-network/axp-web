import { describe, expect, it, vi } from "vitest";

async function loadApiBase() {
  vi.resetModules();
  vi.stubGlobal("window", {
    location: {
      origin: "http://localhost:3100"
    }
  });

  return import("./api-base");
}

describe("api-base", () => {
  it("normalizes apiUrl paths with an /api prefix", async () => {
    const { apiUrl } = await loadApiBase();

    expect(apiUrl("/api/knowledge")).toBe("http://localhost:3100/api/knowledge");
    expect(apiUrl("/counter/stats")).toBe("http://localhost:3100/api/counter/stats");
    expect(apiUrl("counter/stats")).toBe("http://localhost:3100/api/counter/stats");
    expect(apiUrl("api/counter/stats")).toBe("http://localhost:3100/api/counter/stats");
    expect(apiUrl("/api/leads")).toBe("http://localhost:3100/api/leads");
    expect(apiUrl("/api")).toBe("http://localhost:3100/api");
  });
});
