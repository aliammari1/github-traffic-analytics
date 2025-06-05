import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GitHub Analytics Pro - Intelligence Artificielle pour GitHub",
  description: "Plateforme révolutionnaire d'analyse GitHub avec IA prédictive, visualisations 3D immersives, analyse de code en temps réel et 20 expériences innovantes pour les développeurs modernes.",
  keywords: "GitHub, Analytics, IA, Intelligence Artificielle, Visualisation 3D, Analyse de Code, Développement, Open Source",
  openGraph: {
    title: "GitHub Analytics Pro - L'Avenir de l'Analyse GitHub",
    description: "Découvrez 20 expériences révolutionnaires avec IA prédictive et visualisations 3D",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white overflow-x-hidden`}
      >
        <SessionProvider>
          <div className="min-h-screen relative">
            {/* Revolutionary background layers */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950/20 to-purple-950/20" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950" />
            
            {/* Content */}
            <main className="relative z-10">
              {children}
            </main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
