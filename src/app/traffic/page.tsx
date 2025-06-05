"use client";
import { motion } from "framer-motion";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { TextGenerateEffect } from "@/components/aceternity/TextGenerateEffect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Activity, Users, Eye, GitBranch, Star } from "lucide-react";

export default function TrafficPage() {
  return (
    <div className="min-h-screen relative overflow-hidden p-8">
      <Spotlight className="absolute -top-40 left-0 md:left-60 md:-top-20" fill="rgba(59, 130, 246, 0.1)" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <TextGenerateEffect
            words="Analytics de Trafic Avancées"
            className="text-4xl font-bold text-white mb-4"
          />
          <p className="text-xl text-gray-300 max-w-3xl">
            Découvrez des insights détaillés sur le trafic de vos repositories avec des visualisations en temps réel.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Traffic Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <TrendingUp className="w-6 h-6 mr-2 text-blue-400" />
                  Vues Totales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">24,567</div>
                <div className="text-sm text-green-400 flex items-center">
                  <Activity className="w-4 h-4 mr-1" />
                  +12% cette semaine
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Unique Visitors */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Users className="w-6 h-6 mr-2 text-purple-400" />
                  Visiteurs Uniques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">8,429</div>
                <div className="text-sm text-blue-400 flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  +8% cette semaine
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Repository Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <GitBranch className="w-6 h-6 mr-2 text-green-400" />
                  Repositories Actifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">42</div>
                <div className="text-sm text-yellow-400 flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  156 étoiles au total
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Detailed Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12"
        >
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Tendances de Trafic</CardTitle>
              <div className="flex gap-2 mt-4">
                <Badge variant="outline" className="border-blue-400/30 text-blue-400">
                  7 derniers jours
                </Badge>
                <Badge variant="outline" className="border-purple-400/30 text-purple-400">
                  Temps réel
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg flex items-center justify-center">
                <div className="text-center text-white/60">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4" />
                  <p>Graphique interactif de trafic</p>
                  <p className="text-sm mt-2">Visualisation en temps réel des données</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Real-time Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-8"
        >
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Activité en Temps Réel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: "Il y a 2 min", action: "Nouvelle vue sur react-dashboard", country: "France" },
                  { time: "Il y a 5 min", action: "Clone du repository nextjs-app", country: "Canada" },
                  { time: "Il y a 8 min", action: "Étoile ajoutée à python-api", country: "États-Unis" },
                  { time: "Il y a 12 min", action: "Fork de typescript-utils", country: "Allemagne" },
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <div>
                        <p className="text-white font-medium">{activity.action}</p>
                        <p className="text-gray-400 text-sm">{activity.country}</p>
                      </div>
                    </div>
                    <div className="text-gray-400 text-sm">{activity.time}</div>
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
