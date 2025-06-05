"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Menu, 
  X, 
  Search, 
  Settings, 
  User, 
  Bell,
  Palette,
} from "lucide-react";
import { SuperNavigation, useNavigationShortcut } from "./SuperNavigation";

interface FloatingControlCenterProps {
  className?: string;
  onThemeToggle?: () => void;
}

export const FloatingControlCenter = ({ 
  className, 
  onThemeToggle 
}: FloatingControlCenterProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [notifications] = useState(3);

  useNavigationShortcut(() => setIsNavOpen(true));

  const controlItems = [
    {
      icon: Search,
      label: "Navigation",
      action: () => setIsNavOpen(true),
      color: "from-blue-500 to-cyan-500",
      shortcut: "⌘/",
    },
    {
      icon: Palette,
      label: "Thèmes",
      action: onThemeToggle,
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Bell,
      label: "Notifications",
      action: () => {},
      color: "from-yellow-500 to-orange-500",
      badge: notifications,
    },
    {
      icon: Settings,
      label: "Paramètres",
      action: () => {},
      color: "from-gray-500 to-gray-700",
    },
    {
      icon: User,
      label: "Profil",
      action: () => {},
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <>
      <motion.div
        className={cn(
          "fixed bottom-6 right-6 z-40",
          className
        )}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        {/* Expanded Controls */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-16 right-0 mb-4"
            >
              <div className="flex flex-col gap-3">
                {controlItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative group"
                  >
                    <motion.button
                      onClick={item.action}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={cn(
                        "p-3 rounded-full shadow-lg border border-slate-700/50",
                        "bg-gradient-to-br from-slate-900/90 to-slate-800/90",
                        "backdrop-blur-sm hover:shadow-xl transition-all duration-300",
                        "relative overflow-hidden"
                      )}
                    >
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-300",
                        item.color
                      )} />
                      
                      <item.icon className="h-5 w-5 text-white relative z-10" />
                      
                      {item.badge && (
                        <motion.div
                          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {item.badge}
                        </motion.div>
                      )}
                    </motion.button>

                    {/* Tooltip */}
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                    >
                      <div className="bg-slate-900 text-white text-sm px-3 py-2 rounded-lg border border-slate-700/50 whitespace-nowrap">
                        {item.label}
                        {item.shortcut && (
                          <span className="ml-2 text-slate-400 text-xs">
                            {item.shortcut}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Toggle Button */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "p-4 rounded-full shadow-xl border border-slate-700/50",
            "bg-gradient-to-br from-slate-900 to-slate-800",
            "backdrop-blur-sm relative overflow-hidden group"
          )}
        >
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Icon */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            {isExpanded ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </motion.div>

          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0, 0.1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.button>

        {/* Status indicator */}
        <motion.div
          className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Super Navigation */}
      <SuperNavigation 
        isOpen={isNavOpen} 
        onClose={() => setIsNavOpen(false)} 
      />
    </>
  );
};

interface SmartTooltipProps {
  content: string;
  shortcut?: string;
  children: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
}

export const SmartTooltip = ({ 
  content, 
  shortcut, 
  children, 
  placement = "top" 
}: SmartTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const placements = {
    top: "bottom-full mb-2 left-1/2 transform -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 transform -translate-x-1/2",
    left: "right-full mr-2 top-1/2 transform -translate-y-1/2",
    right: "left-full ml-2 top-1/2 transform -translate-y-1/2",
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute z-50 pointer-events-none",
              placements[placement]
            )}
          >
            <div className="bg-slate-900 text-white text-sm px-3 py-2 rounded-lg border border-slate-700/50 whitespace-nowrap shadow-xl backdrop-blur-sm">
              {content}
              {shortcut && (
                <span className="ml-2 text-slate-400 text-xs">
                  {shortcut}
                </span>
              )}
              
              {/* Arrow */}
              <div className={cn(
                "absolute w-2 h-2 bg-slate-900 border border-slate-700/50 transform rotate-45",
                placement === "top" && "top-full left-1/2 -translate-x-1/2 -mt-1 border-t-0 border-l-0",
                placement === "bottom" && "bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-0 border-r-0",
                placement === "left" && "left-full top-1/2 -translate-y-1/2 -ml-1 border-l-0 border-b-0",
                placement === "right" && "right-full top-1/2 -translate-y-1/2 -mr-1 border-r-0 border-t-0"
              )} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
