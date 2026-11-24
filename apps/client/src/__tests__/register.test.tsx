// The /register form in the browser: shared validation, error focus and
// announcements, the code step, and UTM carry-through to the request.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { captureUtm, readUtm } from "@/lib/utm";
import { RegisterFlow } from "@/pages/register/sections/RegisterFlow";

type Call = { path: string; body: Record<string, unknown> };
let calls: Call[];
let replies: Array<{ status: number; body: unknown }>;

beforeEach(() => {
  window.sessionStorage.clear();
  calls = [];
  replies = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string, init?: RequestInit) => {
      calls.push({ path: new URL(input, "http://localhost").pathname, body: JSON.parse(String(init?.body ?? "{}")) });
      const reply = replies.shift() ?? { status: 500, body: { ok: false, error: { code: "X", message: "unmocked" } } };
      return new Response(JSON.stringify(reply.body), { status: reply.status });
    })
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const flush = () => act(async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
});

function fillValid() {
  fireEvent.change(screen.getByLabelText("Full legal name"), { target: { value: "Adaeze Obi" } });
  fireEvent.change(screen.getByLabelText(/Email address/), { target: { value: "Ada@Example.com" } });
  fireEvent.change(screen.getByLabelText("Phone number"), { target: { value: "0803 123 4567" } });
  fireEvent.click(screen.getByLabelText("Me and a co-applicant"));
  fireEvent.click(screen.getByLabelText(/I have read and agree/));
}

describe("utm", () => {
  it("keeps the first utm_source / utm_campaign for the tab", () => {
    captureUtm("?utm_source=instagram&utm_campaign=launch");
    captureUtm("?utm_source=facebook");
    captureUtm("");
    expect(readUtm()).toEqual({ utmSource: "instagram", utmCampaign: "launch" });
  });

  it("is empty without UTM parameters", () => {
    captureUtm("?route=home");
    expect(readUtm()).toEqual({ utmSource: null, utmCampaign: null });
  });
});

describe("details form", () => {
  it("labels every input", () => {
    render(<RegisterFlow />);
    for (const label of [
      "Full legal name",
      /What should we call you/,
      /Email address/,
      "Phone number",
      "Just me",
      "Me and a co-applicant",
      "A business",
      /I have read and agree/
    ]) {
      expect(screen.getByLabelText(label)).toBeTruthy();
    }
    expect(screen.getByRole("radiogroup", { name: "Who is applying?" })).toBeTruthy();
  });

  it("shows each error under its field, focuses the first and sends nothing", async () => {
    render(<RegisterFlow />);
    fireEvent.change(screen.getByLabelText("Phone number"), { target: { value: "0803" } });
    fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
    await flush();

    expect(calls).toHaveLength(0);
    const name = screen.getByLabelText("Full legal name");
    expect(document.activeElement).toBe(name);
    expect(name.getAttribute("aria-invalid")).toBe("true");
    expect(name.getAttribute("aria-describedby")).toContain("legalName-error");
    expect(document.getElementById("legalName-error")?.textContent).toMatch(/full legal name/);
    expect(document.getElementById("phone-error")?.textContent).toMatch(/valid phone number/);
    expect(screen.getByRole("alert").textContent).toMatch(/There are 5 problems/);
  });

  it("clears an error as soon as it is fixed", async () => {
    render(<RegisterFlow />);
    fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
    await flush();
    fireEvent.change(screen.getByLabelText("Full legal name"), { target: { value: "Ada" } });
    expect(document.getElementById("legalName-error")).toBeNull();
  });

  it("goes through code to confirmation, sending the stored UTM and greeting by first name", async () => {
    captureUtm("?utm_source=instagram");
    render(<RegisterFlow />);
    fillValid();

    replies.push({ status: 200, body: { ok: true, data: { pendingId: "p1", resendAfterSeconds: 60, expiresInSeconds: 600 } } });
    fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
    await flush();

    expect(calls[0].path).toBe("/api/homeready/register");
    expect(calls[0].body).toMatchObject({
      legalName: "Adaeze Obi",
      email: "Ada@Example.com",
      applicationType: "Joint",
      consent: true,
      website: "",
      utmSource: "instagram"
    });
    expect(screen.getByRole("heading", { name: "Check your email" })).toBeTruthy();
    expect(screen.getByText("ada@example.com")).toBeTruthy();

    // A wrong code is shown and announced.
    replies.push({ status: 400, body: { ok: false, error: { code: "CODE_INVALID", message: "That code isn't right. You have 4 tries left." } } });
    fireEvent.change(screen.getByLabelText("Verification code"), { target: { value: "111111" } });
    fireEvent.click(screen.getByRole("button", { name: /Confirm/ }));
    await flush();
    expect(screen.getByRole("alert").textContent).toContain("4 tries left");

    replies.push({ status: 200, body: { ok: true, data: { name: "Adaeze" } } });
    fireEvent.change(screen.getByLabelText("Verification code"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /Confirm/ }));
    await flush();

    expect(calls[2]).toEqual({ path: "/api/homeready/verify", body: { pendingId: "p1", code: "123456" } });
    const heading = screen.getByRole("heading", { name: "Thanks, Adaeze." });
    expect(document.activeElement).toBe(heading);
    expect(screen.getByText(/We've received your details and an HomeReady officer will contact you shortly/)).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/reference/i);
  });

  it("keeps the resend button unavailable for 60 seconds", async () => {
    render(<RegisterFlow />);
    fillValid();
    replies.push({ status: 200, body: { ok: true, data: { pendingId: "p1", resendAfterSeconds: 60, expiresInSeconds: 600 } } });
    fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
    await flush();

    const resend = screen.getByRole("button", { name: /Send a new code/ });
    expect(resend.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(resend);
    await flush();
    expect(calls).toHaveLength(1);
  });
});
