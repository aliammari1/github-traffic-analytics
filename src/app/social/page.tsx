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
  TrendingUp, 
  Star, 
  Share2, 
  ThumbsUp, 
  Eye, 
  Globe,
  Zap,
  MessageCircle,
  Hash,
  BarChart3,
  Repeat2
} from "lucide-react";

export default function SocialPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'twitter' | 'linkedin' | 'reddit' | 'dev'>('all');
  const [timeRange, setTimeRange] = useState('week');

  const socialPlatforms = [
    {
      name: "Twitter",
      key: "twitter",
      icon: "🐦",
      color: "blue",
      metrics: {
        mentions: 234,
        retweets: 156,
        likes: 892,
        shares: 67,
        reach: 45678,
        engagement: 3.4
      }
    },
    {
      name: "LinkedIn",
      key: "linkedin", 
      icon: "💼",
      color: "blue",
      metrics: {
        mentions: 89,
        retweets: 45,
        likes: 234,
        shares: 23,
        reach: 12345,
        engagement: 5.2
      }
    },
    {
      name: "Reddit",
      key: "reddit",
      icon: "🔴", 
      color: "orange",
      metrics: {
        mentions: 67,
        retweets: 0,
        likes: 456,
        shares: 34,
        reach: 8901,
        engagement: 7.1
      }
    },
    {
      name: "Dev.to",
      key: "dev",
      icon: "🟢",
      color: "green", 
      metrics: {
        mentions: 45,
        retweets: 12,
        likes: 178,
        shares: 19,
        reach: 3456,
        engagement: 8.3
      }
    }
  ];

  const trendingTopics = [
    { hashtag: "#OpenSource", mentions: 1234, trend: "+23%" },
    { hashtag: "#GitHub", mentions: 897, trend: "+18%" },
    { hashtag: "#JavaScript", mentions: 567, trend: "+12%" },
    { hashtag: "#React", mentions: 434, trend: "+45%" },
    { hashtag: "#TypeScript", mentions: 321, trend: "+67%" },
    { hashtag: "#WebDev", mentions: 289, trend: "+8%" }
  ];

  const viralContent = [
    {
      platform: "Twitter",
      icon: "🐦",
      content: "Notre nouveau feature de visualisation 3D révolutionne l'analyse de code! 🚀",
      engagement: {
        likes: 342,
        retweets: 89,
        comments: 45,
        reach: 15678
      },
      author: "@GitHubAnalytics",
      time: "2h",
      type: "announcement"
    },
    {
      platform: "LinkedIn",
      icon: "💼", 
      content: "Comment notre équipe a augmenté sa productivité de 40% grâce à l'analyse prédictive",
      engagement: {
        likes: 156,
        retweets: 23,
        comments: 34,
        reach: 8901
      },
      author: "Sarah Chen - Lead Developer",
      time: "5h",
      type: "case-study"
    },
    {
      platform: "Reddit",
      icon: "🔴",
      content: "Thread: Les meilleures pratiques pour l'analyse de traffic GitHub en 2024",
      engagement: {
        likes: 234,
        retweets: 0,
        comments: 67,
        reach: 12345
      },
      author: "u/devAnalytics",
      time: "1d",
      type: "tutorial"
    }
  ];

  const influencers = [
    {
      name: "TechGuru Mike",
      platform: "Twitter",
      icon: "🐦",
      followers: "45.2K",
      mentions: 23,
      influence: "high",
      avatar: "👨‍💻"
    },
    {
      name: "Sarah DevLeader",
      platform: "LinkedIn", 
      icon: "💼",
      followers: "12.8K",
      mentions: 15,
      influence: "medium",
      avatar: "👩‍💻"
    },
    {
      name: "CodeMaster Pro",
      platform: "Dev.to",
      icon: "🟢", 
      followers: "8.5K",
      mentions: 12,
      influence: "medium",
      avatar: "🧑‍💻"
    }
  ];

  const getEngagementColor = (rate: number) => {
    if (rate >= 7) return 'text-green-400';
    if (rate >= 4) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getInfluenceColor = (influence: string) => {
    switch (influence) {
      case 'high': return 'text-red-400 bg-red-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-green-400 bg-green-400/10';
      default: return 'text-white bg-white/10';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="cyan" />
      <Spotlight className="top-10 left-full h-[80vh] w-[50vw]" fill="blue" />
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
                className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Share2 className="w-8 h-8 text-white" />
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-3 h-3 text-white" />
              </motion.div>
            </div>
            <div>
              <TextGenerateEffect 
                words="Social Analytics"
                className="text-4xl font-bold text-white mb-2"
              />
              <p className="text-white/60 text-lg">
                Suivez votre impact sur les réseaux sociaux et l&apos;engagement communautaire
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
              <option value="quarter" className="bg-black">Ce trimestre</option>
            </select>

            <div className="flex gap-2">
              {(['all', 'twitter', 'linkedin', 'reddit', 'dev'] as const).map((platform) => (
                <Button
                  key={platform}
                  variant={selectedPlatform === platform ? "default" : "outline"}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`${
                    selectedPlatform === platform 
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500" 
                      : "border-white/20 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {platform === 'all' && <Globe className="w-4 h-4 mr-2" />}
                  {platform === 'twitter' && <MessageCircle className="w-4 h-4 mr-2" />}
                  {platform === 'linkedin' && <Users className="w-4 h-4 mr-2" />}
                  {platform === 'reddit' && <Share2 className="w-4 h-4 mr-2" />}
                  {platform === 'dev' && <Star className="w-4 h-4 mr-2" />}
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Platform Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {socialPlatforms.map((platform, index) => (
            <motion.div
              key={platform.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{platform.icon}</span>
                      <span className="font-semibold text-white">{platform.name}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={getEngagementColor(platform.metrics.engagement)}
                    >
                      {platform.metrics.engagement}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Mentions:</span>
                      <span className="text-white font-bold">{platform.metrics.mentions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Likes:</span>
                      <span className="text-cyan-400 font-bold">{platform.metrics.likes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Portée:</span>
                      <span className="text-blue-400 font-bold">{platform.metrics.reach.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Trending Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Hashtags Tendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendingTopics.map((topic, index) => (
                  <motion.div
                    key={topic.hashtag}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <Hash className="w-4 h-4 text-cyan-400" />
                      <span className="font-semibold text-white">{topic.hashtag}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white/60 text-sm">{topic.mentions} mentions</span>
                      <Badge 
                        variant="outline" 
                        className="text-green-400 border-green-400"
                      >
                        {topic.trend}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Influencers */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="w-5 h-5" />
                Influenceurs Clés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {influencers.map((influencer, index) => (
                  <motion.div
                    key={influencer.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{influencer.avatar}</span>
                      <div>
                        <p className="font-semibold text-white">{influencer.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{influencer.icon}</span>
                          <span className="text-white/60 text-sm">{influencer.followers}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="outline" 
                        className={getInfluenceColor(influencer.influence)}
                      >
                        {influencer.influence}
                      </Badge>
                      <p className="text-white/60 text-sm mt-1">{influencer.mentions} mentions</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Viral Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Contenu Viral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {viralContent.map((content, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-6 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{content.icon}</span>
                        <div>
                          <p className="font-semibold text-white">{content.platform}</p>
                          <p className="text-white/60 text-sm">{content.author}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className="text-cyan-400 border-cyan-400"
                        >
                          {content.type}
                        </Badge>
                        <span className="text-white/50 text-sm">{content.time}</span>
                      </div>
                    </div>
                    
                    <p className="text-white mb-4">{content.content}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4 text-blue-400" />
                        <span className="text-white">{content.engagement.likes}</span>
                      </div>
                      {content.engagement.retweets > 0 && (
                        <div className="flex items-center gap-2">
                          <Repeat2 className="w-4 h-4 text-green-400" />
                          <span className="text-white">{content.engagement.retweets}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-yellow-400" />
                        <span className="text-white">{content.engagement.comments}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-purple-400" />
                        <span className="text-white">{content.engagement.reach.toLocaleString()}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Social Analytics Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Résumé des Performances Sociales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <motion.div
                    className="text-3xl font-bold text-cyan-400 mb-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 1 }}
                  >
                    2.4M
                  </motion.div>
                  <div className="text-white/80">Impressions totales</div>
                </div>
                <div className="text-center">
                  <motion.div
                    className="text-3xl font-bold text-blue-400 mb-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.1 }}
                  >
                    156K
                  </motion.div>
                  <div className="text-white/80">Engagements</div>
                </div>
                <div className="text-center">
                  <motion.div
                    className="text-3xl font-bold text-purple-400 mb-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                  >
                    6.5%
                  </motion.div>
                  <div className="text-white/80">Taux d&apos;engagement</div>
                </div>
                <div className="text-center">
                  <motion.div
                    className="text-3xl font-bold text-green-400 mb-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.3 }}
                  >
                    +32%
                  </motion.div>
                  <div className="text-white/80">Croissance</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
