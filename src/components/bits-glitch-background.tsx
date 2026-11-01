import { useEffect, useRef } from "react";
import { getVisual } from "@/lib/theme";

const GLYPHS = "01010101{}</>=;#01";
const CELL_X = 22;
const CELL_Y = 24;

type Column = { y: number; speed: number; seed: number };

/**
 * Software-flavoured backdrop: slow columns of bits, a few tinted by the accent colour. They flee from the cursor.
 * Every few seconds the "screen" glitches: bits freeze, horizontal bands tear sideways with red/cyan fringes,
 * and the page gets a `glitch` class for a moment (see index.css). Reduced motion gets a still frame only.
 */
export function BitsGlitchBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = matchMedia("(pointer: fine)").matches;
    const root = document.documentElement;

    let W = 0, H = 0, dpr = 1, cols: Column[] = [];
    let frame = 0, last = 0, clock = 0;
    let mx = -9999, my = -9999;
    let glitchUntil = 0, nextGlitch = performance.now() + 30000, glitchSeed = 0;
    let bands: { y: number; h: number; dx: number }[] = [];
    let frozen = 0;

    const build = () => {
      const n = Math.ceil(W / CELL_X);
      cols = Array.from({ length: n }, (_, i) => ({ y: Math.random() * H, speed: 10 + ((i * 37) % 23), seed: i * 12.9898 }));
    };
    const resize = () => {
      W = innerWidth; H = innerHeight; dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };
    const onMove = (e: PointerEvent) => { if (e.pointerType === "mouse") { mx = e.clientX; my = e.clientY; } };
    const onLeave = () => { mx = -9999; my = -9999; };

    const startGlitch = (now: number) => {
      const len = 180 + Math.random() * 260;
      glitchUntil = now + len; glitchSeed = Math.random() * 1000;
      bands = Array.from({ length: 5 + ((Math.random() * 5) | 0) }, () => ({ y: Math.random() * H, h: 6 + Math.random() * 46, dx: (Math.random() - .5) * 90 }));
      root.classList.add("glitch");
      setTimeout(() => root.classList.remove("glitch"), len + 40);
      nextGlitch = now + len + 60000 + Math.random() * 90000; // at least 1 minute apart, random after that
    };

    const paintBits = (now: number, dt: number) => {
      const v = getVisual(), light = v.mode === "light";
      g.clearRect(0, 0, W, H);
      g.font = "500 14px 'IBM Plex Mono', monospace";
      g.textAlign = "center"; g.textBaseline = "middle";
      const base = light ? "hsl(" + v.hsl + ",50%,32%)" : "hsl(" + v.hsl + ",60%,72%)";
      for (let i = 0; i < cols.length; i++) {
        const c = cols[i]!;
        if (!frozen) c.y = (c.y + c.speed * dt) % (H + CELL_Y * 8);
        const x = i * CELL_X + CELL_X / 2;
        for (let k = 0; k < 9; k++) {
          const y = c.y - k * CELL_Y;
          if (y < -CELL_Y || y > H + CELL_Y) continue;
          let px = x, py = y, a = (light ? .32 : .16) * (1 - k / 9);
          const dx = x - mx, dy = y - my, d = Math.hypot(dx, dy);
          if (d < 170) { // cursor pushes the bits away and lights them up
            const f = 1 - d / 170;
            px += (dx / (d || 1)) * f * 26; py += (dy / (d || 1)) * f * 26;
            a = Math.min(.8, a + f * .55);
          }
          const idx = Math.floor((c.seed + Math.floor(now / 520) * (k + 3) + k * 7)) % GLYPHS.length;
          g.globalAlpha = a;
          g.fillStyle = k === 0 || d < 170 ? "hsl(" + v.hsl + "," + (light ? 80 : 90) + "%," + (light ? 46 : 70) + "%)" : base;
          g.fillText(GLYPHS[Math.abs(idx)]!, px, py);
        }
      }
      g.globalAlpha = 1;
    };

    const paintGlitch = (now: number) => {
      // Tear bands of the current frame sideways and fringe them red/cyan.
      const sx = (n: number) => Math.sin(glitchSeed + n * 91.7 + Math.floor(now / 60) * 13.1);
      bands.forEach((b, i) => {
        const dx = b.dx * sx(i);
        const sy = Math.max(0, Math.floor(b.y * dpr)), sh = Math.max(1, Math.floor(b.h * dpr));
        if (sy + sh > canvas.height) return;
        g.save();
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.globalAlpha = .9;
        g.drawImage(canvas, 0, sy, canvas.width, sh, dx * dpr, sy, canvas.width, sh);
        g.globalCompositeOperation = "source-over";
        g.globalAlpha = .16;
        g.fillStyle = i % 2 ? "rgb(255,40,90)" : "rgb(20,220,255)";
        g.fillRect(0, sy, canvas.width, sh);
        g.restore();
      });
      // a few blocky colour fragments, like a broken video frame
      for (let i = 0; i < 4; i++) {
        const r = Math.abs(sx(i + 20));
        g.fillStyle = i % 2 ? "rgba(255,40,90,.14)" : "rgba(20,220,255,.14)";
        g.fillRect(((r * 977) % 1) * W, ((r * 613) % 1) * H, 40 + r * 160, 4 + r * 18);
      }
    };

    const render = (now: number) => {
      frame = requestAnimationFrame(render);
      if (document.hidden) { last = now; return; }
      if (now - last < 1000 / 30) return;
      const dt = Math.min(.1, (now - last) / 1000); last = now; clock += dt;
      if (now >= nextGlitch && now >= glitchUntil) {
        // never glitch while the nucleus is charging, exploding or being reborn; try again shortly
        if (root.dataset.coreBusy === "1" || root.dataset.nofx === "1" || root.dataset.calm === "1") nextGlitch = now + 4000;
        else startGlitch(now);
      }
      frozen = now < glitchUntil ? 1 : 0;
      paintBits(now, dt);
      if (frozen) paintGlitch(now);
    };

    resize();
    addEventListener("resize", resize);
    if (fine) { addEventListener("pointermove", onMove, { passive: true }); document.addEventListener("pointerleave", onLeave); }
    if (reduced) paintBits(0, 0); else frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      root.classList.remove("glitch");
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}
