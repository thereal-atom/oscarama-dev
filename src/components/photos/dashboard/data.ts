// Mock data for the citadel dashboard prototype (/photos/dashboard/<scheme>). EVERY value here is made up:
// the person, the clients, the money, the bank details. The shapes follow citadel's features: the overview +
// account pages, saved invoice payment methods / numbers (its invoice-storage), the theme setting and the TV
// greeting. The monthly figures and statuses are an invented extension (citadel doesn't chart anything yet).

export type Status = "paid" | "sent" | "overdue" | "draft";
export interface Invoice { number: string; client: string; issued: string; due: string; amount: number; status: Status }
export interface SavedPayment { kind: string; accountName: string; bankName: string; rows: Array<[string, string]> }

export const user = { name: "Sam Example", first: "Sam", email: "sam@example.com" };
export const currency = "GBP" as const;
export const currencies = ["GBP", "USD", "EUR"] as const;

// invoiced per month, Dec 2025 → Nov 2026 (the last one is the month in progress)
export const months: Array<{ label: string; short: string; total: number; count: number }> = [
  ["dec 2025", 2100, 3], ["jan 2026", 3400, 4], ["feb 2026", 1800, 2], ["mar 2026", 4200, 5], ["apr 2026", 2900, 3], ["may 2026", 5100, 6],
  ["jun 2026", 3600, 4], ["jul 2026", 2400, 3], ["aug 2026", 4800, 5], ["sep 2026", 3900, 4], ["oct 2026", 5600, 6], ["nov 2026", 3690, 4],
].map(([label, total, count]) => ({ label: label as string, short: (label as string)[0], total: total as number, count: count as number }));

export const invoices: Invoice[] = [
  { number: "INV-0049", client: "Orchard Systems", issued: "", due: "", amount: 720, status: "draft" },
  { number: "INV-0048", client: "Kestrel Labs", issued: "2026-11-18", due: "2026-12-02", amount: 1640, status: "sent" },
  { number: "INV-0047", client: "Paper Moon Co", issued: "2026-11-10", due: "2026-11-24", amount: 850, status: "sent" },
  { number: "INV-0046", client: "Halcyon Events", issued: "2026-11-03", due: "2026-11-17", amount: 1200, status: "overdue" },
  { number: "INV-0045", client: "Quartz & Field", issued: "2026-10-28", due: "2026-11-11", amount: 2300, status: "paid" },
  { number: "INV-0044", client: "Brightwater Ltd", issued: "2026-10-20", due: "2026-11-03", amount: 960, status: "paid" },
  { number: "INV-0043", client: "Lumen Robotics", issued: "2026-10-12", due: "2026-10-26", amount: 1480, status: "paid" },
];

// this year's invoices by status (the waffle): 46 in all
export const statusCounts: Record<Status, number> = { paid: 42, sent: 2, overdue: 1, draft: 1 };
export const statusLabel: Record<Status, string> = { paid: "paid", sent: "awaiting", overdue: "overdue", draft: "draft" };

const sum = (a: number[]) => a.reduce((s, n) => s + n, 0);
const open = invoices.filter((i) => i.status === "sent" || i.status === "overdue");
const late = invoices.filter((i) => i.status === "overdue");
// weekly series for the sparklines (16 weeks, oldest first)
export const kpis = [
  { label: "Invoiced · 2026", value: sum(months.slice(1).map((m) => m.total)), money: true, sub: `${sum(months.slice(1).map((m) => m.count))} invoices`,
    spark: [3, 5, 4, 6, 2, 5, 7, 4, 6, 5, 8, 6, 4, 7, 6, 5] },
  { label: "Outstanding", value: sum(open.map((i) => i.amount)), money: true, sub: `${open.length} invoices`,
    spark: [2, 2, 3, 1, 2, 4, 3, 2, 1, 2, 3, 5, 4, 3, 5, 6] },
  { label: "Overdue", value: sum(late.map((i) => i.amount)), money: true, sub: `${late.length} invoice`, alert: true,
    spark: [0, 0, 1, 0, 0, 0, 2, 1, 0, 0, 0, 0, 1, 0, 3, 3] },
  { label: "Days to pay", value: 11, money: false, sub: "avg, last 90 days",
    spark: [7, 6, 6, 5, 6, 5, 4, 5, 4, 4, 5, 3, 4, 3, 3, 4] },
];

export const payments: SavedPayment[] = [
  { kind: "bank transfer · uk", accountName: "Sam Example", bankName: "Example Bank", rows: [["sort code", "00-00-00"], ["account no.", "•••• 1234"]] },
  { kind: "bank transfer · eu", accountName: "Sam Example", bankName: "Sample Bank EU", rows: [["iban", "XX00 •••• •••• 0000"], ["swift / bic", "SMPLXX00"]] },
];
export const numbers = ["INV-0048", "INV-0047", "INV-0046", "INV-0045", "INV-0044", "INV-0043", "INV-0042", "INV-0041"];
export const nextNumber = "INV-0049";

export const connections = { password: true, google: false };

export const formatMoney = (n: number, c: string = currency) => new Intl.NumberFormat("en-GB", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);
export function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString("en-GB", { timeZone: "UTC", day: "2-digit", month: "short" }).toLowerCase();
}
