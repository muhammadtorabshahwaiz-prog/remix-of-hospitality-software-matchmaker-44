import { useEffect, useRef } from "react";
import { MAP_RUNS } from "@/lib/world-map-data";
import { getVisual } from "@/lib/theme";

const ROUTES: [number, number][][] = [
  [[-122.4, 37.8], [-74, 40.7]],
  [[-0.1, 51.5], [55.3, 25.2]],
  [[72.8, 19.1], [103.8, 1.35]],
  [[151.2, -33.9], [139.7, 35.7]],
  [[-46.6, -23.5], [3.4, 6.5]],
  [[116.4, 39.9], [127, 37.6]],
];

type Dot = { lon: number; lat: number; tier: number };

function buildDots(): Dot[] {
  const dots: Dot[] = [];
  MAP_RUNS.forEach((runs, row) => {
    const lat = 89.5 - row;
    runs.forEach(([start, length]) => {
      for (let column = start; column < start + length; column += 1) {
        dots.push({ lon: -180 + column + 0.5, lat, tier: (row * 7 + column * 13) % 3 });
      }
    });
  });
  return dots;
}

/** A quiet, wordless world network that remains behind every page. */
export function WorldMapBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dots = buildDots();
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let lastPaint = 0;

    const resize = () => {
      width = innerWidth;
      height = innerHeight;
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    const render = (now: number) => {
      if (!reduced) frame = requestAnimationFrame(render);
      if (!reduced && now - lastPaint < 1000 / 30) return;
      lastPaint = now;
      const time = reduced ? 0 : now / 1000;
      const scale = Math.max(width / 250, height / 155);
      const centerLon = reduced ? 15 : (15 + time * 0.7) % 360;
      const centerLat = 24;
      const centerX = width * 0.52;
      const centerY = height * 0.49;
      const point = (lon: number, lat: number) => {
        const relativeLon = ((lon - centerLon + 540) % 360) - 180;
        return [centerX + relativeLon * scale, centerY + (centerLat - lat) * scale] as const;
      };

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      const size0 = Math.max(1.2, Math.min(2.7, scale * 0.3));
      const visual = getVisual(), light = visual.mode === "light";
      const size = size0 * (light ? 1.25 : 1);
      const alphas = light ? [0.22, 0.34, 0.5] : [0.11, 0.16, 0.23];
      for (let tier = 0; tier < 3; tier += 1) {
        context.fillStyle = light ? `hsla(${visual.hsl}, 55%, 32%, ${alphas[tier]})` : `rgba(174, 188, 199, ${alphas[tier]})`;
        context.beginPath();
        dots.forEach((dot) => {
          if (dot.tier !== tier) return;
          const [x, y] = point(dot.lon, dot.lat);
          if (x < -4 || x > width + 4 || y < -4 || y > height + 4) return;
          context.rect(x - size / 2, y - size / 2, size, size);
        });
        context.fill();
      }

      ROUTES.forEach(([from, to], index) => {
        const [x1, y1] = point(from[0], from[1]);
        const [rawX2, y2] = point(to[0], to[1]);
        let x2 = rawX2;
        if (Math.abs(x2 - x1) > 180 * scale) x2 += x2 > x1 ? -360 * scale : 360 * scale;
        if (Math.max(x1, x2) < -80 || Math.min(x1, x2) > width + 80) return;
        const distance = Math.hypot(x2 - x1, y2 - y1);
        const controlX = (x1 + x2) / 2;
        const controlY = (y1 + y2) / 2 - Math.min(90, distance * 0.18);
        const at = (u: number) => {
          const v = 1 - u;
          return [v * v * x1 + 2 * v * u * controlX + u * u * x2, v * v * y1 + 2 * v * u * controlY + u * u * y2] as const;
        };
        context.strokeStyle = light ? `hsla(${visual.hsl}, 80%, 38%, 0.4)` : `hsla(${visual.hsl}, 90%, 70%, 0.1)`;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(x1, y1);
        context.quadraticCurveTo(controlX, controlY, x2, y2);
        context.stroke();
        const progress = reduced ? 0.55 : (time * (0.055 + index * 0.004) + index * 0.16) % 1;
        for (let trail = 7; trail >= 0; trail -= 1) {
          const u = progress - trail * 0.009;
          if (u < 0) continue;
          const [x, y] = at(u);
          context.fillStyle = light ? `hsla(${visual.hsl}, 85%, 38%, ${0.2 + (7 - trail) * 0.1})` : `hsla(${visual.hsl}, 90%, 72%, ${0.08 + (7 - trail) * 0.055})`;
          context.beginPath();
          context.arc(x, y, trail === 0 ? 2 : 1.1, 0, Math.PI * 2);
          context.fill();
        }
      });
    };

    resize();
    addEventListener("resize", resize);
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}
