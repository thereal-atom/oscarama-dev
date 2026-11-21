// Synthesised mechanical shutter (Web Audio, no files) + shared mute state.
// A real SLR/mirrorless-with-mechanical-shutter actuation is three events in ~100ms:
//   0ms   mirror slap / first curtain release — a dull, woody "thk" (low-mid noise + body thump)
//   ~8ms  a very sharp, bright transient (the latch)
//   ~55ms second curtain "clack" — brighter, shorter, slightly metallic
//   ~80ms mirror return — soft, low
// Mute: any [data-mute] button on the page toggles it; state persists in localStorage.

let ctx: AudioContext | null = null;
let master: DynamicsCompressorNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let muted = false;
try { muted = localStorage.getItem("fable-mute") === "1"; } catch {}

function ac() {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    master = ctx.createDynamicsCompressor();
    master.threshold.value = -14; master.ratio.value = 6; master.attack.value = 0.001; master.release.value = 0.05;
    const out = ctx.createGain(); out.gain.value = 0.9;
    master.connect(out).connect(ctx.destination);
    const len = Math.floor(ctx.sampleRate * 0.25);
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/** a burst of filtered noise with a fast attack and exponential decay */
function noise(c: AudioContext, at: number, dur: number, type: BiquadFilterType, freq: number, q: number, gain: number) {
  const src = c.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
  const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + 0.0008);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  src.connect(f).connect(g).connect(master!);
  src.start(at, Math.random() * 0.2); src.stop(at + dur + 0.01);
}
/** a short damped resonance (metal parts ringing) */
function ping(c: AudioContext, at: number, freq: number, dur: number, gain: number, type: OscillatorType = "triangle", drop = 1) {
  const o = c.createOscillator(); o.type = type;
  o.frequency.setValueAtTime(freq, at);
  if (drop !== 1) o.frequency.exponentialRampToValueAtTime(freq * drop, at + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(gain, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(master!);
  o.start(at); o.stop(at + dur + 0.01);
}

export function shutter(soft = false) {
  if (muted) return;
  try {
    const c = ac();
    const t = c.currentTime + 0.004, v = soft ? 0.5 : 1;
    // 1. mirror slap: dull body + thump
    noise(c, t, 0.034, "bandpass", 1500, 0.8, 0.9 * v);
    noise(c, t, 0.05, "lowpass", 420, 0.5, 0.55 * v);
    ping(c, t, 170, 0.045, 0.5 * v, "sine", 0.4);
    // 2. latch: very sharp bright click
    noise(c, t + 0.007, 0.006, "highpass", 5200, 0.7, 0.8 * v);
    ping(c, t + 0.007, 3300, 0.012, 0.12 * v);
    // 3. second curtain clack
    noise(c, t + 0.056, 0.016, "bandpass", 2900, 1.3, 0.75 * v);
    noise(c, t + 0.057, 0.005, "highpass", 6500, 0.7, 0.5 * v);
    ping(c, t + 0.056, 4700, 0.014, 0.07 * v);
    ping(c, t + 0.056, 240, 0.03, 0.28 * v, "sine", 0.5);
    // 4. mirror return
    noise(c, t + 0.082, 0.04, "bandpass", 950, 0.7, 0.42 * v);
  } catch {}
}

export const isMuted = () => muted;

function paint() {
  document.querySelectorAll<HTMLElement>("[data-mute]").forEach((b) => {
    b.setAttribute("aria-pressed", String(muted));
    const label = muted ? (b.dataset.off ?? "sound off") : (b.dataset.on ?? "sound on");
    const slot = b.querySelector<HTMLElement>("[data-mute-label]") ?? b;
    slot.textContent = label;
  });
}

let wired = false;
export function wireMute() {
  if (wired) return; wired = true;
  document.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest?.("[data-mute]");
    if (!b) return;
    muted = !muted;
    try { localStorage.setItem("fable-mute", muted ? "1" : "0"); } catch {}
    paint();
    if (!muted) shutter(true);
  });
  paint();
}
