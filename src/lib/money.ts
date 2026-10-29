const RUPEES_PATTERN = /^\d+(\.\d{1,2})?$/;

export function rupeesToPaise(input: string): number {
  const cleaned = input.trim().replace(/[₹,\s]/g, "");
  if (!RUPEES_PATTERN.test(cleaned)) {
    throw new Error(`Invalid rupee amount: "${input}"`);
  }
  const [whole, fraction = ""] = cleaned.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

export function formatPaise(paise: number): string {
  if (!Number.isInteger(paise)) {
    throw new Error("Paise must be an integer");
  }
  const sign = paise < 0 ? "-" : "";
  const abs = Math.abs(paise);
  const rupees = Math.floor(abs / 100);
  const rem = abs % 100;
  const grouped = new Intl.NumberFormat("en-IN").format(rupees);
  const tail = rem === 0 ? "" : `.${String(rem).padStart(2, "0")}`;
  return `${sign}₹${grouped}${tail}`;
}
