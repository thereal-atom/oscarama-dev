<script lang="ts">
  import { onDestroy } from "svelte";
  import {
    CURRENCIES,
    formatMoney,
    invoiceTotals,
    lineTotal,
    slugify,
    type InvoiceData,
    type InvoiceLineItem,
    type InvoiceTheme,
  } from "@/lib/invoice";

  const themes: InvoiceTheme[] = ["dark", "light"];

  const inputClass =
    "w-full px-4 py-3 bg-white/5 border border-white/20 rounded-md text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-colors";
  const compactInputClass = `${inputClass} px-3 py-2 text-sm`;

  const today = new Date();
  const isoDate = (date: Date) => date.toISOString().slice(0, 10);
  const inTwoWeeks = new Date(today);
  inTwoWeeks.setDate(today.getDate() + 14);

  let nextItemId = 1;
  const newItem = (): InvoiceLineItem => ({
    id: nextItemId++,
    description: "",
    quantity: 1,
    unitPrice: 0,
  });

  let invoice = $state<InvoiceData>({
    from: {
      name: "oscar falemara",
      email: "hello@oscarama.dev",
      address: "",
      website: "oscarama.dev",
    },
    customer: { company: "", contactName: "", email: "", address: "" },
    number: `INV-${isoDate(today).replaceAll("-", "")}-01`,
    issueDate: isoDate(today),
    dueDate: isoDate(inTwoWeeks),
    currency: "GBP",
    items: [newItem()],
    taxLabel: "vat",
    taxRate: 0,
    discount: 0,
    paymentDetails: "",
    notes: "",
    theme: "dark",
  });

  let previewUrl = $state<string | null>(null);
  let previewError = $state<string | null>(null);
  let isRendering = $state(false);
  let isDownloading = $state(false);

  const totals = $derived(invoiceTotals(invoice));

  function addItem() {
    invoice.items.push(newItem());
  }

  function removeItem(id: number) {
    if (invoice.items.length === 1) {
      invoice.items = [newItem()];
      return;
    }
    invoice.items = invoice.items.filter((item) => item.id !== id);
  }

  const snapshot = () => $state.snapshot(invoice);

  let renderTimer: ReturnType<typeof setTimeout> | undefined;
  let renderSeq = 0;

  async function refreshPreview(data: InvoiceData) {
    const seq = ++renderSeq;
    isRendering = true;
    try {
      const { renderInvoicePdf } = await import("@/lib/invoice-pdf");
      const doc = await renderInvoicePdf(data);
      if (seq !== renderSeq) return;
      const url = URL.createObjectURL(doc.output("blob"));
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = url;
      previewError = null;
    } catch (error) {
      if (seq !== renderSeq) return;
      previewError = error instanceof Error ? error.message : "couldn't render the preview";
    } finally {
      if (seq === renderSeq) isRendering = false;
    }
  }

  $effect(() => {
    const data = snapshot();
    clearTimeout(renderTimer);
    renderTimer = setTimeout(() => refreshPreview(data), 350);
  });

  onDestroy(() => {
    clearTimeout(renderTimer);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  });

  async function handleDownload(e: SubmitEvent) {
    e.preventDefault();
    if (isDownloading) return;
    isDownloading = true;
    try {
      const { renderInvoicePdf } = await import("@/lib/invoice-pdf");
      const doc = await renderInvoicePdf(snapshot());
      const parts = ["invoice", invoice.number, invoice.customer.company].map(slugify).filter(Boolean);
      doc.save(`${parts.join("-")}.pdf`);
    } catch (error) {
      previewError = error instanceof Error ? error.message : "couldn't generate the pdf";
    } finally {
      isDownloading = false;
    }
  }
</script>

