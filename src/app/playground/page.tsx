"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { TextGenerateEffect } from "@/components/aceternity/TextGenerateEffect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Code, 
  Database,
  TrendingUp,
  BarChart3,
  Target,
  Sparkles,
  Activity,
  Globe,
  GitBranch,
  Clock,
  AlertCircle,
  Brain,
  Terminal,
  Download,
  RefreshCw,
  Share2,
  CheckCircle,
  Cpu,
  Zap,
  FileText
} from 'lucide-react';

export default function PlaygroundPage() {
  const [activeTab, setActiveTab] = useState<'query' | 'visualize' | 'analyze' | 'export'>('query');
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState('Jamais');

  const playgroundStats = {
    queriesRun: 1847,
    dataPoints: 125000,
    visualizations: 89,
    exportedReports: 34,
    averageQueryTime: 1.2,
    successRate: 98.5,
    activeUsers: 456,
    diskUsage: 2.3
  };

  const predefinedQueries = [
    {
      name: "Top Repositories par Stars",
      description: "Analyse des repositories les plus populaires",
      query: "SELECT name, stars, language FROM repositories ORDER BY stars DESC LIMIT 10",
      category: "Popular",
      complexity: "simple",
      estimatedTime: "1.2s",
      dataSource: "github_api"
    },
    {
      name: "Croissance des Commits",
      description: "Évolution des commits dans le temps",
      query: "SELECT DATE(created_at), COUNT(*) FROM commits GROUP BY DATE(created_at)",
      category: "Trends",
      complexity: "medium",
      estimatedTime: "2.5s",
      dataSource: "git_history"
    },
    {
      name: "Analyse des Contributeurs",
      description: "Statistiques détaillées des contributeurs",
      query: "SELECT author, COUNT(*) as commits, SUM(additions) as added_lines FROM commits GROUP BY author",
      category: "Contributors",
      complexity: "medium",
      estimatedTime: "3.1s",
      dataSource: "git_history"
    },
    {
      name: "Distribution des Langages",
      description: "Répartition des langages de programmation",
      query: "SELECT language, COUNT(*) as count, AVG(size) as avg_size FROM repositories GROUP BY language",
      category: "Languages",
      complexity: "simple",
      estimatedTime: "1.8s",
      dataSource: "github_api"
    },
    {
      name: "Activité par Heure",
      description: "Pattern d'activité des développeurs",
      query: "SELECT HOUR(created_at) as hour, COUNT(*) FROM commits GROUP BY HOUR(created_at)",
      category: "Patterns",
      complexity: "advanced",
      estimatedTime: "4.2s",
      dataSource: "git_history"
    },
    {
      name: "Issues vs Pull Requests",
      description: "Comparaison des issues et PR",
      query: "SELECT type, state, COUNT(*) FROM issues_and_prs GROUP BY type, state",
      category: "Workflow",
      complexity: "medium",
      estimatedTime: "2.1s",
      dataSource: "github_api"
    }
  ];

  const visualizationTypes = [
    { type: "line", name: "Graphique Linéaire", icon: TrendingUp, description: "Tendances temporelles" },
    { type: "bar", name: "Graphique en Barres", icon: BarChart3, description: "Comparaisons" },
    { type: "pie", name: "Graphique Circulaire", icon: Target, description: "Répartitions" },
    { type: "scatter", name: "Nuage de Points", icon: Sparkles, description: "Corrélations" },
    { type: "heatmap", name: "Carte de Chaleur", icon: Activity, description: "Densité de données" },
    { type: "network", name: "Réseau", icon: Globe, description: "Relations" }
  ];

  const dataSources = [
    { name: "GitHub API", status: "connected", latency: "45ms", records: "1.2M", icon: GitBranch },
    { name: "Git History", status: "connected", latency: "12ms", records: "890K", icon: Clock },
    { name: "Code Analysis", status: "syncing", latency: "67ms", records: "567K", icon: Code },
    { name: "Issue Data", status: "connected", latency: "28ms", records: "234K", icon: AlertCircle }
  ];

  const recentQueries = [
    {
      query: "SELECT language, COUNT(*) FROM repos GROUP BY language",
      timestamp: "Il y a 2 min",
      duration: "1.2s",
      status: "success",
      results: 156
    },
    {
      query: "SELECT author, commits FROM contributors ORDER BY commits DESC",
      timestamp: "Il y a 5 min",
      duration: "2.1s",
      status: "success",
      results: 89
    },
    {
      query: "SELECT * FROM pull_requests WHERE status = 'open'",
      timestamp: "Il y a 8 min",
      duration: "0.8s",
      status: "error",
      results: 0
    },
    {
      query: "SELECT DATE(created_at), COUNT(*) FROM commits GROUP BY DATE",
      timestamp: "Il y a 12 min",
      duration: "3.2s",
      status: "success",
      results: 365
    }
  ];

  const executionPlan = [
    { step: 1, operation: "Parse Query", time: "0.1s", status: "completed" },
    { step: 2, operation: "Optimize Plan", time: "0.2s", status: "completed" },
    { step: 3, operation: "Fetch Data", time: "1.8s", status: "running" },
    { step: 4, operation: "Process Results", time: "0.1s", status: "pending" },
    { step: 5, operation: "Format Output", time: "0.1s", status: "pending" }
  ];

  const runQuery = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setLastRun('À l&apos;instant');
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'syncing': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'success': return 'text-green-400';
      case 'running': return 'text-blue-400';
      case 'pending': return 'text-gray-400';
      case 'completed': return 'text-green-400';
      default: return 'text-white';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
      case 'advanced': return 'bg-red-500/20 border-red-500/50 text-red-400';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="cyan" />
      <Spotlight className="-top-10 left-full h-[80vh] w-[50vw]" fill="purple" />
      <Spotlight className="-top-28 left-80 h-[80vh] w-[50vw]" fill="blue" />
      
      <div className="relative z-10 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12"
        >
          <div className="flex items-center mb-6 md:mb-0">
            <div className="relative">
              <motion.div
                className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mr-4"
                animate={{ 
                  boxShadow: [
                    "0 0 20px rgba(34, 197, 94, 0.5)",
                    "0 0 20px rgba(168, 85, 247, 0.5)",
                    "0 0 20px rgba(34, 197, 94, 0.5)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Database className="w-6 h-6 text-white" />
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain className="w-3 h-3 text-white" />
              </motion.div>
            </div>
            <div>
              <TextGenerateEffect 
                words="Laboratoire de Données"
                className="text-4xl font-bold text-white mb-2"
              />
              <p className="text-muted-foreground">
                Testez vos requêtes et explorez l&apos;API GitHub en temps réel
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              {(['query', 'visualize', 'analyze', 'export'] as const).map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "outline"}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab 
                      ? "bg-gradient-to-r from-cyan-500 to-purple-500" 
                      : "border-white/20 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {tab === 'query' && <Terminal className="w-4 h-4 mr-2" />}
                  {tab === 'visualize' && <BarChart3 className="w-4 h-4 mr-2" />}
                  {tab === 'analyze' && <Brain className="w-4 h-4 mr-2" />}
                  {tab === 'export' && <Download className="w-4 h-4 mr-2" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={runQuery}
                disabled={isRunning}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {isRunning ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isRunning ? 'Exécution...' : 'Exécuter'}
              </Button>
              <Button variant="outline" className="border-white/20 text-white/80 hover:bg-white/10">
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Requêtes", value: playgroundStats.queriesRun, icon: Terminal, color: "cyan" },
            { label: "Points de données", value: `${playgroundStats.dataPoints / 1000}K`, icon: Database, color: "purple" },
            { label: "Visualisations", value: playgroundStats.visualizations, icon: BarChart3, color: "blue" },
            { label: "Taux de succès", value: `${playgroundStats.successRate}%`, icon: CheckCircle, color: "green" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                    <motion.div
                      className={`w-2 h-2 rounded-full bg-${stat.color}-400`}
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/60">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        {activeTab === 'query' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Query Builder */}
              <div className="lg:col-span-2">
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Terminal className="w-5 h-5 mr-2 text-cyan-400" />
                      Constructeur de Requêtes
                      <Badge className="ml-2 bg-green-500/20 text-green-400">SQL</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-black/50 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/60 text-sm">Requête SQL</span>
                          <span className="text-green-400 text-xs">Dernière exécution: {lastRun}</span>
                        </div>
                        <textarea
                          className="w-full bg-transparent text-white font-mono text-sm border-none outline-none resize-none"
                          rows={8}
                          placeholder="SELECT name, stars, language FROM repositories ORDER BY stars DESC LIMIT 10"
                          defaultValue="SELECT name, stars, language FROM repositories ORDER BY stars DESC LIMIT 10"
                        />
                      </div>

                      {/* Query Suggestions */}
                      <div>
                        <h4 className="text-white font-medium mb-3">Requêtes Prédéfinies</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {predefinedQueries.slice(0, 4).map((query, index) => (
                            <motion.div
                              key={query.name}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-white text-sm font-medium">{query.name}</span>
                                <Badge className={getComplexityColor(query.complexity)}>
                                  {query.complexity}
                                </Badge>
                              </div>
                              <p className="text-white/60 text-xs mb-2">{query.description}</p>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-cyan-400">{query.estimatedTime}</span>
                                <span className="text-purple-400">{query.dataSource}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Data Sources & Execution */}
              <div className="space-y-6">
                {/* Data Sources */}
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Database className="w-5 h-5 mr-2 text-purple-400" />
                      Sources de Données
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dataSources.map((source, index) => {
                        const IconComponent = source.icon;
                        return (
                          <motion.div
                            key={source.name}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                          >
                            <div className="flex items-center space-x-3">
                              <IconComponent className="w-4 h-4 text-white/60" />
                              <div>
                                <div className="text-white text-sm font-medium">{source.name}</div>
                                <div className="text-white/60 text-xs">{source.records} enregistrements</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-xs font-medium ${getStatusColor(source.status)}`}>
                                {source.status}
                              </div>
                              <div className="text-white/60 text-xs">{source.latency}</div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Execution Plan */}
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Cpu className="w-5 h-5 mr-2 text-blue-400" />
                      Plan d&apos;Exécution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {executionPlan.map((step, index) => (
                        <motion.div
                          key={step.step}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center space-x-3"
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                            ${step.status === 'completed' ? 'bg-green-500' : 
                              step.status === 'running' ? 'bg-blue-500 animate-pulse' : 
                              'bg-gray-500/50'}`}
                          >
                            {step.step}
                          </div>
                          <div className="flex-1">
                            <div className="text-white text-sm">{step.operation}</div>
                            <div className="text-white/60 text-xs">{step.time}</div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(step.status)}`} />
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Queries */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Requêtes Récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentQueries.map((query, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-mono text-sm truncate">{query.query}</div>
                        <div className="flex items-center space-x-4 text-xs text-white/60 mt-1">
                          <span>{query.timestamp}</span>
                          <span>{query.duration}</span>
                          <span>{query.results} résultats</span>
                        </div>
                      </div>
                      <div className={`text-xs font-medium ${getStatusColor(query.status)}`}>
                        {query.status === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'visualize' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visualizationTypes.map((viz, index) => {
                const IconComponent = viz.icon;
                return (
                  <motion.div
                    key={viz.type}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm cursor-pointer hover:bg-white/10 transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <IconComponent className="w-8 h-8 text-cyan-400 mr-3" />
                          <div>
                            <h3 className="text-white font-medium">{viz.name}</h3>
                            <p className="text-white/60 text-sm">{viz.description}</p>
                          </div>
                        </div>
                        <div className="h-20 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-12 h-12 text-white/30" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'analyze' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-400" />
                  Analyse IA Avancée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center mb-2">
                        <Sparkles className="w-4 h-4 text-blue-400 mr-2" />
                        <span className="text-blue-400 font-medium">Détection de Patterns</span>
                      </div>
                      <p className="text-white/80 text-sm">
                        Identifie automatiquement les tendances et anomalies dans vos données
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center mb-2">
                        <Target className="w-4 h-4 text-green-400 mr-2" />
                        <span className="text-green-400 font-medium">Prédictions</span>
                      </div>
                      <p className="text-white/80 text-sm">
                        Prédit les tendances futures basées sur l&apos;historique
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <div className="flex items-center mb-2">
                        <Brain className="w-4 h-4 text-purple-400 mr-2" />
                        <span className="text-purple-400 font-medium">Recommandations</span>
                      </div>
                      <p className="text-white/80 text-sm">
                        Suggestions d&apos;optimisation basées sur l&apos;analyse des données
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <div className="flex items-center mb-2">
                        <Zap className="w-4 h-4 text-orange-400 mr-2" />
                        <span className="text-orange-400 font-medium">Insights</span>
                      </div>
                      <p className="text-white/80 text-sm">
                        Découvertes automatiques et insights cachés
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'export' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Download className="w-5 h-5 mr-2 text-green-400" />
                  Options d&apos;Export
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { format: "CSV", description: "Données tabulaires", icon: FileText },
                    { format: "JSON", description: "Format structuré", icon: Code },
                    { format: "PDF", description: "Rapport complet", icon: Download }
                  ].map((format, index) => (
                    <motion.div
                      key={format.format}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
                    >
                      <format.icon className="w-8 h-8 text-green-400 mb-2" />
                      <h3 className="text-white font-medium">{format.format}</h3>
                      <p className="text-white/60 text-sm">{format.description}</p>
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
