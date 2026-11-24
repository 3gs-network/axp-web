/**
 * HomeReady "register your interest": the rules the browser and the server
 * both apply, so a form the page accepts is a form the API accepts.
 *
 * Plain TypeScript, no zod: the client and server pin different zod majors,
 * and these rules are small enough not to need one.
 *
 * The values written here land in public.leads in the leads database, which
 * the HSG admin app reads every 5 minutes through public.homeready_leads. That
 * contract is fixed -- see README "HomeReady sign-up".
 */

/* ------------------------------------------------------------------------ */
/* Config                                                                    */
/* ------------------------------------------------------------------------ */

/**
 * The privacy notice shown beside the consent box. `version` is written to
 * leads."consentVersion" with every sign-up, so it must change whenever the
 * notice's wording does.
 *
 * NOT SET YET: the notice is being prepared by its owners. While this is null
 * the form still renders, but the server refuses registrations, because a
 * consent recorded against an unknown notice is not a consent.
 */
export const PRIVACY_NOTICE: { version: string; url: string } | null = null;

/**
 * utm_source / utm_campaign value (lower-case) -> lead source name.
 *
 * Each name must match, ignoring case, an ACTIVE lead source in the HSG admin
 * app's Settings -> Leads; otherwise the case is created with no source.
 */
export const LEAD_SOURCE_MAP: Readonly<Record<string, string>> = {
  instagram: "Instagram",
  ig: "Instagram"
};

export const DEFAULT_LEAD_SOURCE = "Website";

/** What leads."applicationType" accepts. Exact and case-sensitive. */
export const APPLICATION_TYPES = ["Individual", "Joint", "Business"] as const;
export type ApplicationType = (typeof APPLICATION_TYPES)[number];

export const APPLICATION_TYPE_LABELS: Readonly<Record<ApplicationType, string>> = {
  Individual: "Just me",
  Joint: "Me and a co-applicant",
  Business: "A business"
};

export const OTP_LENGTH = 6;
export const OTP_TTL_SECONDS = 10 * 60;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

/* ------------------------------------------------------------------------ */
/* Lead source                                                               */
/* ------------------------------------------------------------------------ */

export function resolveLeadSource(utm: { utmSource?: string | null; utmCampaign?: string | null } = {}): string {
  for (const value of [utm.utmSource, utm.utmCampaign]) {
    const key = typeof value === "string" ? value.trim().toLowerCase() : "";
    if (key && Object.prototype.hasOwnProperty.call(LEAD_SOURCE_MAP, key)) {
      return LEAD_SOURCE_MAP[key];
    }
  }
  return DEFAULT_LEAD_SOURCE;
}

/* ------------------------------------------------------------------------ */
/* Field rules                                                               */
/* ------------------------------------------------------------------------ */

export type HomeReadyField = "legalName" | "preferredName" | "email" | "phone" | "applicationType" | "consent";

/** Field order on the form; the first field with an error gets focus. */
export const HOMEREADY_FIELDS: readonly HomeReadyField[] = [
  "legalName",
  "preferredName",
  "email",
  "phone",
  "applicationType",
  "consent"
];

export type HomeReadyLeadInput = {
  legalName: string;
  /** null when left blank. */
  preferredName: string | null;
  email: string;
  /** As typed, trimmed. */
  phone: string;
  applicationType: ApplicationType;
};

export type HomeReadyFieldErrors = Partial<Record<HomeReadyField, string>>;

export type HomeReadyValidation =
  | { ok: true; value: HomeReadyLeadInput }
  | { ok: false; errors: HomeReadyFieldErrors };

const NAME_MAX = 200;
const EMAIL_MAX = 254;
const PHONE_MIN_DIGITS = 10;
const PHONE_MAX_DIGITS = 15;

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function normaliseLegalName(value: unknown) {
  return asString(value).trim().replace(/\s+/g, " ");
}

export function normaliseEmail(value: unknown) {
  return asString(value).trim().toLowerCase();
}

// One @, a non-empty local part, and a dotted domain whose last label is at
// least two letters. Deliberately not RFC 5322: the code we email is the real
// test of an address.
const EMAIL_PATTERN = /^[^\s@]{1,64}@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

// Digits plus the separators people actually type. A "+" only at the start.
const PHONE_PATTERN = /^\+?[0-9\s().-]+$/;

export function validateLegalName(value: unknown): string | null {
  const name = normaliseLegalName(value);
  if (!name) return "Please enter your full legal name.";
  if (name.length > NAME_MAX) return `Your name must be ${NAME_MAX} characters or fewer.`;
  return null;
}

export function validatePreferredName(value: unknown): string | null {
  return asString(value).trim().length > NAME_MAX ? `Please keep this to ${NAME_MAX} characters or fewer.` : null;
}

export function validateEmail(value: unknown): string | null {
  const email = normaliseEmail(value);
  if (!email) return "Please enter your email address.";
  if (email.length > EMAIL_MAX || !EMAIL_PATTERN.test(email)) {
    return "Please enter a valid email address, like name@example.com.";
  }
  return null;
}

export function validatePhone(value: unknown): string | null {
  const phone = asString(value).trim();
  if (!phone) return "Please enter your phone number.";
  const digits = phone.replace(/\D/g, "").length;
  if (!PHONE_PATTERN.test(phone) || digits < PHONE_MIN_DIGITS || digits > PHONE_MAX_DIGITS) {
    return "Please enter a valid phone number, like 0803 123 4567 or +234 803 123 4567.";
  }
  return null;
}

export function isApplicationType(value: unknown): value is ApplicationType {
  return typeof value === "string" && (APPLICATION_TYPES as readonly string[]).includes(value);
}

export function validateApplicationType(value: unknown): string | null {
  return isApplicationType(value) ? null : "Please choose who is applying.";
}

export function validateConsent(value: unknown): string | null {
  return value === true ? null : "Please confirm you have read and agree to the privacy notice.";
}

/** Validate and normalise the whole form. Unknown keys are ignored. */
export function validateHomeReadyForm(raw: unknown): HomeReadyValidation {
  const input = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;

  const errors: HomeReadyFieldErrors = {};
  const checks: Array<[HomeReadyField, string | null]> = [
    ["legalName", validateLegalName(input.legalName)],
    ["preferredName", validatePreferredName(input.preferredName)],
    ["email", validateEmail(input.email)],
    ["phone", validatePhone(input.phone)],
    ["applicationType", validateApplicationType(input.applicationType)],
    ["consent", validateConsent(input.consent)]
  ];
  for (const [field, message] of checks) {
    if (message) errors[field] = message;
  }
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const preferredName = asString(input.preferredName).trim();
  return {
    ok: true,
    value: {
      legalName: normaliseLegalName(input.legalName),
      preferredName: preferredName || null,
      email: normaliseEmail(input.email),
      phone: asString(input.phone).trim(),
      applicationType: input.applicationType as ApplicationType
    }
  };
}

/** How the confirmation screen greets someone. */
export function greetingName(lead: Pick<HomeReadyLeadInput, "legalName" | "preferredName">) {
  return lead.preferredName?.trim() || lead.legalName.trim().split(/\s+/)[0] || "";
}
