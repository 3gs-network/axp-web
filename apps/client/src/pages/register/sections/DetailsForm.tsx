import { FormEvent, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  APPLICATION_TYPES,
  APPLICATION_TYPE_LABELS,
  HOMEREADY_FIELDS,
  PRIVACY_NOTICE,
  validateHomeReadyForm,
  type HomeReadyField,
  type HomeReadyFieldErrors
} from "@repo/shared/homeready";

export type DetailsValues = {
  legalName: string;
  preferredName: string;
  email: string;
  phone: string;
  applicationType: string;
  consent: boolean;
  website: string;
};

export const EMPTY_DETAILS: DetailsValues = {
  legalName: "",
  preferredName: "",
  email: "",
  phone: "",
  applicationType: "",
  consent: false,
  website: ""
};

type Props = {
  values: DetailsValues;
  onChange: (values: DetailsValues) => void;
  /** Resolves with server-side field errors, or a form-level message. */
  onSubmit: (values: DetailsValues) => Promise<{ fields?: HomeReadyFieldErrors; message?: string } | void>;
  submitting: boolean;
  /** Shown above the form, e.g. "your sign-up timed out". */
  notice?: string;
};

/**
 * Step 1. The same rules as the server (@repo/shared/homeready) run on submit;
 * after the first attempt each field re-checks as it changes, so a fixed
 * error clears straight away. The first field with an error gets focus, and
 * the summary above the form is announced to screen readers.
 */
