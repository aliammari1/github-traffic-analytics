"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { TextGenerateEffect } from "@/components/aceternity/TextGenerateEffect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  TrendingUp, 
  Zap, 
  Target, 
  Users, 
  Code, 
  GitCommit,
  Clock,
  Award,
  Lightbulb
} from "lucide-react";

export default function ProductivityPage() {
  const [currentMetric, setCurrentMetric] = useState(0);
  const [metrics, setMetrics] = useState([
    { label: "Score de Productivité", value: 87, unit: "%", color: "text-green-400" },
    { label: "Commits par Jour", value: 4.2, unit: "", color: "text-blue-400" },
    { label: "Temps de Focus", value: 6.5, unit: "h", color: "text-purple-400" },
    { label: "Efficacité Code", value: 92, unit: "%", color: "text-yellow-400" },
  ]);

  // Fonction pour générer des données de productivité dynamiques
  const generateProductivityData = () => {
    return [
      { 
        label: "Score de Productivité", 
        value: Math.floor(Math.random() * 20) + 80, // 80-99
        unit: "%", 
        color: "text-green-400" 
      },
      { 
        label: "Commits par Jour", 
        value: parseFloat((Math.random() * 3 + 2).toFixed(1)), // 2.0-5.0
        unit: "", 
        color: "text-blue-400" 
      },
      { 
        label: "Temps de Focus", 
        value: parseFloat((Math.random() * 4 + 4).toFixed(1)), // 4.0-8.0
        unit: "h", 
        color: "text-purple-400" 
      },
      { 
        label: "Efficacité Code", 
        value: Math.floor(Math.random() * 15) + 85, // 85-99
        unit: "%", 
        color: "text-yellow-400" 
      },
    ];
  };

  useEffect(() => {
    // Rotation automatique des métriques toutes les 3 secondes
    const interval = setInterval(() => {
      setCurrentMetric((prev) => (prev + 1) % metrics.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [metrics.length]);

  useEffect(() => {
    // Mise à jour des données toutes les 30 secondes
    const dataInterval = setInterval(() => {
      setMetrics(generateProductivityData());
    }, 30000);

    return () => clearInterval(dataInterval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden p-8">
      <Spotlight className="absolute -top-40 left-0 md:left-60 md:-top-20" fill="rgba(34, 197, 94, 0.1)" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <TextGenerateEffect
            words="Productivité du Développeur"
            className="text-4xl font-bold text-white mb-4"
          />
          <p className="text-xl text-gray-300 max-w-3xl mb-8">
            Analysez votre productivité et celle de votre équipe avec des métriques avancées
          </p>
        </motion.div>

        {/* Main Productivity Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12"
        >
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
            <CardContent className="p-8">
              <div className="text-center">
                <motion.div
                  key={currentMetric}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="mb-6"
                >
                  <div className={`text-6xl font-bold ${metrics[currentMetric].color} mb-2`}>
                    {metrics[currentMetric].value}{metrics[currentMetric].unit}
                  </div>
                  <div className="text-xl text-white">{metrics[currentMetric].label}</div>
                </motion.div>
                
                <div className="flex justify-center gap-2 mb-6">
                  {metrics.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentMetric ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
                
                <Badge variant="outline" className="border-green-400/30 text-green-400">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  +15% cette semaine
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Productivity Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              title: "Focus Time",
              value: "6h 24m",
              change: "+12%",
              icon: Clock,
              color: "from-blue-500 to-cyan-500"
            },
            {
              title: "Code Quality",
              value: "92%",
              change: "+8%",
              icon: Award,
              color: "from-green-500 to-emerald-500"
            },
            {
              title: "Commits/Jour",
              value: "4.2",
              change: "+5%",
              icon: GitCommit,
              color: "from-purple-500 to-pink-500"
            },
            {
              title: "Efficacité",
              value: "87%",
              change: "+15%",
              icon: Zap,
              color: "from-orange-500 to-red-500"
            }
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
            >
              <Card className="bg-black/40 border-white/10 backdrop-blur-xl hover:bg-black/60 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center`}>
                      <metric.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="outline" className="border-green-400/30 text-green-400 text-xs">
                      {metric.change}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                  <div className="text-sm text-gray-400">{metric.title}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-12"
        >
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-white text-2xl">
                <Brain className="w-8 h-8 mr-3 text-purple-400" />
                Insights IA Personnalisés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/30">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-yellow-400 mt-1" />
                      <div>
                        <h4 className="text-white font-semibold mb-1">Optimisation suggérée</h4>
                        <p className="text-gray-300 text-sm">
                          Vos sessions de code sont plus productives entre 9h-11h. 
                          Planifiez vos tâches complexes durant cette période.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-400/30">
                    <div className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-blue-400 mt-1" />
                      <div>
                        <h4 className="text-white font-semibold mb-1">Objectif recommandé</h4>
                        <p className="text-gray-300 text-sm">
                          Visez 5 commits par jour cette semaine pour maintenir 
                          votre momentum et améliorer votre score de +10%.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-400/30">
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-green-400 mt-1" />
                      <div>
                        <h4 className="text-white font-semibold mb-1">Collaboration</h4>
                        <p className="text-gray-300 text-sm">
                          Vos reviews de code sont 40% plus rapides que la moyenne. 
                          Partagez vos bonnes pratiques avec l&apos;équipe !
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg border border-orange-400/30">
                    <div className="flex items-start gap-3">
                      <Code className="w-5 h-5 text-orange-400 mt-1" />
                      <div>
                        <h4 className="text-white font-semibold mb-1">Qualité du code</h4>
                        <p className="text-gray-300 text-sm">
                          Excellent ! Votre ratio bugs/features est en baisse de 25% 
                          par rapport au mois dernier.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Productivity Trends */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Tendances de Productivité</CardTitle>
              <div className="flex gap-2 mt-4">
                <Badge variant="outline" className="border-blue-400/30 text-blue-400">
                  30 derniers jours
                </Badge>
                <Badge variant="outline" className="border-purple-400/30 text-purple-400">
                  Prédictions IA
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg flex items-center justify-center">
                <div className="text-center text-white/60">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4" />
                  <p>Graphique de tendances interactif</p>
                  <p className="text-sm mt-2">Analyse prédictive de votre productivité</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center gap-4">
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500">
                  Voir Rapport Détaillé
                </Button>
                <Button variant="outline" className="border-white/20 text-white">
                  Exporter Données
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
