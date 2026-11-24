// The shared HomeReady rules (packages/shared/src/homeready.ts): the same
// functions the /register form runs in the browser.

import { describe, expect, it } from "vitest";
import {
  DEFAULT_LEAD_SOURCE,
  greetingName,
  resolveLeadSource,
  validateHomeReadyForm
} from "@repo/shared/homeready";

const valid = {
  legalName: "Adaeze Obi",
  preferredName: "",
  email: "ada@example.com",
  phone: "0803 123 4567",
  applicationType: "Individual",
  consent: true
};

function errorsFor(patch: Record<string, unknown>) {
  const result = validateHomeReadyForm({ ...valid, ...patch });
  return result.ok ? {} : result.errors;
}

function valueFor(patch: Record<string, unknown>) {
  const result = validateHomeReadyForm({ ...valid, ...patch });
  if (!result.ok) throw new Error(`expected valid, got ${JSON.stringify(result.errors)}`);
  return result.value;
}

describe("legal name", () => {
  it("trims and collapses inner spaces", () => {
    expect(valueFor({ legalName: "  Adaeze \t  Chioma   Obi  " }).legalName).toBe("Adaeze Chioma Obi");
  });

  it("is required", () => {
    expect(errorsFor({ legalName: "" }).legalName).toBeTruthy();
    expect(errorsFor({ legalName: "    " }).legalName).toBeTruthy();
    expect(errorsFor({ legalName: undefined }).legalName).toBeTruthy();
  });

  it("allows 1 to 200 characters after normalising", () => {
    expect(valueFor({ legalName: "A" }).legalName).toBe("A");
    expect(valueFor({ legalName: "a".repeat(200) }).legalName).toHaveLength(200);
    expect(errorsFor({ legalName: "a".repeat(201) }).legalName).toBeTruthy();
    // 200 once the padding is gone.
    expect(valueFor({ legalName: `   ${"a".repeat(200)}   ` }).legalName).toHaveLength(200);
  });
});

describe("preferred name", () => {
  it("is optional and stored as null when blank", () => {
    expect(valueFor({ preferredName: "" }).preferredName).toBeNull();
    expect(valueFor({ preferredName: "   " }).preferredName).toBeNull();
    expect(valueFor({ preferredName: undefined }).preferredName).toBeNull();
  });

  it("is trimmed and capped at 200 characters", () => {
    expect(valueFor({ preferredName: "  Ada " }).preferredName).toBe("Ada");
    expect(errorsFor({ preferredName: "a".repeat(201) }).preferredName).toBeTruthy();
  });
});

describe("email", () => {
  it("is trimmed and lower-cased", () => {
    expect(valueFor({ email: "  Ada.Obi@Example.COM " }).email).toBe("ada.obi@example.com");
  });

  it.each(["", "ada", "ada@", "@example.com", "ada@example", "ada@@example.com", "ada @example.com", "ada@exa mple.com"])(
    "rejects %j",
    (email) => {
      expect(errorsFor({ email }).email).toBeTruthy();
    }
  );

  it("accepts ordinary addresses", () => {
    for (const email of ["ada@example.com", "ada+homeready@mail.example.com.ng", "a.b-c@sub.domain.ng"]) {
      expect(errorsFor({ email }).email).toBeUndefined();
    }
  });

  it("caps the address at 254 characters", () => {
    const label = (n: number) => "b".repeat(n);
    // 64 + 1 + 4 x 47 + "com" = 256: a well-formed address, just too long.
    const long = `${"a".repeat(64)}@${label(46)}.${label(46)}.${label(46)}.${label(46)}.com`;
    expect(long.length).toBe(256);
    expect(errorsFor({ email: long }).email).toBeTruthy();
    // The same shape at exactly 254 is fine.
    const ok = `${"a".repeat(62)}@${label(46)}.${label(46)}.${label(46)}.${label(46)}.com`;
    expect(ok.length).toBe(254);
    expect(errorsFor({ email: ok }).email).toBeUndefined();
  });
});

describe("phone", () => {
  it.each(["0803 123 4567", "08031234567", "+234 803 123 4567", "+2348031234567", "+234 (803) 123-4567", "0803.123.4567"])(
    "accepts %j and stores it as typed",
    (phone) => {
      expect(valueFor({ phone: `  ${phone} ` }).phone).toBe(phone);
    }
  );

  it.each([
    ["empty", ""],
    ["too short", "0803 123"],
    ["nine digits", "080312345"],
    ["too long", "+234 803 123 4567 8901"],
    ["letters", "0803 ABC 4567"],
    ["letters mixed in", "0803123456x"],
    ["plus in the middle", "0803+1234567"]
  ])("rejects %s", (_label, phone) => {
    expect(errorsFor({ phone }).phone).toBeTruthy();
  });

  it("is required", () => {
    expect(errorsFor({ phone: undefined }).phone).toBeTruthy();
  });
});

describe("application type", () => {
  it.each(["Individual", "Joint", "Business"])("accepts %s", (applicationType) => {
    expect(valueFor({ applicationType }).applicationType).toBe(applicationType);
  });

  it.each(["individual", "JOINT", "business ", "Company", "", undefined, 1])("rejects %j", (applicationType) => {
    expect(errorsFor({ applicationType }).applicationType).toBeTruthy();
  });
});

describe("consent", () => {
  it("is required and must be exactly true", () => {
    for (const consent of [false, undefined, "true", "on", 1, null]) {
      expect(errorsFor({ consent }).consent).toBeTruthy();
    }
    expect(errorsFor({ consent: true }).consent).toBeUndefined();
  });
});

describe("the whole form", () => {
  it("reports every problem at once", () => {
    const result = validateHomeReadyForm({});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(["applicationType", "consent", "email", "legalName", "phone"]);
    }
  });

  it("ignores fields it does not know", () => {
    const result = validateHomeReadyForm({ ...valid, lead_id: 5, leadSource: "Hacked" });
    expect(result.ok && Object.keys(result.value).sort()).toEqual([
      "applicationType",
      "email",
      "legalName",
      "phone",
      "preferredName"
    ]);
  });
});

describe("lead source", () => {
  it("defaults to Website", () => {
    expect(DEFAULT_LEAD_SOURCE).toBe("Website");
    expect(resolveLeadSource()).toBe("Website");
    expect(resolveLeadSource({ utmSource: null, utmCampaign: "" })).toBe("Website");
  });

  it("maps a known utm_source, ignoring case and spaces", () => {
    expect(resolveLeadSource({ utmSource: "instagram" })).toBe("Instagram");
    expect(resolveLeadSource({ utmSource: "  InstaGram " })).toBe("Instagram");
  });

  it("falls back to utm_campaign when utm_source is unknown or missing", () => {
    expect(resolveLeadSource({ utmSource: "newsletter", utmCampaign: "instagram" })).toBe("Instagram");
    expect(resolveLeadSource({ utmCampaign: "Instagram" })).toBe("Instagram");
  });

  it("sends unknown values to Website", () => {
    expect(resolveLeadSource({ utmSource: "tiktok", utmCampaign: "spring-2026" })).toBe("Website");
    expect(resolveLeadSource({ utmSource: "constructor" })).toBe("Website");
    expect(resolveLeadSource({ utmSource: "__proto__" })).toBe("Website");
  });
});

describe("greeting", () => {
  it("uses the preferred name, else the first name", () => {
    expect(greetingName({ legalName: "Adaeze Chioma Obi", preferredName: "Ada" })).toBe("Ada");
    expect(greetingName({ legalName: "Adaeze Chioma Obi", preferredName: null })).toBe("Adaeze");
  });
});
