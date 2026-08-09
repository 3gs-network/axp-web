export type MortgageInputs = {
  basicSalary: number;
  propertyCost: number;
  downPaymentPct: number;
  tenureYears: number;
  interestRatePct: number;
};

export type MortgageResult = {
  downPaymentAmount: number;
  mortgageAmount: number;
  monthlyRepayment: number;
  netSalary: number;
  durationMonths: number;
  totalAmountPayable: number;
  totalInterest: number;
  totalPrincipal: number;
  interestRatePct: number;
};

export type AmortizationRow = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export type EligibilityResult = {
  ratio: number;
  eligible: boolean;
};

const ELIGIBILITY_THRESHOLD = 0.33;

export function calculateMortgage(inputs: MortgageInputs): MortgageResult | null {
  const { propertyCost, downPaymentPct, tenureYears, interestRatePct, basicSalary } = inputs;
  const durationMonths = Math.round(tenureYears * 12);
  if (propertyCost <= 0 || durationMonths <= 0) return null;

  const downPaymentAmount = propertyCost * (downPaymentPct / 100);
  const mortgageAmount = propertyCost - downPaymentAmount;
  const monthlyRate = interestRatePct / 100 / 12;
  const monthlyRepayment =
    monthlyRate === 0
      ? mortgageAmount / durationMonths
      : (mortgageAmount * monthlyRate * (1 + monthlyRate) ** durationMonths) /
        ((1 + monthlyRate) ** durationMonths - 1);

  const totalAmountPayable = monthlyRepayment * durationMonths;
  const totalPrincipal = mortgageAmount;
  const totalInterest = totalAmountPayable - totalPrincipal;

  return {
    downPaymentAmount,
    mortgageAmount,
    monthlyRepayment,
    netSalary: basicSalary,
    durationMonths,
    totalAmountPayable,
    totalInterest,
    totalPrincipal,
    interestRatePct,
  };
}

export function buildAmortizationSchedule(inputs: MortgageInputs): AmortizationRow[] {
  const result = calculateMortgage(inputs);
  if (!result) return [];

  const { mortgageAmount, monthlyRepayment, durationMonths, interestRatePct } = result;
  const monthlyRate = interestRatePct / 100 / 12;
  const rows: AmortizationRow[] = [];
  let balance = mortgageAmount;

  for (let month = 1; month <= durationMonths; month++) {
    const interest = balance * monthlyRate;
    const principal = monthlyRepayment - interest;
    balance = month === durationMonths ? 0 : balance - principal;
    rows.push({ month, payment: monthlyRepayment, principal, interest, balance });
  }

  return rows;
}

export function checkEligibility(monthlyRepayment: number, netSalary: number): EligibilityResult | null {
  if (netSalary <= 0) return null;
  const ratio = monthlyRepayment / netSalary;
  return { ratio, eligible: ratio <= ELIGIBILITY_THRESHOLD };
}

export { ELIGIBILITY_THRESHOLD };
