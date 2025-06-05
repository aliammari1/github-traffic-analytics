"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { TextGenerateEffect } from "@/components/aceternity/TextGenerateEffect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Code, 
  Shield, 
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Layers,
  Gauge,
  BrainCircuit,
  Sparkles
} from "lucide-react";

export default function CodeQualityPage() {
  const [selectedRepo, setSelectedRepo] = useState("awesome-project");
  const [viewMode, setViewMode] = useState<'matrix' | 'trends' | 'insights'>('matrix');

  const qualityMetrics = {
    overall: 87,
    maintainability: 92,
    reliability: 84,
    security: 89,
    performance: 85,
    testCoverage: 78,
    codeSmells: 23,
    bugs: 5,
    vulnerabilities: 2,
    duplications: 3.2
  };

  const repositories = [
    { name: "awesome-project", score: 87, trend: "+5" },
    { name: "mobile-app", score: 81, trend: "+2" },
    { name: "api-service", score: 92, trend: "-1" },
    { name: "web-app", score: 79, trend: "+8" }
  ];

  const issuesByCategory = [
    { category: "Code Smells", count: 23, severity: "minor", color: "yellow" },
    { category: "Bugs", count: 5, severity: "major", color: "red" },
    { category: "Vulnerabilities", count: 2, severity: "critical", color: "purple" },
    { category: "Duplications", count: 8, severity: "info", color: "blue" }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-500";
    if (score >= 60) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <Spotlight className="h-[80vh] w-[30vw] top-40 left-0 md:left-60 md:-top-20" fill="purple" />
      <Spotlight className="h-[80vh] w-[50vw] top-10 left-full" fill="blue" />
      <Spotlight className="h-[80vh] w-[50vw] top-28 left-80" fill="cyan" />
      
      <div className="relative z-10 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <motion.div
                className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Zap className="w-8 h-8 text-white" />
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-3 h-3 text-white" />
              </motion.div>
            </div>
            <div>
              <TextGenerateEffect 
                words="Analyse de Qualité du Code"
                className="text-4xl font-bold text-white mb-2"
              />
              <p className="text-white/60 text-lg">
                Analyse complète de la qualité avec métriques avancées et IA
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4">
            <select 
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white backdrop-blur-sm"
            >
              {repositories.map(repo => (
                <option key={repo.name} value={repo.name} className="bg-black">
                  {repo.name}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              {(['matrix', 'trends', 'insights'] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "outline"}
                  onClick={() => setViewMode(mode)}
                  className={`${
                    viewMode === mode 
                      ? "bg-gradient-to-r from-purple-500 to-pink-500" 
                      : "border-white/20 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {mode === 'matrix' && <Layers className="w-4 h-4 mr-2" />}
                  {mode === 'trends' && <TrendingUp className="w-4 h-4 mr-2" />}
                  {mode === 'insights' && <BrainCircuit className="w-4 h-4 mr-2" />}
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <motion.div
                      className="w-32 h-32 rounded-full border-8 border-white/10 flex items-center justify-center relative"
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2 }}
                    >
                      <motion.div
                        className={`absolute inset-0 rounded-full border-8 border-transparent bg-gradient-to-r ${getScoreGradient(qualityMetrics.overall)}`}
                        style={{
                          clipPath: `polygon(50% 50%, 50% 0%, ${50 + (qualityMetrics.overall / 100) * 50}% 0%, 100% 50%, 50% 50%)`
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                      <div className="text-center z-10">
                        <div className={`text-4xl font-bold ${getScoreColor(qualityMetrics.overall)}`}>
                          {qualityMetrics.overall}
                        </div>
                        <div className="text-white/60 text-sm">Score Global</div>
                      </div>
                    </motion.div>
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">{selectedRepo}</h2>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        Grade A
                      </Badge>
                      <Badge variant="outline" className="text-blue-400 border-blue-400">
                        +5 cette semaine
                      </Badge>
                    </div>
                    <p className="text-white/60">
                      Excellent niveau de qualité avec des améliorations constantes
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white">Conforme aux standards</span>
                  </div>
                  <div className="text-sm text-white/60">
                    Dernière analyse: il y a 2h
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Matrix View */}
        {viewMode === 'matrix' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Quality Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Maintenabilité", value: qualityMetrics.maintainability, icon: Code },
                { label: "Fiabilité", value: qualityMetrics.reliability, icon: Shield },
                { label: "Sécurité", value: qualityMetrics.security, icon: Target },
                { label: "Performance", value: qualityMetrics.performance, icon: Gauge }
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <metric.icon className="w-6 h-6 text-white/60" />
                        <div className={`text-2xl font-bold ${getScoreColor(metric.value)}`}>
                          {metric.value}
                        </div>
                      </div>
                      <div className="text-sm text-white/80 mb-2">{metric.label}</div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(metric.value)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.value}%` }}
                          transition={{ duration: 1, delay: 0.2 * index }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Issues Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Problèmes Détectés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {issuesByCategory.map((issue) => (
                      <div key={issue.category} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full bg-${issue.color}-500`}></div>
                          <span className="text-white">{issue.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`border-${issue.color}-500 text-${issue.color}-400`}>
                            {issue.count}
                          </Badge>
                          <span className="text-xs text-white/60">{issue.severity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Couverture de Tests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-6">
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-white">{qualityMetrics.testCoverage}%</div>
                      <div className="text-white/60">Couverture Globale</div>
                    </div>
                    
                    <div className="space-y-3">
                      {[
                        { type: "Units", coverage: 78 },
                        { type: "Branches", coverage: 72 },
                        { type: "Functions", coverage: 85 }
                      ].map((test, index) => (
                        <div key={test.type} className="flex items-center gap-4">
                          <span className="text-white/80 w-20">{test.type}</span>
                          <div className="flex-1 bg-white/10 rounded-full h-2">
                            <motion.div
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${test.coverage}%` }}
                              transition={{ duration: 1, delay: 0.2 * index }}
                            />
                          </div>
                          <span className="text-white text-sm w-12">{test.coverage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Trends View */}
        {viewMode === 'trends' && (
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
                  Évolution Temporelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {['Maintainability', 'Reliability', 'Security'].map((metric, index) => (
                    <div key={metric} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">{metric}</span>
                        <span className="text-green-400 text-sm">↗ +3pts</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-lg overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500/50 to-purple-500 rounded-lg"
                          initial={{ width: 0 }}
                          animate={{ width: `${80 + Math.random() * 20}%` }}
                          transition={{ duration: 1.5, delay: index * 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Comparaison Repos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {repositories.map((repo, index) => (
                    <motion.div
                      key={repo.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`p-4 rounded-lg ${repo.name === selectedRepo ? 'bg-purple-500/20' : 'bg-white/5'} cursor-pointer`}
                      onClick={() => setSelectedRepo(repo.name)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{repo.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${getScoreColor(repo.score)}`}>
                            {repo.score}
                          </span>
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            {repo.trend}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* AI Insights View */}
        {viewMode === 'insights' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5" />
                  Insights IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      type: "Recommandation",
                      title: "Optimisation de Performance",
                      description: "L'IA a détecté 12 opportunités d'optimisation dans vos fonctions les plus utilisées.",
                      priority: "high",
                      icon: Zap
                    },
                    {
                      type: "Alerte",
                      title: "Duplication de Code",
                      description: "15% de duplication détectée. Consolidation recommandée dans les modules utils.",
                      priority: "medium",
                      icon: AlertTriangle
                    },
                    {
                      type: "Suggestion",
                      title: "Tests Manquants",
                      description: "5 nouvelles fonctions n'ont pas de tests unitaires associés.",
                      priority: "medium",
                      icon: Target
                    }
                  ].map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="p-6 rounded-lg bg-white/5 border-l-4 border-purple-500"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${
                          insight.priority === 'high' ? 'bg-red-500/20' :
                          insight.priority === 'medium' ? 'bg-yellow-500/20' :
                          'bg-blue-500/20'
                        }`}>
                          <insight.icon className={`w-5 h-5 ${
                            insight.priority === 'high' ? 'text-red-400' :
                            insight.priority === 'medium' ? 'text-yellow-400' :
                            'text-blue-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-white font-semibold">{insight.title}</h3>
                            <Badge variant="outline" className={`text-xs ${
                              insight.priority === 'high' ? 'border-red-500 text-red-400' :
                              insight.priority === 'medium' ? 'border-yellow-500 text-yellow-400' :
                              'border-blue-500 text-blue-400'
                            }`}>
                              {insight.type}
                            </Badge>
                          </div>
                          <p className="text-white/70 text-sm mb-3">{insight.description}</p>
                          <Button size="sm" variant="outline" className="border-white/20 text-white/80 hover:bg-white/10">
                            Voir les détails
                          </Button>
                        </div>
                      </div>
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
