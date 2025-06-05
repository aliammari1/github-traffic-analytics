'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Spotlight } from '@/components/aceternity/Spotlight';
import { TextGenerateEffect } from '@/components/aceternity/TextGenerateEffect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  Calendar, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Layout,
  Eye,
  Target,
  CheckCircle,
  Share2,
  Clock,
  Activity,
  AlertCircle,
  Sparkles,
  Settings,
  Plus,
  Star,
  Edit,
  Zap,
  Bookmark,
  Search,
  Filter,
  Copy,
  Trash2,
  Brain
} from 'lucide-react';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'builder' | 'reports' | 'analytics'>('templates');
  const [reportName, setReportName] = useState('');

  const reportStats = {
    totalReports: 47,
    generatedToday: 8,
    templatesUsed: 15,
    avgGenerationTime: 2.3,
    totalDownloads: 234,
    sharedReports: 12,
    scheduledReports: 6,
    favoriteReports: 9
  };

  const reportTemplates = [
    {
      id: 'weekly-summary',
      name: 'Résumé Hebdomadaire',
      description: 'Rapport complet de l\'activité de la semaine',
      category: 'summary',
      sections: ['commits', 'pull requests', 'issues', 'contributors'],
      estimatedTime: '5 min',
      popularity: 95,
      lastUsed: 'Il y a 2 jours',
      tags: ['hebdomadaire', 'complet', 'activité']
    },
    {
      id: 'performance-analysis',
      name: 'Analyse de Performance',
      description: 'Métriques détaillées de performance d\'équipe',
      category: 'analytics',
      sections: ['velocity', 'commit frequency', 'throughput', 'quality'],
      estimatedTime: '8 min',
      popularity: 87,
      lastUsed: 'Hier',
      tags: ['performance', 'équipe', 'métriques']
    },
    {
      id: 'security-audit',
      name: 'Audit de Sécurité',
      description: 'Rapport complet de sécurité et vulnérabilités',
      category: 'security',
      sections: ['vulnerabilities', 'dependencies', 'compliance', 'recommendations'],
      estimatedTime: '12 min',
      popularity: 78,
      lastUsed: 'Il y a 5 jours',
      tags: ['sécurité', 'audit', 'vulnérabilités']
    },
    {
      id: 'code-quality',
      name: 'Qualité du Code',
      description: 'Analyse approfondie de la qualité du code',
      category: 'quality',
      sections: ['complexity', 'coverage', 'duplication', 'maintainability'],
      estimatedTime: '10 min',
      popularity: 82,
      lastUsed: 'Il y a 3 jours',
      tags: ['qualité', 'code', 'maintenabilité']
    },
    {
      id: 'contributor-insights',
      name: 'Insights Contributeurs',
      description: 'Analyse détaillée des contributions d\'équipe',
      category: 'team',
      sections: ['activity', 'productivity', 'collaboration', 'distribution'],
      estimatedTime: '7 min',
      popularity: 91,
      lastUsed: 'Aujourd\'hui',
      tags: ['équipe', 'contributions', 'collaboration']
    },
    {
      id: 'project-roadmap',
      name: 'Roadmap Projet',
      description: 'Vue d\'ensemble et planification du projet',
      category: 'planning',
      sections: ['milestones', 'timeline', 'dependencies', 'risks'],
      estimatedTime: '15 min',
      popularity: 73,
      lastUsed: 'Il y a 1 semaine',
      tags: ['roadmap', 'planification', 'milestones']
    }
  ];

  const recentReports = [
    {
      name: 'Q1 Performance Report 2024',
      template: 'Performance Analysis',
      generatedAt: 'Il y a 2h',
      status: 'completed',
      size: '2.4 MB',
      downloads: 15,
      type: 'pdf'
    },
    {
      name: 'Audit Sécurité Mars',
      template: 'Security Audit',
      generatedAt: 'Hier',
      status: 'completed',
      size: '1.8 MB',
      downloads: 8,
      type: 'pdf'
    },
    {
      name: 'Weekly Sprint Review',
      template: 'Weekly Summary',
      generatedAt: 'Il y a 3 jours',
      status: 'completed',
      size: '956 KB',
      downloads: 23,
      type: 'pdf'
    },
    {
      name: 'Code Quality Assessment',
      template: 'Code Quality',
      generatedAt: 'Il y a 5 jours',
      status: 'shared',
      size: '1.2 MB',
      downloads: 12,
      type: 'pdf'
    },
    {
      name: 'Team Productivity Report',
      template: 'Contributor Insights',
      generatedAt: 'Il y a 1 semaine',
      status: 'scheduled',
      size: '2.1 MB',
      downloads: 31,
      type: 'pdf'
    }
  ];

  const reportSections = [
    { id: 'header', name: 'En-tête', description: 'Titre et informations générales', icon: Layout },
    { id: 'executive-summary', name: 'Résumé Exécutif', description: 'Vue d\'ensemble des points clés', icon: Eye },
    { id: 'metrics', name: 'Métriques', description: 'Indicateurs de performance', icon: BarChart3 },
    { id: 'charts', name: 'Graphiques', description: 'Visualisations de données', icon: PieChart },
    { id: 'trends', name: 'Tendances', description: 'Évolution dans le temps', icon: TrendingUp },
    { id: 'recommendations', name: 'Recommandations', description: 'Suggestions d\'amélioration', icon: Target },
    { id: 'appendix', name: 'Annexes', description: 'Données supplémentaires', icon: FileText }
  ];

  const scheduledReports = [
    { name: 'Weekly Team Report', frequency: 'Hebdomadaire', nextRun: 'Lundi 09:00', enabled: true },
    { name: 'Monthly Security Audit', frequency: 'Mensuelle', nextRun: '1er du mois', enabled: true },
    { name: 'Quarterly Performance', frequency: 'Trimestrielle', nextRun: '1er avril', enabled: true },
    { name: 'Daily Activity Summary', frequency: 'Quotidienne', nextRun: 'Demain 08:00', enabled: true }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'summary': return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
      case 'analytics': return 'bg-purple-500/20 border-purple-500/50 text-purple-400';
      case 'security': return 'bg-red-500/20 border-red-500/50 text-red-400';
      case 'quality': return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'team': return 'bg-orange-500/20 border-orange-500/50 text-orange-400';
      case 'planning': return 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'shared': return 'text-blue-400';
      case 'scheduled': return 'text-yellow-400';
      case 'generating': return 'text-purple-400';
      case 'error': return 'text-red-400';
      default: return 'text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'shared': return Share2;
      case 'scheduled': return Clock;
      case 'generating': return Activity;
      case 'error': return AlertCircle;
      default: return FileText;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="orange" />
      <Spotlight className="h-[80vh] w-[50vw] top-10 left-full" fill="pink" />
      <Spotlight className="left-80 top-28 h-[80vh] w-[50vw]" fill="purple" />
      
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
                className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mr-4"
                animate={{ 
                  boxShadow: [
                    "0 0 20px rgba(251, 146, 60, 0.5)",
                    "0 0 60px rgba(236, 72, 153, 0.5)",
                    "0 0 20px rgba(251, 146, 60, 0.5)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <FileText className="w-6 h-6 text-white" />
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-pink-400 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-3 h-3 text-white" />
              </motion.div>
            </div>
            <div>
              <TextGenerateEffect 
                words="Rapports Personnalisés"
                className="text-4xl font-bold text-white mb-2"
              />
              <p className="text-white/60 text-lg">
                Créez, personnalisez et automatisez vos rapports GitHub avec des modèles avancés
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              {(['templates', 'builder', 'reports', 'analytics'] as const).map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? 'default' : 'outline'}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab 
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500' 
                      : 'border-white/20 text-white/80 hover:bg-white/10'
                  }`}
                >
                  {tab === 'templates' && <Layout className="w-4 h-4 mr-2" />}
                  {tab === 'builder' && <Settings className="w-4 h-4 mr-2" />}
                  {tab === 'reports' && <FileText className="w-4 h-4 mr-2" />}
                  {tab === 'analytics' && <BarChart3 className="w-4 h-4 mr-2" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Rapport
              </Button>
              <Button variant="outline" className="border-white/20 text-white/80 hover:bg-white/10">
                <Calendar className="w-4 h-4 mr-2" />
                Planifier
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Rapports totaux', value: reportStats.totalReports, icon: FileText, color: "orange" },
            { label: 'Générés aujourd\'hui', value: reportStats.generatedToday, icon: Activity, color: "pink" },
            { label: 'Téléchargements', value: reportStats.totalDownloads, icon: Download, color: "purple" },
            { label: 'Rapports partagés', value: reportStats.sharedReports, icon: Share2, color: "blue" }
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
        {activeTab === 'templates' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Template Categories */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['all', 'summary', 'analytics', 'security', 'quality', 'team', 'planning'].map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  className="border-white/20 text-white/80 hover:bg-white/10"
                >
                  {category === 'all' ? 'Tous' : category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getCategoryColor(template.category)}>
                          {template.category}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-yellow-400 text-sm">{template.popularity}%</span>
                        </div>
                      </div>
                      <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                      <p className="text-white/60 text-sm">{template.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-1">
                          {template.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs border-white/20 text-white/60">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-white/60">
                          <span>{template.estimatedTime}</span>
                          <span>{template.lastUsed}</span>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs text-white/60 mb-1">Sections incluses:</div>
                          <div className="flex flex-wrap gap-1">
                            {template.sections.slice(0, 3).map((section) => (
                              <span key={section} className="text-xs bg-white/10 px-2 py-1 rounded">
                                {section}
                              </span>
                            ))}
                            {template.sections.length > 3 && (
                              <span className="text-xs text-white/60">+{template.sections.length - 3}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500">
                            <Eye className="w-3 h-3 mr-1" />
                            Utiliser
                          </Button>
                          <Button size="sm" variant="outline" className="border-white/20 text-white/80">
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'builder' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Report Builder */}
              <div className="lg:col-span-2">
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-orange-400" />
                      Constructeur de Rapport
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Report Info */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-white/80 text-sm mb-2 block">Nom du rapport</label>
                          <input
                            type="text"
                            value={reportName}
                            onChange={(e) => setReportName(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                            placeholder="Mon rapport personnalisé"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-white/80 text-sm mb-2 block">Format</label>
                            <select className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white">
                              <option value="pdf" className="bg-black">PDF</option>
                              <option value="html" className="bg-black">HTML</option>
                              <option value="json" className="bg-black">JSON</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="text-white/80 text-sm mb-2 block">Période</label>
                            <select className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white">
                              <option value="week" className="bg-black">Cette semaine</option>
                              <option value="month" className="bg-black">Ce mois</option>
                              <option value="quarter" className="bg-black">Ce trimestre</option>
                              <option value="year" className="bg-black">Cette année</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Sections */}
                      <div>
                        <h4 className="text-white font-medium mb-4">Sections du rapport</h4>
                        <div className="space-y-3">
                          {reportSections.map((section, index) => {
                            const IconComponent = section.icon;
                            return (
                              <motion.div
                                key={section.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                              >
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="checkbox"
                                    defaultChecked={index < 4}
                                    className="w-4 h-4 rounded border-white/20"
                                  />
                                  <IconComponent className="w-5 h-5 text-orange-400" />
                                  <div>
                                    <div className="text-white text-sm font-medium">{section.name}</div>
                                    <div className="text-white/60 text-xs">{section.description}</div>
                                  </div>
                                </div>
                                <Button size="sm" variant="outline" className="border-white/20 text-white/80">
                                  <Settings className="w-3 h-3" />
                                </Button>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview & Actions */}
              <div className="space-y-6">
                {/* Preview */}
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Eye className="w-5 h-5 mr-2 text-pink-400" />
                      Aperçu
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-48 bg-gradient-to-br from-orange-500/10 to-pink-500/10 rounded-lg border border-white/10 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-white/30" />
                      </div>
                      
                      <div className="space-y-2 text-sm text-white/60">
                        <div className="flex justify-between">
                          <span>Pages estimées:</span>
                          <span className="text-white">8-12</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Temps de génération:</span>
                          <span className="text-white">~2.5 min</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taille estimée:</span>
                          <span className="text-white">~3.2 MB</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500">
                        <Zap className="w-4 h-4 mr-2" />
                        Générer Maintenant
                      </Button>
                      
                      <Button variant="outline" className="w-full border-white/20 text-white/80">
                        <Calendar className="w-4 h-4 mr-2" />
                        Planifier
                      </Button>
                      
                      <Button variant="outline" className="w-full border-white/20 text-white/80">
                        <Bookmark className="w-4 h-4 mr-2" />
                        Sauvegarder Modèle
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Recent Reports */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-pink-400" />
                    Rapports Récents
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-white/20 text-white/80">
                      <Search className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-white/20 text-white/80">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReports.map((report, index) => {
                    const StatusIcon = getStatusIcon(report.status);
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                            ${report.type === 'pdf' ? 'bg-red-500/20' : 'bg-blue-500/20'}`}
                          >
                            <FileText className={`w-5 h-5 ${report.type === 'pdf' ? 'text-red-400' : 'text-blue-400'}`} />
                          </div>
                          
                          <div>
                            <div className="text-white font-medium">{report.name}</div>
                            <div className="text-white/60 text-sm">{report.template}</div>
                            <div className="flex items-center space-x-4 text-xs text-white/60 mt-1">
                              <span>{report.generatedAt}</span>
                              <span>{report.size}</span>
                              <span>{report.downloads} téléchargements</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`w-4 h-4 ${getStatusColor(report.status)}`} />
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="border-white/20 text-white/80">
                              <Download className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="border-white/20 text-white/80">
                              <Share2 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="border-white/20 text-white/80">
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Scheduled Reports */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-orange-400" />
                  Rapports Planifiés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scheduledReports.map((report, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${report.enabled ? 'bg-green-400' : 'bg-gray-400'}`} />
                        <div>
                          <div className="text-white text-sm font-medium">{report.name}</div>
                          <div className="text-white/60 text-xs">
                            {report.frequency} • Prochain: {report.nextRun}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="border-white/20 text-white/80">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-white/20 text-white/80">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Utilisation des Rapports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Template le plus utilisé</span>
                      <span className="text-pink-400 font-bold">Performance Analysis</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Heure de pic</span>
                      <span className="text-orange-400 font-bold">9:00-11:00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Temps moyen</span>
                      <span className="text-purple-400 font-bold">{reportStats.avgGenerationTime} min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Format préféré</span>
                      <span className="text-blue-400 font-bold">PDF</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Insights & Recommandations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center mb-2">
                        <Target className="w-4 h-4 text-green-400 mr-2" />
                        <span className="text-green-400 font-medium">Optimisation</span>
                      </div>
                      <p className="text-white/80 text-sm">
                        Automatisez vos rapports hebdomadaires pour gagner 2h/semaine
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center mb-2">
                        <Brain className="w-4 h-4 text-blue-400 mr-2" />
                        <span className="text-blue-400 font-medium">Suggestion</span>
                      </div>
                      <p className="text-white/80 text-sm">
                        Utilisez le template Security Audit mensuellement
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
