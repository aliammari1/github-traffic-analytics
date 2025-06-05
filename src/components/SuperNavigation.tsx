"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MagneticButton, GlowEffect } from "@/components/aceternity/AdvancedAnimations";
import { Badge } from "@/components/ui/badge";
import { NAVIGATION_ITEMS, CATEGORY_COLORS, NavigationItem } from "@/config/navigation";
import { 
  Menu, 
  X, 
  Search, 
  Settings, 
  User,
  ChevronDown,
  Sparkles,
  Zap,
  Target
} from "lucide-react";

export function SuperNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  const categories = {
    analytics: { name: "Analytics", icon: Target, color: CATEGORY_COLORS.analytics },
    insights: { name: "Insights", icon: Sparkles, color: CATEGORY_COLORS.insights },
    tools: { name: "Outils", icon: Zap, color: CATEGORY_COLORS.tools },
    community: { name: "Communauté", icon: User, color: CATEGORY_COLORS.community },
    advanced: { name: "Avancé", icon: Settings, color: CATEGORY_COLORS.advanced }
  };

  const filteredItems = NAVIGATION_ITEMS.filter(item => 
    !searchQuery || 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedItems = Object.keys(categories).reduce((acc, category) => {
    acc[category] = filteredItems.filter(item => item.category === category);
    return acc;
  }, {} as Record<string, NavigationItem[]>);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
      if (e.key === '/' && e.metaKey) {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Floating Navigation Button */}
      <motion.div
        className="fixed top-6 left-6 z-50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <GlowEffect color="#3b82f6" intensity={0.4}>
          <MagneticButton
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-3 px-4 py-3 bg-black/80 backdrop-blur-md border border-gray-800 rounded-xl text-white hover:border-blue-500 transition-all duration-200"
          >
            <Menu className="h-5 w-5" />
            <span className="hidden md:block font-medium">Navigation</span>
            <Badge variant="secondary" className="text-xs hidden lg:block">
              ⌘ /
            </Badge>
          </MagneticButton>
        </GlowEffect>
      </motion.div>

      {/* Full Screen Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
          >
            <div className="h-full overflow-y-auto">
              <div className="max-w-6xl mx-auto p-6">
                {/* Header */}
                <motion.div
                  className="flex items-center justify-between mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                      GitHub Analytics Pro
                    </h2>
                    <p className="text-gray-400 mt-1">
                      20 expériences innovantes à découvrir
                    </p>
                  </div>
                  
                  <MagneticButton
                    onClick={() => setIsOpen(false)}
                    className="p-3 rounded-xl border border-gray-800 hover:border-gray-600 bg-black/50 text-gray-300 hover:text-white transition-all duration-200"
                  >
                    <X className="h-6 w-6" />
                  </MagneticButton>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                  className="relative mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une page ou fonctionnalité..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                    autoFocus
                  />
                </motion.div>

                {/* Categories */}
                <div className="space-y-8">
                  {Object.entries(categories).map(([categoryKey, category], categoryIndex) => {
                    const items = groupedItems[categoryKey];
                    if (items.length === 0) return null;

                    return (
                      <motion.div
                        key={categoryKey}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + categoryIndex * 0.1 }}
                      >
                        <div className="mb-6">
                          <motion.button
                            onClick={() => setActiveCategory(
                              activeCategory === categoryKey ? null : categoryKey
                            )}
                            className="flex items-center gap-3 mb-4 group"
                            whileHover={{ x: 5 }}
                          >
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color}`}>
                              <category.icon className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                              {category.name}
                            </h3>
                            <Badge variant="secondary" className="ml-auto">
                              {items.length}
                            </Badge>
                            <motion.div
                              animate={{ rotate: activeCategory === categoryKey ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            </motion.div>
                          </motion.button>

                          <AnimatePresence>
                            {(activeCategory === categoryKey || activeCategory === null) && (
                              <motion.div
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                {items.map((item, index) => (
                                  <motion.div
                                    key={item.href}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                  >
                                    <Link href={item.href} onClick={() => setIsOpen(false)}>
                                      <GlowEffect>
                                        <motion.div
                                          className={`
                                            p-4 rounded-xl border transition-all duration-200 cursor-pointer
                                            ${pathname === item.href 
                                              ? 'border-blue-500 bg-blue-500/10' 
                                              : 'border-gray-800 hover:border-gray-700 bg-gray-900/30 hover:bg-gray-800/50'
                                            }
                                          `}
                                          whileHover={{ y: -2 }}
                                          whileTap={{ scale: 0.98 }}
                                        >
                                          <div className="flex items-start gap-3">
                                            <div className={`
                                              text-2xl p-2 rounded-lg bg-gradient-to-br ${category.color}
                                              ${pathname === item.href ? 'animate-pulse' : ''}
                                            `}>
                                              {typeof item.icon === 'function' ? item.icon : item.icon}
                                            </div>
                                            <div className="flex-1">
                                              <h4 className="font-medium text-white mb-1 flex items-center gap-2">
                                                {item.name}
                                                {pathname === item.href && (
                                                  <motion.div
                                                    className="w-2 h-2 bg-blue-400 rounded-full"
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 1, repeat: Infinity }}
                                                  />
                                                )}
                                              </h4>
                                              <p className="text-sm text-gray-400 leading-relaxed">
                                                {item.description}
                                              </p>
                                            </div>
                                          </div>
                                        </motion.div>
                                      </GlowEffect>
                                    </Link>
                                  </motion.div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Footer */}
                <motion.div
                  className="mt-12 pt-8 border-t border-gray-800 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <p className="text-gray-400 mb-4">
                    Utilisez <Badge variant="outline">⌘ /</Badge> pour ouvrir rapidement la navigation
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Analytics', 'IA', '3D', 'Sécurité', 'Insights'].map((tag, index) => (
                      <motion.div
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                      >
                        <Badge variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
