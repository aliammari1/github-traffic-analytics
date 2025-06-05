"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { NAVIGATION_ITEMS, CATEGORY_COLORS } from "@/config/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const InnovativeNavigation = () => {
  const pathname = usePathname();

  const categories = Array.from(new Set(NAVIGATION_ITEMS.map(item => item.category)));

  return (
    <div className="fixed left-0 top-0 h-full w-20 hover:w-80 transition-all duration-300 bg-black/20 backdrop-blur-xl border-r border-white/10 z-50 group">
      <div className="p-4">
        <div className="text-white font-bold text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          GitHub Analytics
        </div>
      </div>
      
      <nav className="mt-8">
        {categories.map((category) => (
          <div key={category} className="mb-6">
            <motion.div
              className={cn(
                "px-4 py-2 text-sm font-semibold uppercase tracking-wide text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-r",
                CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS],
                "bg-clip-text text-transparent"
              )}
            >
              {category}
            </motion.div>
            
            <div className="space-y-1">
              {NAVIGATION_ITEMS
                .filter(item => item.category === category)
                .map((item) => (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      className={cn(
                        "flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200 cursor-pointer",
                        pathname === item.href
                          ? "bg-white/20 text-white shadow-lg"
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                      )}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex-shrink-0 w-6 h-6 text-lg flex items-center justify-center">
                        {item.icon}
                      </div>
                      <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {item.description}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
};
