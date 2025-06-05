"use client";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface HolographicCardProps {
  children: React.ReactNode;
  className?: string;
  rotationRange?: number;
  half?: boolean;
}

export const HolographicCard = ({
  children,
  className,
  rotationRange = 32.5,
  half = false,
}: HolographicCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x);
  const ySpring = useSpring(y);

const transform = useTransform(
  [xSpring, ySpring],
  (values: number[]) =>
    `rotateX(${values[1] * rotationRange}deg) rotateY(${values[0] * rotationRange}deg)`
);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rX = (mouseX / width - 0.5) * (half ? 0.5 : 1);
    const rY = (mouseY / height - 0.5) * (half ? 0.5 : 1);

    x.set(rX);
    y.set(rY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        transform,
      }}
      className={cn(
        "relative rounded-xl bg-gradient-to-br from-slate-800 to-slate-900",
        "border border-slate-700/50 shadow-2xl",
        "hover:shadow-[0_0_50px_rgba(59,130,246,0.15)]",
        "transition-shadow duration-500",
        className
      )}
    >
      <div
        style={{
          transform: "translateZ(75px)",
          transformStyle: "preserve-3d",
        }}
        className="relative h-full w-full rounded-xl"
      >
        {children}
      </div>
      
      {/* Holographic effect overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 transition-opacity duration-500 hover:opacity-100" />
      
      {/* Glowing border effect */}
      <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 blur-sm transition-opacity duration-500 hover:opacity-100" />
    </motion.div>
  );
};

interface HolographicButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "accent";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const HolographicButton = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className,
}: HolographicButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const variants = {
    primary: "from-blue-600 to-purple-600 text-white",
    secondary: "from-gray-600 to-gray-800 text-gray-200",
    accent: "from-emerald-600 to-cyan-600 text-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative overflow-hidden rounded-lg font-semibold transition-all duration-300",
        "transform-gpu will-change-transform",
        "shadow-lg hover:shadow-xl",
        sizes[size],
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={cn(
          "absolute inset-0 bg-gradient-to-r",
          variants[variant]
        )}
        animate={{
          opacity: isHovered ? 0.9 : 0.7,
        }}
        transition={{ duration: 0.3 }}
      />
      
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: isHovered ? "100%" : "-100%" }}
        transition={{ duration: 0.6 }}
      />
      
      <span className="relative z-10">{children}</span>
      
      {/* Holographic shimmer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        initial={{ x: "-200%" }}
        animate={{ x: isHovered ? "200%" : "-200%" }}
        transition={{ duration: 1.5, repeat: isHovered ? Infinity : 0 }}
      />
    </motion.button>
  );
};

export const HolographicGrid = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string 
}) => {
  return (
    <div 
      className={cn(
        "grid gap-6 p-6",
        "bg-gradient-to-br from-slate-900/50 to-slate-800/50",
        "rounded-xl border border-slate-700/30",
        "backdrop-blur-sm",
        className
      )}
      style={{
        background: `
          radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)
        `,
      }}
    >
      {children}
    </div>
  );
};
