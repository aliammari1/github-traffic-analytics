"use client";
import { motion } from "framer-motion";
import { useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
}

interface NeuralNetworkBackgroundProps {
  className?: string;
  particleCount?: number;
  connectionDistance?: number;
  speed?: number;
}

export const NeuralNetworkBackground = ({
  className,
  particleCount = 50,
  connectionDistance = 150,
  speed = 1,
}: NeuralNetworkBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>(0);

  const initializeParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        id: i,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        hue: Math.random() * 60 + 200, // Blue to purple range
      });
    }
    particlesRef.current = particles;
  }, [particleCount, speed]);

  const updateParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    particlesRef.current.forEach((particle) => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Bounce off edges
      if (particle.x <= 0 || particle.x >= canvas.width) {
        particle.vx *= -1;
      }
      if (particle.y <= 0 || particle.y >= canvas.height) {
        particle.vy *= -1;
      }

      // Keep particles in bounds
      particle.x = Math.max(0, Math.min(canvas.width, particle.x));
      particle.y = Math.max(0, Math.min(canvas.height, particle.y));

      // Subtle attraction to mouse
      const dx = mouseRef.current.x - particle.x;
      const dy = mouseRef.current.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 200) {
        const force = (200 - distance) / 200 * 0.01;
        particle.vx += dx * force;
        particle.vy += dy * force;
      }

      // Limit velocity
      const maxVel = speed * 2;
      particle.vx = Math.max(-maxVel, Math.min(maxVel, particle.vx));
      particle.vy = Math.max(-maxVel, Math.min(maxVel, particle.vy));
    });
  }, [speed]);

  const drawParticles = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    particlesRef.current.forEach((particle, i) => {
      particlesRef.current.slice(i + 1).forEach((otherParticle) => {
        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          const opacity = (1 - distance / connectionDistance) * 0.3;
          ctx.strokeStyle = `hsla(${(particle.hue + otherParticle.hue) / 2}, 70%, 60%, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(otherParticle.x, otherParticle.y);
          ctx.stroke();
        }
      });
    });

    // Draw particles
    particlesRef.current.forEach((particle) => {
      ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();

      // Add glow effect
      ctx.shadowColor = `hsl(${particle.hue}, 70%, 60%)`;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }, [connectionDistance]);

  const animate = useCallback(() => {
    updateParticles();
    drawParticles();
    animationRef.current = requestAnimationFrame(animate);
  }, [updateParticles, drawParticles]);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    initializeParticles();
  }, [initializeParticles]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    initializeParticles();
    animate();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initializeParticles, animate, handleResize]);

  return (
    <motion.canvas
      ref={canvasRef}
      className={cn("absolute inset-0 w-full h-full", className)}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    />
  );
};
