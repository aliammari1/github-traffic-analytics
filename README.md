# GitHub Traffic Analytics

Une application Next.js 15 moderne pour analyser le trafic de vos dépôts GitHub avec des visualisations détaillées.

## Fonctionnalités

- 🔐 Authentification GitHub OAuth
- 📊 Visualisation des vues et clones de dépôts
- 📈 Graphiques interactifs avec Recharts
- 🎨 Interface moderne avec shadcn/ui et Tailwind CSS
- 📱 Design responsive
- 🌐 Support de l'App Router de Next.js 15

## Configuration

1. **Cloner le projet et installer les dépendances :**

```bash
npm install
```

2. **Créer une OAuth App GitHub :**

   - Allez sur [GitHub Developer Settings](https://github.com/settings/developers)
   - Cliquez sur "New OAuth App"
   - Remplissez les informations :
     - Application name: `GitHub Traffic Analytics`
     - Homepage URL: `http://localhost:3000`
     - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
   - Notez votre `Client ID` et `Client Secret`

3. **Configurer les variables d'environnement :**

```bash
cp .env.example .env.local
```

Modifiez `.env.local` avec vos valeurs :

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre-secret-nextauth-ici
GITHUB_CLIENT_ID=votre-client-id-github
GITHUB_CLIENT_SECRET=votre-client-secret-github
```

4. **Démarrer l'application :**

```bash
npm run dev
```

## 🔒 Limitations et Permissions

### Accès aux Données de Trafic

Les données de trafic GitHub (vues, clones, sources de référence, pages populaires) ne sont disponibles que sous certaines conditions :

- **Propriétaire du dépôt** : Vous devez être le propriétaire du dépôt
- **Accès Push** : Ou avoir des permissions de push sur le dépôt
- **Dépôts privés** : Nécessitent le scope `repo` complet
- **Dépôts publics** : Peuvent fonctionner avec `public_repo` mais `repo` est recommandé

### Scopes OAuth Requis

L'application demande les scopes suivants :
- `repo` : Accès complet aux dépôts (nécessaire pour les données de trafic)
- `user:email` : Accès aux informations de profil utilisateur

### Messages d'Erreur

Si vous voyez "Accès refusé", cela signifie que :
1. Vous n'êtes pas propriétaire du dépôt
2. Vous n'avez pas les permissions push sur le dépôt
3. Les scopes OAuth sont insuffisants

### Solutions

1. **Tester avec vos propres dépôts** : Les données de trafic seront disponibles pour tous vos dépôts
2. **Demander l'accès** : Demandez les permissions push aux propriétaires des dépôts
3. **Vérifier les scopes** : Assurez-vous que l'application a les bons scopes OAuth

L'application sera disponible sur [http://localhost:3000](http://localhost:3000).

## Technologies utilisées

- **Next.js 15** - Framework React avec App Router
- **NextAuth.js v5** - Authentification
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling
- **shadcn/ui** - Composants UI
- **Recharts** - Graphiques et visualisations
- **Octokit** - Client API GitHub
- **Lucide React** - Icônes

## Scopes GitHub requis

L'application demande les scopes suivants pour accéder aux données de trafic :

- `repo:status` - Accès au statut des commits
- `read:repo_hook` - Lecture des webhooks de dépôts
- `read:org` - Lecture des informations d'organisation
- `read:public_key` - Lecture des clés publiques
- `read:enterprise` - Lecture des informations d'entreprise
- `read:gpg_key` - Lecture des clés GPG

## Structure du projet

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── repositories/
│   │   └── traffic/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/           # Composants shadcn/ui
│   ├── LoginForm.tsx
│   ├── RepositorySelector.tsx
│   └── TrafficDashboard.tsx
├── lib/
│   ├── auth.ts       # Configuration NextAuth
│   ├── github.ts     # Service API GitHub
│   └── utils.ts      # Utilitaires
└── types/
    └── next-auth.d.ts # Types TypeScript pour NextAuth
```

## Fonctionnalités principales

### Dashboard de trafic

- **Vues et visiteurs uniques** - Graphiques en ligne montrant l'évolution du trafic
- **Clones** - Statistiques de téléchargement des dépôts
- **Référents** - Sources de trafic vers vos dépôts
- **Pages populaires** - Contenu le plus consulté
- **Métriques en temps réel** - Données actualisées depuis l'API GitHub

### Interface utilisateur

- Design moderne et responsive
- Sélection intuitive des dépôts
- Navigation fluide entre les vues
- Graphiques interactifs avec tooltips
- Support du mode sombre (via Tailwind CSS)

## Développement

```bash
# Démarrer en mode développement
npm run dev

# Construire pour la production
npm run build

# Démarrer en production
npm start

# Linting
npm run lint
```

## Déploiement

Pour déployer sur Vercel :

1. Poussez votre code sur GitHub
2. Connectez votre dépôt à Vercel
3. Configurez les variables d'environnement dans Vercel
4. Mettez à jour l'URL de callback GitHub avec votre domaine de production

## Licence

MIT
