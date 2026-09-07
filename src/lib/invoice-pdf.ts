import { jsPDF } from "jspdf";
import {
  formatDate,
  formatMoney,
  invoiceTotals,
  lineTotal,
  type InvoiceData,
  type InvoiceTheme,
} from "./invoice";

const FONT = "GeistMono";
const ACCENT = "#E56717";

// Colours are the site's palette (`#101010` bg, `white/70` body copy, `white/20` borders)
// flattened onto the page background so the PDF has no alpha to worry about.
const PALETTES: Record<
  InvoiceTheme,
  { bg: string; text: string; muted: string; faint: string; border: string; accent: string }
> = {
  dark: {
    bg: "#101010",
    text: "#FFFFFF",
    muted: "#B7B7B7",
    faint: "#707070",
    border: "#404040",
    accent: ACCENT,
  },
  light: {
    bg: "#FFFFFF",
    text: "#101010",
    muted: "#595959",
    faint: "#999999",
    border: "#D9D9D9",
    accent: ACCENT,
  },
};

const PAGE = { width: 210, height: 297, margin: 18 };
const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2;
const RIGHT = PAGE.width - PAGE.margin;

const assets: { regular?: string; bold?: string; logo?: Uint8Array } = {};

async function fetchBase64(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`failed to load ${url}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function loadAssets() {
  if (!assets.regular || !assets.bold || !assets.logo) {
    const [regular, bold, logoRes] = await Promise.all([
      fetchBase64("/fonts/GeistMono-Regular.ttf"),
      fetchBase64("/fonts/GeistMono-Bold.ttf"),
      fetch("/invoice-logo.png"),
    ]);
    assets.regular = regular;
    assets.bold = bold;
    assets.logo = new Uint8Array(await logoRes.arrayBuffer());
  }
  return assets as Required<typeof assets>;
}

export async function renderInvoicePdf(data: InvoiceData): Promise<jsPDF> {
  const { regular, bold, logo } = await loadAssets();
  const palette = PALETTES[data.theme];
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  doc.addFileToVFS("GeistMono-Regular.ttf", regular);
  doc.addFont("GeistMono-Regular.ttf", FONT, "normal");
  doc.addFileToVFS("GeistMono-Bold.ttf", bold);
  doc.addFont("GeistMono-Bold.ttf", FONT, "bold");

  const paintBackground = () => {
    doc.setFillColor(palette.bg);
    doc.rect(0, 0, PAGE.width, PAGE.height, "F");
  };

  const setStyle = (size: number, color: string, weight: "normal" | "bold" = "normal") => {
    doc.setFont(FONT, weight);
    doc.setFontSize(size);
    doc.setTextColor(color);
  };

  const rule = (y: number, color = palette.border) => {
    doc.setDrawColor(color);
    doc.setLineWidth(0.25);
    doc.line(PAGE.margin, y, RIGHT, y);
  };

  // Line height in mm for a given font size (pt), matching a ~1.5 leading.
  const lh = (size: number) => size * 0.3528 * 1.5;

  const lines = (text: string, width: number) =>
    doc.splitTextToSize(text.trim(), width) as string[];

  const paragraph = (
    text: string,
    x: number,
    y: number,
    width: number,
    size: number,
    color: string,
    weight: "normal" | "bold" = "normal"
  ) => {
    setStyle(size, color, weight);
    const rows = lines(text, width);
    rows.forEach((row, i) => doc.text(row, x, y + i * lh(size)));
    return y + rows.length * lh(size);
  };

  let y = PAGE.margin;
  paintBackground();

  const ensureSpace = (needed: number) => {
    if (y + needed > PAGE.height - PAGE.margin - 12) {
      doc.addPage();
      paintBackground();
      y = PAGE.margin;
    }
  };

  // ── header ────────────────────────────────────────────────────────────────
  const logoSize = 10;
  doc.addImage(logo, "PNG", PAGE.margin, y, logoSize, logoSize);

  const fromX = PAGE.margin + logoSize + 4;
  let fromY = y + 3.5;
  setStyle(13, palette.text, "bold");
  doc.text(data.from.name || "your name", fromX, fromY);
  fromY += lh(13);
  const fromLines = [data.from.email, ...data.from.address.split("\n"), data.from.website]
    .map((line) => line.trim())
    .filter(Boolean);
  fromY = paragraph(fromLines.join("\n"), fromX, fromY, 90, 8.5, palette.muted);

  let metaY = y + 3.5;
  setStyle(13, palette.text, "bold");
  doc.text("invoice", RIGHT, metaY, { align: "right" });
  metaY += lh(13);

  const meta: [string, string][] = [
    ["no.", data.number || "—"],
    ["issued", formatDate(data.issueDate)],
    ["due", formatDate(data.dueDate)],
  ];
  setStyle(8.5, palette.muted);
  const valueWidth = Math.max(...meta.map(([, value]) => doc.getTextWidth(value)));
  for (const [label, value] of meta) {
    setStyle(8.5, palette.faint);
    doc.text(label, RIGHT - valueWidth - 4, metaY, { align: "right" });
    setStyle(8.5, palette.muted);
    doc.text(value, RIGHT, metaY, { align: "right" });
    metaY += lh(8.5);
  }

  y = Math.max(fromY, metaY) + 14;

  // ── billed to ─────────────────────────────────────────────────────────────
  setStyle(8.5, palette.faint);
  doc.text("billed to", PAGE.margin, y);
  y += lh(8.5) + 1;
  setStyle(11, palette.text, "bold");
  doc.text(data.customer.company || "customer", PAGE.margin, y);
  y += lh(11);
  const customerLines = [
    data.customer.contactName,
    data.customer.email,
    ...data.customer.address.split("\n"),
  ]
    .map((line) => line.trim())
    .filter(Boolean);
  y = paragraph(customerLines.join("\n"), PAGE.margin, y, CONTENT_WIDTH * 0.6, 8.5, palette.muted);

  y += 12;

  // ── line items ────────────────────────────────────────────────────────────
  const col = {
    amount: RIGHT,
    unit: RIGHT - 32,
    qty: RIGHT - 62,
    descriptionWidth: CONTENT_WIDTH - 78,
  };

  const tableHeader = () => {
    setStyle(8, palette.faint);
    doc.text("description", PAGE.margin, y);
    doc.text("qty", col.qty, y, { align: "right" });
    doc.text("unit price", col.unit, y, { align: "right" });
    doc.text("amount", col.amount, y, { align: "right" });
    y += 3;
    rule(y, palette.faint);
    y += lh(9) + 1;
  };

  tableHeader();

  const items = data.items.filter(
    (item) => item.description.trim() || item.quantity || item.unitPrice
  );

  if (items.length === 0) {
    setStyle(9, palette.faint);
    doc.text("no line items yet", PAGE.margin, y);
    y += lh(9);
    rule(y - lh(9) / 2 + 2);
    y += 4;
  }

  for (const item of items) {
    setStyle(9, palette.text);
    const descriptionRows = lines(item.description || "—", col.descriptionWidth);
    const rowHeight = descriptionRows.length * lh(9) + 4;
    if (y + rowHeight > PAGE.height - PAGE.margin - 12) {
      doc.addPage();
      paintBackground();
      y = PAGE.margin;
      tableHeader();
      setStyle(9, palette.text);
    }
    descriptionRows.forEach((row, i) => doc.text(row, PAGE.margin, y + i * lh(9)));
    setStyle(9, palette.muted);
    doc.text(String(item.quantity || 0), col.qty, y, { align: "right" });
    doc.text(formatMoney(Number(item.unitPrice) || 0, data.currency), col.unit, y, {
      align: "right",
    });
    setStyle(9, palette.text);
    doc.text(formatMoney(lineTotal(item), data.currency), col.amount, y, { align: "right" });
    y += rowHeight;
    rule(y - lh(9) / 2 + 2);
    y += 4;
  }

  // ── totals ────────────────────────────────────────────────────────────────
  const totals = invoiceTotals(data);
  const totalRows: [string, string, boolean][] = [
    ["subtotal", formatMoney(totals.subtotal, data.currency), false],
  ];
  if (totals.discount > 0) {
    totalRows.push(["discount", `-${formatMoney(totals.discount, data.currency)}`, false]);
  }
  if (data.taxRate > 0) {
    totalRows.push([
      `${data.taxLabel.trim() || "tax"} (${data.taxRate}%)`,
      formatMoney(totals.tax, data.currency),
      false,
    ]);
  }
  totalRows.push(["total", formatMoney(totals.total, data.currency), true]);

  ensureSpace(totalRows.length * lh(9) + 16);
  y += 2;
  const labelX = RIGHT - 60;
  for (const [label, value, emphasis] of totalRows) {
    if (emphasis) {
      y += 2;
      doc.setDrawColor(palette.faint);
      doc.setLineWidth(0.25);
      doc.line(labelX, y - lh(9) + 1.5, RIGHT, y - lh(9) + 1.5);
      y += 1;
      setStyle(9, palette.text, "bold");
      doc.text(label, labelX, y);
      setStyle(12, palette.accent, "bold");
      doc.text(value, RIGHT, y, { align: "right" });
      y += lh(12);
    } else {
      setStyle(9, palette.muted);
      doc.text(label, labelX, y);
      setStyle(9, palette.text);
      doc.text(value, RIGHT, y, { align: "right" });
      y += lh(9);
    }
  }

  y += 14;

  // ── payment details & notes ───────────────────────────────────────────────
  const payment = data.paymentDetails.trim();
  const notes = data.notes.trim();
  if (payment || notes) {
    const columnGap = 10;
    const columnWidth = (CONTENT_WIDTH - columnGap) / 2;
    const paymentRows = payment ? lines(payment, columnWidth) : [];
    const notesRows = notes ? lines(notes, columnWidth) : [];
    const blockHeight = (Math.max(paymentRows.length, notesRows.length) + 2) * lh(8.5);
    ensureSpace(blockHeight);

    const startY = y;
    if (payment) {
      setStyle(8.5, palette.faint);
      doc.text("payment details", PAGE.margin, y);
      paragraph(payment, PAGE.margin, y + lh(8.5) + 1, columnWidth, 8.5, palette.muted);
    }
    if (notes) {
      const notesX = payment ? PAGE.margin + columnWidth + columnGap : PAGE.margin;
      setStyle(8.5, palette.faint);
      doc.text("notes", notesX, startY);
      paragraph(notes, notesX, startY + lh(8.5) + 1, columnWidth, 8.5, palette.muted);
    }
    y = startY + blockHeight;
  }

  // ── footer ────────────────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    const footerY = PAGE.height - PAGE.margin + 4;
    rule(footerY - 6);
    setStyle(8, palette.faint);
    doc.text("thank you for your business :)", PAGE.margin, footerY);
    setStyle(8, palette.accent);
    const website = data.from.website.trim();
    const pageLabel = pageCount > 1 ? `${page}/${pageCount}` : "";
    if (pageLabel) {
      setStyle(8, palette.faint);
      doc.text(pageLabel, RIGHT, footerY, { align: "right" });
      setStyle(8, palette.accent);
      if (website)
        doc.text(website, RIGHT - doc.getTextWidth(pageLabel) - 4, footerY, { align: "right" });
    } else if (website) {
      doc.text(website, RIGHT, footerY, { align: "right" });
    }
  }

  doc.setProperties({
    title: `invoice ${data.number}`.trim(),
    author: data.from.name,
    subject: data.customer.company ? `invoice for ${data.customer.company}` : "invoice",
    creator: "oscarama.dev",
  });

  return doc;
}
