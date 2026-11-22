// Invoice prototype data. The shape mirrors citadel's `InvoiceData` (packages/api/src/lib/invoice/schemas.ts)
// field-for-field, and the money/total helpers follow its utils.ts, so the design can be ported back as-is.

export interface InvoiceLineItem { id: string; description: string; quantity: number; unitPrice: number }
export interface PaymentDetails { accountName: string; bankName: string; sortCode: string; accountNumber: string; iban: string; swift: string; reference: string }
export interface InvoiceData {
  from: { name: string; email: string; address: string; website: string };
  customer: { company: string; contactName: string; email: string; address: string };
  number: string;
  issueDate: string; // yyyy-mm-dd or ""
  dueDate: string;
  currency: "GBP" | "USD" | "EUR";
  items: InvoiceLineItem[];
  taxLabel: string;
  taxRate: number;
  discount: number;
  payment: PaymentDetails;
  notes: string;
  theme: "dark" | "light";
}

/** placeholder invoice for a photo shoot — every value here is made up */
export const sample: InvoiceData = {
  from: { name: "Oscar Falemara", email: "me@oscarama.dev", address: "London", website: "oscarama.dev" },
  customer: { company: "Acme Labs Ltd", contactName: "Sam Rivera", email: "events@acmelabs.example", address: "1 Example Street\nLondon EC1A 1AA" },
  number: "INV-0042",
  issueDate: "2026-11-22",
  dueDate: "2026-12-06",
  currency: "GBP",
  items: [
    { id: "1", description: "Event photography — Zero to Agent hackathon, full day", quantity: 1, unitPrice: 850 },
    { id: "2", description: "Recap video, 60–90s cut for socials", quantity: 1, unitPrice: 450 },
    { id: "3", description: "Speaker portraits", quantity: 6, unitPrice: 40 },
    { id: "4", description: "Same-night quick selects", quantity: 1, unitPrice: 100 },
  ],
  taxLabel: "vat",
  taxRate: 0,
  discount: 0,
  payment: { accountName: "Oscar Falemara", bankName: "Monzo", sortCode: "00-00-00", accountNumber: "12345678", iban: "", swift: "", reference: "INV-0042" },
  notes: "Thanks for having me. Full gallery link and video files are in the delivery email.",
  theme: "light",
};

export const PAYMENT_FIELDS: Array<{ key: keyof PaymentDetails; label: string }> = [
  { key: "accountName", label: "account name" },
  { key: "bankName", label: "bank" },
  { key: "sortCode", label: "sort code" },
  { key: "accountNumber", label: "account no." },
  { key: "iban", label: "iban" },
  { key: "swift", label: "swift / bic" },
  { key: "reference", label: "reference" },
];
export const paymentRows = (p: PaymentDetails) =>
  PAYMENT_FIELDS.flatMap(({ key, label }) => (p[key].trim() ? [[label, p[key].trim()] as [string, string]] : []));

const roundMoney = (n: number) => (Math.sign(n) * Math.round(Number((Math.abs(n) * 100).toPrecision(15)))) / 100;
export const lineTotal = (i: InvoiceLineItem) => roundMoney((Number(i.quantity) || 0) * (Number(i.unitPrice) || 0));
export function invoiceTotals(d: InvoiceData) {
  const subtotal = roundMoney(d.items.reduce((s, i) => s + lineTotal(i), 0));
  const discount = roundMoney(Math.min(Number(d.discount) || 0, subtotal));
  const taxable = roundMoney(subtotal - discount);
  const tax = roundMoney(taxable * ((Number(d.taxRate) || 0) / 100));
  return { subtotal, discount, tax, total: roundMoney(taxable + tax) };
}
export const formatMoney = (n: number, currency: string) => new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(n);
export function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso + "T12:00:00Z");
  return isNaN(+d) ? iso : d.toLocaleDateString("en-GB", { timeZone: "UTC", day: "2-digit", month: "short", year: "numeric" }).toLowerCase();
}
