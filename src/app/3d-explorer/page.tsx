"use client";
import { motion } from "framer-motion";
import { useState, Suspense } from "react";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { TextGenerateEffect } from "@/components/aceternity/TextGenerateEffect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Globe, 
  Layers, 
  Maximize, 
  RotateCcw, 
  Settings, 
  Eye,
  Cpu,
  Network,
  Zap
} from "lucide-react";

// Composant placeholder pour la visualisation 3D
const CodeArchitecture3D = () => {
  return (
    <div className="w-full h-96 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-lg relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative"
          animate={{ 
            rotateY: 360,
            rotateX: [0, 20, 0],
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg opacity-80" />
          <motion.div
            className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-green-400 to-cyan-400 rounded-lg"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-pink-400 to-red-400 rounded-lg"
            animate={{ scale: [1.2, 1, 1.2] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </motion.div>
      </div>
      
      {/* Particules flottantes */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/40 rounded-full"
          initial={{
            x: Math.random() * 400,
            y: Math.random() * 400,
          }}
          animate={{
            x: Math.random() * 400,
            y: Math.random() * 400,
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  );
};

const NetworkVisualization = () => {
  return (
    <div className="w-full h-64 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div className="relative">
          {/* Nœuds centraux */}
          <motion.div
            className="w-8 h-8 bg-green-400 rounded-full absolute"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Nœuds satellites */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="w-4 h-4 bg-blue-400 rounded-full absolute"
              style={{
                x: Math.cos((i * Math.PI * 2) / 8) * 60,
                y: Math.sin((i * Math.PI * 2) / 8) * 60,
              }}
              animate={{
                x: Math.cos((i * Math.PI * 2) / 8 + Date.now() * 0.001) * 60,
                y: Math.sin((i * Math.PI * 2) / 8 + Date.now() * 0.001) * 60,
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />
          ))}
          
          {/* Lignes de connexion animées */}
          <svg className="absolute inset-0 w-full h-full">
            {[...Array(8)].map((_, i) => (
              <motion.line
                key={i}
                x1="50%"
                y1="50%"
                x2={`${50 + Math.cos((i * Math.PI * 2) / 8) * 25}%`}
                y2={`${50 + Math.sin((i * Math.PI * 2) / 8) * 25}%`}
                stroke="rgba(59, 130, 246, 0.6)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </svg>
        </motion.div>
      </div>
    </div>
  );
};

export default function ThreeDExplorerPage() {
  const [viewMode, setViewMode] = useState<'architecture' | 'network' | 'performance'>('architecture');
  const [isFullscreen, setIsFullscreen] = useState(false);

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
            words="Explorateur 3D de Code"
            className="text-4xl font-bold text-white mb-4"
          />
          <p className="text-xl text-gray-300 max-w-3xl mb-8">
            Explorez votre écosystème GitHub comme jamais auparavant. Naviguez dans un environnement 3D immersif qui transforme vos données en paysages interactifs.
          </p>
          
          <div className="flex gap-4 items-center flex-wrap">
            <Button
              variant={viewMode === 'architecture' ? 'default' : 'outline'}
              onClick={() => setViewMode('architecture')}
              className="bg-white/10 border-white/20"
            >
              <Layers className="w-4 h-4 mr-2" />
              Architecture
            </Button>
            <Button
              variant={viewMode === 'network' ? 'default' : 'outline'}
              onClick={() => setViewMode('network')}
              className="bg-white/10 border-white/20"
            >
              <Network className="w-4 h-4 mr-2" />
              Réseau
            </Button>
            <Button
              variant={viewMode === 'performance' ? 'default' : 'outline'}
              onClick={() => setViewMode('performance')}
              className="bg-white/10 border-white/20"
            >
              <Cpu className="w-4 h-4 mr-2" />
              Performance
            </Button>
            
            <div className="flex-1" />
            
            <Badge variant="outline" className="border-purple-400/30 text-purple-400">
              <Globe className="w-4 h-4 mr-2" />
              Mode 3D Actif
            </Badge>
          </div>
        </motion.div>

        {/* Contrôles 3D */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" className="border-white/20 text-white">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Vue
                  </Button>
                  <Button variant="outline" size="sm" className="border-white/20 text-white">
                    <Eye className="w-4 h-4 mr-2" />
                    Vue Libre
                  </Button>
                  <Button variant="outline" size="sm" className="border-white/20 text-white">
                    <Settings className="w-4 h-4 mr-2" />
                    Paramètres
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="border-white/20 text-white"
                >
                  <Maximize className="w-4 h-4 mr-2" />
                  Plein Écran
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Visualisation 3D Principale */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className={`mb-8 ${isFullscreen ? 'fixed inset-0 z-50 p-8 bg-black' : ''}`}
        >
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl h-full">
            <CardHeader>
              <CardTitle className="flex items-center text-white text-2xl">
                <Globe className="w-8 h-8 mr-3 text-purple-400" />
                {viewMode === 'architecture' && 'Architecture du Code 3D'}
                {viewMode === 'network' && 'Réseau de Dépendances'}
                {viewMode === 'performance' && 'Métriques de Performance'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={
                <div className="w-full h-96 bg-black/20 rounded-lg flex items-center justify-center">
                  <div className="text-white/60">Chargement de la visualisation 3D...</div>
                </div>
              }>
                {viewMode === 'architecture' && <CodeArchitecture3D />}
                {viewMode === 'network' && <NetworkVisualization />}
                {viewMode === 'performance' && <CodeArchitecture3D />}
              </Suspense>
            </CardContent>
          </Card>
        </motion.div>

        {/* Métriques et Informations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white text-lg">Complexité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400 mb-2">7.8/10</div>
                <div className="text-sm text-gray-400">Complexité cyclomatique moyenne</div>
                <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-400 to-cyan-400"
                    initial={{ width: 0 }}
                    animate={{ width: '78%' }}
                    transition={{ duration: 1, delay: 0.8 }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white text-lg">Couplage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400 mb-2">4.2/10</div>
                <div className="text-sm text-gray-400">Niveau de couplage des modules</div>
                <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-400"
                    initial={{ width: 0 }}
                    animate={{ width: '42%' }}
                    transition={{ duration: 1, delay: 0.9 }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white text-lg">Maintenabilité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-400 mb-2">8.9/10</div>
                <div className="text-sm text-gray-400">Index de maintenabilité</div>
                <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                    initial={{ width: 0 }}
                    animate={{ width: '89%' }}
                    transition={{ duration: 1, delay: 1.0 }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Navigation Interactive */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Navigation Interactive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-16 flex flex-col gap-2 bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Layers className="w-6 h-6" />
                  Modules
                </Button>
                <Button className="h-16 flex flex-col gap-2 bg-gradient-to-br from-green-500 to-emerald-500">
                  <Network className="w-6 h-6" />
                  Dépendances
                </Button>
                <Button className="h-16 flex flex-col gap-2 bg-gradient-to-br from-purple-500 to-pink-500">
                  <Zap className="w-6 h-6" />
                  Performance
                </Button>
                <Button className="h-16 flex flex-col gap-2 bg-gradient-to-br from-orange-500 to-red-500">
                  <Eye className="w-6 h-6" />
                  Analyse
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
