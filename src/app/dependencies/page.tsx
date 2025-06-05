"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { TextGenerateEffect } from "@/components/aceternity/TextGenerateEffect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GitBranch, 
  Shield, 
  AlertTriangle, 
  Package, 
  ExternalLink, 
  Zap,
  Eye,
  RefreshCw,
  TrendingUp,
  CheckCircle,
  Clock
} from "lucide-react";

export default function DependenciesPage() {
  const [selectedView, setSelectedView] = useState<'overview' | 'security' | 'updates'>('overview');

  const dependencies = [
    {
      name: "react",
      version: "18.2.0",
      latest: "19.0.0",
      type: "dependency",
      security: "safe",
      updateType: "major",
      size: "2.8 MB",
      lastUpdated: "2024-01-15",
      vulnerabilities: 0,
      license: "MIT"
    },
    {
      name: "lodash",
      version: "4.17.20",
      latest: "4.17.21",
      type: "dependency",
      security: "vulnerable",
      updateType: "patch",
      size: "1.4 MB",
      lastUpdated: "2023-09-12",
      vulnerabilities: 2,
      license: "MIT"
    },
    {
      name: "express",
      version: "4.18.2",
      latest: "4.19.1",
      type: "dependency",
      security: "outdated",
      updateType: "minor",
      size: "850 KB",
      lastUpdated: "2024-02-03",
      vulnerabilities: 0,
      license: "MIT"
    },
    {
      name: "@types/node",
      version: "20.10.0",
      latest: "20.11.5",
      type: "devDependency",
      security: "safe",
      updateType: "patch",
      size: "3.2 MB",
      lastUpdated: "2024-01-28",
      vulnerabilities: 0,
      license: "MIT"
    }
  ];

  const securityAlerts = [
    {
      package: "lodash",
      severity: "high",
      cve: "CVE-2024-1234",
      description: "Prototype pollution vulnerability in merge function",
      fixVersion: "4.17.21",
      publishedDate: "2024-01-10"
    },
    {
      package: "lodash",
      severity: "medium",
      cve: "CVE-2024-5678",
      description: "ReDoS vulnerability in template function",
      fixVersion: "4.17.21",
      publishedDate: "2024-01-08"
    }
  ];

  const updateSummary = {
    total: dependencies.length,
    outdated: dependencies.filter(d => d.version !== d.latest).length,
    vulnerable: dependencies.filter(d => d.vulnerabilities > 0).length,
    upToDate: dependencies.filter(d => d.version === d.latest).length
  };

  const getSecurityColor = (security: string) => {
    switch (security) {
      case 'safe': return 'text-green-400';
      case 'outdated': return 'text-yellow-400';
      case 'vulnerable': return 'text-red-400';
      default: return 'text-white';
    }
  };

  const getSecurityBg = (security: string) => {
    switch (security) {
      case 'safe': return 'bg-green-500/20';
      case 'outdated': return 'bg-yellow-500/20';
      case 'vulnerable': return 'bg-red-500/20';
      default: return 'bg-white/5';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 border-red-500';
      case 'high': return 'text-orange-500 border-orange-500';
      case 'medium': return 'text-yellow-500 border-yellow-500';
      case 'low': return 'text-blue-500 border-blue-500';
      default: return 'text-gray-500 border-gray-500';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="blue" />
      <Spotlight className="top-10 left-full h-[80vh] w-[50vw]" fill="orange" />
      <Spotlight className="top-28 left-80 h-[80vh] w-[50vw]" fill="green" />
      
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
                className="w-16 h-16 bg-gradient-to-r from-blue-500 to-orange-500 rounded-2xl flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <GitBranch className="w-8 h-8 text-white" />
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AlertTriangle className="w-3 h-3 text-white" />
              </motion.div>
            </div>
            <div>
              <TextGenerateEffect 
                words="Gestionnaire de Dépendances"
                className="text-4xl font-bold text-white mb-2"
              />
              <p className="text-white/60 text-lg">
                Surveillance intelligente et mise à jour automatisée des dépendances
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              {(['overview', 'security', 'updates'] as const).map((view) => (
                <Button
                  key={view}
                  variant={selectedView === view ? "default" : "outline"}
                  onClick={() => setSelectedView(view)}
                  className={`${
                    selectedView === view 
                      ? "bg-gradient-to-r from-blue-500 to-orange-500" 
                      : "border-white/20 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {view === 'overview' && <Package className="w-4 h-4 mr-2" />}
                  {view === 'security' && <Shield className="w-4 h-4 mr-2" />}
                  {view === 'updates' && <RefreshCw className="w-4 h-4 mr-2" />}
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </Button>
              ))}
            </div>

            <Button variant="outline" className="border-white/20 text-white/80 hover:bg-white/10">
              <RefreshCw className="w-4 h-4 mr-2" />
              Analyser
            </Button>
          </div>
        </motion.div>

        {/* Status Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Total", value: updateSummary.total, icon: Package, color: "blue" },
            { label: "À jour", value: updateSummary.upToDate, icon: CheckCircle, color: "green" },
            { label: "Obsolètes", value: updateSummary.outdated, icon: Clock, color: "yellow" },
            { label: "Vulnérables", value: updateSummary.vulnerable, icon: AlertTriangle, color: "red" }
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
        {selectedView === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Dépendances du Projet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dependencies.map((dep, index) => (
                    <motion.div
                      key={dep.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`p-4 rounded-lg ${getSecurityBg(dep.security)} border border-white/10`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-white text-lg">{dep.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {dep.type === 'devDependency' ? 'dev' : 'prod'}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`${getSecurityColor(dep.security)} border-current`}
                            >
                              {dep.security}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-white/60">Version actuelle:</span>
                              <div className="font-mono text-white">{dep.version}</div>
                            </div>
                            <div>
                              <span className="text-white/60">Dernière version:</span>
                              <div className="font-mono text-cyan-400">{dep.latest}</div>
                            </div>
                            <div>
                              <span className="text-white/60">Taille:</span>
                              <div className="text-white">{dep.size}</div>
                            </div>
                            <div>
                              <span className="text-white/60">Licence:</span>
                              <div className="text-green-400">{dep.license}</div>
                            </div>
                          </div>

                          {dep.vulnerabilities > 0 && (
                            <div className="mt-3 p-2 bg-red-500/20 rounded-lg">
                              <div className="flex items-center gap-2 text-red-400">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-sm">
                                  {dep.vulnerabilities} vulnérabilité(s) détectée(s)
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {dep.version !== dep.latest && (
                            <Button size="sm" variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                              <TrendingUp className="w-4 h-4 mr-1" />
                              Mettre à jour
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="border-white/20 text-white/80 hover:bg-white/10">
                            <ExternalLink className="w-4 h-4" />
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

        {selectedView === 'security' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Alertes de Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityAlerts.map((alert, index) => (
                    <motion.div
                      key={alert.cve}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="p-6 rounded-lg bg-red-500/10 border-l-4 border-red-500"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-white">{alert.package}</h3>
                            <Badge 
                              variant="outline" 
                              className={getSeverityColor(alert.severity)}
                            >
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-xs font-mono">
                              {alert.cve}
                            </Badge>
                          </div>
                          <p className="text-white/80 mb-3">{alert.description}</p>
                          <div className="flex items-center gap-4 text-sm text-white/60">
                            <span>Correction: v{alert.fixVersion}</span>
                            <span>Publié: {alert.publishedDate}</span>
                          </div>
                        </div>
                        <Button size="sm" className="bg-red-500 hover:bg-red-600">
                          <Zap className="w-4 h-4 mr-1" />
                          Corriger
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security Score */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Score de Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <motion.div
                      className="w-24 h-24 rounded-full border-8 border-white/10 flex items-center justify-center"
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2 }}
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">67</div>
                        <div className="text-xs text-white/60">Score</div>
                      </div>
                    </motion.div>
                  </div>
                  <div className="flex-1">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">Vulnérabilités critiques</span>
                        <span className="text-red-400 font-bold">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">Vulnérabilités importantes</span>
                        <span className="text-orange-400 font-bold">1</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">Vulnérabilités moyennes</span>
                        <span className="text-yellow-400 font-bold">1</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">Dépendances obsolètes</span>
                        <span className="text-blue-400 font-bold">3</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedView === 'updates' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Mises à Jour Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dependencies.filter(d => d.version !== d.latest).map((dep, index) => (
                    <motion.div
                      key={dep.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="p-4 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-white">{dep.name}</h3>
                            <Badge 
                              variant="outline" 
                              className={`${
                                dep.updateType === 'major' ? 'text-red-400 border-red-400' :
                                dep.updateType === 'minor' ? 'text-yellow-400 border-yellow-400' :
                                'text-green-400 border-green-400'
                              }`}
                            >
                              {dep.updateType}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-white/60">
                              {dep.version} → <span className="text-cyan-400">{dep.latest}</span>
                            </span>
                            <span className="text-white/60">
                              Dernière MAJ: {dep.lastUpdated}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="border-white/20 text-white/80 hover:bg-white/10">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            Mettre à jour
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
