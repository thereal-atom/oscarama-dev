// Sound design for OSCARAMA. Everything is synthesised with WebAudio: no audio files.
// Muted by default; the AudioContext is only created after the visitor opts in.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let projector: AudioBufferSourceNode | null = null;
let projectorGain: GainNode | null = null;
let noise: AudioBuffer | null = null;

export const soundOn = () => document.documentElement.dataset.sound === "on";

function ensure(): AudioContext | null {
  if (ctx) return ctx;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0;
  const comp = ctx.createDynamicsCompressor();
  master.connect(comp).connect(ctx.destination);
  noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return ctx;
}

/** one second of 16mm projector: a motor whirr, 24 gate clicks and a softer shutter tick between them */
function projectorBuffer(c: AudioContext) {
  const sr = c.sampleRate;
  const buf = c.createBuffer(1, sr, sr);
  const d = buf.getChannelData(0);
  let lp = 0;
  for (let i = 0; i < sr; i++) {
    const t = i / sr;
    lp += 0.04 * (Math.random() * 2 - 1 - lp);
    const whirr = lp * 0.9 + Math.sin(2 * Math.PI * 96 * t) * 0.025;
    const frame = (t * 24) % 1;
    const click = Math.exp(-frame * 140) * (Math.random() * 2 - 1) * 0.55;
    const half = (t * 24 + 0.5) % 1;
    const tick = Math.exp(-half * 220) * (Math.random() * 2 - 1) * 0.18;
    d[i] = whirr + click + tick;
  }
  return buf;
}

export function setSound(on: boolean) {
  const c = ensure();
  if (!c || !master) return;
  if (on) {
    void c.resume();
    master.gain.cancelScheduledValues(c.currentTime);
    master.gain.setTargetAtTime(0.9, c.currentTime, 0.08);
    if (!projector) {
      projector = c.createBufferSource();
      projector.buffer = projectorBuffer(c);
      projector.loop = true;
      const hp = c.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 120;
      projectorGain = c.createGain();
      projectorGain.gain.value = 0;
      projector.connect(hp).connect(projectorGain).connect(master);
      projector.start();
    }
    projectorGain?.gain.setTargetAtTime(0.11, c.currentTime, 0.4);
  } else {
    master.gain.cancelScheduledValues(c.currentTime);
    master.gain.setTargetAtTime(0, c.currentTime, 0.05);
  }
}

function noiseSource(c: AudioContext) {
  const s = c.createBufferSource();
  s.buffer = noise;
  return s;
}

/** the clapperboard: a dry wooden crack */
export function clack() {
  if (!soundOn() || !ctx || !master) return;
  const c = ctx;
  const t = c.currentTime;
  const n = noiseSource(c);
  const hp = c.createBiquadFilter();
  hp.type = "bandpass";
  hp.frequency.value = 2400;
  hp.Q.value = 0.9;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.9, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
  n.connect(hp).connect(g).connect(master);
  n.start(t, Math.random());
  n.stop(t + 0.1);
  const o = c.createOscillator();
  o.frequency.setValueAtTime(220, t);
  o.frequency.exponentialRampToValueAtTime(70, t + 0.08);
  const og = c.createGain();
  og.gain.setValueAtTime(0.5, t);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  o.connect(og).connect(master);
  o.start(t);
  o.stop(t + 0.13);
}

/** a trailer whoosh between cards */
export function whoosh() {
  if (!soundOn() || !ctx || !master) return;
  const c = ctx;
  const t = c.currentTime;
  const n = noiseSource(c);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1.4;
  bp.frequency.setValueAtTime(300, t);
  bp.frequency.exponentialRampToValueAtTime(3200, t + 0.35);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.35, t + 0.18);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
  n.connect(bp).connect(g).connect(master);
  n.start(t, Math.random());
  n.stop(t + 0.5);
}

/** the trailer horn. every trailer needs one. */
export function braam() {
  if (!soundOn() || !ctx || !master) return;
  const c = ctx;
  const t = c.currentTime;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.Q.value = 6;
  lp.frequency.setValueAtTime(140, t);
  lp.frequency.exponentialRampToValueAtTime(900, t + 0.25);
  lp.frequency.exponentialRampToValueAtTime(160, t + 2.4);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.28, t + 0.06);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
  lp.connect(g).connect(master);
  for (const f of [43.65, 43.9, 65.4, 87.3]) {
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = f;
    o.connect(lp);
    o.start(t);
    o.stop(t + 2.7);
  }
  // sub thump
  const s = c.createOscillator();
  s.frequency.setValueAtTime(80, t);
  s.frequency.exponentialRampToValueAtTime(32, t + 0.9);
  const sg = c.createGain();
  sg.gain.setValueAtTime(0.6, t);
  sg.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
  s.connect(sg).connect(master);
  s.start(t);
  s.stop(t + 1.2);
}
