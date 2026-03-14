import * as React from 'react';

type DottedSurfaceProps = React.HTMLAttributes<HTMLCanvasElement> & {
  /**
   * Visual density (px between dot centers). Higher = fewer dots.
   */
  spacing?: number;
  /**
   * Dot radius in CSS pixels.
   */
  dotRadius?: number;
  /**
   * Base dot color (alpha is controlled internally).
   */
  dotColor?: string;
  /**
   * Global opacity multiplier for the dots.
   */
  opacity?: number;
  /**
   * Drift speed in px/sec.
   */
  speed?: number;
};

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Animated dotted background surface (canvas) inspired by 21st.dev's DottedSurface.
 * Designed to be lightweight and not interfere with MediaPipe (throttled redraw).
 */
export function DottedSurface({
  className,
  spacing = 24,
  dotRadius = 1.1,
  dotColor = '#ffffff',
  opacity = 0.45,
  speed = 18,
  style,
  ...props
}: DottedSurfaceProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const lastTRef = React.useRef<number>(0);
  const offsetRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Pre-calc values used inside draw loop.
    const draw = (t: number) => {
      if (!lastTRef.current) lastTRef.current = t;
      const dt = (t - lastTRef.current) / 1000;
      lastTRef.current = t;

      // Throttle to ~30fps to minimize CPU and keep MediaPipe happy.
      // Still looks smooth due to small drift + fade.
      if (!prefersReduced && dt < 1 / 32) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      // Drift offsets (wrap so numbers stay small)
      const o = offsetRef.current;
      const step = Math.max(8, spacing);
      o.x = (o.x + speed * dt) % step;
      o.y = (o.y + speed * 0.6 * dt) % step;

      ctx.clearRect(0, 0, w, h);

      // Radial vignette mask like the demo (stronger at edges)
      const cx = w * 0.5;
      const cy = h * 0.5;
      const maxR = Math.hypot(cx, cy);

      ctx.fillStyle = dotColor;

      // Expand one tile to avoid gaps during drift.
      const cols = Math.ceil(w / step) + 2;
      const rows = Math.ceil(h / step) + 2;

      for (let yi = -1; yi < rows; yi++) {
        const y = yi * step + o.y;
        for (let xi = -1; xi < cols; xi++) {
          const x = xi * step + o.x;

          const dist = Math.hypot(x - cx, y - cy) / maxR; // 0..1
          // Keep center visible, fade towards edges.
          const vignette = 1 - smoothstep(0.25, 1, dist);
          const a = opacity * vignette;
          if (a <= 0.002) continue;

          ctx.globalAlpha = a;
          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      rafRef.current = prefersReduced ? null : requestAnimationFrame(draw);
    };

    rafRef.current = prefersReduced ? null : requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [dotColor, dotRadius, opacity, spacing, speed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{
        pointerEvents: 'none',
        transform: 'translate3d(0,0,0)',
        willChange: 'transform',
        ...style,
      }}
      {...props}
    />
  );
}

