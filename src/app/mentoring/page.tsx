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
  Clock, 
  TrendingUp,
  Calendar,
  Award,
  Star,
  Target,
  Code,
  CheckCircle,
  GraduationCap,
  Brain
} from "lucide-react";

export default function MentoringPage() {
  const [selectedView, setSelectedView] = useState<'overview' | 'mentees' | 'sessions' | 'progress'>('overview');
  const [filterLevel, setFilterLevel] = useState('all');

  const mentorStats = {
    totalMentees: 23,
    activeSessions: 8,
    completedSessions: 156,
    averageRating: 4.8,
    totalHours: 342,
    skillsShared: 15,
    successRate: 94,
    responseTime: 2.4
  };

  const mentees = [
    {
      name: "Alex Thompson",
      avatar: "👨‍💻",
      level: "beginner",
      focus: ["JavaScript", "React"],
      progress: 78,
      sessions: 12,
      nextSession: "2024-03-25",
      status: "active",
      goals: "Full-stack development",
      achievements: 5,
      weeklyGoal: "Complete React tutorial"
    },
    {
      name: "Maria Garcia",
      avatar: "👩‍💻", 
      level: "intermediate",
      focus: ["Python", "Data Science"],
      progress: 65,
      sessions: 8,
      nextSession: "2024-03-26",
      status: "active",
      goals: "Machine Learning Engineer",
      achievements: 8,
      weeklyGoal: "Build ML model"
    },
    {
      name: "David Chen",
      avatar: "🧑‍💻",
      level: "advanced",
      focus: ["DevOps", "Kubernetes"],
      progress: 89,
      sessions: 15,
      nextSession: "2024-03-27",
      status: "active", 
      goals: "Senior DevOps Engineer",
      achievements: 12,
      weeklyGoal: "Deploy microservices"
    },
    {
      name: "Sophie Wilson",
      avatar: "👩‍💻",
      level: "beginner",
      focus: ["HTML", "CSS"],
      progress: 45,
      sessions: 6,
      nextSession: "2024-03-28",
      status: "paused",
      goals: "Frontend Developer", 
      achievements: 3,
      weeklyGoal: "CSS Grid mastery"
    }
  ];

  const upcomingSessions = [
    {
      mentee: "Alex Thompson",
      topic: "React State Management",
      time: "14:00",
      date: "2024-03-25",
      duration: "1h",
      type: "technical",
      priority: "high"
    },
    {
      mentee: "Maria Garcia", 
      topic: "Python Data Structures",
      time: "16:00",
      date: "2024-03-26",
      duration: "45min",
      type: "technical",
      priority: "medium"
    },
    {
      mentee: "David Chen",
      topic: "Career Planning",
      time: "10:00",
      date: "2024-03-27", 
      duration: "30min",
      type: "career",
      priority: "low"
    }
  ];

  const skillAreas = [
    { skill: "JavaScript", students: 15, proficiency: 92, demand: "high" },
    { skill: "React", students: 12, proficiency: 88, demand: "very-high" },
    { skill: "Python", students: 10, proficiency: 90, demand: "high" },
    { skill: "Node.js", students: 8, proficiency: 85, demand: "medium" },
    { skill: "DevOps", students: 6, proficiency: 95, demand: "high" },
    { skill: "Machine Learning", students: 4, proficiency: 87, demand: "very-high" }
  ];

  const achievements = [
    {
      title: "Mentor Excellence",
      description: "Maintenu un score de 4.8+ pendant 6 mois",
      date: "2024-02-15",
      type: "excellence",
      icon: Award
    },
    {
      title: "100 Sessions Complétées",
      description: "Milestone de sessions de mentorat",
      date: "2024-01-20",
      type: "milestone",
      icon: Target
    },
    {
      title: "Top Rated Mentor",
      description: "Classé dans le top 5% des mentors",
      date: "2024-01-01",
      type: "recognition",
      icon: Star
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-400 bg-green-400/10';
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/10';
      case 'advanced': return 'text-red-400 bg-red-400/10';
      default: return 'text-white bg-white/10';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 border-green-400';
      case 'paused': return 'text-yellow-400 border-yellow-400';
      case 'completed': return 'text-blue-400 border-blue-400';
      default: return 'text-white border-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-green-400 bg-green-400/10';
      default: return 'text-white bg-white/10';
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'very-high': return 'text-purple-400';
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="gold" />
      <Spotlight className="top-10 left-full h-[80vh] w-[50vw]" fill="orange" />
      <Spotlight className="top-28 left-80 h-[80vh] w-[50vw]" fill="purple" />
      
      <div className="relative z-10 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <motion.div
                className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <GraduationCap className="w-8 h-8 text-white" />
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain className="w-3 h-3 text-white" />
              </motion.div>
            </div>
            <div>
              <TextGenerateEffect 
                words="Tableau de Bord Mentor"
                className="text-4xl font-bold text-white mb-2"
              />
              <p className="text-white/60 text-lg">
                Guidez et suivez le parcours de développement de vos mentorés
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4">
            <select 
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white backdrop-blur-sm"
            >
              <option value="all" className="bg-black">Tous niveaux</option>
              <option value="all" className="bg-black">Tous niveaux</option>
              <option value="beginner" className="bg-black">Débutant</option>
              <option value="intermediate" className="bg-black">Intermédiaire</option>
              <option value="advanced" className="bg-black">Avancé</option>
            </select>

            <div className="flex gap-2">
              {(['overview', 'mentees', 'sessions', 'progress'] as const).map((view) => (
                <Button
                  key={view}
                  variant={selectedView === view ? "default" : "outline"}
                  onClick={() => setSelectedView(view)}
                  className={`${
                    selectedView === view 
                      ? "bg-gradient-to-r from-amber-500 to-orange-500" 
                      : "border-white/20 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {view === 'overview' && <TrendingUp className="w-4 h-4 mr-2" />}
                  {view === 'mentees' && <Users className="w-4 h-4 mr-2" />}
                  {view === 'sessions' && <Calendar className="w-4 h-4 mr-2" />}
                  {view === 'progress' && <Target className="w-4 h-4 mr-2" />}
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Mentor Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Mentorés", value: mentorStats.totalMentees, icon: Users, color: "blue" },
            { label: "Sessions actives", value: mentorStats.activeSessions, icon: Calendar, color: "green" },
            { label: "Note moyenne", value: mentorStats.averageRating, icon: Star, color: "yellow" },
            { label: "Taux de succès", value: `${mentorStats.successRate}%`, icon: CheckCircle, color: "purple" }
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
        {selectedView === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Recent Activity & Upcoming Sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Sessions Prochaines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingSessions.map((session, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="p-4 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-white">{session.mentee}</h3>
                          <Badge 
                            variant="outline" 
                            className={getPriorityColor(session.priority)}
                          >
                            {session.priority}
                          </Badge>
                        </div>
                        <p className="text-amber-400 mb-2">{session.topic}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">{session.date} à {session.time}</span>
                          <span className="text-white/60">{session.duration}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Skills Overview */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Compétences Enseignées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {skillAreas.slice(0, 4).map((skill, index) => (
                      <motion.div
                        key={skill.skill}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">{skill.skill}</span>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={getDemandColor(skill.demand)}
                            >
                              {skill.demand}
                            </Badge>
                            <span className="text-white/60 text-sm">{skill.students} étudiants</span>
                          </div>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.proficiency}%` }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.2 }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Achievements */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Récompenses Récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/20"
                    >
                      <achievement.icon className="w-8 h-8 text-amber-400 mb-3" />
                      <h3 className="font-semibold text-white mb-2">{achievement.title}</h3>
                      <p className="text-white/70 text-sm mb-2">{achievement.description}</p>
                      <span className="text-amber-400 text-xs">{achievement.date}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedView === 'mentees' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Mes Mentorés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mentees.map((mentee, index) => (
                    <motion.div
                      key={mentee.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="p-6 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">{mentee.avatar}</span>
                          <div>
                            <h3 className="font-semibold text-white text-lg">{mentee.name}</h3>
                            <p className="text-amber-400">{mentee.goals}</p>
                            <div className="flex gap-2 mt-2">
                              {mentee.focus.map((tech) => (
                                <Badge 
                                  key={tech}
                                  variant="outline" 
                                  className="text-xs text-white/70 border-white/20"
                                >
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant="outline" 
                            className={getLevelColor(mentee.level)}
                          >
                            {mentee.level}
                          </Badge>
                          <p className="text-white/60 text-sm mt-1">
                            {mentee.sessions} sessions
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-white/60 text-sm">Progression:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${mentee.progress}%` }}
                                transition={{ duration: 1, delay: 0.5 + index * 0.2 }}
                              />
                            </div>
                            <span className="text-white text-sm">{mentee.progress}%</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-white/60 text-sm">Prochaine session:</span>
                          <div className="text-white">{mentee.nextSession}</div>
                        </div>
                        <div>
                          <span className="text-white/60 text-sm">Récompenses:</span>
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-amber-400" />
                            <span className="text-white">{mentee.achievements}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-white/60 text-sm">Objectif hebdomadaire:</span>
                          <p className="text-white">{mentee.weeklyGoal}</p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(mentee.status)}
                        >
                          {mentee.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedView === 'sessions' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Planning des Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Sessions de cette semaine</h3>
                    <div className="space-y-3">
                      {upcomingSessions.map((session, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="p-4 rounded-lg bg-white/5 border-l-4 border-amber-400"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-white">{session.mentee}</h4>
                            <Badge className={`${session.type === 'technical' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                              {session.type}
                            </Badge>
                          </div>
                          <p className="text-amber-400 text-sm mb-1">{session.topic}</p>
                          <p className="text-white/60 text-sm">{session.date} - {session.time} ({session.duration})</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Statistiques</h3>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/80">Heures totales:</span>
                          <span className="text-amber-400 font-bold">{mentorStats.totalHours}h</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/80">Sessions complétées:</span>
                          <span className="text-green-400 font-bold">{mentorStats.completedSessions}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/80">Temps de réponse:</span>
                          <span className="text-blue-400 font-bold">{mentorStats.responseTime}h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedView === 'progress' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Suivi des Progrès
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mentees.map((mentee, index) => (
                    <motion.div
                      key={mentee.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="p-6 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{mentee.avatar}</span>
                          <div>
                            <h3 className="font-semibold text-white">{mentee.name}</h3>
                            <p className="text-amber-400 text-sm">{mentee.goals}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">{mentee.progress}%</div>
                          <div className="text-white/60 text-sm">Progression</div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/80 text-sm">Progression globale</span>
                          <span className="text-white text-sm">{mentee.progress}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-3">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${mentee.progress}%` }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.2 }}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-400">{mentee.sessions}</div>
                          <div className="text-white/60 text-xs">Sessions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">{mentee.achievements}</div>
                          <div className="text-white/60 text-xs">Récompenses</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-400">{mentee.focus.length}</div>
                          <div className="text-white/60 text-xs">Technologies</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-bold ${mentee.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>
                            {mentee.status === 'active' ? 'Actif' : 'En pause'}
                          </div>
                          <div className="text-white/60 text-xs">Statut</div>
                        </div>
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
