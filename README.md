<div align="center">

# GitHub Traffic Analytics

A simple and elegant web application to track and analyze traffic metrics for your GitHub repositories.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38b2ac?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## Overview

GitHub Traffic Analytics is a web-based dashboard that helps you monitor and analyze traffic patterns for your GitHub repositories. Authenticate with your GitHub account to view real-time traffic data, clone statistics, referrer sources, and popular paths across all your repositories.

## Features

- **GitHub Authentication**: Secure sign-in via GitHub OAuth
- **Repository List**: Browse and filter all your accessible repositories
- **Traffic Dashboard**: View detailed traffic analytics for individual repositories including:
  - Views and unique visitor counts
  - Clone and unique clone statistics
  - Top referrer sources
  - Popular pages/paths
  - Historical data visualizations (last 14 days)
- **Aggregated Traffic**: Overview of total traffic across all your repositories
- **Clean UI**: Modern, responsive interface built with Tailwind CSS and Shadcn UI components

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/       # NextAuth authentication
│   │   ├── repositories/             # Repository listing API
│   │   └── traffic/                  # Traffic data API
│   ├── repositories/                 # Repositories list page
│   ├── traffic/                      # Aggregated traffic dashboard
│   └── page.tsx                      # Home page with sign-in
├── components/
│   ├── RepositorySelector.tsx        # Repository selection UI
│   ├── TrafficDashboard.tsx          # Individual repo traffic display
│   ├── SessionProvider.tsx           # Auth session provider
│   └── ui/                           # Shadcn UI components
├── lib/
│   ├── auth.ts                       # NextAuth configuration
│   ├── github.ts                     # GitHub API service
│   └── utils.ts                      # Utility functions
└── types/
    └── next-auth.d.ts               # NextAuth type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- GitHub account
- GitHub OAuth application credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aliammari1/github-traffic-analytics.git
   cd github-traffic-analytics
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with:
   ```
   GITHUB_ID=your_github_oauth_app_id
   GITHUB_SECRET=your_github_oauth_app_secret
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret_key
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **UI Components**: Shadcn UI
- **Styling**: Tailwind CSS 4
- **Authentication**: NextAuth.js
- **API Client**: Octokit (GitHub REST API)
- **Charts**: Recharts
- **Animation**: Framer Motion
- **Icons**: Lucide React, Tabler Icons

## Usage

### Authentication
1. Click "Sign in with GitHub" on the home page
2. Authorize the application to access your GitHub data
3. You'll be redirected to the app dashboard

### View Repository Traffic
1. Navigate to **Repositories** to see all your repositories
2. Click on a repository to view its detailed traffic statistics
3. View traffic data including:
   - Total views and unique visitors
   - Clone statistics
   - Top referrer sources
   - Popular pages/paths
   - 14-day historical data

### Aggregated Traffic Dashboard
1. Navigate to **Traffic** to see aggregated metrics across all repositories
2. View total views, clones, and stars across your account
3. See a combined traffic chart over the last 14 days

## Pages

- **Home** (`/`): Authentication and introduction
- **Repositories** (`/repositories`): List and browse your repositories
- **Traffic** (`/traffic`): Aggregated traffic analytics across all repos

## API Endpoints

- `POST /api/auth/[...nextauth]/` - NextAuth authentication
- `GET /api/repositories` - Fetch user's repositories
- `GET /api/traffic` - Fetch traffic data for a specific repository

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GITHUB_ID` | GitHub OAuth App ID | `abc123def456` |
| `GITHUB_SECRET` | GitHub OAuth App Secret | `secret_key_here` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret for NextAuth | `random_secret_string` |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [GitHub](https://github.com) - For the powerful GitHub API
- [Next.js](https://nextjs.org/) - For the amazing React framework
- [Vercel](https://vercel.com) - For hosting and deployment platform
- [Shadcn UI](https://ui.shadcn.com/) - For the beautiful UI components

## Support

If you have any questions or need help, please open an issue on GitHub.
