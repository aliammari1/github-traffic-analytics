"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  Activity, 
  Users, 
  Star, 
  GitBranch, 
  Eye,
  Zap,
  Target,
  Award
} from "lucide-react";

interface LiveMetric {
  id: string;
  label: string;
  value: number;
  change: number;
  icon: React.ComponentType;
  color: string;
  suffix?: string;
  prefix?: string;
}

interface LiveDashboardProps {
  className?: string;
}

export const LiveDashboard = ({ className }: LiveDashboardProps) => {
  const [metrics, setMetrics] = useState<LiveMetric[]>([
    {
      id: "views",
      label: "Vues Totales",
      value: 12543,
      change: 12.5,
      icon: Eye,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "stars",
      label: "Étoiles",
      value: 1847,
      change: 8.3,
      icon: Star,
      color: "from-yellow-500 to-orange-500",
    },
    {
      id: "commits",
      label: "Commits",
      value: 2341,
      change: 15.7,
      icon: GitBranch,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "contributors",
      label: "Contributeurs",
      value: 234,
      change: 6.2,
      icon: Users,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "activity",
      label: "Activité",
      value: 89,
      change: 23.1,
      icon: Activity,
      color: "from-red-500 to-pink-500",
      suffix: "%",
    },
    {
      id: "performance",
      label: "Performance",
      value: 94,
      change: 4.5,
      icon: Zap,
      color: "from-indigo-500 to-purple-500",
      suffix: "%",
    },
  ]);

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + Math.floor(Math.random() * 10 - 5),
        change: metric.change + (Math.random() - 0.5) * 2,
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      style={{ y }}
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
        className
      )}
    >
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          className="group relative"
        >
          <div className="relative p-6 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-500">
            {/* Background glow */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-500",
              metric.color
            )} />

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "p-3 rounded-lg bg-gradient-to-br",
                metric.color
              )}>
                <div className="text-white">{metric.label}</div>
              </div>
              
              <motion.div
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  metric.change >= 0 
                    ? "bg-green-500/20 text-green-400" 
                    : "bg-red-500/20 text-red-400"
                )}
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatDelay: 3 
                }}
              >
                {metric.change >= 0 ? "↗" : "↘"} {Math.abs(metric.change).toFixed(1)}%
              </motion.div>
            </div>

            {/* Value */}
            <motion.div
              className="mb-2"
              key={metric.value} // Re-animate when value changes
              initial={{ scale: 1.1, color: "#3b82f6" }}
              animate={{ scale: 1, color: "#ffffff" }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-3xl font-bold text-white">
                {metric.prefix}{metric.value.toLocaleString()}{metric.suffix}
              </span>
            </motion.div>

            {/* Label */}
            <p className="text-slate-400 font-medium">{metric.label}</p>

            {/* Progress indicator */}
            <div className="mt-4 h-1 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className={cn("h-full bg-gradient-to-r", metric.color)}
                initial={{ width: "0%" }}
                animate={{ width: `${Math.min(100, (metric.value % 100))}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              />
            </div>

            {/* Pulse effect on hover */}
            <motion.div
              className={cn(
                "absolute inset-0 rounded-xl bg-gradient-to-br opacity-0",
                metric.color
              )}
              whileHover={{
                opacity: [0, 0.1, 0],
                scale: [1, 1.02, 1],
              }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </motion.div>
      ))}

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: metrics.length * 0.1 }}
        className="md:col-span-2 lg:col-span-3"
      >
        <div className="p-6 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Performance Globale</h3>
                <p className="text-slate-400">Aperçu en temps réel</p>
              </div>
            </div>
            
            <motion.div
              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-full"
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatDelay: 4 
              }}
            >
              <Award className="h-4 w-4" />
              <span className="text-sm font-medium">Excellent</span>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">98.7%</div>
              <div className="text-sm text-slate-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">2.3s</div>
              <div className="text-sm text-slate-400">Temps de réponse</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">847K</div>
              <div className="text-sm text-slate-400">Requêtes/jour</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">99.2%</div>
              <div className="text-sm text-slate-400">Satisfaction</div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
