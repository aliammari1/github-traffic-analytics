"use client";
import React, { useState } from 'react'
import { motion } from "framer-motion";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { TextGenerateEffect } from "@/components/aceternity/TextGenerateEffect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Star, 
  Eye, 
  GitBranch, 
  Tag, 
  ExternalLink,
  TrendingUp,
  Rocket,
  Zap,
  Target,
  CheckCircle,
  Users,
  Clock,
  AlertTriangle
} from "lucide-react";

export default function ReleasesPage() {
  const [selectedPhase, setSelectedPhase] = useState<'planning' | 'development' | 'testing' | 'deployment'>('planning');
  const [timeframe, setTimeframe] = useState('quarter');

  const releases = [
    {
      version: "v2.1.0",
      name: "Lightning Release",
      status: "in-progress",
      completion: 78,
      startDate: "2024-03-01",
      targetDate: "2024-03-25",
      features: 12,
      bugs: 3,
      team: ["Alice", "Bob", "Charlie", "Diana"],
      priority: "high",
      branch: "release/v2.1.0"
    },
    {
      version: "v2.2.0",
      name: "Stellar Update",
      status: "planning",
      completion: 15,
      startDate: "2024-03-26",
      targetDate: "2024-04-15",
      features: 8,
      bugs: 1,
      team: ["Eve", "Frank", "Grace"],
      priority: "medium",
      branch: "feature/stellar-features"
    },
    {
      version: "v2.3.0",
      name: "Quantum Leap",
      status: "backlog",
      completion: 0,
      startDate: "2024-04-16",
      targetDate: "2024-05-10",
      features: 15,
      bugs: 0,
      team: ["Henry", "Iris", "Jack", "Kate", "Liam"],
      priority: "low",
      branch: "future/quantum-features"
    }
  ];

  const roadmapPhases = [
    {
      phase: "planning",
      title: "Planification",
      icon: Tag,
      color: "blue",
      tasks: [
        { name: "Analyse des exigences", status: "completed", assignee: "Product Team" },
        { name: "Architecture technique", status: "in-progress", assignee: "Tech Lead" },
        { name: "Estimation des efforts", status: "pending", assignee: "Dev Team" },
        { name: "Validation stakeholders", status: "completed", assignee: "PM" }
      ]
    },
    {
      phase: "development",
      title: "Développement",
      icon: GitBranch,
      color: "green",
      tasks: [
        { name: "Feature A - Core Logic", status: "completed", assignee: "Alice" },
        { name: "Feature B - UI Components", status: "in-progress", assignee: "Bob" },
        { name: "Feature C - API Integration", status: "in-progress", assignee: "Charlie" },
        { name: "Code Review & Refactoring", status: "pending", assignee: "Senior Dev" }
      ]
    },
    {
      phase: "testing",
      title: "Tests & QA",
      icon: Eye,
      color: "yellow",
      tasks: [
        { name: "Tests unitaires", status: "in-progress", assignee: "QA Team" },
        { name: "Tests d'intégration", status: "pending", assignee: "QA Team" },
        { name: "Tests de performance", status: "pending", assignee: "DevOps" },
        { name: "Tests utilisateur", status: "pending", assignee: "UX Team" }
      ]
    },
    {
      phase: "deployment",
      title: "Déploiement",
      icon: ExternalLink,
      color: "purple",
      tasks: [
        { name: "Préparation environnement", status: "pending", assignee: "DevOps" },
        { name: "Migration base de données", status: "pending", assignee: "DBA" },
        { name: "Déploiement production", status: "pending", assignee: "Release Manager" },
        { name: "Monitoring post-release", status: "pending", assignee: "SRE Team" }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 border-green-400';
      case 'in-progress': return 'text-blue-400 border-blue-400';
      case 'planning': return 'text-yellow-400 border-yellow-400';
      case 'backlog': return 'text-gray-400 border-gray-400';
      default: return 'text-white border-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-white bg-white/10';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="purple" />
      <Spotlight className="top-10 left-full h-[80vh] w-[50vw]" fill="blue" />
      <Spotlight className="top-28 left-80 h-[80vh] w-[50vw]" fill="pink" />
      
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
                className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Rocket className="w-8 h-8 text-white" />
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-3 h-3 text-white" />
              </motion.div>
            </div>
            <div>
              <TextGenerateEffect 
                words="Planificateur de Releases"
                className="text-4xl font-bold text-white mb-2"
              />
              <p className="text-white/60 text-lg">
                Orchestration intelligente et suivi en temps réel de vos releases
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4">
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white backdrop-blur-sm"
            >
              <option value="month" className="bg-black">Ce mois</option>
              <option value="quarter" className="bg-black">Ce trimestre</option>
              <option value="year" className="bg-black">Cette année</option>
            </select>

            <div className="flex gap-2">
              {(['planning', 'development', 'testing', 'deployment'] as const).map((phase) => (
                <Button
                  key={phase}
                  variant={selectedPhase === phase ? "default" : "outline"}
                  onClick={() => setSelectedPhase(phase)}
                  className={`${
                    selectedPhase === phase 
                      ? "bg-gradient-to-r from-purple-500 to-pink-500" 
                      : "border-white/20 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {phase === 'planning' && <Target className="w-4 h-4 mr-2" />}
                  {phase === 'development' && <GitBranch className="w-4 h-4 mr-2" />}
                  {phase === 'testing' && <CheckCircle className="w-4 h-4 mr-2" />}
                  {phase === 'deployment' && <Rocket className="w-4 h-4 mr-2" />}
                  {phase.charAt(0).toUpperCase() + phase.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Release Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timeline des Releases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {releases.map((release, index) => (
                  <motion.div
                    key={release.version}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative"
                  >
                    {index < releases.length - 1 && (
                      <div className="absolute left-6 top-16 w-0.5 h-16 bg-gradient-to-b from-purple-400 to-transparent" />
                    )}
                    
                    <div className="flex items-start gap-4 p-6 rounded-lg bg-white/5 border border-white/10">
                      <motion.div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          release.status === 'in-progress' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                          release.status === 'planning' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                          'bg-gradient-to-r from-gray-500 to-gray-400'
                        }`}
                        whileHover={{ scale: 1.1 }}
                      >
                        <Star className="w-6 h-6 text-white" />
                      </motion.div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-white">{release.version}</h3>
                            <p className="text-purple-400">{release.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={getStatusColor(release.status)}
                            >
                              {release.status}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={getPriorityColor(release.priority)}
                            >
                              {release.priority}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <span className="text-white/60 text-sm">Date de début:</span>
                            <div className="text-white font-mono">{release.startDate}</div>
                          </div>
                          <div>
                            <span className="text-white/60 text-sm">Date cible:</span>
                            <div className="text-white font-mono">{release.targetDate}</div>
                          </div>
                          <div>
                            <span className="text-white/60 text-sm">Features:</span>
                            <div className="text-blue-400">{release.features}</div>
                          </div>
                          <div>
                            <span className="text-white/60 text-sm">Bugs fixés:</span>
                            <div className="text-green-400">{release.bugs}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-white/60" />
                            <span className="text-white/80 text-sm">
                              {release.team.length} développeurs
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-white/60 text-sm">Progression:</span>
                              <div className="text-white font-bold">{release.completion}%</div>
                            </div>
                            <div className="w-32 bg-white/10 rounded-full h-2">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${release.completion}%` }}
                                transition={{ duration: 1, delay: 0.5 + index * 0.2 }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Phase Details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Current Phase Tasks */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {(() => {
                  const currentPhase = roadmapPhases.find(p => p.phase === selectedPhase);
                  const IconComponent = currentPhase?.icon;
                  return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
                })()}
                Phase: {roadmapPhases.find(p => p.phase === selectedPhase)?.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roadmapPhases.find(p => p.phase === selectedPhase)?.tasks.map((task, index) => (
                  <motion.div
                    key={task.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{task.name}</h3>
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(task.status)}
                      >
                        {task.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Users className="w-4 h-4" />
                      <span>Assigné à: {task.assignee}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Release Metrics */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Métriques de Release
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { label: "Vélocité moyenne", value: "23 points", icon: Zap, color: "blue" },
                  { label: "Temps de cycle", value: "4.2 jours", icon: Clock, color: "green" },
                  { label: "Taux de succès", value: "94%", icon: Star, color: "yellow" },
                  { label: "Bugs critiques", value: "2", icon: AlertTriangle, color: "red" }
                ].map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <metric.icon className={`w-5 h-5 text-${metric.color}-400`} />
                      <span className="text-white/80">{metric.label}</span>
                    </div>
                    <div className={`text-${metric.color}-400 font-bold text-lg`}>
                      {metric.value}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Release Pipeline Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Pipeline de Release
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-6">
                {roadmapPhases.map((phase, index) => (
                  <motion.div
                    key={phase.phase}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                        selectedPhase === phase.phase 
                          ? `bg-gradient-to-r from-${phase.color}-500 to-${phase.color}-400` 
                          : 'bg-white/10'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      onClick={(e: React.FormEvent) => {
                        e.preventDefault();
                        setSelectedPhase(phase.phase as 'planning' | 'development' | 'testing' | 'deployment')
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <phase.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <span className={`text-sm font-medium ${
                      selectedPhase === phase.phase ? 'text-white' : 'text-white/60'
                    }`}>
                      {phase.title}
                    </span>
                    {index < roadmapPhases.length - 1 && (
                      <motion.div
                        className="absolute top-8 w-24 h-0.5 bg-gradient-to-r from-purple-400 to-transparent"
                        style={{ left: '50%', transform: 'translateX(-50%)' }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5, delay: 1.2 + index * 0.2 }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
