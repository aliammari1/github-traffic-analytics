"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, useAnimation } from "framer-motion";
import { Repository } from "@/lib/github";
import LoginForm from "@/components/LoginForm";
import RepositorySelector from "@/components/RepositorySelector";
import TrafficDashboard from "@/components/TrafficDashboard";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { TextGenerateEffect } from "@/components/aceternity/TextGenerateEffect";
import { FloatingNav } from "@/components/aceternity/FloatingNav";
import { HolographicCard, HolographicButton, HolographicGrid } from "@/components/aceternity/HolographicCards";
import { NeuralNetworkBackground } from "@/components/aceternity/NeuralNetworkBackground";
import { LiveDashboard } from "@/components/aceternity/LiveDashboard";
import { FloatingControlCenter } from "@/components/aceternity/FloatingControlCenter";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  GitBranch, 
  Users, 
  Eye, 
  Star,
  Activity,
  Zap,
  Shield,
  Brain,
  Sparkles,
  Rocket,
  Globe,
  BarChart3,
  Command,
  Play
} from "lucide-react";

const navItems = [
  {
    name: "Accueil",
    link: "/",
    icon: <Activity className="h-4 w-4" />,
  },
  {
    name: "Analytics",
    link: "/traffic",
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    name: "Repositories",
    link: "/repositories",
    icon: <GitBranch className="h-4 w-4" />,
  },
  {
    name: "Insights",
    link: "/insights",
    icon: <Brain className="h-4 w-4" />,
  },
];

