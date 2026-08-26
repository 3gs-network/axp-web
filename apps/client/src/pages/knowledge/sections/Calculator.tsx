import "./Calculator.css";
import { useState } from "react";
import { CircleCheck, FileSpreadsheet, FileText, Info, MonitorCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { formatInputValue, formatNaira, parseInputValue } from "@/lib/format";
import { buildAmortizationSchedule, calculateMortgage, checkEligibility, ELIGIBILITY_THRESHOLD, type EligibilityResult, type MortgageInputs } from "@/lib/mortgage";

const fields: { key: keyof MortgageInputs; label: string; placeholder: string; full?: boolean; max?: number }[] = [
  { key: "basicSalary", label: "Basic Salary (₦)", placeholder: "e.g., 500,000" },
  { key: "propertyCost", label: "Property Cost (₦)", placeholder: "e.g., 17,000,000" },
  { key: "downPaymentPct", label: "Down Payment (%)", placeholder: "e.g., 20", max: 100 },
  { key: "tenureYears", label: "Loan Tenure (Years)", placeholder: "e.g., 15", max: 40 },
  { key: "interestRatePct", label: "Interest Rate (% per annum)", placeholder: "e.g., 10", full: true, max: 100 },
];

const emptyForm: Record<keyof MortgageInputs, string> = {
  basicSalary: "",
  propertyCost: "",
  downPaymentPct: "",
  tenureYears: "",
  interestRatePct: "",
};

export function Calculator() {
  const reduce = useReducedMotion();
  const [form, setForm] = useState(emptyForm);
  const [activeTab, setActiveTab] = useState<"summary" | "detailed">("summary");
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [eligibilityKey, setEligibilityKey] = useState("");

  const numeric: MortgageInputs = {
    basicSalary: Number(form.basicSalary) || 0,
    propertyCost: Number(form.propertyCost) || 0,
    downPaymentPct: Number(form.downPaymentPct) || 0,
    tenureYears: Number(form.tenureYears) || 0,
    interestRatePct: Number(form.interestRatePct) || 0,
  };
  const currentKey = JSON.stringify(numeric);
  const result = calculateMortgage(numeric);
  const schedule = result ? buildAmortizationSchedule(numeric) : [];
  const visibleEligibility = eligibility && eligibilityKey === currentKey ? eligibility : null;

  const updateField = (key: keyof MortgageInputs, event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const cursorPos = input.selectionStart ?? input.value.length;
    const digitsBeforeCursor = input.value.slice(0, cursorPos).replace(/[^\d]/g, "").length;
    const max = fields.find((f) => f.key === key)?.max;
    let parsed = parseInputValue(input.value);
    let clamped = false;
    if (max !== undefined && Number(parsed) > max) {
      parsed = String(max);
      clamped = true;
    }

    setForm((prev) => ({ ...prev, [key]: parsed }));

    requestAnimationFrame(() => {
      const formatted = formatInputValue(parsed);
      if (clamped) {
        input.setSelectionRange(formatted.length, formatted.length);
        return;
      }
      let pos = 0;
      let digitsSeen = 0;
      while (pos < formatted.length && digitsSeen < digitsBeforeCursor) {
        if (/\d/.test(formatted[pos])) digitsSeen++;
        pos++;
      }
      input.setSelectionRange(pos, pos);
    });
  };

  const handleCheckEligibility = () => {
    if (!result) return;
    setEligibility(checkEligibility(result.monthlyRepayment, result.netSalary));
    setEligibilityKey(currentKey);
  };

  const handleDownloadPdf = async () => {
    if (!result) return;
    const { downloadRepaymentPlanPdf } = await import("@/lib/mortgage-pdf");
    await downloadRepaymentPlanPdf(numeric, result, schedule, visibleEligibility);
  };

  const handleDownloadCsv = async () => {
    if (!result) return;
    const { downloadRepaymentPlanCsv } = await import("@/lib/mortgage-csv");
    downloadRepaymentPlanCsv(numeric, result, schedule, visibleEligibility);
  };

  return (
    <section className="section mortgage-calculator">
      <div className="shell">
        <SectionHeading eyebrow="Mortgage calculator" title="Want to check if you qualify for a mortgage?" copy="Calculate your monthly mortgage payments and payment schedule." />
        <motion.div className="calc-grid" variants={staggerContainer} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
          <motion.div className="calc-card" variants={staggerItem}>
            <div className="calc-card-header"><MonitorCheck size={16} /><span>Loan Details</span></div>
            <div className="calc-card-body">
              <div className="calc-form-grid">
                {fields.map((field) => (
                  <div className={`calc-field${field.full ? " calc-field--full" : ""}`} key={field.key}>
                    <label htmlFor={field.key}>{field.label}</label>
                    <input id={field.key} type="text" inputMode="decimal" placeholder={field.placeholder} value={formatInputValue(form[field.key])} onChange={(event) => updateField(field.key, event)} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div className="calc-card calc-card--result" variants={staggerItem}>
            <div className="calc-card-body calc-result-body">
              {result ? (
                <div className="calc-result-figure">
                  <span className="calc-result-amount">{formatNaira(result.monthlyRepayment)}</span>
                  <p>Estimated monthly repayment</p>
                </div>
              ) : (
                <div className="calc-result-empty">
                  <span className="calc-result-icon"><Info size={22} /></span>
                  <h3>Enter loan details to calculate</h3>
                  <span className="calc-result-amount calc-result-amount--muted">₦0.00</span>
                  <p>Estimated monthly repayment</p>
                </div>
              )}

              <div className="calc-result-rows">
                <div className="calc-result-row"><span>Property Cost</span><strong>{formatNaira(numeric.propertyCost)}</strong></div>
                <div className="calc-result-row"><span>Mortgage Amount</span><strong>{formatNaira(result?.mortgageAmount ?? 0)}</strong></div>
                <div className="calc-result-row"><span>Direct Equity ({numeric.downPaymentPct}%)</span><strong>{formatNaira(result?.downPaymentAmount ?? 0)}</strong></div>
                <div className="calc-result-row"><span>Net Salary</span><strong>{formatNaira(numeric.basicSalary)}</strong></div>
                <div className="calc-result-row"><span>Duration</span><strong>{result?.durationMonths ?? 0} Months</strong></div>
                <div className="calc-result-row"><span>Interest per annum</span><strong>{numeric.interestRatePct}%</strong></div>
              </div>

              {visibleEligibility && (
                <div className={`calc-eligibility calc-eligibility--${visibleEligibility.eligible ? "pass" : "fail"}`}>
                  {visibleEligibility.eligible ? <CircleCheck size={16} /> : <Info size={16} />}
                  <span>{visibleEligibility.eligible ? "Eligible" : "Not eligible"} — repayment is {(visibleEligibility.ratio * 100).toFixed(1)}% of net salary (threshold {ELIGIBILITY_THRESHOLD * 100}%)</span>
                </div>
              )}

              <div className="calc-actions">
                <button type="button" className="button button--primary" disabled={!result} onClick={handleCheckEligibility}>Check Eligibility</button>
                <div className="calc-download-row">
                  <button type="button" className="button button--outline" disabled={!result} onClick={handleDownloadPdf}><FileText size={15} /> PDF</button>
                  <button type="button" className="button button--outline" disabled={!result} onClick={handleDownloadCsv}><FileSpreadsheet size={15} /> CSV</button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div className="calc-card calc-schedule-card" variants={fadeInUp} initial={reduce ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.15 }}>
          <div className="calc-card-header"><span>Monthly Payment Schedule</span></div>
          <div className="calc-tabs">
            <button type="button" className={activeTab === "summary" ? "active" : ""} onClick={() => setActiveTab("summary")}>Payment Summary</button>
            <button type="button" className={activeTab === "detailed" ? "active" : ""} onClick={() => setActiveTab("detailed")}>Detailed Schedule</button>
          </div>

          {activeTab === "summary" ? (
            <div className="calc-stat-tiles">
              <div className="calc-stat-tile"><strong>{formatNaira(result?.totalAmountPayable ?? 0)}</strong><span>Total Amount Payable</span></div>
              <div className="calc-stat-tile"><strong>{formatNaira(result?.totalInterest ?? 0)}</strong><span>Total Interest</span></div>
              <div className="calc-stat-tile"><strong>{formatNaira(result?.totalPrincipal ?? 0)}</strong><span>Total Principal</span></div>
            </div>
          ) : (
            <div className="calc-schedule-table-wrap">
              {schedule.length === 0 ? (
                <p className="calc-schedule-empty">Enter loan details to see the month-by-month schedule.</p>
              ) : (
                <table className="calc-schedule-table">
                  <thead><tr><th>Month</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead>
                  <tbody>
                    {schedule.map((row) => (
                      <tr key={row.month}><td>{row.month}</td><td>{formatNaira(row.payment)}</td><td>{formatNaira(row.principal)}</td><td>{formatNaira(row.interest)}</td><td>{formatNaira(row.balance)}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
