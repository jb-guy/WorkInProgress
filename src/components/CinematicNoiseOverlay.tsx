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

// ── WebGL shaders ──────────────────────────────────────────────────────────
// All per-pixel work (grain + artifacts) runs on the GPU.
// The CPU only generates a handful of artifact positions per frame.

const VERT_SRC = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG_SRC = `
precision mediump float;

uniform float uTime;
uniform float uGrainStrength;
uniform float uArtifactLevel;
uniform vec2  uResolution;

uniform int   uScratchCount;
uniform float uScratchX[8];
uniform float uScratchAlpha[8];

uniform int   uBandCount;
uniform float uBandY[5];
uniform float uBandH[5];
uniform float uBandShift[5];

uniform int   uDropoutCount;
uniform float uDropoutX[6];
uniform float uDropoutY[6];
uniform float uDropoutW[6];
uniform float uDropoutH[6];

// Fast hash – different result every frame because uTime changes
float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

void main() {
  float pixX = gl_FragCoord.x;
  float pixY = uResolution.y - gl_FragCoord.y; // top-down y

  // Film grain
  float noise   = hash(gl_FragCoord.xy + fract(uTime * 100.0));
  float tinted  = noise * uGrainStrength;
  vec4 color = vec4(
    clamp(tinted + 14.0 / 255.0, 0.0, 1.0),
    clamp(tinted +  8.0 / 255.0, 0.0, 1.0),
    clamp(tinted -  2.0 / 255.0, 0.0, 1.0),
    1.0
  );

  // Vertical scratches
  for (int i = 0; i < 8; i++) {
    if (i >= uScratchCount) break;
    if (abs(pixX - uScratchX[i] * uResolution.x) < 0.5) {
      color = vec4(215.0/255.0, 205.0/255.0, 185.0/255.0, uScratchAlpha[i]);
    }
  }

  // Horizontal bands (colour shift)
  for (int i = 0; i < 5; i++) {
    if (i >= uBandCount) break;
    float y1 = uBandY[i] * uResolution.y;
    float y2 = y1 + uBandH[i] * uResolution.y;
    if (pixY >= y1 && pixY < y2) {
      float s = uBandShift[i];
      color = vec4(
        clamp(color.r + s + 6.0/255.0,  0.0, 1.0),
        clamp(color.g + s,               0.0, 1.0),
        clamp(color.b + s - 8.0/255.0,  0.0, 1.0),
        max(color.a, (95.0 + uArtifactLevel * 110.0) / 255.0)
      );
    }
  }

  // Block dropouts (warm rectangle glitches)
  for (int i = 0; i < 6; i++) {
    if (i >= uDropoutCount) break;
    float x1 = uDropoutX[i] * uResolution.x;
    float y1 = uDropoutY[i] * uResolution.y;
    float x2 = x1 + uDropoutW[i] * uResolution.x;
    float y2 = y1 + uDropoutH[i] * uResolution.y;
    if (pixX >= x1 && pixX < x2 && pixY >= y1 && pixY < y2) {
      color = vec4(
        clamp(color.r + 38.0/255.0, 0.0, 1.0),
        clamp(color.g + 10.0/255.0, 0.0, 1.0),
        clamp(color.b - 24.0/255.0, 0.0, 1.0),
        max(color.a, 150.0/255.0)
      );
    }
  }

  gl_FragColor = color;
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  return shader;
}

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

    const gl = (canvas.getContext("webgl") ?? canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return;

    // ── Compile & link program ──
    const vert = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    const program = gl.createProgram()!;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    gl.useProgram(program);
    // Shaders are no longer needed after linking
    gl.detachShader(program, vert);
    gl.detachShader(program, frag);
    gl.deleteShader(vert);
    gl.deleteShader(frag);

    // ── Full-screen quad ──
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // ── Cache uniform locations ──
    const uTime          = gl.getUniformLocation(program, "uTime");
    const uGrainStrength = gl.getUniformLocation(program, "uGrainStrength");
    const uArtifactLevel = gl.getUniformLocation(program, "uArtifactLevel");
    const uResolution    = gl.getUniformLocation(program, "uResolution");
    const uScratchCount  = gl.getUniformLocation(program, "uScratchCount");
    const uScratchX      = gl.getUniformLocation(program, "uScratchX");
    const uScratchAlpha  = gl.getUniformLocation(program, "uScratchAlpha");
    const uBandCount     = gl.getUniformLocation(program, "uBandCount");
    const uBandY         = gl.getUniformLocation(program, "uBandY");
    const uBandH         = gl.getUniformLocation(program, "uBandH");
    const uBandShift     = gl.getUniformLocation(program, "uBandShift");
    const uDropoutCount  = gl.getUniformLocation(program, "uDropoutCount");
    const uDropoutX      = gl.getUniformLocation(program, "uDropoutX");
    const uDropoutY      = gl.getUniformLocation(program, "uDropoutY");
    const uDropoutW      = gl.getUniformLocation(program, "uDropoutW");
    const uDropoutH      = gl.getUniformLocation(program, "uDropoutH");

    // Pre-allocate typed arrays to avoid GC churn inside the render loop
    const scratchXArr   = new Float32Array(8);
    const scratchAlpArr = new Float32Array(8);
    const bandYArr      = new Float32Array(5);
    const bandHArr      = new Float32Array(5);
    const bandShiftArr  = new Float32Array(5);
    const dropXArr      = new Float32Array(6);
    const dropYArr      = new Float32Array(6);
    const dropWArr      = new Float32Array(6);
    const dropHArr      = new Float32Array(6);

    const safeArtifact   = clamp(artifactIntensity, 0, 1);
    const grainStrength  = 0.45 + clamp(intensity, 0, 1) * 0.55;
    const targetFrameTime = 1000 / clamp(fps, 8, 60);

    let rafId    = 0;
    let lastFrame = 0;

    const resizeCanvas = () => {
      const rect       = canvas.getBoundingClientRect();
      const dpr        = clamp(window.devicePixelRatio || 1, 1, 1.5);
      const downsample = clamp(grainScale, 1.5, 4);
      const width      = Math.max(1, Math.floor((rect.width  * dpr) / downsample));
      const height     = Math.max(1, Math.floor((rect.height * dpr) / downsample));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width  = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const render = (now: number) => {
      rafId = window.requestAnimationFrame(render);
      if (now - lastFrame < targetFrameTime) return;
      lastFrame = now;

      resizeCanvas();
      const w = canvas.width;
      const h = canvas.height;

      // Generate artifact params on CPU — just positions/sizes, not per-pixel
      const scratchCount = safeArtifact > 0 ? Math.max(1, Math.floor(2 + safeArtifact * 6)) : 0;
      for (let i = 0; i < scratchCount; i++) {
        scratchXArr[i]   = Math.random();
        scratchAlpArr[i] = (110 + Math.random() * 250 * safeArtifact) / 255;
      }

      const bandCount = safeArtifact > 0 ? Math.max(1, Math.floor(1 + safeArtifact * 4)) : 0;
      for (let i = 0; i < bandCount; i++) {
        bandYArr[i]     = Math.random();
        bandHArr[i]     = (2 + Math.random() * Math.max(3, h * 0.12)) / h;
        bandShiftArr[i] = (Math.random() * 80 - 40) * safeArtifact / 255;
      }

      const dropoutCount = safeArtifact > 0 ? Math.floor(1 + safeArtifact * 5) : 0;
      for (let i = 0; i < dropoutCount; i++) {
        const bw     = (8 + Math.random() * Math.max(10, w * 0.1)) / w;
        const bh     = (2 + Math.random() * Math.max(4,  h * 0.05)) / h;
        dropXArr[i]  = Math.random() * Math.max(0, 1 - bw);
        dropYArr[i]  = Math.random() * Math.max(0, 1 - bh);
        dropWArr[i]  = bw;
        dropHArr[i]  = bh;
      }

      // Upload uniforms & draw — GPU handles every pixel
      gl.uniform1f(uTime,          now * 0.001);
      gl.uniform1f(uGrainStrength, grainStrength);
      gl.uniform1f(uArtifactLevel, safeArtifact);
      gl.uniform2f(uResolution,    w, h);

      gl.uniform1i(uScratchCount, scratchCount);
      gl.uniform1fv(uScratchX,    scratchXArr);
      gl.uniform1fv(uScratchAlpha, scratchAlpArr);

      gl.uniform1i(uBandCount, bandCount);
      gl.uniform1fv(uBandY,    bandYArr);
      gl.uniform1fv(uBandH,    bandHArr);
      gl.uniform1fv(uBandShift, bandShiftArr);

      gl.uniform1i(uDropoutCount, dropoutCount);
      gl.uniform1fv(uDropoutX,    dropXArr);
      gl.uniform1fv(uDropoutY,    dropYArr);
      gl.uniform1fv(uDropoutW,    dropWArr);
      gl.uniform1fv(uDropoutH,    dropHArr);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    resizeCanvas();
    rafId = window.requestAnimationFrame(render);
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.cancelAnimationFrame(rafId);
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
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
