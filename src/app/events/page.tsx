"use client";
import React, { useState } from 'react'
import { motion } from "framer-motion";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { TextGenerateEffect } from "@/components/aceternity/TextGenerateEffect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Star,
  GitCommit,
  GitPullRequest,
  GitMerge,
  Award,
  MessageSquare,
  Activity,
  Download,
  Share2,
  TrendingUp,
  Target,
  Zap
} from "lucide-react";

export default function EventsTimelinePage() {
  const [selectedView, setSelectedView] = useState<'timeline' | 'calendar' | 'heatmap' | 'analytics'>('timeline');
  const [filterType, setFilterType] = useState('all');
  const [timeRange, setTimeRange] = useState('week');

  const eventStats = {
    totalEvents: 1247,
    todayEvents: 23,
    mostActiveDay: "Mercredi",
    peakHour: "14h",
    avgEventsPerDay: 42,
    streakDays: 15,
    topEventType: "commits",
    weeklyGrowth: 8.5
  };

  const recentEvents = [
    {
      id: 1,
      type: "commit",
      action: "Nouveau commit sur react-dashboard",
      repository: "react-dashboard",
      user: "johndoe",
      avatar: "👨‍💻",
      timestamp: "il y a 5 min",
      impact: "medium",
      changes: { files: 3, additions: 45, deletions: 12 },
      branch: "main"
    },
    {
      id: 2,
      type: "pull_request",
      action: "Pull Request ouvert #134",
      repository: "api-server",
      user: "janedoe",
      avatar: "👩‍💻",
      timestamp: "il y a 12 min",
      impact: "high",
      title: "Add authentication middleware",
      status: "open"
    },
    {
      id: 3,
      type: "star",
      action: "Repository étoilé",
      repository: "machine-learning-utils",
      user: "developer",
      avatar: "⭐",
      timestamp: "il y a 20 min",
      impact: "low",
      stars: 1250
    },
    {
      id: 4,
      type: "merge",
      action: "Pull Request mergé #132",
      repository: "frontend-app",
      user: "teamlead",
      avatar: "🔀",
      timestamp: "il y a 35 min",
      impact: "high",
      title: "Implement dark mode",
      reviewer: "codereviewer"
    },
    {
      id: 5,
      type: "release",
      action: "Version v2.1.0 publiée",
      repository: "opensource-lib",
      user: "maintainer",
      avatar: "📦",
      timestamp: "il y a 1h",
      impact: "high",
      version: "v2.1.0",
      downloads: 850
    },
    {
      id: 6,
      type: "issue",
      action: "Nouveau issue #89",
      repository: "bug-tracker",
      user: "tester",
      avatar: "🐛",
      timestamp: "il y a 2h",
      impact: "medium",
      title: "Performance degradation in search",
      priority: "high"
    }
  ];

  const eventTypes = [
    { type: "commit", count: 156, color: "blue", icon: GitCommit },
    { type: "pull_request", count: 34, color: "green", icon: GitPullRequest },
    { type: "star", count: 89, color: "yellow", icon: Star },
    { type: "merge", count: 67, color: "purple", icon: GitMerge },
    { type: "release", count: 9, color: "orange", icon: Award },
    { type: "issue", count: 12, color: "red", icon: MessageSquare }
  ];

  const timelineData = [
    { time: "00h", events: 12, peak: false },
    { time: "02h", events: 18, peak: false },
    { time: "04h", events: 25, peak: false },
    { time: "06h", events: 15, peak: false },
    { time: "08h", events: 30, peak: false },
    { time: "10h", events: 45, peak: true },
    { time: "12h", events: 38, peak: false },
    { time: "14h", events: 32, peak: false },
    { time: "16h", events: 28, peak: false },
    { time: "18h", events: 20, peak: false }
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'commit': return GitCommit;
      case 'pull_request': return GitPullRequest;
      case 'star': return Star;
      case 'merge': return GitMerge;
      case 'release': return Award;
      case 'issue': return MessageSquare;
      default: return Activity;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'commit': return 'text-blue-400';
      case 'pull_request': return 'text-green-400';
      case 'star': return 'text-yellow-400';
      case 'merge': return 'text-purple-400';
      case 'release': return 'text-orange-400';
      case 'issue': return 'text-red-400';
      default: return 'text-white';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/20 border-red-500/50 text-red-400';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
      case 'low': return 'bg-green-500/20 border-green-500/50 text-green-400';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <Spotlight className="h-[80vh] w-[30vw] top-40 left-0 md:left-60 md:-top-20" fill="white" />
      <Spotlight className="h-[80vh] w-[50vw] top-10 left-full" fill="purple" />
      <Spotlight className="h-[80vh] w-[50vw] top-28 left-80" fill="cyan" />
      
      <div className="relative z-10 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12"
        >
          <div className="flex items-center mb-6 md:mb-0">
            <div className="relative">
              <motion.div
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Calendar className="w-6 h-6 text-white" />
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Activity className="w-3 h-3 text-white" />
              </motion.div>
            </div>
            <div>
              <TextGenerateEffect 
                words="Chronologie des Événements"
                className="text-4xl font-bold text-white mb-2"
              />
              <p className="text-white/60 text-lg">
                Suivez l&apos;activité GitHub en temps réel avec des visualisations interactives
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
              <option value="day" className="bg-black">Aujourd&apos;hui</option>
              <option value="week" className="bg-black">Cette semaine</option>
              <option value="month" className="bg-black">Ce mois</option>
              <option value="year" className="bg-black">Cette année</option>
            </select>

            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white backdrop-blur-sm"
            >
              <option value="all" className="bg-black">Tous les événements</option>
              <option value="commit" className="bg-black">Commits</option>
              <option value="pull_request" className="bg-black">Pull Requests</option>
              <option value="star" className="bg-black">Stars</option>
            </select>

            <div className="flex gap-2">
              {(['timeline', 'calendar', 'heatmap', 'analytics'] as const).map((view) => (
                <Button
                  key={view}
                  variant={selectedView === view ? "default" : "outline"}
                  onClick={() => setSelectedView(view)}
                  className={`${
                    selectedView === view 
                      ? "bg-gradient-to-r from-blue-500 to-purple-500" 
                      : "border-white/20 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {view === 'timeline' && <Clock className="w-4 h-4 mr-2" />}
                  {view === 'calendar' && <Calendar className="w-4 h-4 mr-2" />}
                  {view === 'heatmap' && <Activity className="w-4 h-4 mr-2" />}
                  {view === 'analytics' && <TrendingUp className="w-4 h-4 mr-2" />}
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="border-white/20 text-white/80 hover:bg-white/10">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" className="border-white/20 text-white/80 hover:bg-white/10">
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Événements totaux", value: eventStats.totalEvents, icon: Activity, color: "blue" },
            { label: "Aujourd'hui", value: eventStats.todayEvents, icon: Calendar, color: "green" },
            { label: "Série active", value: `${eventStats.streakDays} jours`, icon: Target, color: "yellow" },
            { label: "Croissance", value: `+${eventStats.weeklyGrowth}%`, icon: TrendingUp, color: "purple" }
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
                    {stat.value}
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
        {selectedView === 'timeline' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Live Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-blue-400" />
                      Timeline en Temps Réel
                      <motion.div
                        className="ml-2 w-2 h-2 bg-green-400 rounded-full"
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {recentEvents.map((event, index) => {
                        const EventIcon = getEventIcon(event.type);
                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="relative flex items-start space-x-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                          >
                            {/* Timeline line */}
                            {index < recentEvents.length - 1 && (
                              <div className="absolute left-8 top-12 w-0.5 h-8 bg-gradient-to-b from-blue-400 to-transparent" />
                            )}
                            
                            {/* Event icon */}
                            <div className={`w-8 h-8 rounded-full bg-white/10 flex items-center justify-center ${getEventColor(event.type)}`}>
                              <EventIcon className="w-4 h-4" />
                            </div>
                            
                            {/* Event content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-white">
                                    {event.avatar} {event.user}
                                  </span>
                                  <Badge className={getImpactColor(event.impact)}>
                                    {event.impact}
                                  </Badge>
                                </div>
                                <span className="text-xs text-white/60">{event.timestamp}</span>
                              </div>
                              
                              <p className="text-white/80 text-sm mb-2">{event.action}</p>
                              
                              <div className="flex items-center space-x-4 text-xs text-white/60">
                                <span className="bg-white/10 px-2 py-1 rounded">{event.repository}</span>
                                {event.changes && (
                                  <span className="text-green-400">+{event.changes.additions} -{event.changes.deletions}</span>
                                )}
                                {event.stars && (
                                  <span className="text-yellow-400">★ {event.stars}</span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Event Types Distribution */}
              <div>
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Types d&apos;Événements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {eventTypes.map((type, index) => {
                        const IconComponent = type.icon;
                        return (
                          <motion.div
                            key={type.type}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-3">
                              <IconComponent className={`w-5 h-5 text-${type.color}-400`} />
                              <span className="text-white/80 capitalize">{type.type.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-medium">{type.count}</span>
                              <div className="w-20 bg-white/10 rounded-full h-2">
                                <motion.div
                                  className={`bg-${type.color}-400 h-2 rounded-full`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(type.count / 500) * 100}%` }}
                                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                />
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}

        {selectedView === 'calendar' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Vue Calendrier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                    <div key={day} className="text-center text-white/60 font-medium py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }, (_, i) => {
                    const dayEvents = Math.floor(Math.random() * 20);
                    const intensity = Math.min(dayEvents / 20, 1);
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.02 }}
                        whileHover={{ scale: 1.1 }}
                        className="aspect-square rounded-lg border border-white/10 flex items-center justify-center cursor-pointer relative"
                        style={{
                          backgroundColor: `rgba(59, 130, 246, ${intensity * 0.8})`,
                        }}
                      >
                        <span className="text-white text-sm">{i + 1}</span>
                        {dayEvents > 0 && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full text-xs flex items-center justify-center">
                            <span className="text-black font-bold text-[10px]">{dayEvents}</span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedView === 'heatmap' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Heatmap d&apos;Activité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-10 gap-2">
                    {timelineData.map((data, index) => (
                      <motion.div
                        key={data.time}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="text-center"
                      >
                        <div className="text-white/60 text-xs mb-2">{data.time}</div>
                        <div 
                          className={`w-full rounded-lg border border-white/10 flex items-end justify-center relative overflow-hidden ${
                            data.peak ? 'bg-gradient-to-t from-yellow-500 to-orange-500' : 'bg-gradient-to-t from-blue-500 to-cyan-500'
                          }`}
                          style={{ height: `${Math.max(data.events * 2, 20)}px` }}
                        >
                          {data.peak && (
                            <motion.div
                              className="absolute top-0 left-0 w-full h-full bg-yellow-400/20"
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                          <span className="text-white text-xs font-bold">{data.events}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-white/60">
                    <span>Moins d&apos;activité</span>
                    <div className="flex gap-1">
                      {[0.2, 0.4, 0.6, 0.8, 1].map((opacity, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-sm bg-blue-500"
                          style={{ opacity }}
                        />
                      ))}
                    </div>
                    <span>Plus d&apos;activité</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedView === 'analytics' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Tendances d&apos;Activité</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Jour le plus actif</span>
                      <span className="text-blue-400 font-bold">{eventStats.mostActiveDay}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Heure de pic</span>
                      <span className="text-green-400 font-bold">{eventStats.peakHour}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Moyenne par jour</span>
                      <span className="text-purple-400 font-bold">{eventStats.avgEventsPerDay}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Type principal</span>
                      <span className="text-yellow-400 font-bold capitalize">{eventStats.topEventType}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Insights Prédictifs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center mb-2">
                        <Zap className="w-4 h-4 text-blue-400 mr-2" />
                        <span className="text-blue-400 font-medium">Prédiction</span>
                      </div>
                      <p className="text-white/80 text-sm">
                        Activité attendue en hausse de 15% cette semaine
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center mb-2">
                        <Target className="w-4 h-4 text-green-400 mr-2" />
                        <span className="text-green-400 font-medium">Recommandation</span>
                      </div>
                      <p className="text-white/80 text-sm">
                        Optimal pour planifier des reviews entre 14h-16h
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <div className="flex items-center mb-2">
                        <Award className="w-4 h-4 text-orange-400 mr-2" />
                        <span className="text-orange-400 font-medium">Réalisation</span>
                      </div>
                      <p className="text-white/80 text-sm">
                        Record personnel de productivité battu !
                      </p>
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
