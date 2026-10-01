let ctx;
// two short beeps made in the browser, so no sound file is needed
export function playAlert() {
  playTone();
}

export function playTone() {
    try {
        const AudioCtx = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
        if (!AudioCtx) return;
        ctx = ctx || new AudioCtx();
        if (ctx.state === "suspended") ctx.resume();
        [0, 0.25].forEach((delay) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = 800;
            gain.gain.value = 0.15;
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + delay);
            osc.stop(ctx.currentTime + delay + 0.18);
        });
    } catch {
        // sound is optional, never break the page for it
    }
}

