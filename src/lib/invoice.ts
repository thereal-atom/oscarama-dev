export type InvoiceTheme = "dark" | "light";

export type InvoiceLineItem = {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceData = {
  from: {
    name: string;
    email: string;
    address: string;
    website: string;
  };
  customer: {
    company: string;
    contactName: string;
    email: string;
    address: string;
  };
  number: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  items: InvoiceLineItem[];
  taxLabel: string;
  taxRate: number;
  discount: number;
  payment: PaymentDetails;
  notes: string;
  theme: InvoiceTheme;
};

export type PaymentDetails = {
  accountName: string;
  bankName: string;
  sortCode: string;
  accountNumber: string;
  iban: string;
  swift: string;
  reference: string;
};

export const PAYMENT_FIELDS: {
  key: keyof PaymentDetails;
  label: string;
  placeholder: string;
}[] = [
  { key: "accountName", label: "account name", placeholder: "oscar falemara" },
  { key: "bankName", label: "bank", placeholder: "monzo" },
  { key: "sortCode", label: "sort code", placeholder: "00-00-00" },
  { key: "accountNumber", label: "account no.", placeholder: "12345678" },
  { key: "iban", label: "iban", placeholder: "GB00 XXXX 0000 0000 0000 00" },
  { key: "swift", label: "swift / bic", placeholder: "XXXXGB2L" },
  { key: "reference", label: "reference", placeholder: "invoice number" },
];

export const emptyPaymentDetails = (): PaymentDetails => ({
  accountName: "",
  bankName: "",
  sortCode: "",
  accountNumber: "",
  iban: "",
  swift: "",
  reference: "",
});

export function paymentRows(payment: PaymentDetails): [string, string][] {
  return PAYMENT_FIELDS.flatMap(({ key, label }) => {
    const value = payment[key].trim();
    return value ? [[label, value] as [string, string]] : [];
  });
}

export const CURRENCIES = ["GBP", "USD", "EUR"] as const;

// All supported currencies have two minor units; every monetary stage is rounded
// half away from zero to cents so printed line amounts reconcile with printed totals.
// The epsilon nudge stops exact half-cents (e.g. 0.145) rounding down through
// binary floating-point error.
const roundMoney = (amount: number) =>
  (Math.sign(amount) * Math.round((Math.abs(amount) + Number.EPSILON) * 100)) / 100;

export function lineTotal(item: InvoiceLineItem) {
  return roundMoney((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0));
}

export function invoiceTotals(data: InvoiceData) {
  const subtotal = roundMoney(data.items.reduce((sum, item) => sum + lineTotal(item), 0));
  const discount = roundMoney(Math.min(Number(data.discount) || 0, subtotal));
  const taxable = roundMoney(subtotal - discount);
  const tax = roundMoney(taxable * ((Number(data.taxRate) || 0) / 100));
  return { subtotal, discount, tax, total: roundMoney(taxable + tax) };
}

export function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(amount);
}

export function formatDate(iso: string) {
  if (!iso) return "—";
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleDateString("en-US", { month: "short" }).toLowerCase();
  return `${day} ${month} ${date.getFullYear()}`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
