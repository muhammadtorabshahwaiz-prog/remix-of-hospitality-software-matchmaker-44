import { useEffect, useRef } from "react";
import { getVisual } from "@/lib/theme";

type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; hue: number }; // hue = offset from the theme hue
type Wave = { x: number; y: number; t: number };

const INTERACTIVE = "a,button,[role=button],summary,label[for],.data-row,.btn-primary,.btn-secondary";

/** Site-wide electric cursor: glowing orb, trailing sparks, lightning to hovered controls, click shockwaves. */
export function CursorFx() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const fine = matchMedia("(pointer: fine)").matches;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    const g = canvas.getContext("2d");
    if (!g) return;

    document.documentElement.classList.add("cursor-fx");
    let W = 0, H = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener("resize", resize);

    let th = 192, light = false;   // current theme hue and mode, refreshed every frame
    const L = (dark: number) => (light ? Math.round(dark * 0.55) : dark);
    const m = { x: -100, y: -100, px: -100, py: -100, in: false, hide: false };
    let target: Element | null = null;
    let glow = 0;          // 0..1 hover intensity
    let rect: DOMRect | null = null;
    const sparks: Spark[] = [];
    const waves: Wave[] = [];

    const onMove = (e: PointerEvent) => {
      m.x = e.clientX; m.y = e.clientY; m.in = true;
      const t = e.target as Element | null;
      m.hide = !!t && (t.tagName === "CANVAS" || !!t.closest("input,textarea,select,[contenteditable=true]"));
      target = t ? t.closest(INTERACTIVE) : null;
      rect = target ? target.getBoundingClientRect() : null;
    };
    const onDown = (e: PointerEvent) => {
      if (m.hide) return;
      waves.push({ x: e.clientX, y: e.clientY, t: 0 });
      for (let i = 0; i < 16; i++) {
        const a = Math.random() * 6.283, v = 80 + Math.random() * 220;
        sparks.push({ x: e.clientX, y: e.clientY, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: .5 + Math.random() * .5, hue: 30 + Math.random() * 25 });
      }
    };
    const onLeave = () => { m.in = false; };
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    let last = performance.now(), t = 0, raf = 0;
    const bolt = (x0: number, y0: number, x1: number, y1: number, amp: number, alpha: number) => {
      const n = 9, dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
      g.beginPath(); g.moveTo(x0, y0);
      for (let i = 1; i < n; i++) {
        const u = i / n, o = (Math.random() - .5) * amp * Math.sin(u * Math.PI);
        g.lineTo(x0 + dx * u + nx * o, y0 + dy * u + ny * o);
      }
      g.lineTo(x1, y1);
      g.strokeStyle = `hsla(${th},100%,${L(88)}%,${alpha})`; g.lineWidth = 1.2; g.stroke();
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (document.documentElement.dataset.nofx === "1") {
        g.clearRect(0, 0, W, H);
        document.documentElement.classList.remove("cursor-fx");
        return;
      }
      document.documentElement.classList.add("cursor-fx");
      const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
      g.clearRect(0, 0, W, H);
      const vis = getVisual(); th = vis.hsl; light = vis.mode === "light";
      const speed = Math.hypot(m.x - m.px, m.y - m.py);
      // trail sparks
      if (m.in && !m.hide && speed > 1.5) {
        for (let i = 0; i < Math.min(4, 1 + speed / 14); i++) {
          const a = Math.random() * 6.283, v = 10 + Math.random() * 40;
          sparks.push({ x: m.x, y: m.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: .35 + Math.random() * .45, hue: -10 + Math.random() * 20 });
        }
      }
      m.px = m.x; m.py = m.y;
      glow += ((target ? 1 : 0) - glow) * Math.min(1, dt * 10);
      g.globalCompositeOperation = light ? "source-over" : "lighter";

      // hovered control: glowing outline + lightning from orb to its nearest edge
      if (rect && !m.hide && glow > .02) {
        g.strokeStyle = `hsla(${th},100%,${L(64)}%,${.55 * glow})`; g.lineWidth = 1.5;
        g.strokeRect(rect.left - 3, rect.top - 3, rect.width + 6, rect.height + 6);
        const ex = Math.max(rect.left, Math.min(m.x, rect.right)), ey = Math.max(rect.top, Math.min(m.y, rect.bottom));
        if (Math.hypot(ex - m.x, ey - m.y) > 3) bolt(m.x, m.y, ex, ey, 14, .8 * glow);
      }

      // sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]; s.life += dt;
        if (s.life >= s.max) { sparks.splice(i, 1); continue; }
        s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= .94; s.vy *= .94;
        const k = 1 - s.life / s.max;
        g.fillStyle = `hsla(${th + s.hue},100%,${L(70)}%,${k * .9})`;
        g.beginPath(); g.arc(s.x, s.y, 1 + 1.6 * k, 0, 6.283); g.fill();
      }
      // click shockwaves
      for (let i = waves.length - 1; i >= 0; i--) {
        const w = waves[i]; w.t += dt;
        if (w.t > .7) { waves.splice(i, 1); continue; }
        const k = w.t / .7;
        g.strokeStyle = `hsla(${th + 42},100%,${L(68)}%,${(1 - k) * .8})`; g.lineWidth = 2 * (1 - k) + .5;
        g.beginPath(); g.arc(w.x, w.y, 8 + k * 70, 0, 6.283); g.stroke();
      }

      // the orb itself
      if (m.in && !m.hide) {
        const r = 7 + 5 * glow + Math.min(speed, 30) * .12;
        // flat, solid orb: a faint disc, a bright core and a hard ring (no gradient)
        g.fillStyle = `hsla(${th},100%,${L(62)}%,.16)`; g.beginPath(); g.arc(m.x, m.y, r * 1.9, 0, 6.283); g.fill();
        g.fillStyle = `hsla(${th},100%,${L(82)}%,.95)`; g.beginPath(); g.arc(m.x, m.y, r * .62, 0, 6.283); g.fill();
        g.strokeStyle = `hsla(${th},100%,${L(78)}%,.7)`; g.lineWidth = 1.2; g.beginPath(); g.arc(m.x, m.y, r * 1.9, 0, 6.283); g.stroke();
        for (let i = 0; i < 2 + Math.round(glow * 3); i++) {
          const a = Math.random() * 6.283, l = r * (1.3 + Math.random() * 1.6);
          bolt(m.x, m.y, m.x + Math.cos(a) * l, m.y + Math.sin(a) * l, r * .8, .5 + Math.random() * .4);
        }
        for (let i = 0; i < 3; i++) {
          const a = t * (2 + i * .7) + i * 2.1, rr = r * (1.6 + i * .35);
          g.fillStyle = `hsla(${th},100%,${L(92)}%,.9)`;
          g.beginPath(); g.arc(m.x + Math.cos(a) * rr, m.y + Math.sin(a) * rr * .8, 1.4, 0, 6.283); g.fill();
        }
      }
      g.globalCompositeOperation = "source-over";
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("cursor-fx");
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[90] h-full w-full" aria-hidden="true" />;
}