export function DetailsForm({ values, onChange, onSubmit, submitting, notice }: Props) {
  const [errors, setErrors] = useState<HomeReadyFieldErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [formError, setFormError] = useState("");
  const refs = useRef<Partial<Record<HomeReadyField, HTMLInputElement | null>>>({});

  const errorsFor = (next: DetailsValues) => {
    const result = validateHomeReadyForm(next);
    return result.ok ? {} : result.errors;
  };

  const set = <K extends keyof DetailsValues>(key: K, value: DetailsValues[K]) => {
    const next = { ...values, [key]: value };
    onChange(next);
    if (attempted) setErrors(errorsFor(next));
  };

  const focusFirst = (found: HomeReadyFieldErrors) => {
    const first = HOMEREADY_FIELDS.find((field) => found[field]);
    if (first) refs.current[first]?.focus();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setAttempted(true);
    setFormError("");

    const found = errorsFor(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirst(found);
      return;
    }

    const problem = await onSubmit(values);
    if (problem?.fields && Object.keys(problem.fields).length > 0) {
      setErrors(problem.fields);
      focusFirst(problem.fields);
    } else if (problem?.message) {
      setFormError(problem.message);
    }
  };

  const errorCount = Object.keys(errors).length;
  const describedBy = (field: HomeReadyField, hint?: string) =>
    [hint, errors[field] ? `${field}-error` : null].filter(Boolean).join(" ") || undefined;
  const fieldError = (field: HomeReadyField) =>
    errors[field] ? (
      <p className="register-error" id={`${field}-error`}>
        {errors[field]}
      </p>
    ) : null;

  return (
    <form className="register-form" onSubmit={submit} noValidate aria-describedby="register-required-note">
      {notice && (
        <p className="register-banner" role="status">
          {notice}
        </p>
      )}
      <div role="alert" className="register-summary-slot">
        {attempted && errorCount > 0 && (
          <p className="register-summary">
            {errorCount === 1 ? "There is 1 problem with the form." : `There are ${errorCount} problems with the form.`}{" "}
            Please check the highlighted {errorCount === 1 ? "field" : "fields"}.
          </p>
        )}
        {formError && <p className="register-summary">{formError}</p>}
      </div>

      <p className="register-note" id="register-required-note">
        All fields are required unless marked optional.
      </p>

      <div className="register-field">
        <label htmlFor="legalName">Full legal name</label>
        <p className="register-hint" id="legalName-hint">
          As it appears on your ID
        </p>
        <input
          id="legalName"
          name="legalName"
          ref={(el) => {
            refs.current.legalName = el;
          }}
          value={values.legalName}
          onChange={(e) => set("legalName", e.target.value)}
          autoComplete="name"
          aria-required="true"
          aria-invalid={Boolean(errors.legalName)}
          aria-describedby={describedBy("legalName", "legalName-hint")}
          maxLength={400}
        />
        {fieldError("legalName")}
      </div>

      <div className="register-field">
        <label htmlFor="preferredName">
          What should we call you? <span className="register-optional">(optional)</span>
        </label>
        <input
          id="preferredName"
          name="preferredName"
          ref={(el) => {
            refs.current.preferredName = el;
          }}
          value={values.preferredName}
          onChange={(e) => set("preferredName", e.target.value)}
          autoComplete="nickname"
          aria-invalid={Boolean(errors.preferredName)}
          aria-describedby={describedBy("preferredName")}
          maxLength={400}
        />
        {fieldError("preferredName")}
      </div>

      <div className="register-field">
        <label htmlFor="email">Email address</label>
        <p className="register-hint" id="email-hint">
          We'll send a 6-digit code here to confirm it's you.
        </p>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          ref={(el) => {
            refs.current.email = el;
          }}
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          autoComplete="email"
          spellCheck={false}
          autoCapitalize="none"
          aria-required="true"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={describedBy("email", "email-hint")}
          maxLength={320}
        />
        {fieldError("email")}
      </div>

      <div className="register-field">
        <label htmlFor="phone">Phone number</label>
        <p className="register-hint" id="phone-hint">
          For example 0803 123 4567 or +234 803 123 4567
        </p>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          ref={(el) => {
            refs.current.phone = el;
          }}
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
          autoComplete="tel"
          aria-required="true"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={describedBy("phone", "phone-hint")}
          maxLength={40}
        />
        {fieldError("phone")}
      </div>

      <fieldset
        className="register-field register-choices"
        role="radiogroup"
        aria-labelledby="applicationType-legend"
        aria-required="true"
        aria-invalid={Boolean(errors.applicationType)}
        aria-describedby={describedBy("applicationType")}
      >
        <legend id="applicationType-legend">Who is applying?</legend>
        {APPLICATION_TYPES.map((type, index) => (
          <label className="register-choice" key={type}>
            <input
              type="radio"
              name="applicationType"
              value={type}
              checked={values.applicationType === type}
              onChange={() => set("applicationType", type)}
              ref={(el) => {
                // Focus lands on the first option when nothing is chosen.
                if (index === 0) refs.current.applicationType = el;
              }}
            />
            <span>{APPLICATION_TYPE_LABELS[type]}</span>
          </label>
        ))}
        {fieldError("applicationType")}
      </fieldset>

      <div className="register-field">
        <label className="register-consent">
          <input
            type="checkbox"
            name="consent"
            ref={(el) => {
              refs.current.consent = el;
            }}
            checked={values.consent}
            onChange={(e) => set("consent", e.target.checked)}
            aria-required="true"
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={describedBy("consent")}
          />
          <span>
            I have read and agree to the{" "}
            {PRIVACY_NOTICE ? (
              <a href={PRIVACY_NOTICE.url} target="_blank" rel="noreferrer">
                privacy notice<span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <>privacy notice</>
            )}
          </span>
        </label>
        {!PRIVACY_NOTICE && (
          <p className="register-hint">The privacy notice is being finalised and will be linked here.</p>
        )}
        {fieldError("consent")}
      </div>

      {/* Hidden from people, filled in by bots. Off-screen rather than
          display:none, which some bots skip. */}
      <div className="register-honeypot" aria-hidden="true">
        <label>
          Website
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={(e) => set("website", e.target.value)}
          />
        </label>
      </div>

      <button type="submit" className="button button--gold register-submit" aria-disabled={submitting}>
        {submitting ? "Sending your code…" : "Continue"} <ArrowRight size={16} aria-hidden />
      </button>
    </form>
  );
}
