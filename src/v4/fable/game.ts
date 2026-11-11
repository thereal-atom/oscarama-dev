// plus one: a tiny crowd-gathering game.
// you are oscar. bump into people and they join you. walk the crowd through
// nine doors, in order, and each one opens a chapter of the story.

import { drawBlob, sampleText, pickColour, PAL, INK, SUN, SUN_DEEP, VIOLET, PAPER } from "./blob";

const IDLE = 0,
  WANDER = 1,
  FOLLOW = 2;

type Person = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  a: number; // wander heading
  c: number;
  s: number;
  ph: number;
  fx: number;
  fy: number;
  imm: number;
  hop: number;
  tx: number;
  ty: number;
  sz: number;
};

type Venue = {
  n: number;
  name: string;
  need: number;
  img: HTMLImageElement | null;
  glyph: string;
  bg: string;
  pad: number;
  x: number;
  y: number;
  state: 0 | 1 | 2; // locked, open, done
  pop: number;
  deny: number;
  shown: boolean;
};

const DISPLAY = '"Bagel Fat One", "Arial Black", system-ui, sans-serif';
const NAMEFONT = "Figtree, system-ui, sans-serif";
const BODY = "Figtree, system-ui, sans-serif";
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const rand = (a: number, b: number) => a + Math.random() * (b - a);

