"use client";

import { useEffect, useRef } from "react";

export default function Particles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const nodes = Array.from({ length: reduce ? 18 : 42 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00035,
      vy: (Math.random() - 0.5) * 0.00035,
    }));

    function resize() {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    }

    function draw() {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(180, 220, 255, 0.85)";
      ctx.strokeStyle = "rgba(150, 200, 255, 0.28)";
      const points = nodes.map((node) => ({
        x: node.x * width,
        y: node.y * height,
      }));
      for (let i = 0; i < points.length; i += 1) {
        for (let j = i + 1; j < points.length; j += 1) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < width * 0.12) {
            ctx.globalAlpha = 1 - dist / (width * 0.12);
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2.2 * window.devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
      });
      if (!reduce) {
        nodes.forEach((node) => {
          node.x += node.vx;
          node.y += node.vy;
          if (node.x < 0 || node.x > 1) node.vx *= -1;
          if (node.y < 0 || node.y > 1) node.vy *= -1;
        });
        frame = window.requestAnimationFrame(draw);
      }
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas className="particles" ref={canvasRef} aria-hidden="true" />;
}
