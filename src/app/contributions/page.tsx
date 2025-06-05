"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { TextGenerateEffect } from "@/components/aceternity/TextGenerateEffect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  GitCommit, 
  GitPullRequest, 
  GitBranch,
  Clock,
  TrendingUp,
  Zap,
  Target,
  Activity,
  Star
} from "lucide-react";

export default function ContributionsPage() {
  const [viewMode, setViewMode] = useState<'timeline' | 'heatmap' | 'stats'>('timeline');

  const contributionData = [
    {
      date: "2024-01-15",
      type: "commit",
      repo: "awesome-project",
      count: 12,
      description: "Major feature implementation",
      impact: "high"
    },
    {
      date: "2024-01-20",
      type: "pr",
      repo: "open-source-lib",
      count: 3,
      description: "Bug fixes and optimizations",
      impact: "medium"
    },
    {
      date: "2024-02-01",
      type: "issue",
      repo: "community-project",
      count: 8,
      description: "Documentation improvements",
      impact: "low"
    },
    {
      date: "2024-02-15",
      type: "review",
      repo: "team-project",
      count: 15,
      description: "Code reviews and suggestions",
      impact: "high"
    }
  ];

  const yearlyStats = {
    totalCommits: 1247,
    totalPRs: 89,
    totalIssues: 156,
    totalReviews: 234,
    streakDays: 47,
    activeRepos: 23
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="blue" />
      <Spotlight className="top-10 left-full h-[80vh] w-[50vw]" fill="purple" />
      <Spotlight className="top-28 left-80 h-[80vh] w-[50vw]" fill="cyan" />
      
      <div className="relative z-10 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <motion.div
                className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Calendar className="w-8 h-8 text-white" />
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Activity className="w-3 h-3 text-white" />
              </motion.div>
            </div>
            <div>
              <TextGenerateEffect 
                words="Chronologie des Contributions"
                className="text-4xl font-bold text-white mb-2"
              />
              <p className="text-white/60 text-lg">
                Visualisez votre parcours de développement avec une timeline interactive
              </p>
            </div>
          </div>

          {/* View Mode Selector */}
          <div className="flex gap-2">
            {(['timeline', 'heatmap', 'stats'] as const).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "outline"}
                onClick={() => setViewMode(mode)}
                className={`${
                  viewMode === mode 
                    ? "bg-gradient-to-r from-blue-500 to-purple-500" 
                    : "border-white/20 text-white/80 hover:bg-white/10"
                }`}
              >
                {mode === 'timeline' && <Clock className="w-4 h-4 mr-2" />}
                {mode === 'heatmap' && <Target className="w-4 h-4 mr-2" />}
                {mode === 'stats' && <TrendingUp className="w-4 h-4 mr-2" />}
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
        >
          {[
            { label: "Commits", value: yearlyStats.totalCommits, icon: GitCommit, color: "blue" },
            { label: "Pull Requests", value: yearlyStats.totalPRs, icon: GitPullRequest, color: "green" },
            { label: "Issues", value: yearlyStats.totalIssues, icon: Target, color: "orange" },
            { label: "Reviews", value: yearlyStats.totalReviews, icon: Star, color: "purple" },
            { label: "Streak", value: `${yearlyStats.streakDays}d`, icon: Zap, color: "yellow" },
            { label: "Repos", value: yearlyStats.activeRepos, icon: GitBranch, color: "cyan" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                    <Badge variant="outline" className="text-xs">
                      2024
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-white/60">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Timeline Interactive
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>
                  
                  <div className="space-y-8">
                    {contributionData.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                        className="relative flex items-start gap-6"
                      >
                        {/* Timeline Dot */}
                        <motion.div
                          className={`relative z-10 w-16 h-16 rounded-full bg-gradient-to-r ${
                            item.impact === 'high' ? 'from-green-500 to-emerald-500' :
                            item.impact === 'medium' ? 'from-yellow-500 to-orange-500' :
                            'from-blue-500 to-cyan-500'
                          } flex items-center justify-center`}
                          whileHover={{ scale: 1.1 }}
                          animate={{ 
                            boxShadow: [
                              "0 0 0 0 rgba(59, 130, 246, 0.7)",
                              "0 0 0 10px rgba(59, 130, 246, 0)",
                              "0 0 0 0 rgba(59, 130, 246, 0)"
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {item.type === 'commit' && <GitCommit className="w-8 h-8 text-white" />}
                          {item.type === 'pr' && <GitPullRequest className="w-8 h-8 text-white" />}
                          {item.type === 'issue' && <Target className="w-8 h-8 text-white" />}
                          {item.type === 'review' && <Star className="w-8 h-8 text-white" />}
                        </motion.div>

                        {/* Content */}
                        <div className="flex-1 -mt-2">
                          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-lg font-semibold text-white mb-1">
                                    {item.description}
                                  </h3>
                                  <div className="flex items-center gap-2 text-sm text-white/60">
                                    <span>{new Date(item.date).toLocaleDateString('fr-FR')}</span>
                                    <span>•</span>
                                    <span className="font-mono">{item.repo}</span>
                                  </div>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`${
                                    item.impact === 'high' ? 'border-green-500 text-green-400' :
                                    item.impact === 'medium' ? 'border-yellow-500 text-yellow-400' :
                                    'border-blue-500 text-blue-400'
                                  }`}
                                >
                                  {item.count} {item.type}s
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <div className={`h-2 flex-1 rounded-full bg-gradient-to-r ${
                                  item.impact === 'high' ? 'from-green-500/20 to-green-500' :
                                  item.impact === 'medium' ? 'from-yellow-500/20 to-yellow-500' :
                                  'from-blue-500/20 to-blue-500'
                                }`}></div>
                                <span className="text-xs text-white/40 uppercase tracking-wider">
                                  {item.impact} impact
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Heatmap View */}
        {viewMode === 'heatmap' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Heatmap des Contributions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-53 gap-1 mb-6">
                  {Array.from({ length: 365 }, (_, i) => {
                    const intensity = Math.floor(Math.random() * 5);
                    return (
                      <motion.div
                        key={i}
                        className={`aspect-square rounded-sm ${
                          intensity === 0 ? 'bg-white/5' :
                          intensity === 1 ? 'bg-green-500/20' :
                          intensity === 2 ? 'bg-green-500/40' :
                          intensity === 3 ? 'bg-green-500/60' :
                          intensity === 4 ? 'bg-green-500/80' :
                          'bg-green-500'
                        }`}
                        whileHover={{ scale: 1.5 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.1, delay: i * 0.001 }}
                      />
                    );
                  })}
                </div>
                
                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>Moins</span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`w-3 h-3 rounded-sm ${
                          level === 0 ? 'bg-white/5' :
                          level === 1 ? 'bg-green-500/20' :
                          level === 2 ? 'bg-green-500/40' :
                          level === 3 ? 'bg-green-500/60' :
                          level === 4 ? 'bg-green-500/80' :
                          'bg-green-500'
                        }`}
                      />
                    ))}
                  </div>
                  <span>Plus</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats View */}
        {viewMode === 'stats' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Tendances Mensuelles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'].map((month, index) => (
                    <div key={month} className="flex items-center gap-4">
                      <span className="text-white/60 w-8">{month}</span>
                      <div className="flex-1 bg-white/5 rounded-full h-2">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.random() * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                      <span className="text-white text-sm">
                        {Math.floor(Math.random() * 200 + 50)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Records Personnels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { label: "Plus longue série", value: "47 jours", color: "green" },
                    { label: "Jour le plus productif", value: "23 commits", color: "blue" },
                    { label: "Mois record", value: "Mars 2024", color: "purple" },
                    { label: "Repos le plus actif", value: "awesome-project", color: "orange" }
                  ].map((record, index) => (
                    <motion.div
                      key={record.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                    >
                      <span className="text-white/80">{record.label}</span>
                      <span className={`font-bold text-${record.color}-400`}>
                        {record.value}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
