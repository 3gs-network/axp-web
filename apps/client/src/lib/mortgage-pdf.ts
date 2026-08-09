import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatNaira } from "./format";
import { ELIGIBILITY_THRESHOLD } from "./mortgage";
import type { AmortizationRow, EligibilityResult, MortgageInputs, MortgageResult } from "./mortgage";

const NAVY: [number, number, number] = [26, 35, 61];
const FONT_FAMILY = "NotoSans";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function registerFont(doc: jsPDF, fileName: string, style: "normal" | "bold"): Promise<void> {
  // eslint-disable-next-line local/no-direct-api-request -- static bundled asset, not a backend API call
  const buffer = await fetch(`${import.meta.env.BASE_URL}fonts/${fileName}`).then((res) => res.arrayBuffer());
  const base64 = arrayBufferToBase64(buffer);
  doc.addFileToVFS(fileName, base64);
  doc.addFont(fileName, FONT_FAMILY, style);
}

export async function downloadRepaymentPlanPdf(
  inputs: MortgageInputs,
  result: MortgageResult,
  schedule: AmortizationRow[],
  eligibility: EligibilityResult | null
): Promise<void> {
  const doc = new jsPDF();
  await Promise.all([
    registerFont(doc, "NotoSans-Regular.ttf", "normal"),
    registerFont(doc, "NotoSans-Bold.ttf", "bold"),
  ]);

  const marginX = 14;
  let y = 20;

  doc.setFont(FONT_FAMILY, "bold");
  doc.setFontSize(16);
  doc.setTextColor(...NAVY);
  doc.text("AXP — Mortgage Repayment Plan", marginX, y);

  doc.setFont(FONT_FAMILY, "normal");
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
    doc.setFont(FONT_FAMILY, "normal");
    doc.text(label, marginX, y);
    doc.setTextColor(...NAVY);
    doc.setFont(FONT_FAMILY, "bold");
    doc.text(value, 130, y, { align: "left" });
    y += 7;
  }

  if (eligibility) {
    y += 2;
    const pct = (eligibility.ratio * 100).toFixed(1);
    const status = eligibility.eligible ? "Eligible" : "Not eligible";
    doc.setFont(FONT_FAMILY, "bold");
    doc.setTextColor(...NAVY);
    doc.text(
      `Eligibility check: ${pct}% of net salary (threshold ${ELIGIBILITY_THRESHOLD * 100}%) — ${status}`,
      marginX,
      y
    );
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
    styles: { font: FONT_FAMILY, fontStyle: "normal", fontSize: 8 },
    headStyles: { font: FONT_FAMILY, fontStyle: "bold", fillColor: NAVY, textColor: 255 },
    margin: { left: marginX, right: marginX },
  });

  doc.save(`axp-mortgage-repayment-plan-${Date.now()}.pdf`);
}
