<script lang="ts">
  interface Props {
    href: string;
    src: string;
    alt: string;
    text: string;
  }

  const { href, src, alt, text }: Props = $props();
</script>

<a
  {href}
  target="_blank"
  class="group inline-flex items-center gap-1 align-middle text-white/70 underline dark:text-white transition-all duration-200"
>
  <img
    class="h-4 w-4 rounded-xs mb-0.5"
    {src}
    {alt}
  />
  <span>{text}</span>
</a>
