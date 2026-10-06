import { jsPDF } from "jspdf";
import {
  formatDate,
  formatMoney,
  invoiceTotals,
  lineTotal,
  paymentRows,
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

  // Everything below BOTTOM is reserved for the footer.
  const BOTTOM = PAGE.height - PAGE.margin - 12;

  // A cursor is a (page, y) position. Independent cursors let two columns flow
  // side by side across page breaks; the main cursor tracks the document body.
  type Cursor = { page: number; y: number };
  const main: Cursor = { page: 1, y: PAGE.margin };
  paintBackground();

  const breakPage = (cursor: Cursor) => {
    cursor.page += 1;
    if (cursor.page > doc.getNumberOfPages()) {
      doc.addPage();
      paintBackground();
    } else {
      doc.setPage(cursor.page);
    }
    cursor.y = PAGE.margin;
  };

  const ensureSpace = (cursor: Cursor, needed: number, onBreak?: () => void) => {
    if (cursor.y + needed > BOTTOM) {
      breakPage(cursor);
      onBreak?.();
    }
  };

  // Writes pre-wrapped rows one line at a time, breaking pages between rows.
  const flow = (
    cursor: Cursor,
    rows: string[],
    x: number,
    size: number,
    color: string,
    onBreak?: () => void,
    weight: "normal" | "bold" = "normal"
  ) => {
    for (const row of rows) {
      ensureSpace(cursor, lh(size), onBreak);
      setStyle(size, color, weight);
      doc.text(row, x, cursor.y);
      cursor.y += lh(size);
    }
  };

  const continued = (cursor: Cursor, x: number, heading: string) => () => {
    setStyle(8.5, palette.faint);
    doc.text(`${heading} (cont.)`, x, cursor.y);
    cursor.y += lh(8.5) + 1;
  };

  // ── header ────────────────────────────────────────────────────────────────
  const logoSize = 10;
  doc.addImage(logo, "PNG", PAGE.margin, main.y, logoSize, logoSize);

  let metaY = main.y + 3.5;
  setStyle(13, palette.text, "bold");
  doc.text("invoice", RIGHT, metaY, { align: "right" });
  metaY += lh(13);

  const metaValueWidth = 60;
  setStyle(8.5, palette.muted);
  const meta: [string, string[]][] = [
    ["no.", lines(data.number.trim() || "—", metaValueWidth)],
    ["issued", [formatDate(data.issueDate)]],
    ["due", [formatDate(data.dueDate)]],
  ];
  const valueWidth = Math.max(
    ...meta.flatMap(([, rows]) => rows.map((row) => doc.getTextWidth(row)))
  );
  for (const [label, rows] of meta) {
    setStyle(8.5, palette.faint);
    doc.text(label, RIGHT - valueWidth - 4, metaY, { align: "right" });
    setStyle(8.5, palette.muted);
    for (const row of rows) {
      doc.text(row, RIGHT, metaY, { align: "right" });
      metaY += lh(8.5);
    }
  }

  const fromX = PAGE.margin + logoSize + 4;
  const fromWidth = RIGHT - metaValueWidth - 8 - fromX;
  main.y += 3.5;
  setStyle(13, palette.text, "bold");
  flow(
    main,
    lines(data.from.name || "your name", fromWidth),
    fromX,
    13,
    palette.text,
    undefined,
    "bold"
  );
  const fromLines = [data.from.email, ...data.from.address.split("\n")]
    .map((line) => line.trim())
    .filter(Boolean);
  setStyle(8.5, palette.muted);
  flow(main, lines(fromLines.join("\n"), fromWidth), fromX, 8.5, palette.muted);

  main.y = (main.page === 1 ? Math.max(main.y, metaY) : main.y) + 14;

  // ── billed to ─────────────────────────────────────────────────────────────
  ensureSpace(main, lh(8.5) + lh(11) + lh(8.5) + 1);
  setStyle(8.5, palette.faint);
  doc.text("billed to", PAGE.margin, main.y);
  main.y += lh(8.5) + 1;
  setStyle(11, palette.text, "bold");
  flow(
    main,
    lines(data.customer.company || "customer", CONTENT_WIDTH * 0.6),
    PAGE.margin,
    11,
    palette.text,
    undefined,
    "bold"
  );
  const customerLines = [
    data.customer.contactName,
    data.customer.email,
    ...data.customer.address.split("\n"),
  ]
    .map((line) => line.trim())
    .filter(Boolean);
  setStyle(8.5, palette.muted);
  flow(main, lines(customerLines.join("\n"), CONTENT_WIDTH * 0.6), PAGE.margin, 8.5, palette.muted);

  main.y += 12;

  // ── line items ────────────────────────────────────────────────────────────
  const col = {
    amount: RIGHT,
    unit: RIGHT - 32,
    qty: RIGHT - 62,
    descriptionWidth: CONTENT_WIDTH - 78,
  };

  const tableHeader = () => {
    setStyle(8, palette.faint);
    doc.text("description", PAGE.margin, main.y);
    doc.text("qty", col.qty, main.y, { align: "right" });
    doc.text("unit price", col.unit, main.y, { align: "right" });
    doc.text("amount", col.amount, main.y, { align: "right" });
    main.y += 3;
    rule(main.y, palette.faint);
    main.y += lh(9) + 1;
  };

  ensureSpace(main, lh(8) + 4 + lh(9) * 2);
  tableHeader();

  const items = data.items.filter(
    (item) => item.description.trim() || item.quantity || item.unitPrice
  );

  if (items.length === 0) {
    setStyle(9, palette.faint);
    doc.text("no line items yet", PAGE.margin, main.y);
    main.y += lh(9);
    rule(main.y - lh(9) / 2 + 2);
    main.y += 4;
  }

  for (const item of items) {
    setStyle(9, palette.text);
    const [firstRow, ...restRows] = lines(item.description.trim() || "—", col.descriptionWidth);
    ensureSpace(main, lh(9) + 4, tableHeader);
    setStyle(9, palette.text);
    doc.text(firstRow, PAGE.margin, main.y);
    setStyle(9, palette.muted);
    doc.text(String(item.quantity || 0), col.qty, main.y, { align: "right" });
    doc.text(formatMoney(Number(item.unitPrice) || 0, data.currency), col.unit, main.y, {
      align: "right",
    });
    setStyle(9, palette.text);
    doc.text(formatMoney(lineTotal(item), data.currency), col.amount, main.y, { align: "right" });
    main.y += lh(9);
    flow(main, restRows, PAGE.margin, 9, palette.text, tableHeader);
    main.y += 4;
    rule(main.y - lh(9) / 2 + 2);
    main.y += 4;
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

  ensureSpace(main, totalRows.length * lh(9) + 16);
  main.y += 2;
  const labelX = RIGHT - 60;
  for (const [label, value, emphasis] of totalRows) {
    if (emphasis) {
      main.y += 2;
      doc.setDrawColor(palette.faint);
      doc.setLineWidth(0.25);
      doc.line(labelX, main.y - lh(9) + 1.5, RIGHT, main.y - lh(9) + 1.5);
      main.y += 1;
      setStyle(9, palette.text, "bold");
      doc.text(label, labelX, main.y);
      setStyle(12, palette.accent, "bold");
      doc.text(value, RIGHT, main.y, { align: "right" });
      main.y += lh(12);
    } else {
      setStyle(9, palette.muted);
      doc.text(label, labelX, main.y);
      setStyle(9, palette.text);
      doc.text(value, RIGHT, main.y, { align: "right" });
      main.y += lh(9);
    }
  }

  main.y += 14;

  // ── payment details & notes ───────────────────────────────────────────────
  const payment = paymentRows(data.payment);
  const notes = data.notes.trim();
  if (payment.length || notes) {
    const columnGap = 10;
    const columnWidth = (CONTENT_WIDTH - columnGap) / 2;
    const labelWidth = 30;
    const valueX = PAGE.margin + labelWidth + 3;
    const rowGap = 2.5;

    // Keep the headings with at least a couple of rows of content.
    ensureSpace(main, lh(8.5) * 4);
    const paymentCursor: Cursor = { ...main };
    const notesCursor: Cursor = { ...main };

    if (payment.length) {
      setStyle(8.5, palette.muted);
      const paymentTable = payment.map(
        ([label, value]) =>
          [label, lines(value, columnWidth - labelWidth - 3)] as [string, string[]]
      );
      const onBreak = continued(paymentCursor, PAGE.margin, "payment details");
      setStyle(8.5, palette.faint);
      doc.text("payment details", PAGE.margin, paymentCursor.y);
      paymentCursor.y += lh(8.5) + 1;
      paymentTable.forEach(([label, [firstRow, ...restRows]], index) => {
        ensureSpace(paymentCursor, lh(8.5) + rowGap, onBreak);
        setStyle(8.5, palette.faint);
        doc.text(label, PAGE.margin, paymentCursor.y);
        setStyle(8.5, palette.text);
        doc.text(firstRow, valueX, paymentCursor.y);
        paymentCursor.y += lh(8.5);
        flow(paymentCursor, restRows, valueX, 8.5, palette.text, onBreak);
        const lastBaseline = paymentCursor.y - lh(8.5);
        paymentCursor.y += rowGap;
        if (index < paymentTable.length - 1) {
          // Separator sits midway between this row's descenders and the next row's caps.
          const lineY = lastBaseline + 2.8;
          doc.setDrawColor(palette.border);
          doc.setLineWidth(0.2);
          doc.line(PAGE.margin, lineY, PAGE.margin + columnWidth, lineY);
        }
      });
    }

    if (notes) {
      const notesX = payment.length ? PAGE.margin + columnWidth + columnGap : PAGE.margin;
      doc.setPage(notesCursor.page);
      setStyle(8.5, palette.faint);
      doc.text("notes", notesX, notesCursor.y);
      notesCursor.y += lh(8.5) + 1;
      setStyle(8.5, palette.muted);
      flow(
        notesCursor,
        lines(notes, columnWidth),
        notesX,
        8.5,
        palette.muted,
        continued(notesCursor, notesX, "notes")
      );
    }

    const last = [paymentCursor, notesCursor].reduce((a, b) =>
      b.page > a.page || (b.page === a.page && b.y > a.y) ? b : a
    );
    main.page = last.page;
    main.y = last.y;
    doc.setPage(main.page);
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
