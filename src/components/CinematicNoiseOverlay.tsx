import { useEffect, useMemo, useRef } from "react";
import type { CSSProperties } from "react";

type CinematicNoiseOverlayProps = {
  enabled?: boolean;
  intensity?: number;
  artifactIntensity?: number;
  fps?: number;
  grainScale?: number;
  className?: string;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function CinematicNoiseOverlay({
  enabled = true,
  intensity = 0.6,
  artifactIntensity = 0.5,
  fps = 20,
  grainScale = 2,
  className,
}: CinematicNoiseOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const cssVars = useMemo(() => {
    const safeIntensity = clamp(intensity, 0, 1);
    const safeArtifact = clamp(artifactIntensity, 0, 1);

    return {
      "--noise-opacity": String(0.12 + safeIntensity * 0.22),
      "--scanline-opacity": String(0.06 + safeIntensity * 0.2),
      "--artifact-opacity": String(0.05 + safeArtifact * 0.35),
      "--artifact-speed": `${(1.3 - safeArtifact * 0.6).toFixed(2)}s`,
      "--flicker-speed": `${(0.22 + (1 - safeIntensity) * 0.28).toFixed(2)}s`,
    } as CSSProperties;
  }, [artifactIntensity, intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: true });
    if (!ctx) return;

    let rafId = 0;
    let lastFrame = 0;
    let imageData: ImageData | null = null;

    const targetFrameTime = 1000 / clamp(fps, 8, 60);

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = clamp(window.devicePixelRatio || 1, 1, 1.5);
      const downsample = clamp(grainScale, 1.5, 4);
      const width = Math.max(1, Math.floor((rect.width * dpr) / downsample));
      const height = Math.max(1, Math.floor((rect.height * dpr) / downsample));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        imageData = ctx.createImageData(width, height);
      }
    };

    const addArtifacts = (buffer: Uint8ClampedArray, width: number, height: number, artifactLevel: number) => {
      if (artifactLevel <= 0) return;

      const scratchCount = Math.max(1, Math.floor(2 + artifactLevel * 6));
      for (let i = 0; i < scratchCount; i += 1) {
        const x = Math.floor(Math.random() * width);
        const alpha = Math.floor(110 + Math.random() * 140 * artifactLevel);
        for (let y = 0; y < height; y += 1) {
          const index = (y * width + x) * 4;
          buffer[index] = 245;
          buffer[index + 1] = 235;
          buffer[index + 2] = 215;
          buffer[index + 3] = alpha;
        }
      }

      const bandCount = Math.max(1, Math.floor(1 + artifactLevel * 4));
      for (let i = 0; i < bandCount; i += 1) {
        const bandY = Math.floor(Math.random() * height);
        const bandHeight = Math.floor(2 + Math.random() * Math.max(3, height * 0.12));
        const bandShift = (Math.random() * 80 - 40) * artifactLevel;

        const yEnd = Math.min(height, bandY + bandHeight);
        for (let y = bandY; y < yEnd; y += 1) {
          for (let x = 0; x < width; x += 1) {
            const index = (y * width + x) * 4;
            const shifted = clamp(buffer[index] + bandShift, 0, 255);
            buffer[index] = shifted;
            buffer[index + 1] = clamp(shifted + 6, 0, 255);
            buffer[index + 2] = clamp(shifted - 8, 0, 255);
            buffer[index + 3] = Math.max(buffer[index + 3], Math.floor(95 + artifactLevel * 110));
          }
        }
      }

      const dropouts = Math.floor(1 + artifactLevel * 5);
      for (let i = 0; i < dropouts; i += 1) {
        const blockW = Math.floor(8 + Math.random() * Math.max(10, width * 0.1));
        const blockH = Math.floor(2 + Math.random() * Math.max(4, height * 0.05));
        const startX = Math.floor(Math.random() * Math.max(1, width - blockW));
        const startY = Math.floor(Math.random() * Math.max(1, height - blockH));

        for (let y = startY; y < startY + blockH; y += 1) {
          for (let x = startX; x < startX + blockW; x += 1) {
            const index = (y * width + x) * 4;
            buffer[index] = clamp(buffer[index] + 38, 0, 255);
            buffer[index + 1] = clamp(buffer[index + 1] + 10, 0, 255);
            buffer[index + 2] = clamp(buffer[index + 2] - 24, 0, 255);
            buffer[index + 3] = Math.max(buffer[index + 3], 150);
          }
        }
      }
    };

    const render = (now: number) => {
      rafId = window.requestAnimationFrame(render);
      if (now - lastFrame < targetFrameTime) return;
      lastFrame = now;

      resizeCanvas();
      if (!imageData) return;

      const { data, width, height } = imageData;
      const grainStrength = 0.45 + clamp(intensity, 0, 1) * 0.55;

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255;
        const tinted = noise * grainStrength;
        data[i] = clamp(tinted + 14, 0, 255);
        data[i + 1] = clamp(tinted + 8, 0, 255);
        data[i + 2] = clamp(tinted - 2, 0, 255);
        data[i + 3] = 255;
      }

      addArtifacts(data, width, height, clamp(artifactIntensity, 0, 1));
      ctx.putImageData(imageData, 0, 0);
    };

    resizeCanvas();
    console.log("Starting cinematic noise overlay with target FPS:", fps);
    rafId = window.requestAnimationFrame(render);
    window.addEventListener("resize", resizeCanvas);

    return () => {
      console.log("Stopping cinematic noise overlay");
      window.removeEventListener("resize", resizeCanvas);
      window.cancelAnimationFrame(rafId);
    };
  }, [artifactIntensity, enabled, fps, grainScale, intensity]);

  return (
    <div className={`cinematic-noise-overlay ${className ?? ""}`} style={cssVars} aria-hidden="true">
      <canvas ref={canvasRef} className="cinematic-noise-canvas" />
      <div className="cinematic-scanlines" />
      <div className="cinematic-artifact-band" />
      <div className="cinematic-vignette" />
    </div>
  );
}
