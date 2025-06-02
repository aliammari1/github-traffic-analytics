/** @type {import('next').NextConfig} */
const nextConfig = {
  // Désactiver la génération statique pour les routes API qui nécessitent des variables d'environnement
  experimental: {
    // Force les routes API à être rendues côté serveur
    serverComponentsExternalPackages: ['octokit']
  },
  // Configuration pour éviter les erreurs de build avec les routes API dynamiques
  typescript: {
    // Attention: Ceci permet au build de réussir même avec des erreurs TypeScript
    // Utilisez uniquement en dernier recours
    ignoreBuildErrors: false,
  },
  eslint: {
    // Attention: Ceci permet au build de réussir même avec des erreurs ESLint
    // Utilisez uniquement en dernier recours
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
