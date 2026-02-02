<script lang="ts">
  import { Turnstile } from "svelte-turnstile";

  let { sitekey = "" }: { sitekey?: string } = $props();

  const eventsList = [
    { label: "🧗 bouldering", value: "bouldering" },
    { label: "🍽️ dinners", value: "dinners" },
    { label: "💻 hackathons", value: "hackathons" },
    { label: "⛺ camping & hiking", value: "camping & hiking" },
    { label: "✨ other", value: "other" },
  ];

  const channelsList = [
    { label: "whatsapp", value: "whatsapp", icon: "whatsapp" },
    { label: "slack", value: "slack", icon: "slack" },
    { label: "discord", value: "discord", icon: "discord" },
    { label: "other", value: "other", icon: "other" },
  ];

  let name = $state("");
  let email = $state("");
  let interests = $state<string[]>([]);
  let channels = $state<string[]>([]);
  let notes = $state("");

  let isSubmitting = $state(false);
  let message = $state<{ text: string; type: "success" | "error" } | null>(null);

  function toggleInterest(value: string) {
    if (interests.includes(value)) {
      interests = interests.filter((i) => i !== value);
    } else {
      interests = [...interests, value];
    }
  }

  function toggleChannel(value: string) {
    if (channels.includes(value)) {
      channels = channels.filter((c) => c !== value);
    } else {
      channels = [...channels, value];
    }
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    isSubmitting = true;

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const response = await fetch("/api/subscribe", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        message = { text: "you're in! check your inbox soon.", type: "success" };
        name = "";
        email = "";
        interests = [];
        channels = [];
        notes = "";
      } else {
        message = { text: result.error || "something went wrong", type: "error" };
      }
    } catch {
      message = { text: "something went wrong. please try again.", type: "error" };
    } finally {
      isSubmitting = false;
    }
  }
</script>

<form onsubmit={handleSubmit} class="flex flex-col gap-6 mt-10">
  <div class="flex flex-col gap-2">
    <label for="name" class="text-sm text-white/70">name</label>
    <input
      type="text"
      id="name"
      name="name"
      bind:value={name}
      placeholder="what should I call you?"
      required
      class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-md text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-colors"
    />
  </div>

  <div class="flex flex-col gap-2">
    <label for="email" class="text-sm text-white/70">email</label>
    <input
      type="email"
      id="email"
      name="email"
      bind:value={email}
      placeholder="you@example.com"
      required
      class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-md text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-colors"
    />
  </div>

  <fieldset class="flex flex-col gap-3">
    <legend class="text-sm text-white/70 mb-1">what kind of events interest you?</legend>
    <div class="flex flex-wrap gap-1.5 mt-2">
      {#each eventsList as event}
        <label class="group cursor-pointer">
          <input
            type="checkbox"
            name="interests"
            value={event.value}
            checked={interests.includes(event.value)}
            onchange={() => toggleInterest(event.value)}
            class="peer sr-only"
          />
          <span
            class="inline-block px-2.5 py-1 text-xs border border-white/20 rounded-full text-white/70 peer-checked:bg-[#E56717] peer-checked:border-[#E56717] peer-checked:text-white hover:border-white/40 transition-all select-none"
          >
            {event.label}
          </span>
        </label>
      {/each}
    </div>
  </fieldset>

  <fieldset class="flex flex-col gap-3">
    <legend class="text-sm text-white/70 mb-1">
      preferred community comms channel? <span class="text-white/40">(optional)</span>
    </legend>
    <div class="flex flex-wrap gap-1.5 mt-2">
      {#each channelsList as channel}
        <label class="group cursor-pointer">
          <input
            type="checkbox"
            name="channels"
            value={channel.value}
            checked={channels.includes(channel.value)}
            onchange={() => toggleChannel(channel.value)}
            class="peer sr-only"
          />
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-white/20 rounded-full text-white/70 peer-checked:bg-[#E56717] peer-checked:border-[#E56717] peer-checked:text-white hover:border-white/40 transition-all select-none"
          >
            {#if channel.icon === "whatsapp"}
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"
                ><path
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                /></svg
              >
            {:else if channel.icon === "slack"}
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"
                ><path
                  d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"
                /></svg
              >
            {:else if channel.icon === "discord"}
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"
                ><path
                  d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"
                /></svg
              >
            {:else}
              <span class="text-xs">✨</span>
            {/if}
            {channel.label}
          </span>
        </label>
      {/each}
    </div>
  </fieldset>

  <div class="flex flex-col gap-2">
    <label for="notes" class="text-sm text-white/70">
      anything else? <span class="text-white/40">(optional)</span>
    </label>
    <textarea
      id="notes"
      name="notes"
      bind:value={notes}
      rows="3"
      placeholder="ideas for events, how you found me, or just say hi..."
      class="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-md text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-colors resize-none"
    ></textarea>
  </div>

  <!-- DEBUG: sitekey={sitekey ? "present" : "MISSING"} -->
  {#if sitekey}
    <Turnstile siteKey={sitekey} theme="dark" />
  {:else}
    <p class="text-red-500 text-xs">DEBUG: No sitekey provided</p>
  {/if}

  <button
    type="submit"
    disabled={isSubmitting}
    class="mt-2 px-6 py-3 bg-[#E56717] text-white font-semibold rounded-md hover:bg-[#E56717]/80 focus:outline-none focus:ring-2 focus:ring-[#E56717]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isSubmitting ? "subscribing..." : "subscribe"}
  </button>

  {#if message}
    <p class="text-sm {message.type === 'success' ? 'text-green-400' : 'text-red-400'}">
      {message.text}
    </p>
  {/if}
</form>
