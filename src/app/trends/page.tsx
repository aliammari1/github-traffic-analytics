"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { TextGenerateEffect } from "@/components/aceternity/TextGenerateEffect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  AlertTriangle,
  Target,
  CheckCircle,
  Brain,
  Sparkles,
  Zap,
  Users,
  Activity,
  Clock
} from 'lucide-react';

export default function TrendsPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("3 mois");
  const [predictionType, setPredictionType] = useState<'popularity' | 'tech' | 'community'>('popularity');
  const [confidenceLevel] = useState<number>(0.87);

  const predictions = {
    popularity: [
      {
        title: "Croissance des Stars",
        prediction: "+2,400 stars dans les 3 prochains mois",
        confidence: 89,
        reasoning: "Tendance ascendante constante + mention dans newsletter tech",
        impact: "high",
        color: "green"
      },
      {
        title: "Engagement Communauté",
        prediction: "+45% de contributeurs actifs",
        confidence: 76,
        reasoning: "Issues marquées 'good-first-issue' en augmentation",
        impact: "medium",
        color: "blue"
      },
      {
        title: "Fork Rate",
        prediction: "+156 forks cette semaine",
        confidence: 82,
        reasoning: "Pattern viral détecté sur Twitter tech",
        impact: "high",
        color: "orange"
      }
    ],
    tech: [
      {
        title: "Migration TypeScript",
        prediction: "+34% de contributions TypeScript prévu",
        confidence: 91,
        reasoning: "Tendance industry + roadmap projet alignée",
        impact: "high",
        color: "blue"
      },
      {
        title: "Migration React 19",
        prediction: "Mise à jour recommendée dans 2 mois",
        confidence: 73,
        reasoning: "Stabilité version + feature compatibility",
        impact: "medium",
        color: "yellow"
      },
      {
        title: "Performance Optimization",
        prediction: "Besoin d'optimisation critique détecté",
        confidence: 94,
        reasoning: "Métriques dégradation + user feedback",
        impact: "critical",
        color: "red"
      }
    ],
    community: [
      {
        title: "Nouveau Maintainer",
        prediction: "Besoin d'1-2 maintainers supplémentaires",
        confidence: 87,
        reasoning: "Charge de travail actuelle + croissance projet",
        impact: "high",
        color: "purple"
      },
      {
        title: "Spike Contributions",
        prediction: "Hacktoberfest +300% contributions",
        confidence: 95,
        reasoning: "Historique années précédentes + préparation",
        impact: "high",
        color: "orange"
      },
      {
        title: "Documentation Gap",
        prediction: "Besoin urgent de documentation",
        confidence: 78,
        reasoning: "Ratio questions/documentation détérioré",
        impact: "medium",
        color: "yellow"
      }
    ]
  };

  const trendingTopics = [
    { topic: "AI Integration", growth: "+340%", confidence: 97, hotness: 97 },
    { topic: "WebAssembly", growth: "+156%", confidence: 89, hotness: 89 },
    { topic: "Edge Computing", growth: "+234%", confidence: 85, hotness: 85 },
    { topic: "Rust Adoption", growth: "+198%", confidence: 82, hotness: 82 },
    { topic: "Serverless", growth: "+123%", confidence: 78, hotness: 78 }
  ];

  const marketInsights = [
    {
      insight: "L'IA générative va transformer 67% des projets open source d'ici 6 mois",
      probability: 89,
      timeframe: "6 mois",
      impact: "Révolutionnaire"
    },
    {
      insight: "Les langages fonctionnels verront une adoption +45% cette année",
      probability: 73,
      timeframe: "12 mois",
      impact: "Significatif"
    },
    {
      insight: "Edge computing deviendra standard pour 34% des nouvelles apps",
      probability: 81,
      timeframe: "18 mois",
      impact: "Transformateur"
    }
  ];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-400";
    if (confidence >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'high': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'medium': return <Target className="w-4 h-4 text-yellow-400" />;
      default: return <CheckCircle className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <Spotlight className="top-40 left-0 md:left-60 md:-top-20" fill="purple" />
      <Spotlight className="top-10 left-full h-[80vh] w-[50vw]" fill="cyan" />
      <Spotlight className="top-28 left-80 h-[80vh] w-[50vw]" fill="pink" />
      
      <div className="relative z-10 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <motion.div
                className="w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-2xl flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Brain className="w-8 h-8 text-white" />
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-3 h-3 text-white" />
              </motion.div>
            </div>
            <div>
              <TextGenerateEffect 
                words="Détecteur de Tendances IA"
                className="text-4xl font-bold text-white mb-2"
              />
              <p className="text-gray-300 mb-4">Analysez l&apos;évolution de votre écosystème technologique</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4">
            <select 
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white backdrop-blur-sm"
            >
              <option value="1 semaine" className="bg-black">1 semaine</option>
              <option value="1 mois" className="bg-black">1 mois</option>
              <option value="3 mois" className="bg-black">3 mois</option>
              <option value="6 mois" className="bg-black">6 mois</option>
            </select>

            <div className="flex gap-2">
              {(['popularity', 'tech', 'community'] as const).map((type) => (
                <Button
                  key={type}
                  variant={predictionType === type ? "default" : "outline"}
                  onClick={() => setPredictionType(type)}
                  className={`${
                    predictionType === type 
                      ? "bg-gradient-to-r from-purple-500 to-pink-500" 
                      : "border-white/20 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {type === 'popularity' && <TrendingUp className="w-4 h-4 mr-2" />}
                  {type === 'tech' && <Zap className="w-4 h-4 mr-2" />}
                  {type === 'community' && <Users className="w-4 h-4 mr-2" />}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* AI Confidence Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center"
                    animate={{ 
                      boxShadow: [
                        "0 0 20px rgba(34, 197, 94, 0.7)",
                        "0 0 20px rgba(34, 197, 94, 0)",
                        "0 0 20px rgba(34, 197, 94, 0)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Brain className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-white">IA Prédictive Active</h3>
                    <p className="text-sm text-muted-foreground">
                      Basé sur l&apos;analyse prédictive des données GitHub
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-400">{confidenceLevel}%</div>
                  <div className="text-white/60">Confiance Globale</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Predictions Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {predictions[predictionType].map((prediction, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getImpactIcon(prediction.impact)}
                      <h3 className="font-semibold text-white">{prediction.title}</h3>
                    </div>
                    <Badge 
                      variant="outline"
                      className={`${getConfidenceColor(prediction.confidence)} border-current`}
                    >
                      {prediction.confidence}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div className={`text-lg font-bold text-${prediction.color}-400`}>
                      {prediction.prediction}
                    </div>
                    
                    <div className="p-3 rounded-lg bg-white/5">
                      <div className="text-sm text-white/60 mb-1">Raisonnement IA:</div>
                      <div className="text-sm text-white/80">{prediction.reasoning}</div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/60">Mise à jour:</span>
                      <span className="text-white/80">Il y a 2 min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Trending Topics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Sujets en Tendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendingTopics.map((topic, index) => (
                  <motion.div
                    key={topic.topic}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-1">{topic.topic}</div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-400 font-medium">{topic.growth}</span>
                        <span className="text-white/60">
                          Confiance: {topic.confidence}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-400">{topic.hotness}</div>
                        <div className="text-xs text-white/60">Hotness</div>
                      </div>
                      <motion.div
                        className="w-2 h-8 bg-gradient-to-t from-orange-500 to-red-500 rounded-full"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: topic.hotness / 100 }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Insights Marché
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {marketInsights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 * index }}
                    className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-l-4 border-purple-500"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <motion.div
                        className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      >
                        <Brain className="w-4 h-4 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <p className="text-white/90 text-sm leading-relaxed">{insight.insight}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-4">
                        <span className="text-white/60">Probabilité:</span>
                        <span className={`font-bold ${getConfidenceColor(insight.probability)}`}>
                          {insight.probability}%
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-white/60">Échéance:</span>
                        <span className="text-cyan-400">{insight.timeframe}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <Badge variant="outline" className="text-pink-400 border-pink-400">
                        {insight.impact}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Processing Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="flex gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </motion.div>
                  <div>
                    <h3 className="text-white font-semibold">IA en cours d&apos;analyse</h3>
                    <p className="text-white/60 text-sm">
                      Traitement de nouveaux patterns et signaux faibles...
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Clock className="w-4 h-4" />
                  <span>Prochaine mise à jour dans 47 min</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
