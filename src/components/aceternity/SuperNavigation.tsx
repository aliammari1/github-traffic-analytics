"use client";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, Search, Command } from "lucide-react";
import { NAVIGATION_ITEMS, CATEGORY_COLORS } from "@/config/navigation";

interface SuperNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuperNavigation = ({ isOpen, onClose }: SuperNavigationProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const controls = useAnimation();

  const filteredItems = NAVIGATION_ITEMS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(NAVIGATION_ITEMS.map(item => item.category)));

  useEffect(() => {
    if (isOpen) {
      controls.start("open");
    } else {
      controls.start("closed");
    }
  }, [isOpen, controls]);

  const variants = {
    open: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05,
      },
    },
    closed: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  const itemVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    closed: {
      opacity: 0,
      y: 20,
      transition: { duration: 0.2 },
    },
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg"
          onClick={onClose}
        >
          <motion.div
            variants={variants}
            initial="closed"
            animate={controls}
            exit="closed"
            className="absolute inset-4 md:inset-8 lg:inset-16 bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                    <Command className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Navigation Hub</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher une page ou fonctionnalité..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  autoFocus
                />
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2 mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                    !selectedCategory 
                      ? "bg-blue-500 text-white" 
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  )}
                >
                  Tout
                </motion.button>
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize",
                      selectedCategory === category 
                        ? "bg-blue-500 text-white" 
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    )}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Navigation Items */}
            <div className="p-6 overflow-y-auto max-h-[calc(100vh-16rem)]">
              <motion.div
                variants={variants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {filteredItems.map((item, index) => (
                  <motion.a
                    key={index}
                    href={item.href}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "block p-4 rounded-xl border border-slate-700/50 bg-gradient-to-br",
                      "hover:border-slate-600/50 transition-all duration-300",
                      "group cursor-pointer",
                      `from-slate-800/50 to-slate-900/50 hover:${CATEGORY_COLORS[item.category]}`
                    )}
                    onClick={onClose}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-lg bg-gradient-to-br transition-all duration-300",
                        CATEGORY_COLORS[item.category],
                        "group-hover:scale-110"
                      )}>
                        <div>{item.icon}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white mb-1 group-hover:text-white transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Hover effect */}
                    <motion.div
                      className={cn(
                        "absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 group-hover:opacity-10",
                        CATEGORY_COLORS[item.category]
                      )}
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 0.1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.a>
                ))}
              </motion.div>

              {filteredItems.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <Search className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-400 mb-2">
                    Aucun résultat trouvé
                  </h3>
                  <p className="text-slate-500">
                    Essayez de modifier votre recherche ou vos filtres
                  </p>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
              <div className="flex items-center justify-between text-sm text-slate-400">
                <div className="flex items-center gap-4">
                  <span>20 pages disponibles</span>
                  <span>•</span>
                  <span>{filteredItems.length} résultat(s)</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 text-xs bg-slate-800 rounded border border-slate-700">⌘</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 text-xs bg-slate-800 rounded border border-slate-700">/</kbd>
                  <span className="ml-2">pour ouvrir</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Global keyboard shortcut hook
export const useNavigationShortcut = (onOpen: () => void) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        onOpen();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpen]);
};
