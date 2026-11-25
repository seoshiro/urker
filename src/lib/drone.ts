// A synthesised steppe wind: band-passed noise whose centre frequency and level wander slowly,
// over a low open fifth. Nothing is downloaded; everything is generated in the AudioContext.

export interface Drone {
  setOn(on: boolean): void;
  dispose(): void;
}

export function createDrone(): Drone {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // Two seconds of pink-ish noise, looped.
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    last = 0.97 * last + 0.03 * (Math.random() * 2 - 1);
    data[i] = last * 3.2;
  }

  const wind = (centre: number, q: number, level: number, lfoRate: number) => {
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src.playbackRate.value = 0.7 + Math.random() * 0.5;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = centre;
    band.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.value = level;
    // Gusts: slow oscillators move the filter and the level.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = lfoRate;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = centre * 0.45;
    lfo.connect(lfoDepth).connect(band.frequency);
    const gust = ctx.createOscillator();
    gust.frequency.value = lfoRate * 0.61;
    const gustDepth = ctx.createGain();
    gustDepth.gain.value = level * 0.6;
    gust.connect(gustDepth).connect(gain.gain);
    src.connect(band).connect(gain).connect(master);
    src.start();
    lfo.start();
    gust.start();
  };
  wind(420, 1.4, 0.55, 0.07);
  wind(900, 3.5, 0.22, 0.11);
  wind(180, 0.9, 0.4, 0.05);

  for (const f of [55, 82.4]) {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.value = 0.05;
    o.connect(g).connect(master);
    o.start();
  }

  return {
    setOn(on) {
      if (on) void ctx.resume();
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(on ? 0.5 : 0, t + (on ? 2.5 : 1.2));
    },
    dispose() {
      void ctx.close();
    },
  };
}
