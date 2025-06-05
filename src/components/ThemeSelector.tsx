"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { MagneticButton, GlowEffect } from "@/components/aceternity/AdvancedAnimations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Check, 
  Sparkles, 
  Zap, 
  Moon, 
  Sun, 
  Star,
  X
} from "lucide-react";

export function ThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTheme, themeName, setTheme, availableThemes } = useTheme();

  const themeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    cyber: Zap,
    neon: Sparkles,
    sunset: Sun,
    arctic: Moon,
    cosmic: Star
  };

  const applyTheme = (themeKey: string) => {
    setTheme(themeKey);
  };

  return (
    <>
      {/* Theme Selector Button */}
      <motion.div
        className="fixed top-6 right-6 z-50"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlowEffect color={currentTheme.primary} intensity={0.4}>
          <MagneticButton
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-black/80 backdrop-blur-md border border-gray-800 rounded-xl text-white hover:border-blue-500 transition-all duration-200"
          >
            <Palette className="h-5 w-5" />
            <span className="hidden md:block font-medium">Thème</span>
          </MagneticButton>
        </GlowEffect>
      </motion.div>

      {/* Theme Selector Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
          >
            <motion.div
              className="w-full max-w-2xl"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <Card className="border-gray-800/50 bg-black/90 backdrop-blur-sm">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        Personnaliser le Thème
                      </h2>
                      <p className="text-sm text-gray-400">
                        Choisissez un thème pour personnaliser votre expérience GitHub Analytics
                      </p>
                    </div>
                    <MagneticButton
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded-lg border border-gray-800 hover:border-gray-600 bg-black/50 text-gray-300 hover:text-white transition-all duration-200"
                    >
                      <X className="h-5 w-5" />
                    </MagneticButton>
                  </div>
                </CardContent>
                
                <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/30">
                  <motion.div
                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${currentTheme.gradients.hero} mx-auto mb-3`}
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      repeatDelay: 1 
                    }}
                  />
                  <h3 className="font-semibold text-white mb-1">
                    Thème Actuel: {currentTheme.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Couleur principale: {currentTheme.primary}
                  </p>
                </div>

                {/* Theme Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {Object.entries(availableThemes).map(([key, theme], index) => {
                    const IconComponent = themeIcons[key] || Sparkles;
                    const isSelected = themeName === key;
                    
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <MagneticButton
                          onClick={() => applyTheme(key)}
                          className={`
                            w-full p-4 rounded-xl border transition-all duration-200 relative overflow-hidden
                            ${isSelected 
                              ? 'border-blue-500 bg-blue-500/10' 
                              : 'border-gray-800 hover:border-gray-600 bg-gray-900/30 hover:bg-gray-800/50'
                            }
                          `}
                        >
                          {/* Background gradient */}
                          <div 
                            className={`absolute inset-0 bg-gradient-to-br ${theme.background} opacity-20`}
                          />
                          
                          {/* Content */}
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${theme.gradients.buttons}`}>
                                <IconComponent className="h-4 w-4 text-white" />
                              </div>
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full"
                                >
                                  <Check className="h-3 w-3 text-white" />
                                </motion.div>
                              )}
                            </div>
                            
                            <h4 className="font-medium text-white mb-2">{theme.name}</h4>
                            
                            {/* Color preview */}
                            <div className="flex gap-1 mb-3">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: theme.primary }}
                              />
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: theme.secondary }}
                              />
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: theme.accent }}
                              />
                            </div>
                            
                            {/* Theme preview bar */}
                            <div className={`h-2 rounded-full bg-gradient-to-r ${theme.gradients.hero}`} />
                          </div>
                          
                          {/* Hover effect */}
                          <motion.div
                            className="absolute inset-0 bg-white/5 rounded-xl opacity-0"
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                        </MagneticButton>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Theme Info */}
                <motion.div
                  className="text-center p-4 rounded-lg bg-gray-900/50 border border-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Sparkles className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    Les thèmes personnalisent les couleurs, animations et effets visuels de votre interface
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {['Couleurs dynamiques', 'Particules', 'Gradients', 'Animations'].map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
