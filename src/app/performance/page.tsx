"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { TextGenerateEffect } from "@/components/aceternity/TextGenerateEffect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  BarChart3, 
  Clock, 
  CheckCircle,
  Cpu,
  Gauge, 
  HardDrive,
  Server,
  Wifi,
  AlertTriangle,
  TrendingUp
} from "lucide-react";

export default function PerformancePage() {
  const [selectedMetric, setSelectedMetric] = useState("overview");
  const [timeRange, setTimeRange] = useState("24h");
  const [isRealTime, setIsRealTime] = useState(true);

  // Simulation de données en temps réel
  const [realTimeData, setRealTimeData] = useState({
    responseTime: 145,
    throughput: 2847,
    errorRate: 0.23,
    cpuUsage: 67,
    memoryUsage: 82,
    diskUsage: 45
  });

  useEffect(() => {
    if (!isRealTime) return;
    
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        responseTime: Math.max(50, prev.responseTime + (Math.random() - 0.5) * 20),
        throughput: Math.max(1000, prev.throughput + (Math.random() - 0.5) * 200),
        errorRate: Math.max(0, Math.min(5, prev.errorRate + (Math.random() - 0.5) * 0.1)),
        cpuUsage: Math.max(20, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(30, Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 8)),
        diskUsage: Math.max(20, Math.min(100, prev.diskUsage + (Math.random() - 0.5) * 5))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isRealTime]);

  const performanceMetrics = [
    {
      name: "Temps de Réponse",
      value: Math.round(realTimeData.responseTime),
      unit: "ms",
      status: realTimeData.responseTime < 200 ? "good" : realTimeData.responseTime < 500 ? "warning" : "critical",
      trend: "+5%",
      target: "< 200ms",
      icon: Clock
    },
    {
      name: "Débit",
      value: Math.round(realTimeData.throughput),
      unit: "req/s",
      status: realTimeData.throughput > 2000 ? "good" : realTimeData.throughput > 1000 ? "warning" : "critical",
      trend: "+12%",
      target: "> 2000/s",
      icon: TrendingUp
    },
    {
      name: "Taux d'Erreur",
      value: realTimeData.errorRate.toFixed(2),
      unit: "%",
      status: realTimeData.errorRate < 1 ? "good" : realTimeData.errorRate < 3 ? "warning" : "critical",
      trend: "-8%",
      target: "< 1%",
      icon: AlertTriangle
    },
    {
      name: "Disponibilité",
      value: "99.97",
      unit: "%",
      status: "good",
      trend: "+0.02%",
      target: "> 99.9%",
      icon: CheckCircle
    }
  ];

  const systemMetrics = [
    {
      name: "CPU",
      value: Math.round(realTimeData.cpuUsage),
      icon: Cpu,
      color: "blue",
      warning: 80
    },
    {
      name: "Mémoire",
      value: Math.round(realTimeData.memoryUsage),
      icon: Server,
      color: "purple",
      warning: 85
    },
    {
      name: "Disque",
      value: Math.round(realTimeData.diskUsage),
      icon: HardDrive,
      color: "green",
      warning: 90
    },
    {
      name: "Réseau",
      value: 34,
      icon: Wifi,
      color: "orange",
      warning: 70
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-white';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500/20';
      case 'warning': return 'bg-yellow-500/20';
      case 'critical': return 'bg-red-500/20';
      default: return 'bg-white/5';
    }
  };

  // Données historiques simulées
  const historicalData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    responseTime: 120 + Math.random() * 80,
    throughput: 2000 + Math.random() * 1000,
    errorRate: Math.random() * 2
  }));

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="blue" />
      <Spotlight className="top-10 left-full h-[80vh] w-[50vw]" fill="green" />
      <Spotlight className="top-28 left-80 h-[80vh] w-[50vw]" fill="purple" />
      
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
                className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Gauge className="w-8 h-8 text-white" />
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Activity className="w-3 h-3 text-white" />
              </motion.div>
            </div>
            <div>
              <TextGenerateEffect 
                words="Moniteur de Performance"
                className="text-4xl font-bold text-white mb-2"
              />
              <p className="text-white/60 text-lg">
                Surveillance temps réel et analytics avancées de performance
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white backdrop-blur-sm"
            >
              <option value="1h" className="bg-black">Dernière heure</option>
              <option value="24h" className="bg-black">24 heures</option>
              <option value="7d" className="bg-black">7 jours</option>
              <option value="30d" className="bg-black">30 jours</option>
            </select>

            <Button
              variant={isRealTime ? "default" : "outline"}
              onClick={() => setIsRealTime(!isRealTime)}
              className={`${
                isRealTime 
                  ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                  : "border-white/20 text-white/80 hover:bg-white/10"
              }`}
            >
              <Activity className="w-4 h-4 mr-2" />
              {isRealTime ? "Temps Réel ON" : "Temps Réel OFF"}
            </Button>

            <div className="flex gap-2">
              {(['overview', 'detailed', 'alerts'] as const).map((metric) => (
                <Button
                  key={metric}
                  variant={selectedMetric === metric ? "default" : "outline"}
                  onClick={() => setSelectedMetric(metric)}
                  className={`${
                    selectedMetric === metric 
                      ? "bg-gradient-to-r from-blue-500 to-purple-500" 
                      : "border-white/20 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {metric === 'overview' && <BarChart3 className="w-4 h-4 mr-2" />}
                  {metric === 'detailed' && <Gauge className="w-4 h-4 mr-2" />}
                  {metric === 'alerts' && <AlertTriangle className="w-4 h-4 mr-2" />}
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Real-time Status Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center"
                    animate={{ 
                      boxShadow: [
                        "0 0 0 0 rgba(34, 197, 94, 0.7)",
                        "0 0 0 20px rgba(34, 197, 94, 0)",
                        "0 0 0 0 rgba(34, 197, 94, 0)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <CheckCircle className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Système Opérationnel</h3>
                    <p className="text-white/60">Tous les services fonctionnent normalement</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-400">99.97%</div>
                  <div className="text-white/60">Uptime</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance Metrics Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {performanceMetrics.map((metric, index) => (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className={`${getStatusBg(metric.status)} border-white/10 backdrop-blur-sm`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <metric.icon className={`w-6 h-6 ${getStatusColor(metric.status)}`} />
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(metric.status)} border-current text-xs`}
                    >
                      {metric.trend}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                      {metric.value}{metric.unit}
                    </div>
                    <div className="text-sm text-white/80">{metric.name}</div>
                    <div className="text-xs text-white/60">Cible: {metric.target}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* System Resources */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Server className="w-5 h-5" />
                Ressources Système
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {systemMetrics.map((metric, index) => (
                  <div key={metric.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <metric.icon className={`w-5 h-5 text-${metric.color}-400`} />
                        <span className="text-white/80">{metric.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${
                          metric.value > metric.warning ? 'text-red-400' : 
                          metric.value > metric.warning * 0.8 ? 'text-yellow-400' : 
                          'text-green-400'
                        }`}>
                          {metric.value}%
                        </span>
                        {metric.value > metric.warning && (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                    </div>
                    
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${
                          metric.value > metric.warning ? 'from-red-500 to-red-400' :
                          metric.value > metric.warning * 0.8 ? 'from-yellow-500 to-yellow-400' :
                          `from-${metric.color}-500 to-${metric.color}-400`
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.value}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
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
                <BarChart3 className="w-5 h-5" />
                Tendances Temporelles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80">Temps de Réponse (24h)</span>
                    <span className="text-blue-400 text-sm">Moyenne: 147ms</span>
                  </div>
                  <div className="flex items-end gap-1 h-16">
                    {historicalData.slice(-12).map((data, index) => (
                      <motion.div
                        key={index}
                        className="flex-1 bg-gradient-to-t from-blue-500/50 to-blue-500 rounded-sm"
                        initial={{ height: 0 }}
                        animate={{ height: `${(data.responseTime / 300) * 100}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80">Débit (24h)</span>
                    <span className="text-green-400 text-sm">Moyenne: 2.4k req/s</span>
                  </div>
                  <div className="flex items-end gap-1 h-16">
                    {historicalData.slice(-12).map((data, index) => (
                      <motion.div
                        key={index}
                        className="flex-1 bg-gradient-to-t from-green-500/50 to-green-500 rounded-sm"
                        initial={{ height: 0 }}
                        animate={{ height: `${(data.throughput / 3000) * 100}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80">Taux d&apos;Erreur (24h)</span>
                    <span className="text-yellow-400 text-sm">Moyenne: 0.8%</span>
                  </div>
                  <div className="flex items-end gap-1 h-16">
                    {historicalData.slice(-12).map((data, index) => (
                      <motion.div
                        key={index}
                        className="flex-1 bg-gradient-to-t from-yellow-500/50 to-yellow-500 rounded-sm"
                        initial={{ height: 0 }}
                        animate={{ height: `${(data.errorRate / 5) * 100}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Alerts & Incidents */}
        {selectedMetric === 'alerts' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Alertes Récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      severity: "warning",
                      title: "Utilisation mémoire élevée",
                      description: "Mémoire à 82% sur le serveur principal",
                      time: "Il y a 5 min",
                      status: "active"
                    },
                    {
                      severity: "info",
                      title: "Déploiement terminé",
                      description: "Version 2.1.3 déployée avec succès",
                      time: "Il y a 12 min",
                      status: "resolved"
                    },
                    {
                      severity: "critical",
                      title: "Pic de latence détecté",
                      description: "Temps de réponse moyen > 500ms pendant 2 min",
                      time: "Il y a 1h",
                      status: "resolved"
                    }
                  ].map((alert, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-l-4 ${
                        alert.severity === 'critical' ? 'bg-red-500/10 border-red-500' :
                        alert.severity === 'warning' ? 'bg-yellow-500/10 border-yellow-500' :
                        'bg-blue-500/10 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">{alert.title}</h3>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                alert.status === 'active' ? 'border-red-500 text-red-400' :
                                'border-green-500 text-green-400'
                              }`}
                            >
                              {alert.status}
                            </Badge>
                          </div>
                          <p className="text-white/70 text-sm mb-2">{alert.description}</p>
                          <span className="text-white/50 text-xs">{alert.time}</span>
                        </div>
                        <div className={`p-2 rounded-lg ${
                          alert.severity === 'critical' ? 'bg-red-500/20' :
                          alert.severity === 'warning' ? 'bg-yellow-500/20' :
                          'bg-blue-500/20'
                        }`}>
                          <AlertTriangle className={`w-4 h-4 ${
                            alert.severity === 'critical' ? 'text-red-400' :
                            alert.severity === 'warning' ? 'text-yellow-400' :
                            'text-blue-400'
                          }`} />
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
