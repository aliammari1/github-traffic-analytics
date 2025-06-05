"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LiveActivityFeed } from "@/components/LiveActivityFeed";
import {
  FloatingElements,
  AnimatedCounter,
  GlowEffect,
  MagneticButton,
} from "@/components/aceternity/AdvancedAnimations";
import {
  Activity,
  Users,
  GitCommit,
  Star,
  Eye,
  GitFork,
  GitBranch,
  Zap,
  BarChart3,
  TrendingUp,
} from "lucide-react";

interface DashboardStats {
  totalRepositories: number;
  totalCommits: number;
  totalContributors: number;
  totalStars: number;
  weeklyViews: number;
  codeQualityScore: number;
  securityScore: number;
  productivityIndex: number;
}

interface QuickAction {
  icon: React.ComponentType;
  label: string;
  description: string;
  action: () => void;
  color: string;
}

export function EnhancedDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d">(
    "30d"
  );

  const stats: DashboardStats = {
    totalRepositories: 47,
    totalCommits: 2847,
    totalContributors: 156,
    totalStars: 8934,
    weeklyViews: 12456,
    codeQualityScore: 92,
    securityScore: 88,
    productivityIndex: 85,
  };

  const quickActions: QuickAction[] = [
    {
      icon: GitFork,
      label: "Analyse Rapide",
      description: "Générer un rapport instantané",
      action: () => console.log("Quick analysis"),
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: GitCommit,
      label: "Scan Sécurité",
      description: "Vérifier les vulnérabilités",
      action: () => console.log("Security scan"),
      color: "from-red-500 to-pink-500",
    },
    {
      icon: Eye,
      label: "IA Insights",
      description: "Recommandations intelligentes",
      action: () => console.log("AI insights"),
      color: "from-purple-500 to-indigo-500",
    },
    {
      icon: Activity,
      label: "Optimisation",
      description: "Améliorer les performances",
      action: () => console.log("Optimization"),
      color: "from-green-500 to-emerald-500",
    },
  ];

  const recentMetrics = [
    {
      label: "Commits cette semaine",
      value: 89,
      change: +12.5,
      icon: GitCommit,
      color: "text-green-500",
    },
    {
      label: "Pull Requests",
      value: 23,
      change: +5.2,
      icon: Activity,
      color: "text-blue-500",
    },
    {
      label: "Code Reviews",
      value: 45,
      change: +8.7,
      icon: Eye,
      color: "text-purple-500",
    },
    {
      label: "Issues Résolues",
      value: 67,
      change: +15.3,
      icon: Activity,
      color: "text-orange-500",
    },
  ];

  const trendingProjects = [
    { name: "react-dashboard", stars: "+24", commits: 45, trend: "up" },
    { name: "api-gateway", stars: "+18", commits: 32, trend: "up" },
    { name: "mobile-app", stars: "+12", commits: 28, trend: "stable" },
    { name: "data-pipeline", stars: "+8", commits: 19, trend: "down" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Tableau de Bord Avancé
          </motion.h1>
          <motion.p
            className="text-muted-foreground mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Analyse complète de vos projets GitHub avec IA et insights
            prédictifs
          </motion.p>
        </div>

        <div className="flex items-center gap-3">
          {(["7d", "30d", "90d"] as const).map((period) => (
            <MagneticButton
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`
                px-4 py-2 rounded-lg border transition-all duration-200
                ${
                  selectedPeriod === period
                    ? "bg-blue-500 text-white border-blue-500"
                    : "border-gray-700 hover:border-gray-600 text-gray-300"
                }
              `}
            >
              {period}
            </MagneticButton>
          ))}
        </div>
      </motion.div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Dépôts",
            value: stats.totalRepositories,
            icon: GitBranch,
            color: "from-blue-500 to-cyan-500",
            change: "+12%",
          },
          {
            label: "Commits",
            value: stats.totalCommits,
            icon: Activity,
            color: "from-green-500 to-emerald-500",
            change: "+24%",
          },
          {
            label: "Contributeurs",
            value: stats.totalContributors,
            icon: Users,
            color: "from-purple-500 to-pink-500",
            change: "+8%",
          },
          {
            label: "Étoiles",
            value: stats.totalStars,
            icon: Star,
            color: "from-yellow-500 to-orange-500",
            change: "+18%",
          },
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
          >
            <FloatingElements>
              <GlowEffect color="#3b82f6" intensity={0.3}>
                <Card className="relative overflow-hidden border-gray-800/50 bg-black/50 backdrop-blur-sm">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5`}
                  />
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">
                          {metric.label}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <AnimatedCounter
                            target={metric.value}
                            className="text-2xl font-bold"
                          />
                          <Badge variant="secondary" className="text-xs">
                            {metric.change}
                          </Badge>
                        </div>
                      </div>
                      <motion.div
                        className={`p-3 rounded-lg bg-gradient-to-br ${metric.color}`}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <metric.icon className="h-6 w-6 text-white" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </GlowEffect>
            </FloatingElements>
          </motion.div>
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Activity Feed */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <LiveActivityFeed className="h-[500px]" />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-gray-800/50 bg-black/50 backdrop-blur-sm h-[500px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Actions Rapides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <GlowEffect>
                    <MagneticButton
                      onClick={action.action}
                      className="w-full p-4 rounded-lg border border-gray-800 hover:border-gray-700 bg-black/30 text-left transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}
                        >
                          <div className="h-4 w-4 text-white">
                            <action.icon />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">{action.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </MagneticButton>
                  </GlowEffect>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Section - Recent Metrics & Trending Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="border-gray-800/50 bg-black/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Métriques Récentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentMetrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50"
                >
                  <div className="flex items-center gap-3">
                    <metric.icon className={`h-5 w-5 ${metric.color}`} />
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AnimatedCounter
                      target={metric.value}
                      className="font-bold"
                    />
                    <Badge
                      variant={metric.change > 0 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {metric.change > 0 ? "+" : ""}
                      {metric.change}%
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Trending Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card className="border-gray-800/50 bg-black/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Projets Tendance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {trendingProjects.map((project, index) => (
                <motion.div
                  key={project.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 hover:bg-gray-800/50 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {project.commits} commits cette semaine
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{project.stars}</Badge>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        project.trend === "up"
                          ? "bg-green-500"
                          : project.trend === "stable"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
