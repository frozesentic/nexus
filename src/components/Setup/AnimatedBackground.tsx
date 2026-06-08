import { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  pulseOffset: number;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const N = 48;
    const CONNECT_DIST = 160;
    const particles: Particle[] = Array.from({ length: N }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      size: Math.random() * 1.5 + 0.8,
      alpha: Math.random() * 0.35 + 0.15,
      pulseOffset: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    let animId: number;

    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.y > canvas.height + 20) p.y = -20;
      });

      // Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - particles[i].x;
          const dy = particles[j].y - particles[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const fade = 1 - dist / CONNECT_DIST;
            ctx.strokeStyle = `rgba(99,102,241,${fade * 0.12})`;
            ctx.lineWidth = fade * 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      particles.forEach((p) => {
        const pulse = 0.7 + 0.3 * Math.sin(t * 1.5 + p.pulseOffset);
        const r = p.size * pulse;
        const a = p.alpha * pulse;

        // Outer glow
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 5);
        grd.addColorStop(0, `rgba(99,102,241,${a * 0.5})`);
        grd.addColorStop(1, 'rgba(99,102,241,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 5, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(139,92,246,${a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.75 }}
    />
  );
}