export function boot() {
  const arena = document.getElementById("play");
  const stage = document.getElementById("stage");
  const canvas = document.getElementById("g") as HTMLCanvasElement | null;
  if (!arena || !stage || !canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const $ = (k: string) => stage.querySelector<HTMLElement>(`[data-g="${k}"]`)!;
  const elCount = $("count"),
    elObj = $("obj"),
    elBar = $("bar"),
    elPips = $("pips"),
    elTime = $("time"),
    elSound = $("sound"),
    elRestart = $("restart"),
    elCard = $("card"),
    elCardBody = $("card-body"),
    elCardGo = $("card-go"),
    elEnd = $("end"),
    elEndN = $("end-n"),
    elEndT = $("end-t"),
    elAgain = $("again"),
    elGate = $("gate"),
    elGatePlay = $("gate-play"),
    elHud = $("hud");

  const doorEls = Array.from(document.querySelectorAll<HTMLElement>("[data-door]"));
  const loadImg = (src?: string) => {
    if (!src) return null;
    const im = new Image();
    im.decoding = "async";
    im.src = src;
    return im;
  };
  const venues: Venue[] = doorEls.map((el) => ({
    n: Number(el.dataset.door),
    name: el.dataset.name ?? "",
    need: Number(el.dataset.need ?? 1),
    img: loadImg(el.dataset.logo),
    glyph: el.dataset.glyph ?? "",
    bg: el.dataset.bg ?? PAPER,
    pad: Number(el.dataset.pad ?? 1),
    x: 0,
    y: 0,
    state: 0,
    pop: 0,
    deny: 0,
    shown: true,
  }));
  const LAST = venues.length; // the finale door sits in the middle
  const avatar = loadImg(stage.dataset.avatar);

  // ---------- state ----------
  let W = 0,
    H = 0,
    DPR = 1,
    R = 8,
    LR = 18,
    VR = 44,
    SLOT = 10,
    portrait = false;
  const bounds = { l: 0, t: 0, r: 0, b: 0 };
  let people: Person[] = [];
  let followers: Person[] = [];
  const leader = { x: 0, y: 0, tx: 0, ty: 0, fx: 0, fy: 1, hop: 0 };
  const C = { x: 0, y: 0 };
  let next = 0; // index of the open venue
  let phase: "play" | "celebrate" | "card" | "end" | "gate" = "play";
  let started = false;
  let clock = 0;
  let t = 0;
  let spawnT = 1.5;
  let shake = 0;
  let celebrateT = 0;
  let cardOpenedAt = 0;
  let cardReplay = false;
  let streak = 0,
    streakT = 0,
    lastJoinSound = 0;
  let confetti: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    vr: number;
    c: number;
    life: number;
  }[] = [];
  let floaters: { x: number; y: number; t: number; s: string }[] = [];
  let fontReady = false;
  const keys = new Set<string>();
  let pointerSeen = false;
  const coarse = matchMedia("(pointer: coarse)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- audio ----------
  let ac: AudioContext | null = null;
  let muted = false;
  try {
    muted = localStorage.getItem("v4f-mute") === "1";
  } catch {}
  const paintSound = () => {
    elSound.setAttribute("aria-pressed", String(!muted));
    elSound.dataset.on = String(!muted);
    elSound.setAttribute("aria-label", muted ? "sound is off. turn on" : "sound is on. turn off");
  };
  paintSound();
  const wake = () => {
    if (muted) return;
    try {
      if (!ac) ac = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ac.state === "suspended") void ac.resume();
    } catch {}
  };
  const tone = (
    freq: number,
    dur = 0.16,
    vol = 0.05,
    type: OscillatorType = "triangle",
    when = 0
  ) => {
    if (muted || !ac || ac.state !== "running") return;
    const t0 = ac.currentTime + when;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(ac.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  };
  const PENTA = [0, 2, 4, 7, 9];
  const note = (i: number) => 262 * Math.pow(2, (PENTA[i % 5] + 12 * Math.floor(i / 5)) / 12);

  // ---------- layout ----------
  const LAND = [
    [0.15, 0.15],
    [0.5, 0.11],
    [0.85, 0.15],
    [0.93, 0.5],
    [0.85, 0.8],
    [0.5, 0.84],
    [0.15, 0.8],
    [0.07, 0.5],
  ];
  const PORT = [
    [0.25, 0.07],
    [0.75, 0.07],
    [0.85, 0.34],
    [0.85, 0.62],
    [0.75, 0.87],
    [0.25, 0.87],
    [0.15, 0.62],
    [0.15, 0.34],
  ];

  function layout() {
    const rect = stage!.getBoundingClientRect();
    W = Math.max(280, rect.width);
    H = Math.max(320, rect.height);
    DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas!.width = Math.round(W * DPR);
    canvas!.height = Math.round(H * DPR);
    portrait = W < 720 || W < H * 0.95;
    R = clamp(Math.min(W, H) / 88, 5.4, 8.6);
    LR = Math.max(R * 2.3, 15);
    SLOT = R * 1.22;
    VR = portrait ? clamp(W * 0.078, 27, 40) : clamp(H * 0.058, 34, 48);
    const top = elHud.offsetHeight + 14;
    bounds.l = 0;
    bounds.r = W;
    bounds.t = top;
    bounds.b = H - 6;
    const pw = W,
      ph = H - top - 6;
    const pts = portrait ? PORT : LAND;
    venues.forEach((v, i) => {
      const p = i < pts.length ? pts[i] : [0.5, portrait ? 0.47 : 0.46];
      v.x = pw * p[0];
      v.y = top + ph * p[1];
    });
  }

  function mkPerson(x: number, y: number, s: number): Person {
    return {
      x,
      y,
      vx: 0,
      vy: 0,
      a: Math.random() * 6.28,
      c: pickColour(),
      s,
      ph: Math.random() * 6.28,
      fx: 0,
      fy: 1,
      imm: 0,
      hop: 2,
      tx: x,
      ty: y,
      sz: rand(0.86, 1.14),
    };
  }

  function nameBox() {
    const cy = (bounds.t + bounds.b) / 2 - (portrait ? H * 0.015 : H * 0.02);
    return portrait
      ? { cx: W / 2, cy, w: W * (W < 380 ? 0.5 : 0.56), h: H * 0.3, stretch: 2.5 }
      : { cx: W / 2, cy, w: Math.min(W * 0.54, 800), h: H * 0.36, stretch: 1.25 };
  }

  function reset() {
    people = [];
    followers = [];
    confetti = [];
    floaters = [];
    next = 0;
    started = false;
    clock = 0;
    spawnT = 1.2;
    streak = 0;
    venues.forEach((v, i) => {
      v.state = i === 0 ? 1 : 0;
      v.pop = 0;
      v.deny = 0;
      v.shown = i < LAST - 1;
    });
    layout();
    const nb = nameBox();
    const pts = sampleText(
      "oscar",
      NAMEFONT,
      nb.cx,
      nb.cy,
      nb.w,
      nb.h,
      portrait ? 76 : 150,
      R * 2.2,
      nb.stretch
    );
    let nameBottom = nb.cy;
    for (const p of pts) if (p.y > nameBottom) nameBottom = p.y;
    for (const p of pts) people.push(mkPerson(p.x, p.y, IDLE));
    leader.x = leader.tx = W / 2;
    leader.y = leader.ty = Math.min(nameBottom + LR * 2.6, bounds.b - LR * 3);
    C.x = leader.x;
    C.y = leader.y;
    // a few early wanderers so the place feels alive
    for (let i = 0; i < (portrait ? 5 : 9); i++) {
      const p = mkPerson(rand(W * 0.1, W * 0.9), rand(bounds.t + 30, bounds.b - 30), WANDER);
      const dx = p.x - nb.cx,
        dy = p.y - nb.cy;
      if (Math.abs(dx) < nb.w * 0.62 && Math.abs(dy) < nb.h * 0.75)
        p.y = dy < 0 ? nb.cy - nb.h * 0.8 : nb.cy + nb.h * 0.8;
      people.push(p);
    }
    phase = reduce && !gateCleared ? "gate" : "play";
    elCard.hidden = true;
    elEnd.hidden = true;
    stage!.dataset.phase = phase;
    hudCache = "";
    paintPips();
  }

  // ---------- spawning ----------
  function spawnGroup(n: number) {
    const side = Math.floor(Math.random() * 4);
    const bx = side === 0 ? -14 : side === 1 ? W + 14 : rand(W * 0.1, W * 0.9);
    const by =
      side === 2 ? bounds.t - 10 : side === 3 ? H + 14 : rand(bounds.t + 20, bounds.b - 20);
    const a = Math.atan2((bounds.t + bounds.b) / 2 - by, W / 2 - bx);
    for (let i = 0; i < n; i++) {
      const p = mkPerson(bx + rand(-16, 16), by + rand(-16, 16), WANDER);
      p.a = a + rand(-0.5, 0.5);
      p.imm = 0.3;
      people.push(p);
    }
  }

  function burstFrom(v: Venue, n: number) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, 6.28);
      const p = mkPerson(v.x + Math.cos(a) * VR * 0.4, v.y + Math.sin(a) * VR * 0.4, WANDER);
      const sp = rand(260, 560);
      p.vx = Math.cos(a) * sp;
      p.vy = Math.sin(a) * sp;
      p.a = a;
      p.imm = 1.5;
      p.hop = -rand(0, 0.3);
      people.push(p);
    }
  }

  function join(p: Person) {
    p.s = FOLLOW;
    p.hop = 0;
    followers.push(p);
    if (floaters.length < 10) floaters.push({ x: p.x, y: p.y - R * 2, t: 0, s: "+1" });
    streak = Math.min(streak + 1, 19);
    streakT = 1.1;
    if (t - lastJoinSound > 0.045) {
      tone(note(streak), 0.14, 0.045);
      lastJoinSound = t;
    }
  }

  // ---------- venue flow ----------
  function unlock(v: Venue) {
    v.state = 2;
    v.pop = 1;
    shake = 9;
    phase = "celebrate";
    celebrateT = reduce ? 0.25 : 0.85;
    stage!.dataset.phase = phase;
    for (let i = 0; i < 70; i++) {
      const a = rand(0, 6.28),
        sp = rand(120, 520);
      confetti.push({
        x: v.x,
        y: v.y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 180,
        r: rand(0, 6.28),
        vr: rand(-9, 9),
        c: Math.floor(Math.random() * PAL.length),
        life: rand(0.9, 1.7),
      });
    }
    for (const f of followers) f.hop = -Math.hypot(f.x - v.x, f.y - v.y) / 520;
    leader.hop = 0;
    [0, 2, 4, 7].forEach((s, i) =>
      tone(392 * Math.pow(2, s / 12), 0.3, 0.06, "triangle", i * 0.085)
    );
    tone(784, 0.5, 0.05, "sine", 0.36);
    if (v.n < LAST) burstFrom(v, 5 + v.n);
    paintPips();
  }

  function openCard(n: number, replay = false) {
    const el = doorEls[n - 1];
    if (!el) return;
    cardReplay = replay;
    elCardBody.innerHTML = el.innerHTML;
    elCard.dataset.n = String(n);
    elCardGo.textContent = replay
      ? "back to the game"
      : n === LAST
        ? "one last thing →"
        : "keep going →";
    elCard.hidden = false;
    cardOpenedAt = performance.now();
    phase = "card";
    stage!.dataset.phase = phase;
    elCardBody.scrollTop = 0;
    elCardGo.focus({ preventScroll: true });
    keys.clear();
  }

  function closeCard() {
    if (phase !== "card") return;
    elCard.hidden = true;
    const n = Number(elCard.dataset.n);
    leader.tx = leader.x;
    leader.ty = leader.y;
    if (cardReplay) {
      phase = endShown ? "end" : "play";
    } else if (n >= LAST) {
      finale();
    } else {
      next = n;
      venues[next].state = 1;
      venues[next].shown = true;
      venues[next].pop = 1;
      phase = "play";
    }
    stage!.dataset.phase = phase;
    hudCache = "";
    paintPips();
    canvas!.focus({ preventScroll: true });
  }

  let endShown = false;
  let endScale = 1;
  function finale() {
    phase = "end";
    endShown = true;
    next = LAST;
    venues[LAST - 1].shown = false;
    // everyone's invited: stragglers get swept in too
    for (const p of people)
      if (p.s !== FOLLOW) {
        p.s = FOLLOW;
        followers.push(p);
      }
    const ph = bounds.b - bounds.t;
    const cy = bounds.t + ph * (portrait ? 0.2 : 0.33);
    const w = portrait ? W * 0.6 : Math.min(W * 0.34, 500);
    // a big crowd squeezes up a bit so the word still fits
    let pts: { x: number; y: number }[] = [];
    for (endScale = 1; endScale > 0.55; endScale -= 0.08) {
      pts = sampleText(
        "hi",
        NAMEFONT,
        W / 2 - LR,
        cy,
        w,
        ph * (portrait ? 0.3 : 0.44),
        followers.length,
        R * endScale * 2.1,
        1.25
      );
      if (pts.length >= followers.length * 0.96) break;
    }
    let maxX = 0,
      maxY = 0;
    for (const p of pts) {
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    followers.forEach((f, i) => {
      const p = pts[i % Math.max(1, pts.length)];
      const extra = i >= pts.length ? R * 0.9 : 0;
      f.tx = p ? p.x + rand(-extra, extra) : W / 2;
      f.ty = p ? p.y + rand(-extra, extra) : cy;
      f.hop = -i * 0.004;
    });
    // oscar is the full stop
    leader.tx = maxX + LR * 2.2;
    leader.ty = maxY - LR * 0.6;
    elEndN.textContent = String(followers.length);
    elEndT.textContent = fmt(clock);
    setTimeout(
      () => {
        if (phase === "end") {
          elEnd.hidden = false;
          [0, 4, 7, 12, 16].forEach((s, i) =>
            tone(262 * Math.pow(2, s / 12), 0.5, 0.05, "triangle", i * 0.11)
          );
        }
      },
      reduce ? 100 : 1500
    );
    stage!.dataset.phase = phase;
  }

  // ---------- hud ----------
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  let hudCache = "";
  function paintHud() {
    const n = followers.length;
    const v = venues[next];
    let obj = "";
    let pct = 1;
    if (phase === "end") obj = "that's everyone. nice hosting.";
    else if (!started) {
      obj = coarse
        ? "drag anywhere to walk. bump into people!"
        : "move your mouse. bump into people!";
      pct = 0;
    } else if (!v) obj = "";
    else if (n >= v.need) {
      obj = `door ${v.n} · ${v.name} is open. walk in!`;
    } else {
      obj = `door ${v.n} · ${v.name}: bring ${v.need}`;
      pct = n / v.need;
    }
    const key = `${n}|${obj}|${Math.floor(clock)}|${Math.round(pct * 100)}`;
    if (key === hudCache) return;
    hudCache = key;
    elCount.textContent = String(n);
    elObj.textContent = obj;
    elBar.style.transform = `scaleX(${clamp(pct, 0, 1)})`;
    elBar.dataset.full = String(pct >= 1);
    elTime.textContent = fmt(clock);
  }

  function paintPips() {
    const pips = Array.from(elPips.querySelectorAll<HTMLButtonElement>("button"));
    pips.forEach((b, i) => {
      const v = venues[i];
      const done = v.state === 2;
      b.disabled = !done;
      b.dataset.state = done ? "done" : v.state === 1 && v.shown ? "now" : "locked";
      b.setAttribute(
        "aria-label",
        done ? `door ${v.n}, ${v.name}: read again` : `door ${v.n}: locked`
      );
    });
  }

  // ---------- update ----------
  function update(dt: number) {
    t += dt;
    stepParticles(dt);
    if (phase === "card") return; // the room holds its breath while you read
    const playing = phase === "play";
    if (playing && started) clock += dt;
    if (streakT > 0) {
      streakT -= dt;
      if (streakT <= 0) streak = 0;
    }

    // keyboard steering
    if (playing && keys.size) {
      let kx = 0,
        ky = 0;
      if (keys.has("left")) kx -= 1;
      if (keys.has("right")) kx += 1;
      if (keys.has("up")) ky -= 1;
      if (keys.has("down")) ky += 1;
      if (kx || ky) {
        const l = Math.hypot(kx, ky);
        leader.tx = leader.x + (kx / l) * 62;
        leader.ty = leader.y + (ky / l) * 62;
        started = true;
      }
    }
    leader.tx = clamp(leader.tx, bounds.l + LR, bounds.r - LR);
    leader.ty = clamp(leader.ty, bounds.t + LR, bounds.b - LR);

    // leader
    {
      const dx = leader.tx - leader.x,
        dy = leader.ty - leader.y;
      const d = Math.hypot(dx, dy);
      if (d > 0.5) {
        const maxV = phase === "end" ? 420 : clamp(Math.max(W, H) * 1.05, 480, 1400);
        const v = Math.min(d * 11, maxV);
        leader.x += (dx / d) * v * dt;
        leader.y += (dy / d) * v * dt;
        leader.fx += (dx / d - leader.fx) * Math.min(1, dt * 10);
        leader.fy += (dy / d - leader.fy) * Math.min(1, dt * 10);
      }
      leader.hop += dt * 2.6;
    }
    C.x += (leader.x - C.x) * (1 - Math.exp(-3.4 * dt));
    C.y += (leader.y - C.y) * (1 - Math.exp(-3.4 * dt));

    const n = followers.length;
    const crowdR = SLOT * Math.sqrt(n + 7);
    const magnet = LR + R * 2.4;
    const nb = people.length;

    // followers
    for (let i = 0; i < n; i++) {
      const f = followers[i];
      let tx: number, ty: number, k: number;
      if (phase === "end") {
        tx = f.tx;
        ty = f.ty;
        k = 3.2;
      } else {
        const a = i * 2.39996;
        const rr = SLOT * Math.sqrt(i + 7);
        tx = C.x + Math.cos(a) * rr;
        ty = C.y + Math.sin(a) * rr;
        k = Math.max(2.4, 9 / (1 + i * 0.02));
      }
      const e = 1 - Math.exp(-k * dt);
      const mx = (tx - f.x) * e,
        my = (ty - f.y) * e;
      f.x += mx;
      f.y += my;
      const sp = Math.hypot(mx, my) / Math.max(dt, 0.001);
      if (sp > 14) {
        const l = Math.hypot(mx, my) || 1;
        f.fx += (mx / l - f.fx) * Math.min(1, dt * 8);
        f.fy += (my / l - f.fy) * Math.min(1, dt * 8);
        f.ph += dt * 13;
      } else {
        // settle: look where oscar looks
        f.fx += (leader.fx - f.fx) * Math.min(1, dt * 3);
        f.fy += (leader.fy - f.fy) * Math.min(1, dt * 3);
      }
      if (f.hop < 1.5) f.hop += dt * 2.6;
    }

    // everyone else
    let free = 0;
    for (let i = 0; i < nb; i++) {
      const p = people[i];
      if (p.s === FOLLOW) continue;
      free++;
      if (p.hop < 1.5) p.hop += dt * 2.6;
      const dxl = leader.x - p.x,
        dyl = leader.y - p.y;
      const dl = Math.hypot(dxl, dyl) || 1;
      if (p.s === IDLE) {
        // stand in the name, watch oscar
        p.fx += (dxl / dl - p.fx) * Math.min(1, dt * 5);
        p.fy += (dyl / dl - p.fy) * Math.min(1, dt * 5);
        p.ph += dt * 2;
      } else {
        const sp0 = Math.hypot(p.vx, p.vy);
        if (sp0 > 60) {
          // thrown out of a venue, slow down
          const fr = Math.exp(-3.2 * dt);
          p.vx *= fr;
          p.vy *= fr;
        } else {
          p.a += rand(-1.6, 1.6) * dt;
          const m = 26;
          const cxm = W / 2,
            cym = (bounds.t + bounds.b) / 2;
          if (
            p.x < bounds.l + m ||
            p.x > bounds.r - m ||
            p.y < bounds.t + m ||
            p.y > bounds.b - m
          ) {
            const want = Math.atan2(cym - p.y, cxm - p.x);
            let da = want - p.a;
            while (da > Math.PI) da -= 6.2832;
            while (da < -Math.PI) da += 6.2832;
            p.a += da * Math.min(1, dt * 3);
          }
          let sp = 26;
          // word of mouth: drift towards a nearby crowd
          const dxc = C.x - p.x,
            dyc = C.y - p.y;
          const dc = Math.hypot(dxc, dyc) || 1;
          if (n > 2 && dc < crowdR + R * 11 && p.imm <= 0) {
            const want = Math.atan2(dyc, dxc);
            let da = want - p.a;
            while (da > Math.PI) da -= 6.2832;
            while (da < -Math.PI) da += 6.2832;
            p.a += da * Math.min(1, dt * 5);
            sp = 60;
          }
          p.vx = Math.cos(p.a) * sp;
          p.vy = Math.sin(p.a) * sp;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const l = Math.hypot(p.vx, p.vy) || 1;
        p.fx += (p.vx / l - p.fx) * Math.min(1, dt * 6);
        p.fy += (p.vy / l - p.fy) * Math.min(1, dt * 6);
        p.ph += dt * 9;
      }
      if (p.imm > 0) {
        p.imm -= dt;
        continue;
      }
      if (phase === "end" || phase === "gate") continue;
      if (dl < magnet || (n > 2 && Math.hypot(C.x - p.x, C.y - p.y) < crowdR + R * 0.6)) join(p);
    }

    // spawns
    if (phase !== "end" && phase !== "gate") {
      spawnT -= dt;
      const v = venues[next];
      const short = !!v && started && n < v.need && free < v.need - n + 6;
      if (spawnT <= 0) {
        const cap = short ? 70 : 26;
        if (free < cap)
          spawnGroup(short ? 3 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 3));
        spawnT = short ? 0.55 : started ? 1.9 : 3.2;
      }
    }

    // venues
    for (const v of venues) {
      if (v.pop > 0) v.pop = Math.max(0, v.pop - dt * 2.2);
      if (v.deny > 0) v.deny -= dt;
    }
    if (playing) {
      const v = venues[next];
      if (v && v.state === 1 && Math.hypot(leader.x - v.x, leader.y - v.y) < VR + LR * 0.4) {
        if (n >= v.need) unlock(v);
        else if (v.deny <= 0) {
          v.deny = 1.5;
          tone(150, 0.16, 0.05, "square");
          tone(120, 0.2, 0.05, "square", 0.1);
        }
      }
    }
    if (phase === "celebrate") {
      celebrateT -= dt;
      if (celebrateT <= 0) openCard(venues[next].n);
    }
  }

  function stepParticles(dt: number) {
    if (shake > 0) shake = Math.max(0, shake - dt * 26);
    for (const c of confetti) {
      c.vy += 900 * dt;
      c.vx *= 1 - 1.2 * dt;
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.r += c.vr * dt;
      c.life -= dt;
    }
    if (confetti.length) confetti = confetti.filter((c) => c.life > 0);
    for (const f of floaters) f.t += dt;
    if (floaters.length) floaters = floaters.filter((f) => f.t < 0.7);
  }

  // ---------- draw ----------
  function drawGround() {
    ctx!.fillStyle = SUN;
    ctx!.fillRect(0, 0, W, H);
    const cx = W / 2,
      cy = (bounds.t + bounds.b) / 2;
    ctx!.strokeStyle = SUN_DEEP;
    ctx!.lineWidth = portrait ? 3 : 4;
    // painted playground lines
    const rr = Math.min(W, bounds.b - bounds.t) * (portrait ? 0.4 : 0.36);
    ctx!.beginPath();
    ctx!.arc(cx, cy, rr, 0, 6.2832);
    ctx!.stroke();
    ctx!.beginPath();
    ctx!.arc(cx, cy, rr * 0.16, 0, 6.2832);
    ctx!.stroke();
    ctx!.beginPath();
    if (portrait) {
      ctx!.moveTo(0, cy);
      ctx!.lineTo(cx - rr, cy);
      ctx!.moveTo(cx + rr, cy);
      ctx!.lineTo(W, cy);
    } else {
      ctx!.moveTo(cx, bounds.t - 20);
      ctx!.lineTo(cx, cy - rr);
      ctx!.moveTo(cx, cy + rr);
      ctx!.lineTo(cx, H);
    }
    ctx!.stroke();

    // the route between doors
    ctx!.setLineDash([2, portrait ? 9 : 12]);
    ctx!.lineCap = "round";
    ctx!.lineWidth = portrait ? 3 : 4;
    for (let i = 0; i < venues.length - 1; i++) {
      const a = venues[i],
        b = venues[i + 1];
      if (!b.shown) continue;
      const walked = b.state === 2 || (b.state === 1 && a.state === 2);
      ctx!.strokeStyle = walked ? "rgba(27,21,37,0.55)" : "rgba(27,21,37,0.16)";
      const dx = b.x - a.x,
        dy = b.y - a.y,
        d = Math.hypot(dx, dy) || 1;
      const g = VR + 12;
      ctx!.beginPath();
      ctx!.moveTo(a.x + (dx / d) * g, a.y + (dy / d) * g);
      ctx!.lineTo(b.x - (dx / d) * g, b.y - (dy / d) * g);
      ctx!.stroke();
    }
    ctx!.setLineDash([]);
    ctx!.lineCap = "butt";
  }

  function drawVenue(v: Venue) {
    if (!v.shown) return;
    const n = followers.length;
    const bump = 1 + Math.sin(Math.min(1, v.pop) * Math.PI) * 0.22;
    const wob = v.deny > 1.1 ? Math.sin(t * 60) * 4 : 0;
    const x = v.x + wob,
      y = v.y,
      r = VR * bump;
    const c = ctx!;
    const small = portrait;

    if (v.state === 0) {
      c.fillStyle = SUN_DEEP;
      c.beginPath();
      c.arc(x, y, r, 0, 6.2832);
      c.fill();
      c.setLineDash([5, 6]);
      c.strokeStyle = "rgba(27,21,37,0.4)";
      c.lineWidth = 2;
      c.stroke();
      c.setLineDash([]);
      c.fillStyle = "rgba(27,21,37,0.42)";
      c.font = `${r * 0.95}px ${DISPLAY}`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(String(v.n), x, y + r * 0.06);
    } else {
      if (v.state === 1) {
        // beacon + progress ring
        const pulse = (t * 0.9) % 1;
        c.strokeStyle = `rgba(108,71,255,${0.55 * (1 - pulse)})`;
        c.lineWidth = 3;
        c.beginPath();
        c.arc(x, y, r + 10 + pulse * r * 0.9, 0, 6.2832);
        c.stroke();
        c.strokeStyle = "rgba(27,21,37,0.16)";
        c.lineWidth = small ? 5 : 7;
        c.beginPath();
        c.arc(x, y, r + (small ? 6 : 8), 0, 6.2832);
        c.stroke();
        c.strokeStyle = VIOLET;
        c.lineCap = "round";
        c.beginPath();
        c.arc(x, y, r + (small ? 6 : 8), -1.5708, -1.5708 + 6.2832 * clamp(n / v.need, 0.001, 1));
        c.stroke();
        c.lineCap = "butt";
      }
      // hard shadow
      c.fillStyle = INK;
      c.beginPath();
      c.arc(x + 3, y + 4, r, 0, 6.2832);
      c.fill();
      c.fillStyle = v.bg;
      c.beginPath();
      c.arc(x, y, r, 0, 6.2832);
      c.fill();
      c.save();
      c.beginPath();
      c.arc(x, y, r - 1, 0, 6.2832);
      c.clip();
      if (v.img && v.img.complete && v.img.naturalWidth) {
        const iw = v.img.naturalWidth,
          ih = v.img.naturalHeight;
        const side = r * 2 * v.pad;
        const sc = v.pad < 1 ? Math.min(side / iw, side / ih) : Math.max(side / iw, side / ih);
        c.drawImage(
          v.img,
          x - (iw * sc) / 2,
          y - (ih * sc) / 2 - (v.pad < 1 ? r * 0.06 : 0),
          iw * sc,
          ih * sc
        );
      } else if (v.glyph) {
        c.fillStyle = v.bg === INK ? PAPER : INK;
        c.font = `${r * (v.glyph.length > 1 ? 0.92 : 1.1)}px ${DISPLAY}`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(v.glyph, x, y + r * 0.07);
      }
      c.restore();
      c.strokeStyle = INK;
      c.lineWidth = small ? 3 : 3.5;
      c.beginPath();
      c.arc(x, y, r, 0, 6.2832);
      c.stroke();
      if (v.state === 2) {
        // done tick
        const bx = x + r * 0.72,
          by = y - r * 0.72,
          br = Math.max(9, r * 0.3);
        c.fillStyle = VIOLET;
        c.beginPath();
        c.arc(bx, by, br, 0, 6.2832);
        c.fill();
        c.strokeStyle = INK;
        c.lineWidth = 2.5;
        c.stroke();
        c.strokeStyle = PAPER;
        c.lineWidth = Math.max(2, br * 0.26);
        c.lineCap = "round";
        c.lineJoin = "round";
        c.beginPath();
        c.moveTo(bx - br * 0.42, by + br * 0.02);
        c.lineTo(bx - br * 0.1, by + br * 0.34);
        c.lineTo(bx + br * 0.44, by - br * 0.3);
        c.stroke();
        c.lineCap = "butt";
      }
    }

    // label
    const fs = small ? 11 : 13.5;
    const ly = y + r + (v.state === 1 ? (small ? 21 : 26) : small ? 15 : 19);
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = `800 ${fs}px ${BODY}`;
    c.fillStyle = v.state === 0 ? "rgba(27,21,37,0.5)" : INK;
    c.fillText(v.name, x, ly);
    if (v.state === 1) {
      const ok = n >= v.need;
      const s = v.deny > 0 && !ok ? `need ${v.need - n} more` : ok ? "walk in!" : `bring ${v.need}`;
      c.font = `800 ${fs - 0.5}px ${BODY}`;
      const tw = c.measureText(s).width + (small ? 14 : 18);
      const ph = small ? 18 : 22;
      const py = ly + (small ? 17 : 21);
      c.fillStyle = ok ? VIOLET : INK;
      c.beginPath();
      c.roundRect(x - tw / 2, py - ph / 2, tw, ph, ph / 2);
      c.fill();
      c.fillStyle = PAPER;
      c.fillText(s, x, py + 0.5);
    }
  }

  function drawLeader() {
    const c = ctx!;
    const moving = Math.hypot(leader.tx - leader.x, leader.ty - leader.y) > 6;
    const lift = moving ? Math.abs(Math.sin(t * 11)) * LR * 0.16 : 0;
    const x = leader.x,
      y = leader.y - lift;
    c.fillStyle = "rgba(120, 78, 0, 0.3)";
    c.beginPath();
    c.ellipse(leader.x, leader.y + LR * 0.9, LR * 0.9, LR * 0.32, 0, 0, 6.2832);
    c.fill();
    if (!started && phase === "play") {
      const pulse = (t * 0.8) % 1;
      c.strokeStyle = `rgba(27,21,37,${0.5 * (1 - pulse)})`;
      c.lineWidth = 3;
      c.beginPath();
      c.arc(x, y, LR + 6 + pulse * LR * 1.4, 0, 6.2832);
      c.stroke();
    }
    c.fillStyle = PAPER;
    c.beginPath();
    c.arc(x, y, LR, 0, 6.2832);
    c.fill();
    if (avatar && avatar.complete && avatar.naturalWidth) {
      c.save();
      c.beginPath();
      c.arc(x, y, LR - 1, 0, 6.2832);
      c.clip();
      const iw = avatar.naturalWidth;
      // crop to the face
      c.drawImage(avatar, iw * 0.2, iw * 0.07, iw * 0.5, iw * 0.5, x - LR, y - LR, LR * 2, LR * 2);
      c.restore();
    }
    c.strokeStyle = INK;
    c.lineWidth = 3;
    c.beginPath();
    c.arc(x, y, LR, 0, 6.2832);
    c.stroke();
    if (!started && phase === "play") {
      const s = "you";
      c.font = `800 12px ${BODY}`;
      const tw = c.measureText(s).width + 16;
      c.fillStyle = INK;
      c.beginPath();
      c.roundRect(x - tw / 2, y + LR + 8, tw, 20, 10);
      c.fill();
      c.fillStyle = PAPER;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(s, x, y + LR + 18.5);
    }
  }

  let order: Person[] = [];
  function draw() {
    const c = ctx!;
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    drawGround();
    if (shake > 0) c.translate(rand(-1, 1) * shake * 0.5, rand(-1, 1) * shake * 0.5);
    for (const v of venues) drawVenue(v);

    if (order.length !== people.length) order = people.slice();
    order.sort((a, b) => a.y - b.y);
    let ledDrawn = false;
    for (let i = 0; i < order.length; i++) {
      const p = order[i];
      if (!ledDrawn && p.y > leader.y) {
        drawLeader();
        ledDrawn = true;
      }
      const r = R * p.sz * (phase === "end" && p.s === FOLLOW ? endScale : 1);
      let lift = 0;
      if (p.hop >= 0 && p.hop < 1) lift = Math.sin(p.hop * Math.PI) * r * 1.5;
      else if (p.s === IDLE) lift = Math.max(0, Math.sin(p.ph)) * r * 0.12;
      else lift = Math.abs(Math.sin(p.ph)) * r * 0.22;
      const blink = (t * 0.6 + p.ph * 7) % 9 < 0.14;
      drawBlob(c, p.x, p.y, r, p.c, p.fx, p.fy, lift, blink);
    }
    if (!ledDrawn) drawLeader();

    for (const f of floaters) {
      const a = 1 - f.t / 0.7;
      c.globalAlpha = a;
      c.font = `${portrait ? 15 : 18}px ${DISPLAY}`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.lineWidth = 4;
      c.strokeStyle = PAPER;
      c.strokeText(f.s, f.x, f.y - f.t * 46);
      c.fillStyle = INK;
      c.fillText(f.s, f.x, f.y - f.t * 46);
    }
    c.globalAlpha = 1;
    for (const k of confetti) {
      c.save();
      c.translate(k.x, k.y);
      c.rotate(k.r);
      c.fillStyle = PAL[k.c];
      c.fillRect(-5, -3, 10, 6);
      c.strokeStyle = INK;
      c.lineWidth = 1.2;
      c.strokeRect(-5, -3, 10, 6);
      c.restore();
    }
  }

  // ---------- loop ----------
  let raf = 0,
    last = 0,
    onScreen = true,
    gateCleared = false;
  function frame(now: number) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    if (phase !== "gate") update(dt);
    draw();
    paintHud();
    kick();
  }
  function kick() {
    if (raf || !onScreen || document.hidden || !fontReady) return;
    if (phase === "gate") return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  document.addEventListener("visibilitychange", kick);
  new IntersectionObserver(
    (es) => {
      onScreen = es[0].isIntersecting;
      kick();
    },
    { threshold: 0.05 }
  ).observe(stage);

  // ---------- input ----------
  const local = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  let touchId = -1,
    lastTx = 0,
    lastTy = 0;
  stage.addEventListener("pointermove", (e) => {
    if (phase !== "play") return;
    if (e.pointerType === "mouse" || e.pointerType === "pen") {
      const p = local(e);
      if (!pointerSeen) {
        pointerSeen = true;
        // don't lurch on the first event if the pointer is already far away
      }
      leader.tx = p.x;
      leader.ty = p.y;
      started = true;
    } else if (e.pointerId === touchId) {
      const p = local(e);
      leader.tx = clamp(leader.tx + (p.x - lastTx) * 1.7, bounds.l + LR, bounds.r - LR);
      leader.ty = clamp(leader.ty + (p.y - lastTy) * 1.7, bounds.t + LR, bounds.b - LR);
      lastTx = p.x;
      lastTy = p.y;
      started = true;
      e.preventDefault();
    }
  });
  stage.addEventListener("pointerdown", wake);
  canvas.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "touch") {
      touchId = e.pointerId;
      const p = local(e);
      lastTx = p.x;
      lastTy = p.y;
      // anchor the virtual stick to wherever oscar currently is
      leader.tx = leader.x;
      leader.ty = leader.y;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {}
    }
  });
  const endTouch = (e: PointerEvent) => {
    if (e.pointerId === touchId) touchId = -1;
  };
  canvas.addEventListener("pointerup", endTouch);
  canvas.addEventListener("pointercancel", endTouch);

  const KEYMAP: Record<string, string> = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "up",
    ArrowDown: "down",
    a: "left",
    d: "right",
    w: "up",
    s: "down",
    A: "left",
    D: "right",
    W: "up",
    S: "down",
  };
  const inView = () => {
    const r = stage.getBoundingClientRect();
    return r.bottom > innerHeight * 0.45 && r.top < innerHeight * 0.4;
  };
  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (phase === "card") {
      if (
        e.key === "Escape" ||
        ((e.key === "Enter" || e.key === " ") && e.target === document.body)
      ) {
        if (performance.now() - cardOpenedAt > 350) {
          e.preventDefault();
          closeCard();
        }
      }
      return;
    }
    const k = KEYMAP[e.key];
    if (!k || phase !== "play" || !inView()) return;
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    wake();
    keys.add(k);
    e.preventDefault();
  });
  window.addEventListener("keyup", (e) => {
    const k = KEYMAP[e.key];
    if (!k) return;
    keys.delete(k);
    if (!keys.size && phase === "play") {
      leader.tx = leader.x;
      leader.ty = leader.y;
    }
  });
  window.addEventListener("blur", () => keys.clear());

  elCardGo.addEventListener("click", () => closeCard());
  elSound.addEventListener("click", () => {
    muted = !muted;
    try {
      localStorage.setItem("v4f-mute", muted ? "1" : "0");
    } catch {}
    paintSound();
    if (!muted) {
      wake();
      setTimeout(() => tone(note(4), 0.2, 0.05), 60);
    }
  });
  const restart = () => {
    endShown = false;
    endScale = 1;
    reset();
    kick();
    canvas.focus({ preventScroll: true });
  };
  elRestart.addEventListener("click", restart);
  elAgain.addEventListener("click", restart);
  elGatePlay.addEventListener("click", () => {
    gateCleared = true;
    elGate.hidden = true;
    phase = "play";
    stage.dataset.phase = phase;
    wake();
    kick();
  });
  elPips.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest("button");
    if (!b || b.disabled) return;
    if (phase !== "play" && phase !== "end") return;
    openCard(Number(b.dataset.n), true);
  });

  let resizeT = 0;
  new ResizeObserver(() => {
    clearTimeout(resizeT);
    resizeT = window.setTimeout(() => {
      if (!fontReady) return;
      const ow = W,
        oh = H;
      if (!started && phase !== "end") {
        reset();
      } else {
        layout();
        const kx = W / (ow || W),
          ky = H / (oh || H);
        for (const p of people) {
          p.x *= kx;
          p.y *= ky;
          p.tx *= kx;
          p.ty *= ky;
        }
        leader.x *= kx;
        leader.y *= ky;
        leader.tx = leader.x;
        leader.ty = leader.y;
        if (phase === "end") finale();
      }
      draw();
      kick();
    }, 120);
  }).observe(stage);

  // ---------- go ----------
  const fontsOk = document.fonts
    ? Promise.race([
        Promise.all([
          document.fonts.load('160px "Bagel Fat One"'),
          document.fonts.load("800 13px Figtree"),
          document.fonts.load("900 160px Figtree"),
        ]),
        new Promise((r) => setTimeout(r, 1800)),
      ])
    : Promise.resolve();
  fontsOk.then(() => {
    fontReady = true;
    reset();
    if (phase === "gate") {
      elGate.hidden = false;
      draw();
      paintHud();
    }
    stage.dataset.ready = "1";
    kick();
  });

  // debug hook, used for screenshots
  (window as any).__game = {
    get phase() {
      return phase;
    },
    get crew() {
      return followers.length;
    },
    give(k: number) {
      started = true;
      for (let i = 0; i < k; i++) {
        const p = mkPerson(leader.x + rand(-60, 60), leader.y + rand(-60, 60), WANDER);
        people.push(p);
        join(p);
      }
    },
    warp(x: number, y: number) {
      started = true;
      leader.x = leader.tx = x * W;
      leader.y = leader.ty = bounds.t + y * (bounds.b - bounds.t);
    },
    go(i: number) {
      started = true;
      const v = venues[i - 1];
      leader.tx = v.x;
      leader.ty = v.y;
    },
    close: closeCard,
    step(sec: number) {
      for (let i = 0; i < sec * 60; i++) update(1 / 60);
      draw();
      paintHud();
    },
    skipTo(k: number) {
      // unlock doors 1..k instantly
      started = true;
      for (let i = 0; i < k; i++) {
        const v = venues[i];
        if (followers.length < v.need) this.give(v.need - followers.length);
        v.state = 2;
        v.shown = true;
      }
      next = k;
      if (venues[k]) {
        venues[k].state = 1;
        venues[k].shown = true;
      }
      phase = "play";
      paintPips();
    },
    finale,
    restart,
    get clock() {
      return clock;
    },
    // one tick of a very simple bot: chase the nearest person until the next door opens
    auto() {
      if (phase === "card") return closeCard();
      if (phase !== "play") return;
      started = true;
      const v = venues[next];
      if (followers.length >= v.need) {
        leader.tx = v.x;
        leader.ty = v.y;
        return;
      }
      let best: Person | null = null,
        bd = 1e9;
      for (const p of people) {
        if (
          p.s === FOLLOW ||
          p.x < 10 ||
          p.x > W - 10 ||
          p.y < bounds.t + 10 ||
          p.y > bounds.b - 10
        )
          continue;
        const d = Math.hypot(p.x - leader.x, p.y - leader.y);
        if (d < bd) {
          bd = d;
          best = p;
        }
      }
      if (best) {
        leader.tx = best.x;
        leader.ty = best.y;
      }
    },
  };
}
