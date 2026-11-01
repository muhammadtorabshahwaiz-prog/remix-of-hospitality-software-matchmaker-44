import { useEffect } from "react";
import { setDrift } from "@/lib/theme";

const INTERACTIVE = "a,button,[role=button],summary,label[for],.data-row,.btn-primary,.btn-secondary";
const BTN = ".btn-primary,.btn-secondary";

type Hot = { el: HTMLElement; mode: "card" | "btn" };

/**
 * Site-wide mouse reactions, all driven by the current theme. (The old helix / particle-network
 * backdrop that used to live here has been removed; the world-map backdrop will replace it.)
 *  - cards tilt a few degrees toward the cursor, lift, and get a soft spotlight under it
 *  - buttons lean toward the cursor
 *  - the page's CSS vars --px/--py (-1..1) drive heading parallax, and the cursor's x position drifts the hue
 */
export function SiteFx() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = matchMedia("(pointer: fine)").matches;
    let W = innerWidth, H = innerHeight;
    let inside = false, lastMove = -1e9, tx = 0, ty = 0, px = 0, py = 0, pxApplied = 9, pyApplied = 9;

    // ---- slabs tilt, buttons lean ----
    let hot: Hot | null = null, hotRect: DOMRect | null = null, lastInteractive: Element | null = null;
    const clearHot = () => {
      if (!hot) return;
      const el = hot.el;
      el.removeAttribute("data-fx-hot");
      ["--tiltx", "--tilty", "--bx", "--by", "--mx", "--my"].forEach((k) => el.style.removeProperty(k));
      hot = null; hotRect = null;
    };
    const findHot = (target: Element): Hot | null => {
      const b = target.closest<HTMLElement>(BTN);
      if (b) return { el: b, mode: "btn" };
      const c = target.closest<HTMLElement>("[data-fx-card],.slab");
      if (c && !c.hasAttribute("data-no-tilt")) { c.setAttribute("data-fx-card", ""); return { el: c, mode: "card" }; }
      return null;
    };
    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t) return;
      const it = t.closest(INTERACTIVE);
      lastInteractive = it;
      if (!fine || e.pointerType !== "mouse" || reduce) return;
      if (hot && !hot.el.contains(t)) clearHot();
      if (!hot) {
        const found = findHot(t);
        if (found) { hot = found; hotRect = found.el.getBoundingClientRect(); found.el.setAttribute("data-fx-hot", found.mode); }
      }
    };
    const onTilt = (e: PointerEvent) => {
      if (!hot || !hotRect || e.pointerType !== "mouse") return;
      const rx = (e.clientX - hotRect.left) / Math.max(1, hotRect.width) - 0.5;
      const ry = (e.clientY - hotRect.top) / Math.max(1, hotRect.height) - 0.5;
      const s = hot.el.style;
      if (hot.mode === "card") { s.setProperty("--tiltx", `${(-ry * 5).toFixed(2)}deg`); s.setProperty("--tilty", `${(rx * 6).toFixed(2)}deg`); s.setProperty("--mx", `${((rx + 0.5) * 100).toFixed(1)}%`); s.setProperty("--my", `${((ry + 0.5) * 100).toFixed(1)}%`); }
      else { s.setProperty("--bx", `${(rx * 6).toFixed(1)}px`); s.setProperty("--by", `${(ry * 4).toFixed(1)}px`); }
    };
    const onMove = (e: PointerEvent) => {
      tx = e.clientX; ty = e.clientY; inside = true; lastMove = performance.now();
      if (e.pointerType === "mouse") setDrift((e.clientX / Math.max(1, W) - 0.5) * 2);
      onTilt(e);
    };
    const onLeave = () => { inside = false; setDrift(0); clearHot(); };
    const onResize = () => { W = innerWidth; H = innerHeight; };
    const onScroll = () => clearHot();

    // ---- smoothed pointer vars for CSS parallax ----
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (root.dataset.nofx === "1") { clearHot(); return; }
      if (document.hidden) { last = now; return; }
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
      const real = fine && inside && now - lastMove < 4500;
      const gx = real ? (tx / Math.max(1, W) - 0.5) * 2 : 0, gy = real ? (ty / Math.max(1, H) - 0.5) * 2 : 0;
      px += (gx - px) * Math.min(1, dt * 6); py += (gy - py) * Math.min(1, dt * 6);
      if (Math.abs(px - pxApplied) > 0.004 || Math.abs(py - pyApplied) > 0.004) {
        root.style.setProperty("--px", px.toFixed(3)); root.style.setProperty("--py", py.toFixed(3));
        pxApplied = px; pyApplied = py;
      }
    };

    addEventListener("resize", onResize);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    if (!reduce) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", onResize);
      removeEventListener("scroll", onScroll);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      clearHot();
      root.style.removeProperty("--px"); root.style.removeProperty("--py");
    };
  }, []);

  return null;
}
