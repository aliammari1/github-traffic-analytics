"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Theme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  particleColor: string;
  gradients: {
    hero: string;
    cards: string;
    buttons: string;
  };
}

const themes: Record<string, Theme> = {
  cyber: {
    name: " Blue",
    primary: "f6",
    secondary: "f6",
    accent: "d4",
    background: "blue-900/20 via-purple-900/20 to-cyan-900/20",
    particleColor: "f6",
    gradients: {
      hero: "blue-400 via-purple-500 to-cyan-400",
      cards: "blue-500/10 to-purple-500/10",
      buttons: "blue-600 to-purple-600"
    }
  },
  neon: {
    name: "Green",
    primary: "81",
    secondary: "0b",
    accent: "99",
    background: "emerald-900/20 via-yellow-900/20 to-pink-900/20",
    particleColor: "81",
    gradients: {
      hero: "emerald-400 via-yellow-500 to-pink-400",
      cards: "emerald-500/10 to-yellow-500/10",
      buttons: "emerald-600 to-yellow-600"
    }
  },
  sunset: {
    name: "t Orange",
    primary: "16",
    secondary: "44",
    accent: "f6",
    background: "orange-900/20 via-red-900/20 to-purple-900/20",
    particleColor: "16",
    gradients: {
      hero: "orange-400 via-red-500 to-purple-400",
      cards: "orange-500/10 to-red-500/10",
      buttons: "orange-600 to-red-600"
    }
  },
  arctic: {
    name: "c Ice",
    primary: "d4",
    secondary: "f6",
    accent: "f6",
    background: "cyan-900/20 via-blue-900/20 to-indigo-900/20",
    particleColor: "d4",
    gradients: {
      hero: "cyan-400 via-blue-500 to-indigo-400",
      cards: "cyan-500/10 to-blue-500/10",
      buttons: "cyan-600 to-blue-600"
    }
  },
  cosmic: {
    name: "c Purple",
    primary: "f6",
    secondary: "99",
    accent: "0b",
    background: "violet-900/20 via-purple-900/20 to-pink-900/20",
    particleColor: "f6",
    gradients: {
      hero: "violet-400 via-purple-500 to-pink-400",
      cards: "violet-500/10 to-purple-500/10",
      buttons: "violet-600 to-purple-600"
    }
  }
};

interface ThemeContextType {
  currentTheme: Theme;
  themeName: string;
  setTheme: (themeName: string) => void;
  availableThemes: Record<string, Theme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState("");
  const [currentTheme, setCurrentTheme] = useState(themes.cyber);

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('b-analytics-theme');
    if (savedTheme && themes[savedTheme]) {
      setThemeName(savedTheme);
      setCurrentTheme(themes[savedTheme]);
    }
  }, []);

  useEffect(() => {
    // Apply theme CSS variables
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', currentTheme.primary);
    root.style.setProperty('--theme-secondary', currentTheme.secondary);
    root.style.setProperty('--theme-accent', currentTheme.accent);
    root.style.setProperty('--theme-particle-color', currentTheme.particleColor);
  }, [currentTheme]);

  const setTheme = (newThemeName: string) => {
    if (themes[newThemeName]) {
      setThemeName(newThemeName);
      setCurrentTheme(themes[newThemeName]);
      localStorage.setItem('b-analytics-theme', newThemeName);
    }
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        currentTheme, 
        themeName, 
        setTheme, 
        availableThemes: themes 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('Theme must be used within a ThemeProvider');
  }
  return context;
}
