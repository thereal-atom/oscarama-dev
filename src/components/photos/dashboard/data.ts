// Mock data for the citadel dashboard prototype (/photos/dashboard/<scheme>). EVERY value here is made up.
// The shapes follow citadel's app: the signed-in user (better-auth session), the invoice generator's form
// (InvoiceData, shared with ../invoice/data.ts) and what citadel keeps in the browser (saved payment methods and
// the invoice numbers you've downloaded).
import type { InvoiceData, PaymentDetails } from "../invoice/data";

export const user = { name: "Sam Example", first: "Sam", email: "sam@example.com" };

/** the routes in citadel's shell, in sidebar order; `title` is what the breadcrumb shows (pathToPageTitle) */
export const routes = [
  { id: "invoice", title: "Invoices", nav: "Invoices" },
  { id: "overview", title: "Overview", nav: "Overview" },
  { id: "tv", title: "Dashboard", nav: "Dashboard" },
  { id: "settings", title: "Settings", nav: "Settings" },
  { id: "account", title: "My account", nav: "" },
  { id: "login", title: "Sign in", nav: "" },
] as const;
export type RouteId = (typeof routes)[number]["id"];

const iso = (d: Date) => d.toISOString().slice(0, 10);
const today = new Date(Date.UTC(2026, 10, 22));
const in14 = new Date(Date.UTC(2026, 11, 6));

/** a fresh invoice, like citadel's createInvoice(): one empty line, today + 14 days, GBP, dark PDF */
export const blankInvoice: InvoiceData = {
  from: { name: user.name, email: user.email, address: "", website: "example.com" },
  customer: { company: "", contactName: "", email: "", address: "" },
  number: "INV-0049",
  issueDate: iso(today),
  dueDate: iso(in14),
  currency: "GBP",
  items: [{ id: "initial", description: "", quantity: 1, unitPrice: 0 }],
  taxLabel: "vat",
  taxRate: 0,
  discount: 0,
  payment: { accountName: "", bankName: "", sortCode: "", accountNumber: "", iban: "", swift: "", reference: "INV-0049" },
  notes: "",
  theme: "dark",
};

/** what's "already saved on this device" the first time the prototype opens */
export const seedSaved: { payments: Array<Omit<PaymentDetails, "reference">>; numbers: string[] } = {
  payments: [
    { accountName: "Sam Example", bankName: "Example Bank", sortCode: "00-00-00", accountNumber: "12345678", iban: "", swift: "" },
    { accountName: "Sam Example", bankName: "Sample Bank EU", sortCode: "", accountNumber: "", iban: "XX00 0000 0000 0000 00", swift: "SMPLXX00" },
  ],
  numbers: ["INV-0048", "INV-0047", "INV-0046"],
};
