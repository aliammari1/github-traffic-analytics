"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { TextGenerateEffect } from "@/components/aceternity/TextGenerateEffect";
import { BentoGrid, BentoGridItem } from "@/components/aceternity/BentoGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GitBranch, 
  Star, 
  GitCommit, 
  Eye, 
  Download, 
  Users, 
  Calendar,
  Code,
  Activity,
  TrendingUp
} from "lucide-react";

const repositories = [
  {
    id: 1,
    name: "react-dashboard",
    description: "Dashboard moderne avec React et TypeScript",
    language: "TypeScript",
    stars: 245,
    forks: 67,
    views: 1240,
    commits: 156,
    lastUpdate: "2 heures",
    isPrivate: false,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: 2,
    name: "python-api-server",
    description: "API REST performante avec FastAPI",
    language: "Python",
    stars: 89,
    forks: 23,
    views: 567,
    commits: 234,
    lastUpdate: "1 jour",
    isPrivate: true,
    gradient: "from-green-500 to-emerald-500"
  },
  {
    id: 3,
    name: "nextjs-portfolio",
    description: "Portfolio personnel avec Next.js 15",
    language: "JavaScript",
    stars: 178,
    forks: 45,
    views: 890,
    commits: 89,
    lastUpdate: "3 heures",
    isPrivate: false,
    gradient: "from-purple-500 to-pink-500"
  },
  {
    id: 4,
    name: "mobile-app-flutter",
    description: "Application mobile cross-platform",
    language: "Dart",
    stars: 312,
    forks: 98,
    views: 2100,
    commits: 278,
    lastUpdate: "5 heures",
    isPrivate: false,
    gradient: "from-orange-500 to-red-500"
  }
];

export default function RepositoriesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
            words="Vos Repositories GitHub"
            className="text-4xl font-bold text-white mb-4"
          />
          <p className="text-xl text-gray-300 max-w-3xl mb-8">
            Explorez vos repositories avec des insights détaillés et des métriques avancées.
          </p>
          
          <div className="flex gap-4 items-center">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
              className="bg-white/10 border-white/20"
            >
              Vue Grille
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              className="bg-white/10 border-white/20"
            >
              Vue Liste
            </Button>
            <Badge variant="outline" className="border-purple-400/30 text-purple-400">
              {repositories.length} repositories
            </Badge>
          </div>
        </motion.div>

        {/* Repository Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Étoiles</p>
                  <p className="text-2xl font-bold text-white">824</p>
                </div>
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Forks</p>
                  <p className="text-2xl font-bold text-white">233</p>
                </div>
                <GitBranch className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Vues</p>
                  <p className="text-2xl font-bold text-white">4,797</p>
                </div>
                <Eye className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Commits</p>
                  <p className="text-2xl font-bold text-white">757</p>
                </div>
                <GitCommit className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Repositories Grid/List */}
        {viewMode === 'grid' ? (
          <BentoGrid className="max-w-full mx-auto">
            {repositories.map((repo, index) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <BentoGridItem
                  title={repo.name}
                  description={repo.description}
                  header={
                    <div className={`flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br ${repo.gradient} relative overflow-hidden`}>
                      <div className="absolute top-4 right-4 flex gap-2">
                        {repo.isPrivate && (
                          <Badge variant="secondary" className="bg-black/20 text-white text-xs">
                            Privé
                          </Badge>
                        )}
                        <Badge variant="secondary" className="bg-black/20 text-white text-xs">
                          {repo.language}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {repo.stars}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitBranch className="w-4 h-4" />
                            {repo.forks}
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                  className={index === 0 || index === 3 ? "md:col-span-2" : ""}
                />
              </motion.div>
            ))}
          </BentoGrid>
        ) : (
          <div className="space-y-4">
            {repositories.map((repo, index) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <Card className="bg-black/40 border-white/10 backdrop-blur-xl hover:bg-black/60 transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">{repo.name}</h3>
                          {repo.isPrivate && (
                            <Badge variant="outline" className="border-yellow-400/30 text-yellow-400 text-xs">
                              Privé
                            </Badge>
                          )}
                          <Badge variant="outline" className="border-blue-400/30 text-blue-400 text-xs">
                            {repo.language}
                          </Badge>
                        </div>
                        <p className="text-gray-300 mb-4">{repo.description}</p>
                        <div className="flex items-center gap-6 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {repo.stars} étoiles
                          </span>
                          <span className="flex items-center gap-1">
                            <GitBranch className="w-4 h-4" />
                            {repo.forks} forks
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {repo.views} vues
                          </span>
                          <span className="flex items-center gap-1">
                            <GitCommit className="w-4 h-4" />
                            {repo.commits} commits
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Mis à jour {repo.lastUpdate}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-white/20 text-white">
                          <Activity className="w-4 h-4 mr-2" />
                          Analytics
                        </Button>
                        <Button variant="outline" size="sm" className="border-white/20 text-white">
                          <Code className="w-4 h-4 mr-2" />
                          Code
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12"
        >
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-20 flex flex-col gap-2 bg-gradient-to-br from-blue-500 to-cyan-500">
                  <TrendingUp className="w-6 h-6" />
                  Analyser Tout
                </Button>
                <Button className="h-20 flex flex-col gap-2 bg-gradient-to-br from-green-500 to-emerald-500">
                  <Download className="w-6 h-6" />
                  Exporter Données
                </Button>
                <Button className="h-20 flex flex-col gap-2 bg-gradient-to-br from-purple-500 to-pink-500">
                  <Users className="w-6 h-6" />
                  Collaborateurs
                </Button>
                <Button className="h-20 flex flex-col gap-2 bg-gradient-to-br from-orange-500 to-red-500">
                  <Activity className="w-6 h-6" />
                  Rapport Global
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
