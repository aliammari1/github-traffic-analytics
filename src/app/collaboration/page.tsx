"use client";
import { motion } from "framer-motion";
import { useState, Suspense } from "react";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { TextGenerateEffect } from "@/components/aceternity/TextGenerateEffect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Network, 
  Users, 
  GitPullRequest, 
  MessageSquare,
  Star,
  GitBranch,
  Zap,
  Globe,
  ArrowRight,
  Eye,
  Share,
  TrendingUp
} from "lucide-react";

// Composant 3D Network Visualization (placeholder)
const NetworkVisualization3D = () => {
  return (
    <div className="w-full h-96 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-green-500/20 rounded-lg relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Central Node */}
          <motion.div
            className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
          >
            <Users className="w-8 h-8 text-white" />
          </motion.div>

          {/* Orbiting Nodes */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 45) * (Math.PI / 180);
            const radius = 120;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <motion.div
                key={i}
                className="absolute w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)'
                }}
                animate={{
                  rotate: [0, 360],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                  scale: { duration: 3, repeat: Infinity, delay: i * 0.2 }
                }}
              >
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </motion.div>
            );
          })}

          {/* Connection Lines */}
          {Array.from({ length: 8 }).map((_, i) => {
            const radius = 120;
            
            return (
              <motion.div
                key={`line-${i}`}
                className="absolute w-0.5 bg-gradient-to-r from-purple-500/50 to-transparent origin-center"
                style={{
                  height: `${radius}px`,
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -100%) rotate(${i * 45}deg)`
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 1, delay: i * 0.1 }}
              />
            );
          })}
        </motion.div>
      </div>

      {/* Floating Data Points */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/60 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            x: [0, Math.random() * 50 - 25],
            y: [0, Math.random() * 50 - 25],
            opacity: [0.3, 1, 0.3]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  );
};

export default function CollaborationPage() {
  const [viewMode, setViewMode] = useState<'3d' | 'graph' | 'stats'>('3d');
  const [timeRange, setTimeRange] = useState("6months");

  const networkStats = {
    totalCollaborators: 156,
    activeConnections: 89,
    strongTies: 23,
    communityScore: 87,
    influenceRadius: 4.2,
    engagementRate: 73
  };

  const topCollaborators = [
    { name: "Sarah Chen", avatar: "👩‍💻", contributions: 156, projects: 12, strength: 92 },
    { name: "Mike Wilson", avatar: "👨‍💻", contributions: 143, projects: 8, strength: 85 },
    { name: "Emma Davis", avatar: "👩‍🔬", contributions: 98, projects: 15, strength: 78 },
    { name: "David Kim", avatar: "👨‍💼", contributions: 87, projects: 6, strength: 71 }
  ];

  const networkCommunities = [
    { name: "Frontend Team", members: 23, color: "blue", activity: 94 },
    { name: "Backend Core", members: 18, color: "purple", activity: 87 },
    { name: "DevOps Circle", members: 12, color: "green", activity: 82 },
    { name: "Open Source", members: 45, color: "orange", activity: 76 }
  ];

  const collaborationTrends = [
    { month: "Jan", connections: 45, activity: 78 },
    { month: "Fév", connections: 52, activity: 82 },
    { month: "Mar", connections: 48, activity: 85 },
    { month: "Avr", connections: 61, activity: 91 },
    { month: "Mai", connections: 67, activity: 88 },
    { month: "Juin", connections: 73, activity: 93 }
  ];

  return (
    <div className="min-screen relative overflow-hidden bg-black">
      <Spotlight className="h-[80vh] w-[30vw] top-40 left-0 md:left-60 md:-top-20" fill="purple" />
      <Spotlight className="h-[80vh] w-[50vw] top-10 left-full" fill="blue" />
      <Spotlight className="h-[80vh] w-[50vw] top-28 left-80" fill="cyan" />
      
      <div className="relative z-10 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <motion.div
                className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Network className="w-8 h-8 text-white" />
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Globe className="w-3 h-3 text-white" />
              </motion.div>
            </div>
            <div>
              <TextGenerateEffect 
                words="Réseau de Collaboration"
                className="text-4xl font-bold text-white mb-2"
              />
              <p className="text-white/60 text-lg">
                Explorez vos connexions et communautés dans l&apos;écosystème GitHub
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
              <option value="month" className="bg-black">Dernier mois</option>
              <option value="3months" className="bg-black">3 derniers mois</option>
              <option value="6months" className="bg-black">6 derniers mois</option>
              <option value="month" className="bg-black">Dernier mois</option>
              <option value="3months" className="bg-black">3 derniers mois</option>
              <option value="6months" className="bg-black">6 derniers mois</option>
              <option value="year" className="bg-black">Cette année</option>
            </select>

            <div className="flex gap-2">
              {(['3d', 'graph', 'stats'] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "outline"}
                  onClick={() => setViewMode(mode)}
                  className={`${
                    viewMode === mode 
                      ? "bg-gradient-to-r from-purple-500 to-blue-500" 
                      : "border-white/20 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {mode === '3d' && <Globe className="w-4 h-4 mr-2" />}
                  {mode === 'graph' && <Network className="w-4 h-4 mr-2" />}
                  {mode === 'stats' && <TrendingUp className="w-4 h-4 mr-2" />}
                  {mode.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Network Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
        >
          {[
            { label: "Collaborateurs", value: networkStats.totalCollaborators, icon: Users, color: "blue" },
            { label: "Connexions", value: networkStats.activeConnections, icon: Network, color: "purple" },
            { label: "Liens Forts", value: networkStats.strongTies, icon: Zap, color: "yellow" },
            { label: "Score Communauté", value: networkStats.communityScore, icon: Star, color: "green" },
            { label: "Rayon d'Influence", value: networkStats.influenceRadius, icon: ArrowRight, color: "orange" },
            { label: "Engagement", value: `${networkStats.engagementRate}%`, icon: TrendingUp, color: "pink" }
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
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                    <motion.div
                      className={`w-2 h-2 rounded-full bg-${stat.color}-400`}
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-white/60">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Based on View Mode */}
        {viewMode === '3d' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Visualisation 3D du Réseau
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="w-full h-96 bg-white/5 rounded-lg animate-pulse" />}>
                  <NetworkVisualization3D />
                </Suspense>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 rounded-lg bg-white/5">
                    <div className="text-2xl font-bold text-blue-400 mb-1">156</div>
                    <div className="text-sm text-white/60">Nœuds Actifs</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-white/5">
                    <div className="text-2xl font-bold text-purple-400 mb-1">324</div>
                    <div className="text-sm text-white/60">Connexions</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-white/5">
                    <div className="text-2xl font-bold text-green-400 mb-1">12</div>
                    <div className="text-sm text-white/60">Clusters</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {viewMode === 'graph' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Top Collaborators */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Top Collaborateurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCollaborators.map((collaborator, index) => (
                    <motion.div
                      key={collaborator.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <div className="text-2xl">{collaborator.avatar}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{collaborator.name}</div>
                        <div className="text-sm text-white/60">
                          {collaborator.contributions} contributions • {collaborator.projects} projets
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-400">
                          {collaborator.strength}
                        </div>
                        <div className="text-xs text-white/60">Force</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Network Communities */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  Communautés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {networkCommunities.map((community, index) => (
                    <motion.div
                      key={community.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="p-4 rounded-lg bg-white/5"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full bg-${community.color}-500`}></div>
                          <span className="font-semibold text-white">{community.name}</span>
                        </div>
                        <Badge variant="outline" className="text-white border-white/20">
                          {community.members} membres
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-white/60">Activité</span>
                        <div className="flex-1 bg-white/10 rounded-full h-2">
                          <motion.div
                            className={`h-full rounded-full bg-${community.color}-500`}
                            initial={{ width: 0 }}
                            animate={{ width: `${community.activity}%` }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                          />
                        </div>
                        <span className={`text-${community.color}-400 font-medium`}>
                          {community.activity}%
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {viewMode === 'stats' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Tendances de Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {collaborationTrends.map((trend, index) => (
                    <div key={trend.month} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">{trend.month}</span>
                        <div className="flex gap-4 text-sm">
                          <span className="text-blue-400">{trend.connections} connexions</span>
                          <span className="text-purple-400">{trend.activity}% activité</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex-1 bg-white/5 rounded-full h-2">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(trend.connections / 80) * 100}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                          />
                        </div>
                        <div className="flex-1 bg-white/5 rounded-full h-2">
                          <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${trend.activity}%` }}
                            transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Interactions Récentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                      <GitPullRequest className="w-4 h-4 text-green-400" />
                      <span className="text-white/80">15 reviews cette semaine</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                      <MessageSquare className="w-4 h-4 text-blue-400" />
                      <span className="text-white/80">23 discussions actives</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                      <Share className="w-4 h-4 text-purple-400" />
                      <span className="text-white/80">8 nouveaux followers</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Influence &amp; Portée
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">4.2</div>
                      <div className="text-white/60">Portée Globale</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold text-blue-400">87</div>
                        <div className="text-xs text-white/60">Score d&apos;influence</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-purple-400">12</div>
                        <div className="text-xs text-white/60">Mentions/semaine</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
