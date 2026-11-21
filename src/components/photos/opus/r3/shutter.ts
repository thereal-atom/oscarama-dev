// Round-3 synthesised mechanical shutter (Web Audio, no files).
// Layers, ~110ms total:
//   1. mirror slap   — low-mid filtered noise + a short body thump
//   2. first curtain — very sharp high click + a metallic resonant ping
//   3. second curtain— brighter "clack" ~50ms later
//   4. mirror return — softer mid knock + tiny thump
// glued with a very short synthetic room so it doesn't sound like a hi-hat.
// Mute state is shared by every opus r3 page via localStorage.

const KEY = "opus-r3-muted";
let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;
let out: AudioNode | null = null;

export function isMuted(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(v: boolean) {
  try {
    localStorage.setItem(KEY, v ? "1" : "0");
  } catch {}
  document.dispatchEvent(new CustomEvent("opus-r3:mute", { detail: v }));
}

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    const sr = ctx.sampleRate;
    noise = ctx.createBuffer(1, Math.floor(sr * 0.5), sr);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

    // tiny room: 90ms exponentially decaying noise impulse
    const ir = ctx.createBuffer(2, Math.floor(sr * 0.09), sr);
    for (let c = 0; c < 2; c++) {
      const ch = ir.getChannelData(c);
      for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / ch.length, 4);
    }
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -10;
    comp.ratio.value = 4;
    comp.attack.value = 0.001;
    comp.release.value = 0.05;
    comp.connect(ctx.destination);
    const dry = ctx.createGain();
    dry.gain.value = 0.9;
    const conv = ctx.createConvolver();
    conv.buffer = ir;
    const wet = ctx.createGain();
    wet.gain.value = 0.16;
    dry.connect(comp);
    dry.connect(conv).connect(wet).connect(comp);
    out = dry;
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

type F = { type: BiquadFilterType; f: number; q?: number };
function hit(a: AudioContext, t: number, filters: F[], attack: number, decay: number, vol: number) {
  const src = a.createBufferSource();
  src.buffer = noise;
  let node: AudioNode = src;
  for (const f of filters) {
    const b = a.createBiquadFilter();
    b.type = f.type;
    b.frequency.value = f.f;
    if (f.q) b.Q.value = f.q;
    node.connect(b);
    node = b;
  }
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  node.connect(g).connect(out!);
  src.start(t, Math.random() * 0.3);
  src.stop(t + attack + decay + 0.02);
}

function thump(a: AudioContext, t: number, f0: number, f1: number, dur: number, vol: number) {
  const o = a.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(out!);
  o.start(t);
  o.stop(t + dur + 0.02);
}

/** Play one mechanical shutter actuation. `speed` > 1 = faster curtain gap. */
export function shutter(speed = 1) {
  if (isMuted()) return;
  const a = audio();
  if (!a || !out) return;
  const j = () => 0.94 + Math.random() * 0.12; // humanise
  const t = a.currentTime + 0.004;
  const gap = (0.048 / speed) * j();
  // 1. mirror slap
  hit(a, t, [{ type: "bandpass", f: 950 * j(), q: 1.1 }], 0.001, 0.028, 0.55);
  thump(a, t, 150, 62, 0.035, 0.45);
  // 2. first curtain: sharp click + metallic ping
  hit(a, t + 0.003, [{ type: "highpass", f: 3800 }], 0.0004, 0.006, 0.95);
  hit(a, t + 0.003, [{ type: "bandpass", f: 4300 * j(), q: 14 }], 0.0006, 0.02, 0.35);
  // 3. second curtain clack
  hit(a, t + gap, [{ type: "bandpass", f: 2500 * j(), q: 2 }], 0.0005, 0.015, 0.75);
  hit(a, t + gap + 0.0015, [{ type: "highpass", f: 5200 }], 0.0003, 0.005, 0.55);
  // 4. mirror return
  hit(a, t + gap + 0.024, [{ type: "bandpass", f: 1350 * j(), q: 1.6 }], 0.001, 0.022, 0.4);
  thump(a, t + gap + 0.024, 120, 55, 0.03, 0.25);
}

/** Wire a button as mute toggle. `render(muted)` updates its label/icon. */
export function bindMute(btn: HTMLElement | null, render: (muted: boolean) => void) {
  if (!btn) return;
  const sync = () => {
    const m = isMuted();
    btn.setAttribute("aria-pressed", String(m));
    render(m);
  };
  btn.addEventListener("click", () => {
    setMuted(!isMuted());
    if (!isMuted()) shutter();
  });
  document.addEventListener("opus-r3:mute", sync);
  sync();
}
