import { formatNaira } from "./format";
import { ELIGIBILITY_THRESHOLD } from "./mortgage";
import type { AmortizationRow, EligibilityResult, MortgageInputs, MortgageResult } from "./mortgage";

function csvCell(value: string | number): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function csvRow(cells: (string | number)[]): string {
  return cells.map(csvCell).join(",");
}

export function downloadRepaymentPlanCsv(
  inputs: MortgageInputs,
  result: MortgageResult,
  schedule: AmortizationRow[],
  eligibility: EligibilityResult | null
): void {
  const lines: string[] = [
    csvRow(["AXP — Mortgage Repayment Plan"]),
    csvRow(["Generated", new Date().toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })]),
    "",
    csvRow(["Property cost", formatNaira(inputs.propertyCost)]),
    csvRow(["Down payment", `${inputs.downPaymentPct}% (${formatNaira(result.downPaymentAmount)})`]),
    csvRow(["Mortgage amount", formatNaira(result.mortgageAmount)]),
    csvRow(["Interest rate", `${inputs.interestRatePct}% per annum`]),
    csvRow(["Loan tenure", `${inputs.tenureYears} years (${result.durationMonths} months)`]),
    csvRow(["Net salary", formatNaira(result.netSalary)]),
    csvRow(["Estimated monthly repayment", formatNaira(result.monthlyRepayment)]),
  ];

  if (eligibility) {
    const pct = (eligibility.ratio * 100).toFixed(1);
    const status = eligibility.eligible ? "Eligible" : "Not eligible";
    lines.push("", csvRow(["Eligibility check", `${pct}% of net salary (threshold ${ELIGIBILITY_THRESHOLD * 100}%) — ${status}`]));
  }

  lines.push("", csvRow(["Month", "Payment", "Principal", "Interest", "Balance"]));
  for (const row of schedule) {
    lines.push(csvRow([row.month, row.payment.toFixed(2), row.principal.toFixed(2), row.interest.toFixed(2), row.balance.toFixed(2)]));
  }

  const csvContent = "\uFEFF" + lines.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `axp-mortgage-repayment-plan-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
