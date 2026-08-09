import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatNaira } from "./format";
import { ELIGIBILITY_THRESHOLD } from "./mortgage";
import type { AmortizationRow, EligibilityResult, MortgageInputs, MortgageResult } from "./mortgage";

const NAVY: [number, number, number] = [26, 35, 61];

export function downloadRepaymentPlanPdf(
  inputs: MortgageInputs,
  result: MortgageResult,
  schedule: AmortizationRow[],
  eligibility: EligibilityResult | null
): void {
  const doc = new jsPDF();
  const marginX = 14;
  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...NAVY);
  doc.text("AXP — Mortgage Repayment Plan", marginX, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  y += 6;
  doc.text(`Generated ${new Date().toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}`, marginX, y);

  y += 10;
  const summaryRows: [string, string][] = [
    ["Property cost", formatNaira(inputs.propertyCost)],
    ["Down payment", `${inputs.downPaymentPct}% (${formatNaira(result.downPaymentAmount)})`],
    ["Mortgage amount", formatNaira(result.mortgageAmount)],
    ["Interest rate", `${inputs.interestRatePct}% per annum`],
    ["Loan tenure", `${inputs.tenureYears} years (${result.durationMonths} months)`],
    ["Net salary", formatNaira(result.netSalary)],
    ["Estimated monthly repayment", formatNaira(result.monthlyRepayment)],
  ];

  doc.setFontSize(11);
  for (const [label, value] of summaryRows) {
    doc.setTextColor(90, 90, 90);
    doc.text(label, marginX, y);
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    doc.text(value, 130, y, { align: "left" });
    doc.setFont("helvetica", "normal");
    y += 7;
  }

  if (eligibility) {
    y += 2;
    const pct = (eligibility.ratio * 100).toFixed(1);
    const status = eligibility.eligible ? "Eligible" : "Not eligible";
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...NAVY);
    doc.text(
      `Eligibility check: ${pct}% of net salary (threshold ${ELIGIBILITY_THRESHOLD * 100}%) — ${status}`,
      marginX,
      y
    );
    doc.setFont("helvetica", "normal");
    y += 8;
  }

  y += 4;
  autoTable(doc, {
    startY: y,
    head: [["Month", "Payment", "Principal", "Interest", "Balance"]],
    body: schedule.map((row) => [
      row.month,
      formatNaira(row.payment),
      formatNaira(row.principal),
      formatNaira(row.interest),
      formatNaira(row.balance),
    ]),
    headStyles: { fillColor: NAVY, textColor: 255 },
    styles: { fontSize: 8 },
    margin: { left: marginX, right: marginX },
  });

  doc.save(`axp-mortgage-repayment-plan-${Date.now()}.pdf`);
}
