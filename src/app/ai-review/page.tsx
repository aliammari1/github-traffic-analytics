"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { TextGenerateEffect } from "@/components/aceternity/TextGenerateEffect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, TrendingUp, Target, Clock, Zap } from "lucide-react";

export default function AIReviewPage() {
  const [activeReview, setActiveReview] = useState(0);

  const reviews = [
    {
      file: "components/Dashboard.tsx",
      suggestions: 8,
      score: 87,
      issues: ["Performance", "Accessibilité"],
      improvements: ["Memoization", "ARIA labels"]
    },
    {
      file: "utils/dataProcessor.js",
      suggestions: 12,
      score: 73,
      issues: ["Complexité", "Types"],
      improvements: ["Simplification", "TypeScript"]
    },
    {
      file: "api/routes.py",
      suggestions: 5,
      score: 92,
      issues: ["Documentation"],
      improvements: ["Docstrings", "Type hints"]
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden p-8">
      <Spotlight className="absolute -top-40 left-0 md:left-60 md:-top-20" fill="rgba(168, 85, 247, 0.1)" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <TextGenerateEffect
            words="Révision de Code par IA"
            className="text-4xl font-bold text-white mb-4"
          />
          <p className="text-xl text-gray-300 max-w-3xl mb-8">
            Intelligence artificielle avancée pour l&apos;analyse et la révision automatique de votre code.
          </p>
        </motion.div>

        {/* AI Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">IA CodeReviewer v2.1</h3>
                    <p className="text-gray-300">Analyse en cours... 23 fichiers traités</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-400">94%</div>
                  <div className="text-sm text-gray-400">Précision moyenne</div>
                </div>
              </div>
              
              <div className="mt-6 h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                  initial={{ width: 0 }}
                  animate={{ width: '76%' }}
                  transition={{ duration: 2, delay: 0.5 }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>Analyse en cours...</span>
                <span>76% terminé</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Review Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Suggestions IA</CardTitle>
                  <div className="flex gap-2 mt-4">
                    {reviews.map((review, index) => (
                      <Button
                        key={index}
                        variant={activeReview === index ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveReview(index)}
                        className="border-white/20"
                      >
                        {review.file.split('/').pop()}
                      </Button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <motion.div
                    key={activeReview}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-white">{reviews[activeReview].file}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-purple-400/30 text-purple-400">
                          Score: {reviews[activeReview].score}%
                        </Badge>
                        <Badge variant="outline" className="border-blue-400/30 text-blue-400">
                          {reviews[activeReview].suggestions} suggestions
                        </Badge>
                      </div>
                    </div>

                    {/* Code Analysis */}
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                      <div className="text-sm text-gray-400 mb-2">Ligne 42-48:</div>
                      <pre className="text-green-400 text-sm mb-4">
{`function processData(data) {
  // IA Suggestion: Ajouter la validation des types
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data');
  }
  return data.map(item => ({ ...item, processed: true }));
}`}
                      </pre>
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-yellow-400 mt-1" />
                        <div>
                          <p className="text-white font-semibold">Suggestion IA</p>
                          <p className="text-gray-300 text-sm">
                            Ajoutez une validation TypeScript pour améliorer la sécurité des types et réduire les erreurs runtime.
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500">
                              Appliquer
                            </Button>
                            <Button variant="outline" size="sm" className="border-white/20 text-white">
                              Ignorer
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Issues & Improvements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-white font-semibold mb-3">Problèmes détectés</h5>
                        <div className="space-y-2">
                          {reviews[activeReview].issues.map((issue, index) => (
                            <div key={index} className="flex items-center gap-2 text-red-400 text-sm">
                              <Target className="w-4 h-4" />
                              {issue}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-white font-semibold mb-3">Améliorations suggérées</h5>
                        <div className="space-y-2">
                          {reviews[activeReview].improvements.map((improvement, index) => (
                            <div key={index} className="flex items-center gap-2 text-green-400 text-sm">
                              <Zap className="w-4 h-4" />
                              {improvement}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="space-y-6"
            >
              {/* AI Metrics */}
              <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Métriques IA</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Qualité Code</span>
                        <span className="text-white">87%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-400"
                          initial={{ width: 0 }}
                          animate={{ width: '87%' }}
                          transition={{ duration: 1, delay: 0.8 }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Maintenabilité</span>
                        <span className="text-white">73%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-400 to-cyan-400"
                          initial={{ width: 0 }}
                          animate={{ width: '73%' }}
                          transition={{ duration: 1, delay: 0.9 }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Performance</span>
                        <span className="text-white">92%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                          initial={{ width: 0 }}
                          animate={{ width: '92%' }}
                          transition={{ duration: 1, delay: 1.0 }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Actions Rapides</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                      <Brain className="w-4 h-4 mr-2" />
                      Appliquer Toutes les Suggestions
                    </Button>
                    <Button variant="outline" className="w-full border-white/20 text-white">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Rapport Détaillé
                    </Button>
                    <Button variant="outline" className="w-full border-white/20 text-white">
                      <Clock className="w-4 h-4 mr-2" />
                      Planifier Révision
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
