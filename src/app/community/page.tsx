"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { TextGenerateEffect } from "@/components/aceternity/TextGenerateEffect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Heart, 
  MessageSquare, 
  Star,
  GitFork,
  TrendingUp,
  Globe,
  Coffee,
  Handshake,
  Target,
  Sparkles,
  Activity,
  Award
} from "lucide-react";

export default function CommunityPage() {
  const [selectedMetric, setSelectedMetric] = useState<'overview' | 'contributors' | 'impact' | 'engagement'>('overview');
  const [timeRange, setTimeRange] = useState('month');

  const communityStats = {
    totalContributors: 1247,
    activeContributors: 89,
    newContributors: 23,
    totalIssues: 456,
    resolvedIssues: 402,
    pullRequests: 234,
    discussions: 156,
    stars: 8934,
    forks: 2156,
    watchers: 1023
  };

  const topContributors = [
    {
      name: "Alex Chen",
      avatar: "👨‍💻",
      contributions: 156,
      type: "Core Developer",
      specialties: ["Frontend", "UI/UX"],
      recentActivity: "Merged 3 PRs",
      impact: "high",
      joinedDate: "2024-01-15"
    },
    {
      name: "Sarah Johnson",
      avatar: "👩‍💻",
      contributions: 143,
      type: "Maintainer",
      specialties: ["Backend", "DevOps"],
      recentActivity: "Fixed critical bug",
      impact: "high",
      joinedDate: "2023-08-20"
    },
    {
      name: "Maria Rodriguez",
      avatar: "👩‍🔬",
      contributions: 98,
      type: "Community Leader",
      specialties: ["Documentation", "Community"],
      recentActivity: "Updated tutorial",
      impact: "medium",
      joinedDate: "2024-03-10"
    },
    {
      name: "David Kim",
      avatar: "👨‍🔒",
      contributions: 87,
      type: "Security Specialist",
      specialties: ["Security", "Testing"],
      recentActivity: "Security audit",
      impact: "medium",
      joinedDate: "2023-05-22"
    }
  ];

  const impactMetrics = [
    {
      label: "Projets inspirés",
      value: "42",
      icon: Sparkles,
      trend: "+18%",
      color: "purple"
    },
    {
      label: "Problèmes résolus",
      value: "156",
      icon: Target,
      trend: "+25%",
      color: "blue"
    },
    {
      label: "Heures économisées",
      value: "1200h",
      icon: Coffee,
      trend: "+12%",
      color: "yellow"
    },
    {
      label: "Collaborations",
      value: "89",
      icon: Handshake,
      trend: "+30%",
      color: "green"
    }
  ];

  const engagementData = [
    {
      platform: "GitHub Discussions",
      activity: 156,
      growth: "+15%",
      engagement: "high"
    },
    {
      platform: "Discord Community",
      activity: 892,
      growth: "+22%",
      engagement: "very-high"
    },
    {
      platform: "Stack Overflow",
      activity: 234,
      growth: "+8%",
      engagement: "medium"
    },
    {
      platform: "Reddit",
      activity: 67,
      growth: "+5%",
      engagement: "low"
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-green-400 bg-green-400/10';
      default: return 'text-white bg-white/10';
    }
  };

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case 'very-high': return 'text-purple-400';
      case 'high': return 'text-blue-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-gray-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <Spotlight className="h-[80vh] w-[30vw] top-40 left-0 md:left-60 md:-top-20" fill="purple" />
      <Spotlight className="h-[80vh] w-[50vw] top-10 left-full" fill="pink" />
      <Spotlight className="h-[80vh] w-[50vw] top-28 left-80" fill="blue" />
      
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
                className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Heart className="w-8 h-8 text-white" />
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-3 h-3 text-white" />
              </motion.div>
            </div>
            <div>
              <TextGenerateEffect 
                words="Impact Communauté"
                className="text-4xl font-bold text-white mb-2"
              />
              <p className="text-white/60 text-lg">
                Mesure et célèbre l&apos;impact de votre communauté open source
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
              <option value="week" className="bg-black">Cette semaine</option>
              <option value="month" className="bg-black">Ce mois</option>
              <option value="quarter" className="bg-black">Ce trimestre</option>
              <option value="year" className="bg-black">Cette année</option>
            </select>

            <div className="flex gap-2">
              {(['overview', 'contributors', 'impact', 'engagement'] as const).map((metric) => (
                <Button
                  key={metric}
                  variant={selectedMetric === metric ? "default" : "outline"}
                  onClick={() => setSelectedMetric(metric)}
                  className={`${
                    selectedMetric === metric 
                      ? "bg-gradient-to-r from-purple-500 to-pink-500" 
                      : "border-white/20 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {metric === 'overview' && <Globe className="w-4 h-4 mr-2" />}
                  {metric === 'contributors' && <Users className="w-4 h-4 mr-2" />}
                  {metric === 'impact' && <Target className="w-4 h-4 mr-2" />}
                  {metric === 'engagement' && <Activity className="w-4 h-4 mr-2" />}
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Community Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          {[
            { label: "Contributeurs", value: communityStats.totalContributors, icon: Users, color: "blue" },
            { label: "Stars", value: communityStats.stars, icon: Star, color: "yellow" },
            { label: "Forks", value: communityStats.forks, icon: GitFork, color: "green" },
            { label: "Issues fermées", value: communityStats.resolvedIssues, icon: Target, color: "purple" },
            { label: "Pull Requests", value: communityStats.pullRequests, icon: TrendingUp, color: "pink" }
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
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                    <motion.div
                      className={`w-2 h-2 rounded-full bg-${stat.color}-400`}
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="text-sm text-white/60">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        {selectedMetric === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
          >
            {/* Community Growth */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Croissance de la Communauté
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Nouveaux contributeurs</span>
                    <span className="text-green-400 font-bold">+{communityStats.newContributors}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                      initial={{ width: 0 }}
                      animate={{ width: "75%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Contributeurs actifs</span>
                    <span className="text-blue-400 font-bold">{communityStats.activeContributors}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      initial={{ width: 0 }}
                      animate={{ width: "68%" }}
                      transition={{ duration: 1, delay: 0.7 }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Engagement global</span>
                    <span className="text-purple-400 font-bold">94%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-400"
                      initial={{ width: 0 }}
                      animate={{ width: "94%" }}
                      transition={{ duration: 1, delay: 0.9 }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Activité Récente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: "Nouveau contributeur rejoint", user: "Alex Turner", time: "Il y a 5 min", type: "new" },
                    { action: "Pull Request mergée avec succès", user: "Sarah Chen", time: "Il y a 15 min", type: "merge" },
                    { action: "Issue critique résolue", user: "Marcus Johnson", time: "Il y a 30 min", type: "issue" },
                    { action: "Documentation mise à jour", user: "Elena Rodriguez", time: "Il y a 1h", type: "docs" }
                  ].map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'new' ? 'bg-green-400' :
                        activity.type === 'merge' ? 'bg-blue-400' :
                        activity.type === 'issue' ? 'bg-red-400' :
                        'bg-yellow-400'
                      }`} />
                      <div className="flex-1">
                        <p className="text-white text-sm">{activity.action}</p>
                        <p className="text-white/60 text-xs">par {activity.user}</p>
                      </div>
                      <span className="text-white/50 text-xs">{activity.time}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedMetric === 'contributors' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Top Contributeurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topContributors.map((contributor, index) => (
                    <motion.div
                      key={contributor.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="p-4 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">{contributor.avatar}</div>
                          <div>
                            <h3 className="font-semibold text-white">{contributor.name}</h3>
                            <p className="text-purple-400 text-sm">{contributor.type}</p>
                            <div className="flex gap-2 mt-1">
                              {contributor.specialties.map((specialty) => (
                                <Badge 
                                  key={specialty}
                                  variant="outline"
                                  className="text-xs text-white/70 border-white/20"
                                >
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">{contributor.contributions}</div>
                          <div className="text-white/60 text-sm">contributions</div>
                          <Badge 
                            variant="outline"
                            className={getImpactColor(contributor.impact)}
                          >
                            {contributor.impact} impact
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-3">
                        <span className="text-white/60">Activité récente: {contributor.recentActivity}</span>
                        <span className="text-white/60">Membre depuis: {contributor.joinedDate}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedMetric === 'impact' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {impactMetrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <metric.icon className={`w-6 h-6 text-${metric.color}-400`} />
                        <Badge 
                          variant="outline"
                          className="text-green-400 border-green-400"
                        >
                          {metric.trend}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {metric.value}
                      </div>
                      <div className="text-sm text-white/60">
                        {metric.label}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Impact Global
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">15+</div>
                    <div className="text-white/80">Pays utilisateurs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">50K+</div>
                    <div className="text-white/80">Téléchargements</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">2.3M</div>
                    <div className="text-white/80">Lignes de code</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedMetric === 'engagement' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Engagement par Plateforme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {engagementData.map((platform, index) => (
                    <motion.div
                      key={platform.platform}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="p-4 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">{platform.platform}</h3>
                        <Badge 
                          variant="outline"
                          className={`${getEngagementColor(platform.engagement)} border-current`}
                        >
                          {platform.engagement}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-white">{platform.activity}</div>
                          <div className="text-white/60">interactions</div>
                        </div>
                        <div className="text-green-400 font-medium">{platform.growth}</div>
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
