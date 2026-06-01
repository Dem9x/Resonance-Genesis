"use client";

import { useEffect, useRef } from "react";

type SandSettleAnimationProps = {
  particleCount?: number;
  intensity?: "low" | "medium" | "high";
  mode?: "ring" | "wave" | "node";
};

export function SandSettleAnimation({ particleCount = 320, intensity = "medium", mode = "node" }: SandSettleAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const surface = canvas;
    const ctx = context;

    let animation = 0;
    const particles = Array.from({ length: Math.min(600, particleCount) }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      speed: 0.001 + Math.random() * (intensity === "high" ? 0.004 : intensity === "medium" ? 0.0025 : 0.0015),
      phase: index * 0.17
    }));

    function resize() {
      const rect = surface.getBoundingClientRect();
      surface.width = Math.max(320, Math.floor(rect.width * window.devicePixelRatio));
      surface.height = Math.max(220, Math.floor(rect.height * window.devicePixelRatio));
    }

    function targetY(x: number, phase: number) {
      if (mode === "ring") return 0.5 + Math.sin(x * Math.PI * 4 + phase) * 0.16;
      if (mode === "wave") return 0.5 + Math.sin(x * Math.PI * 6) * 0.18;
      return 0.5 + Math.sin(x * Math.PI * 8) * Math.cos(x * Math.PI * 3) * 0.18;
    }

    function draw() {
      const styles = getComputedStyle(document.documentElement);
      const sand = styles.getPropertyValue("--sand").trim() || "#e7d7a0";
      const accent = styles.getPropertyValue("--accent").trim() || "#d6b45c";

      ctx.clearRect(0, 0, surface.width, surface.height);
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, surface.width, surface.height);

      for (const particle of particles) {
        particle.y += (targetY(particle.x, particle.phase) - particle.y) * particle.speed * 20;
        particle.x += Math.sin(Date.now() * 0.0008 + particle.phase) * 0.00055;
        if (particle.x > 1) particle.x = 0;
        if (particle.x < 0) particle.x = 1;

        const x = particle.x * surface.width;
        const y = particle.y * surface.height;
        ctx.beginPath();
        ctx.fillStyle = Math.sin(particle.phase + Date.now() * 0.003) > 0.82 ? accent : sand;
        ctx.globalAlpha = 0.55 + Math.sin(particle.phase + Date.now() * 0.002) * 0.2;
        ctx.arc(x, y, 1.2 * window.devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animation = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener("resize", resize);
    };
  }, [intensity, mode, particleCount]);

  return <canvas ref={canvasRef} className="h-full min-h-[320px] w-full rounded-[2rem]" aria-label="Animated sand particles settling into a Chladni-like node path" />;
}