export default function HomePage() {
  const { data: session, status } = useSession();
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    });
  }, [controls]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <NeuralNetworkBackground className="opacity-30" />
        <div className="relative z-10 text-center">
          <motion.div
            className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-8"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-white">Chargement de l&apos;expérience</h2>
            <p className="text-white/60">GitHub Analytics Pro se prépare...</p>
            <div className="flex items-center justify-center gap-2 text-blue-400">
              <Command className="h-4 w-4" />
              <span className="text-sm">Initialisation des composants révolutionnaires</span>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <NeuralNetworkBackground className="opacity-20" />
        <Spotlight className="absolute -top-40 left-0 md:left-60 md:-top-20" fill="white" />
        <FloatingNav navItems={navItems} />
        
        <div className="relative z-10 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            {/* Revolutionary Hero Section */}
            <div className="text-center py-20">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="mb-8"
              >
                <Badge variant="outline" className="px-6 py-3 text-blue-400 border-blue-400/30 bg-blue-400/10 backdrop-blur-sm">
                  <Sparkles className="w-5 h-5 mr-3" />
                  Révolutionnaire GitHub Analytics Pro
                  <div className="ml-3 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </Badge>
              </motion.div>
              
              <TextGenerateEffect
                words="L'Intelligence Artificielle rencontre GitHub Analytics"
                className="text-4xl md:text-7xl font-bold text-center text-white mb-8 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent"
              />
              
              <motion.p
                className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Découvrez 20 expériences innovantes avec IA prédictive, visualisations 3D interactives, 
                analyse de code en temps réel et des insights qui révolutionnent votre développement.
              </motion.p>
              
              <motion.div
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <HolographicButton variant="primary" size="lg">
                  <LoginForm />
                </HolographicButton>
                
                <HolographicButton 
                  variant="secondary" 
                  size="lg"
                  onClick={() => window.open("/traffic", "_blank")}
                >
                  <div className="flex items-center gap-3">
                    <Play className="h-5 w-5" />
                    Démo Interactive
                  </div>
                </HolographicButton>
              </motion.div>
            </div>

            {/* Revolutionary Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="py-20"
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  20 Expériences Révolutionnaires
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Chaque page offre une expérience unique avec des technologies de pointe
                </p>
              </div>
              
              <HolographicGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <HolographicCard className="md:col-span-2 p-8">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                        <TrendingUp className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Analytics Temps Réel</h3>
                        <p className="text-gray-300">Données live avec IA prédictive</p>
                      </div>
                    </div>
                    <div className="flex-1 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg p-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-400">847K</div>
                          <div className="text-sm text-gray-400">Analyses/jour</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-cyan-400">99.7%</div>
                          <div className="text-sm text-gray-400">Précision IA</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-400">2.1s</div>
                          <div className="text-sm text-gray-400">Temps réel</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </HolographicCard>
                
                <HolographicCard className="p-6">
                  <div className="text-center">
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mx-auto w-fit mb-4">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">IA Prédictive</h3>
                    <p className="text-gray-300 text-sm mb-4">Prédictions intelligentes sur vos projets</p>
                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-3">
                      <div className="text-sm text-purple-300">Précision: 94.2%</div>
                    </div>
                  </div>
                </HolographicCard>
                
                <HolographicCard className="p-6">
                  <div className="text-center">
                    <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl mx-auto w-fit mb-4">
                      <Globe className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">3D Immersif</h3>
                    <p className="text-gray-300 text-sm mb-4">Explorez votre code en 3D</p>
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-3">
                      <div className="text-sm text-green-300">WebGL + Three.js</div>
                    </div>
                  </div>
                </HolographicCard>
                
                <HolographicCard className="md:col-span-2 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Sécurité Avancée</h3>
                      <p className="text-gray-300">Analyse complète avec recommandations IA</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-red-500/10 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-red-400">0</div>
                      <div className="text-sm text-gray-400">Vulnérabilités critiques</div>
                    </div>
                    <div className="bg-green-500/10 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-green-400">100%</div>
                      <div className="text-sm text-gray-400">Code sécurisé</div>
                    </div>
                  </div>
                </HolographicCard>
              </HolographicGrid>
            </motion.div>

            {/* Live Statistics */}
            <motion.div
              className="py-20"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">Impact Mondial</h2>
                <p className="text-gray-300">Des milliers de développeurs utilisent déjà notre plateforme</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { icon: Users, label: "Développeurs", value: "50K+", color: "text-blue-400", gradient: "from-blue-500 to-cyan-500" },
                  { icon: GitBranch, label: "Repositories", value: "200K+", color: "text-green-400", gradient: "from-green-500 to-emerald-500" },
                  { icon: Eye, label: "Analyses", value: "5M+", color: "text-purple-400", gradient: "from-purple-500 to-pink-500" },
                  { icon: Star, label: "Insights", value: "1M+", color: "text-yellow-400", gradient: "from-yellow-500 to-orange-500" },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.3 + index * 0.1 }}
                  >
                    <HolographicCard className="p-6 text-center">
                      <div className={`p-4 bg-gradient-to-br ${stat.gradient} rounded-xl mx-auto w-fit mb-4`}>
                        <stat.icon className="h-8 w-8 text-white" />
                      </div>
                      <div className={`text-3xl font-bold mb-2 ${stat.color}`}>{stat.value}</div>
                      <div className="text-gray-400">{stat.label}</div>
                    </HolographicCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <NeuralNetworkBackground className="opacity-10" />
      <Spotlight className="absolute -top-40 left-0 md:left-60 md:-top-20" fill="white" />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        {!selectedRepository ? (
          <div className="space-y-8">
            {/* Revolutionary Welcome Header */}
            <motion.div
              className="text-center pt-8 pb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-4 mb-6">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.2, 1, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    repeatDelay: 2 
                  }}
                >
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                </motion.div>
                <div>
                  <h1 className="text-4xl font-bold text-center mb-4">
                    GitHub Traffic Analytics - L&apos;Innovation au Service de vos Données
                  </h1>
                  <motion.p
                    className="text-xl text-gray-300 mt-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    Votre univers GitHub Analytics Pro vous attend
                  </motion.p>
                </div>
              </div>
            </motion.div>

            {/* Live Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-7xl mx-auto px-6"
            >
              <LiveDashboard />
            </motion.div>

            {/* Enhanced Repository Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="max-w-4xl mx-auto p-6"
            >
              <HolographicCard className="p-8">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl">
                      <GitBranch className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Analyse Approfondie</h2>
                  </div>
                  <p className="text-gray-300">
                    Sélectionnez un repository pour une analyse complète avec IA
                  </p>
                </div>
                <RepositorySelector onRepositorySelect={setSelectedRepository} />
              </HolographicCard>
            </motion.div>

            {/* Revolutionary Navigation Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="max-w-7xl mx-auto p-6"
            >
              <HolographicCard className="p-8">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                      <Rocket className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">20 Expériences Révolutionnaires</h2>
                  </div>
                  <p className="text-gray-300 mb-8">
                    Explorez toutes les fonctionnalités avancées avec IA et visualisations 3D
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  {[
                    { name: "Analytics", icon: BarChart3, color: "from-blue-500 to-cyan-500", href: "/traffic" },
                    { name: "IA Review", icon: Brain, color: "from-purple-500 to-pink-500", href: "/ai-review" },
                    { name: "3D Explorer", icon: Globe, color: "from-green-500 to-emerald-500", href: "/3d-explorer" },
                    { name: "Sécurité", icon: Shield, color: "from-red-500 to-orange-500", href: "/security" },
                    { name: "Collaboration", icon: Users, color: "from-indigo-500 to-purple-500", href: "/collaboration" },
                    { name: "Productivité", icon: Zap, color: "from-yellow-500 to-orange-500", href: "/productivity" },
                    { name: "Tendances", icon: TrendingUp, color: "from-pink-500 to-red-500", href: "/trends" },
                    { name: "Plus...", icon: Command, color: "from-gray-500 to-gray-700", href: "/repositories" }
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                    >
                      <HolographicButton
                        onClick={() => window.location.href = feature.href}
                        className="w-full p-4"
                      >
                        <div className="text-center">
                          <div className={`mx-auto mb-3 w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                            <feature.icon className="h-5 w-5 text-white" />
                          </div>
                          <p className="text-sm font-medium text-white">{feature.name}</p>
                        </div>
                      </HolographicButton>
                    </motion.div>
                  ))}
                </div>
                
                <motion.div
                  className="mt-8 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                >
                  <p className="text-gray-400 text-sm mb-4">
                    Utilisez <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">⌘ /</kbd> pour la navigation rapide
                  </p>
                </motion.div>
              </HolographicCard>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <TrafficDashboard
              repository={selectedRepository}
              onBack={() => setSelectedRepository(null)}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Revolutionary Floating Control Center */}
      <FloatingControlCenter 
        onThemeToggle={() => {
          // Theme selector functionality can be implemented here
          console.log('Theme toggle clicked');
        }}
      />
    </div>
  );
}
