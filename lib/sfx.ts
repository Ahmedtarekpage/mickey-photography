/**
 * Tiny Web-Audio sound effects (no audio files). Currently a synthesized
 * camera-shutter "snap" — two quick filtered-noise clicks (mirror up + shutter
 * close) like a DSLR. Lazily creates a single AudioContext and resumes it on
 * first use (browsers block audio until a user gesture).
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

/** One short decaying band-passed noise burst — a mechanical "click". */
function click(c: AudioContext, at: number, dur: number, freq: number, gain: number) {
  const n = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, n, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);

  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = freq;
  bp.Q.value = 0.9;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);

  src.connect(bp).connect(g).connect(c.destination);
  src.start(at);
  src.stop(at + dur);
}

/** Play a camera-shutter snap. Safe to call on every tap. */
export function shutterClick() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume().catch(() => {});
  const t = c.currentTime;
  click(c, t, 0.05, 2300, 0.5); // mirror flips up
  click(c, t + 0.06, 0.075, 1500, 0.42); // shutter closes
}

/** A short, soft tone — a tactile UI "tap" when a card/photo is pressed. */
export function tapSound() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume().catch(() => {});
  const t = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(560, t);
  osc.frequency.exponentialRampToValueAtTime(320, t + 0.09);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.22, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.12);
}

/** A quick airy "whoosh" — played when swiping between photos. */
export function swipeSound() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume().catch(() => {});
  const t = c.currentTime;
  const dur = 0.16;
  const n = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, n, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);

  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1.2;
  bp.frequency.setValueAtTime(900, t);
  bp.frequency.exponentialRampToValueAtTime(2400, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.16, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  src.connect(bp).connect(g).connect(c.destination);
  src.start(t);
  src.stop(t + dur);
}