<form onsubmit={handleDownload} class="flex flex-col">
  <h2 class="text-xl mt-8 sm:mt-12">from</h2>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
    <div class="flex flex-col gap-2">
      <label for="from-name" class="text-sm text-white/70">name</label>
      <input id="from-name" type="text" bind:value={invoice.from.name} class={inputClass} />
    </div>
    <div class="flex flex-col gap-2">
      <label for="from-email" class="text-sm text-white/70">email</label>
      <input id="from-email" type="email" bind:value={invoice.from.email} class={inputClass} />
    </div>
    <div class="flex flex-col gap-2">
      <label for="from-address" class="text-sm text-white/70">
        address <span class="text-white/40">(optional)</span>
      </label>
      <textarea
        id="from-address"
        rows="3"
        bind:value={invoice.from.address}
        placeholder={"street\ncity, postcode\ncountry"}
        class="{inputClass} resize-none"
      ></textarea>
    </div>
    <div class="flex flex-col gap-2">
      <label for="from-website" class="text-sm text-white/70">
        website <span class="text-white/40">(optional)</span>
      </label>
      <input id="from-website" type="text" bind:value={invoice.from.website} class={inputClass} />
    </div>
  </div>

  <h2 class="text-xl mt-8 sm:mt-12">customer</h2>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
    <div class="flex flex-col gap-2">
      <label for="customer-company" class="text-sm text-white/70">company name</label>
      <input
        id="customer-company"
        type="text"
        bind:value={invoice.customer.company}
        placeholder="acme ltd"
        required
        class={inputClass}
      />
    </div>
    <div class="flex flex-col gap-2">
      <label for="customer-email" class="text-sm text-white/70">email</label>
      <input
        id="customer-email"
        type="email"
        bind:value={invoice.customer.email}
        placeholder="billing@acme.com"
        required
        class={inputClass}
      />
    </div>
    <div class="flex flex-col gap-2">
      <label for="customer-address" class="text-sm text-white/70">company address</label>
      <textarea
        id="customer-address"
        rows="3"
        bind:value={invoice.customer.address}
        placeholder={"street\ncity, postcode\ncountry"}
        required
        class="{inputClass} resize-none"
      ></textarea>
    </div>
    <div class="flex flex-col gap-2">
      <label for="customer-contact" class="text-sm text-white/70">
        contact name <span class="text-white/40">(optional)</span>
      </label>
      <input
        id="customer-contact"
        type="text"
        bind:value={invoice.customer.contactName}
        placeholder="jane doe"
        class={inputClass}
      />
    </div>
  </div>

  <h2 class="text-xl mt-8 sm:mt-12">details</h2>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-6">
    <div class="flex flex-col gap-2 col-span-2 sm:col-span-1">
      <label for="invoice-number" class="text-sm text-white/70">invoice no.</label>
      <input id="invoice-number" type="text" bind:value={invoice.number} required class={inputClass} />
    </div>
    <div class="flex flex-col gap-2">
      <label for="issue-date" class="text-sm text-white/70">issued</label>
      <input id="issue-date" type="date" bind:value={invoice.issueDate} required class={inputClass} />
    </div>
    <div class="flex flex-col gap-2">
      <label for="due-date" class="text-sm text-white/70">due</label>
      <input id="due-date" type="date" bind:value={invoice.dueDate} required class={inputClass} />
    </div>
    <div class="flex flex-col gap-2 col-span-2 sm:col-span-1">
      <label for="currency" class="text-sm text-white/70">currency</label>
      <select id="currency" bind:value={invoice.currency} class="{inputClass} bg-[#101010]">
        {#each CURRENCIES as currency}
          <option value={currency} class="bg-[#101010] text-white">{currency}</option>
        {/each}
      </select>
    </div>
  </div>

  <h2 class="text-xl mt-8 sm:mt-12">line items</h2>
  <div class="flex flex-col gap-3 mt-6">
    <div class="hidden sm:grid grid-cols-[1fr_5rem_8rem_7rem_2rem] gap-3 text-xs text-white/40 px-1">
      <span>description</span>
      <span class="text-right">qty</span>
      <span class="text-right">unit price</span>
      <span class="text-right">amount</span>
      <span></span>
    </div>
    {#each invoice.items as item (item.id)}
      <div
        class="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_5rem_8rem_7rem_2rem] gap-3 items-center"
      >
        <input
          type="text"
          bind:value={item.description}
          placeholder="what did you do?"
          aria-label="description"
          class="{compactInputClass} col-span-2 sm:col-span-1"
        />
        <input
          type="number"
          min="0"
          step="any"
          bind:value={item.quantity}
          aria-label="quantity"
          class="{compactInputClass} text-right"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          bind:value={item.unitPrice}
          aria-label="unit price"
          class="{compactInputClass} text-right"
        />
        <span class="text-sm text-white/70 text-right sm:px-1 max-sm:col-span-1">
          {formatMoney(lineTotal(item), invoice.currency)}
        </span>
        <button
          type="button"
          onclick={() => removeItem(item.id)}
          aria-label="remove line item"
          class="text-white/40 hover:text-white transition-colors text-lg leading-none justify-self-end"
        >
          ×
        </button>
      </div>
    {/each}
    <button
      type="button"
      onclick={addItem}
      class="self-start text-sm text-[#E56717] underline mt-1"
    >
      + add line item
    </button>
  </div>

  <div class="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-8">
    <div class="flex flex-col gap-2">
      <label for="tax-label" class="text-sm text-white/70">tax label</label>
      <input id="tax-label" type="text" bind:value={invoice.taxLabel} class={inputClass} />
    </div>
    <div class="flex flex-col gap-2">
      <label for="tax-rate" class="text-sm text-white/70">tax rate (%)</label>
      <input
        id="tax-rate"
        type="number"
        min="0"
        max="100"
        step="0.01"
        bind:value={invoice.taxRate}
        class={inputClass}
      />
    </div>
    <div class="flex flex-col gap-2 col-span-2 sm:col-span-1">
      <label for="discount" class="text-sm text-white/70">
        discount <span class="text-white/40">({invoice.currency})</span>
      </label>
      <input
        id="discount"
        type="number"
        min="0"
        step="0.01"
        bind:value={invoice.discount}
        class={inputClass}
      />
    </div>
  </div>

  <ul class="text-sm text-white/70 mt-6">
    <li>subtotal: {formatMoney(totals.subtotal, invoice.currency)}</li>
    {#if totals.discount > 0}
      <li>discount: -{formatMoney(totals.discount, invoice.currency)}</li>
    {/if}
    {#if invoice.taxRate > 0}
      <li>
        {invoice.taxLabel || "tax"} ({invoice.taxRate}%): {formatMoney(totals.tax, invoice.currency)}
      </li>
    {/if}
    <li class="text-white">
      total: <span class="text-[#E56717] font-semibold"
        >{formatMoney(totals.total, invoice.currency)}</span
      >
    </li>
  </ul>

  <h2 class="text-xl mt-8 sm:mt-12">extras</h2>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
    <div class="flex flex-col gap-2">
      <label for="payment-details" class="text-sm text-white/70">
        payment details <span class="text-white/40">(optional)</span>
      </label>
      <textarea
        id="payment-details"
        rows="4"
        bind:value={invoice.paymentDetails}
        placeholder={"account name\nsort code / account number\niban / swift"}
        class="{inputClass} resize-none"
      ></textarea>
    </div>
    <div class="flex flex-col gap-2">
      <label for="notes" class="text-sm text-white/70">
        notes <span class="text-white/40">(optional)</span>
      </label>
      <textarea
        id="notes"
        rows="4"
        bind:value={invoice.notes}
        placeholder="payment terms, thanks, anything else..."
        class="{inputClass} resize-none"
      ></textarea>
    </div>
  </div>

  <div class="flex flex-col sm:flex-row sm:items-center gap-4 mt-10">
    <button
      type="submit"
      disabled={isDownloading}
      class="px-6 py-3 bg-[#E56717] text-white font-semibold rounded-md hover:bg-[#E56717]/80 focus:outline-none focus:ring-2 focus:ring-[#E56717]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDownloading ? "generating..." : "download pdf"}
    </button>
    <fieldset class="flex items-center gap-1.5">
      <legend class="sr-only">pdf theme</legend>
      {#each themes as theme}
        <label class="cursor-pointer">
          <input type="radio" name="theme" value={theme} bind:group={invoice.theme} class="peer sr-only" />
          <span
            class="inline-block px-2.5 py-1 text-xs border border-white/20 rounded-full text-white/70 peer-checked:bg-[#E56717] peer-checked:border-[#E56717] peer-checked:text-white hover:border-white/40 transition-all select-none"
          >
            {theme} paper
          </span>
        </label>
      {/each}
    </fieldset>
  </div>

  <h2 class="text-xl mt-8 sm:mt-12 flex items-baseline gap-3">
    preview
    {#if isRendering}
      <span class="text-xs text-white/40">rendering...</span>
    {/if}
  </h2>
  {#if previewError}
    <p class="text-sm text-red-400 mt-4">{previewError}</p>
  {/if}
  <div class="mt-6 border border-white/20 rounded-md overflow-hidden bg-white/5 aspect-[210/297]">
    {#if previewUrl}
      <iframe
        src="{previewUrl}#toolbar=0&navpanes=0&view=Fit"
        title="invoice preview"
        class="w-full h-full"
      ></iframe>
    {:else}
      <div class="w-full h-full flex items-center justify-center text-sm text-white/40">
        rendering preview...
      </div>
    {/if}
  </div>
  <p class="text-xs text-white/40 mt-4">
    nothing is saved anywhere - refresh and it's gone. download the pdf when you're done.
  </p>
</form>
