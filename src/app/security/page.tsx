"use client";
import { motion } from "framer-motion";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { TextGenerateEffect } from "@/components/aceternity/TextGenerateEffect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function SecurityPage() {
  const vulnerabilities = [
    { severity: "Critique", count: 2, color: "text-red-400", bg: "from-red-500/20 to-red-600/20" },
    { severity: "Élevé", count: 5, color: "text-orange-400", bg: "from-orange-500/20 to-orange-600/20" },
    { severity: "Moyen", count: 12, color: "text-yellow-400", bg: "from-yellow-500/20 to-yellow-600/20" },
    { severity: "Faible", count: 8, color: "text-blue-400", bg: "from-blue-500/20 to-blue-600/20" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden p-8">
      <Spotlight className="absolute -top-40 left-0 md:left-60 md:-top-20" fill="rgba(239, 68, 68, 0.1)" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <TextGenerateEffect
            words="Scanner de Sécurité Avancé"
            className="text-4xl font-bold text-white mb-4"
          />
          <p className="text-xl text-gray-300 max-w-3xl mb-8">
            Analyse de sécurité complète avec détection automatique des vulnérabilités et recommandations.
          </p>
        </motion.div>

        {/* Security Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
            <CardContent className="p-8 text-center">
              <div className="text-6xl font-bold text-green-400 mb-4">B+</div>
              <div className="text-2xl text-white mb-2">Score de Sécurité</div>
              <Badge variant="outline" className="border-green-400/30 text-green-400">
                <Shield className="w-4 h-4 mr-2" />
                Sécurisé
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vulnerabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {vulnerabilities.map((vuln, index) => (
            <motion.div
              key={vuln.severity}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
            >
              <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
                <CardContent className="p-6">
                  <div className={`w-full h-24 rounded-lg bg-gradient-to-br ${vuln.bg} flex items-center justify-center mb-4`}>
                    <div className={`text-3xl font-bold ${vuln.color}`}>{vuln.count}</div>
                  </div>
                  <div className="text-white font-semibold">{vuln.severity}</div>
                  <div className="text-gray-400 text-sm">Vulnérabilités</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Detailed Security Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Analyse Détaillée</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "Dépendance obsolète détectée",
                    description: "lodash@4.17.20 contient des vulnérabilités connues",
                    severity: "Critique",
                    icon: XCircle,
                    color: "text-red-400"
                  },
                  {
                    title: "Configuration HTTPS manquante",
                    description: "Force l'utilisation de HTTPS en production",
                    severity: "Élevé",
                    icon: AlertTriangle,
                    color: "text-orange-400"
                  },
                  {
                    title: "Authentification sécurisée",
                    description: "Implémentation OAuth2 conforme",
                    severity: "Bon",
                    icon: CheckCircle,
                    color: "text-green-400"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.0 + index * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <item.icon className={`w-6 h-6 ${item.color} mt-1`} />
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                      <p className="text-gray-300 text-sm mb-2">{item.description}</p>
                      <Badge variant="outline" className={`border-${item.color.split('-')[1]}-400/30 ${item.color} text-xs`}>
                        {item.severity}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" className="border-white/20 text-white">
                      Corriger
                    </Button>
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
