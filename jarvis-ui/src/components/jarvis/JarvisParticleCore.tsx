"use client";

import { cn } from "@/components/ui/utils";
import type { JarvisVoiceMode } from "@/features/jarvis/voice-mode";
import { useEffect, useRef } from "react";

type JarvisParticleCoreProps = {
  mode: JarvisVoiceMode;
  speechEnergy?: number;
  className?: string;
};

type SwingPoint = {
  x: number;
  y: number;
  radian: number;
  range: number;
  phase: number;
};

type GradientStop = {
  position: number;
  color: string;
};

const POINTS = 12;
const LAYERS = 3;

function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

export function JarvisParticleCore({
  mode,
  speechEnergy = 0,
  className,
}: JarvisParticleCoreProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const pi = Math.PI;

    let rafId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let centerX = 0;
    let centerY = 0;
    let baseOrbRadius = 0;
    let currentOrbRadius = 0;
    let orbSizeMultiplier = 0.9;
    let voiceIntensity = 0;
    let targetIntensity = 0;
    let tick = 0;
    let circles: SwingPoint[][] = [];

    const createGradient = (
      angle: number,
      colorStops: GradientStop[],
      radius: number,
    ) => {
      const angleRad = ((angle - 90) * Math.PI) / 180;
      const startX = centerX - Math.cos(angleRad) * radius;
      const startY = centerY - Math.sin(angleRad) * radius;
      const endX = centerX + Math.cos(angleRad) * radius;
      const endY = centerY + Math.sin(angleRad) * radius;

      const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
      colorStops.forEach((stop) => {
        gradient.addColorStop(stop.position / 100, stop.color);
      });

      return gradient;
    };

    const drawCurve = (points: SwingPoint[], fillStyle: CanvasGradient) => {
      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      ctx.moveTo(
        (points[points.length - 1].x + points[0].x) / 2,
        (points[points.length - 1].y + points[0].y) / 2,
      );

      for (let index = 0; index < points.length; index += 1) {
        const nextIndex = (index + 1) % points.length;
        ctx.quadraticCurveTo(
          points[index].x,
          points[index].y,
          (points[index].x + points[nextIndex].x) / 2,
          (points[index].y + points[nextIndex].y) / 2,
        );
      }

      ctx.closePath();
      ctx.fill();
    };

    const drawMainOrb = () => {
      const blurAmount =
        mode === "speaking"
          ? 14 + voiceIntensity * 12
          : 12 + voiceIntensity * 8;
      ctx.filter = `blur(${blurAmount}px)`;

      const gradient = createGradient(
        98,
        [
          { position: 4, color: "rgba(226, 252, 255, 0.95)" },
          { position: 50, color: "rgba(177, 233, 255, 0.88)" },
          { position: 99, color: "rgba(129, 214, 255, 0.82)" },
        ],
        currentOrbRadius,
      );

      ctx.globalAlpha =
        mode === "speaking"
          ? Math.min(1, 0.92 + voiceIntensity * 0.1)
          : 0.9 + voiceIntensity * 0.1;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentOrbRadius, 0, pi * 2);
      ctx.fill();

      ctx.filter = "none";
      ctx.globalAlpha = 1;
    };

    const drawSpeakingRays = (_time: number) => undefined;

    const drawSpeakingShockwaves = (time: number) => {
      if (mode !== "speaking") {
        return;
      }

      const waves = 2;
      for (let waveIndex = 0; waveIndex < waves; waveIndex += 1) {
        const progress =
          (time * (0.62 + voiceIntensity * 0.35) + waveIndex * 0.22) % 1;
        const radius =
          currentOrbRadius * (1.12 + progress * (1.0 + voiceIntensity * 0.45));
        const alpha = (1 - progress) * (0.16 + voiceIntensity * 0.14);

        ctx.beginPath();
        ctx.lineWidth = 1.2 - waveIndex * 0.2;
        ctx.strokeStyle = `rgba(152, 241, 255, ${Math.max(0.05, alpha)})`;
        ctx.arc(centerX, centerY, radius, 0, pi * 2);
        ctx.stroke();
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;

      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);

      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      centerX = width / 2;
      centerY = height / 2;
      baseOrbRadius = Math.min(width, height) * 0.34;
      currentOrbRadius = baseOrbRadius * 0.9;

      circles = Array.from({ length: LAYERS }, () => {
        return Array.from({ length: POINTS }, (_, index) => {
          const radian = ((pi * 2) / POINTS) * index;
          return {
            x: centerX + currentOrbRadius * Math.cos(radian),
            y: centerY + currentOrbRadius * Math.sin(radian),
            radian,
            range: random(5, 15) * (Math.min(width, height) / 400),
            phase: random(0, pi * 2),
          };
        });
      });
    };

    resize();

    const animate = (timestamp: number) => {
      const time = timestamp * 0.001;
      const isSpeaking = mode === "speaking";
      ctx.clearRect(0, 0, width, height);
      if (mode === "speaking") {
        const speakingWave =
          0.45 +
          Math.abs(Math.sin(time * 4.8)) * 0.22 +
          Math.abs(Math.sin(time * 11.2)) * 0.2;
        targetIntensity = clamp(
          Math.max(speakingWave, speechEnergy * 2.1),
          0.32,
          1,
        );
      } else if (mode === "listening") {
        targetIntensity = 0.14;
      } else {
        targetIntensity = 0;
      }

      const responseSmoothing = isSpeaking ? 0.2 : 0.1;
      voiceIntensity += (targetIntensity - voiceIntensity) * responseSmoothing;

      const targetSize = mode === "idle" ? 0.9 : isSpeaking ? 1.05 : 1;
      orbSizeMultiplier += (targetSize - orbSizeMultiplier) * 0.08;

      const idlePulse = Math.sin(tick * 0.02) * 0.015;
      const voicePulse = voiceIntensity * (isSpeaking ? 0.58 : 0.35);
      const pulseScale = orbSizeMultiplier * (1 + idlePulse + voicePulse);
      currentOrbRadius = baseOrbRadius * pulseScale;

      const shakeAmount =
        isSpeaking && voiceIntensity > 0.2
          ? (0.2 + voiceIntensity * 1.4) * (0.35 + speechEnergy * 0.6)
          : 0;
      const shakeX = (Math.random() * 2 - 1) * shakeAmount;
      const shakeY = (Math.random() * 2 - 1) * shakeAmount;

      ctx.save();
      if (isSpeaking) {
        ctx.translate(shakeX, shakeY);
      }

      circles.forEach((swingPoints, layerIndex) => {
        swingPoints.forEach((point) => {
          point.phase +=
            random(1, 10) *
            -0.005 *
            (1 + voiceIntensity * (isSpeaking ? 6 : 4));
          const phase = 2 * Math.sin(tick / (isSpeaking ? 62 : 85));

          const baseRadius = currentOrbRadius + 3;
          const displacement =
            point.range *
            phase *
            Math.sin(point.phase) *
            (0.5 + voiceIntensity * (isSpeaking ? 3.4 : 2.5));
          const radius = clamp(
            baseRadius + displacement * 0.8,
            currentOrbRadius * 0.85,
            currentOrbRadius * 1.4,
          );

          point.radian +=
            (pi / 720) * (0.5 + voiceIntensity * (isSpeaking ? 4.6 : 3));
          point.x = centerX + radius * Math.cos(point.radian);
          point.y = centerY + radius * Math.sin(point.radian);
        });

        if (layerIndex === 0) {
          ctx.globalCompositeOperation = "multiply";
        } else if (layerIndex === 1) {
          ctx.globalCompositeOperation = "screen";
        } else {
          ctx.globalCompositeOperation = "overlay";
        }

        ctx.filter = `blur(${1.8 + voiceIntensity * (isSpeaking ? 2.8 : 1.5)}px)`;

        const opacity = 0.08 + voiceIntensity * (isSpeaking ? 0.46 : 0.35);
        const maxGradientRadius = Math.min(width, height) * 0.38;
        const gradientRadius = Math.min(
          currentOrbRadius * (1.3 + voiceIntensity * (isSpeaking ? 0.9 : 0.6)),
          maxGradientRadius,
        );

        const gradient = createGradient(
          tick / 150 + (layerIndex * Math.PI) / 2,
          [
            { position: 4, color: `rgba(30, 191, 219, ${opacity})` },
            { position: 28, color: `rgba(70, 156, 245, ${opacity * 1.4})` },
            { position: 52, color: `rgba(40, 129, 255, ${opacity * 1.7})` },
            { position: 75, color: `rgba(75, 185, 255, ${opacity * 1.4})` },
            { position: 99, color: `rgba(164, 236, 255, ${opacity})` },
          ],
          gradientRadius,
        );

        drawCurve(swingPoints, gradient);
      });

      ctx.filter = "none";
      ctx.globalCompositeOperation = "source-over";

      drawMainOrb();
      drawSpeakingRays(time);
      drawSpeakingShockwaves(time);

      ctx.beginPath();
      ctx.lineWidth = mode === "speaking" ? 1.9 : 1.4;
      ctx.strokeStyle = `rgba(92, 230, 255, ${0.2 + voiceIntensity * (isSpeaking ? 0.5 : 0.55)})`;
      ctx.arc(centerX, centerY, currentOrbRadius * 1.06, 0, pi * 2);
      ctx.stroke();

      if (mode === "listening") {
        const scanStart = time * 1.35;
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(96, 214, 255, 0.56)";
        ctx.arc(
          centerX,
          centerY,
          currentOrbRadius * 1.16,
          scanStart,
          scanStart + pi * 0.62,
        );
        ctx.stroke();
      }

      ctx.restore();

      tick += 1;
      rafId = window.requestAnimationFrame(animate);
    };

    rafId = window.requestAnimationFrame(animate);
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [mode, speechEnergy]);

  return (
    <div
      className={cn(
        "relative h-[320px] w-full overflow-hidden rounded-2xl border border-cyan-400/30 bg-[#020204] shadow-[0_0_70px_rgba(35,146,255,0.25)] sm:h-[440px]",
        className,
      )}
      data-mode={mode}
      data-testid="jarvis-particle-core"
      aria-label="Nucleo visual de voz de JARVIS"
    >
      <canvas className="absolute inset-0 h-full w-full" ref={canvasRef} />
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_22px,rgba(101,236,255,0.08)_22px,rgba(101,236,255,0.08)_23px),repeating-linear-gradient(90deg,transparent,transparent_22px,rgba(101,236,255,0.06)_22px,rgba(101,236,255,0.06)_23px)] opacity-35 [mask-image:radial-gradient(circle_at_center,black_30%,transparent_82%)] animate-[jarvis-grid-drift_10s_linear_infinite]" />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <p className="text-[clamp(1.35rem,3.5vw,2.7rem)] font-bold uppercase tracking-[0.55em] text-cyan-100/65 [text-shadow:0_0_22px_rgba(96,242,255,0.5)] animate-[jarvis-core-flicker_3.4s_ease-in-out_infinite]">
          JARVIS
        </p>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex flex-col items-center gap-1 text-center">
        <p className="text-[10px] uppercase tracking-[0.45em] text-cyan-200/70">
          Jarvis Neural Core
        </p>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100">
          {mode === "speaking" && "Speaking"}
          {mode === "listening" && "Listening"}
          {mode === "idle" && "Standby"}
        </p>
      </div>
    </div>
  );
}
