# 🚦 GitHub Traffic Analytics 📊

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)  
🌐 [Live Demo](http://aacoder.me/github-traffic-analytics/)

Get deep insights into your repositories’ popularity, right from your browser!  
Easily visualize views, clones, and trends for all your public GitHub repos with a modern and interactive dashboard.

---

## ✨ Features

- 🔐 **GitHub Authentication** – Securely connect with your personal access token  
- 📈 **Traffic Metrics Dashboard** – See total & unique views, clones, and daily stats  
- 🔎 **Smart Filtering & Sorting** – Instantly find and organize your repos  
- 🔗 **Quick Repo Links** – Jump straight to any project’s GitHub page  
- ⚡ **Fast & Responsive UI** – Built with Next.js, Radix UI, and Tailwind CSS  
- 🌙 **Dark Mode** – Pleasant experience day & night

---

## 🛠️ Tech Stack

- **Frontend:** React, Next.js, TypeScript
- **Styling:** Tailwind CSS, Radix UI
- **Data Fetching:** Octokit, Axios
- **Tables:** TanStack Table
- **Linting/Formatting:** ESLint, Prettier

---

## 🚀 Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/aliammari1/github-traffic-analytics.git
   cd github-traffic-analytics
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Configure GitHub Token**
   - Create a `.env.local` file (if not present)
   - Add your GitHub personal access token:
     ```
     GITHUB_TOKEN=your_personal_access_token
     ```
   - _Your token requires **repo** and **repo:status** scopes_

4. **Run locally**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deployment

### Vercel Deployment

1. **Prérequis**
   - Avoir un token GitHub avec les permissions **repo** (accès complet aux dépôts)
   - Créer le token sur [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)

2. **Configuration Vercel**
   - Connectez votre repo GitHub à Vercel
   - Dans les paramètres du projet Vercel, ajoutez la variable d'environnement :
     ```
     GITHUB_TOKEN=your_personal_access_token
     ```
   - **Important :** Ne pas utiliser `NEXT_PUBLIC_` pour cette variable car elle contient des données sensibles

3. **Déployer**
   - Vercel déploiera automatiquement à chaque push sur la branche principale
   - L'application sera accessible via l'URL fournie par Vercel

---

## 🧑‍💻 Usage

- Authenticate using your GitHub token.
- Click "Navigate to /traffic" to view your analytics dashboard.
- Filter repos by name or sort by any metric.
- Click any repo name to visit it on GitHub.

---

## 🤝 Contributing

We love contributions!  
Please see [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before opening a PR.

1. Fork the repo
2. Create a feature branch
3. Commit your changes 🚀
4. Open a Pull Request

---

## 📄 License

Licensed under the [MIT License](LICENSE).

---

> Made with ❤️ by [aliammari1](https://github.com/aliammari1)