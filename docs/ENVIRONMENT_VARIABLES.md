# Variables d’environnement

Ce document recense les variables réellement utilisées par le dépôt `Frankenstein-Labs/next-shadcn-dashboard-starter`. Les secrets ne doivent jamais être placés dans GitHub, dans le navigateur ou dans une variable `NEXT_PUBLIC_*`.

## Règles de configuration

- **Local** : copier `.env.example` vers `.env.local`.
- **Vercel** : ajouter les variables dans **Project Settings → Environment Variables**, généralement pour Production, Preview et Development selon le besoin. Les secrets serveur ne sont jamais exposés au client.
- **Render SearXNG** : les variables du service sont gérées par le Blueprint `render.yaml`. `SEARXNG_SECRET` est obligatoire et est déjà configuré sur le service Render créé.
- **GitHub Actions** : seuls les secrets de déploiement CI/CD (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) vont dans **Settings → Secrets and variables → Actions**.

## Authentification Clerk

| Variable | Service | Obligatoire | Utilité / emplacement | Environnements |
|---|---|---:|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk | Oui | Clé publique utilisée par le provider et le middleware. Obtenir dans Clerk Dashboard. Vercel et local. | Production, Preview, Development |
| `CLERK_SECRET_KEY` | Clerk | Oui | Clé serveur pour l’authentification des route handlers protégés. Clerk Dashboard → API Keys. Vercel uniquement côté serveur. | Production, Preview, Development |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Clerk/Next.js | Oui | Route de connexion, `/auth/sign-in`. Vercel/local. | Tous |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Clerk/Next.js | Oui | Route d’inscription, `/auth/sign-up`. Vercel/local. | Tous |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Clerk | Oui | Destination après connexion sans URL de retour. | Tous |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Clerk | Oui | Destination après inscription sans URL de retour. | Tous |
| `WEBHOOK_SECRET` | Clerk Webhooks | Facultative | Secret de vérification de webhook si des webhooks Clerk sont ajoutés. | Production/Preview selon usage |

## Application et observabilité

| Variable | Service | Obligatoire | Utilité / où obtenir | Environnements |
|---|---|---:|---|---|
| `NEXT_PUBLIC_APP_URL` | Next.js | Recommandée | URL HTTPS canonique utilisée par le layout et les métadonnées. Vercel project URL ou domaine personnalisé. | Production, Preview, Development |
| `BUILD_STANDALONE` | Next.js | Facultative | Active la sortie standalone pour Docker/self-hosting. | Render/Docker |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry | Facultative | DSN client pour le suivi d’erreurs. Sentry Project Settings. | Production/Preview |
| `NEXT_PUBLIC_SENTRY_ORG` | Sentry | Facultative | Organisation Sentry pour les sourcemaps. | CI/Production |
| `NEXT_PUBLIC_SENTRY_PROJECT` | Sentry | Facultative | Projet Sentry pour les sourcemaps. | CI/Production |
| `SENTRY_AUTH_TOKEN` | Sentry | Facultative | Token serveur CI pour envoyer les sourcemaps. GitHub Actions ou Vercel, jamais client. | CI/Production |
| `NEXT_PUBLIC_SENTRY_DISABLED` | Sentry | Facultative | Désactive l’instrumentation quand `true`. | Tous |

## Marketplace Frankenstein-Labs

| Variable | Service | Obligatoire | Utilité / emplacement | Environnements |
|---|---|---:|---|---|
| `FRANKENSTEIN_API_URL` | API Render Frankenstein-Labs | Pour le Marketplace | URL de l’API Render proxy. | Production, Preview, Development |
| `FRANKENSTEIN_API_SECRET` | API Render Frankenstein-Labs | Pour le Marketplace | Secret partagé envoyé côté serveur dans `x-frankenstein-api-secret`. Doit correspondre à Render. | Production, Preview, Development |
| `FRANKENSTEIN_API_TIMEOUT_MS` | API Render Frankenstein-Labs | Facultative | Timeout upstream, recommandé `75000` pour le réveil Render Free. | Tous |

## API Hub — connexions actives

| Variable | Fournisseur | Obligatoire | Utilité / emplacement | Environnements |
|---|---|---:|---|---|
| `FORGE_API_KEY` | Voxell Forge | Pour l’embedding | Bearer token du endpoint serveur `/api/api-hub/voxell/embed`. Obtenir auprès de Voxell Forge. Vercel server-only. | Production, Preview, Development |
| `UNOROUTER_API_KEY` | UnoRouter | Pour les modèles | Bearer token du route handler `/api/api-hub/unorouter/models`. Obtenir dans UnoRouter. Vercel server-only. | Production, Preview, Development |
| `AGENT_NEXUS_API_KEY` | Agent Nexus | Facultative | Header serveur `x-api-key`; le registre public fonctionne sans clé. | Production, Preview, Development |
| `SEARXNG_API_URL` | SearXNG Render | Oui pour la recherche SearXNG | URL de base de l’instance Render : `https://aetheris-searxng-uj0m.onrender.com`. À ajouter dans Vercel server-side. | Production, Preview, Development |

## API Hub — accès publics ou credentials optionnels

Les route handlers suivants utilisent des APIs publiques et ne nécessitent actuellement pas de clé : Neuronto, Wandbox, npm Registry, CDNJS, APIs.guru et Prismix. Les variables conservées dans `env.example.txt` et `.env.example` sont réservées à un futur plan authentifié ou à une opération privée : `NEURONTO_API_KEY`, `WANDBOX_API_KEY`, `NPM_REGISTRY_TOKEN`, `CDNJS_API_KEY`, `APIS_GURU_API_KEY` et `PRISMIX_API_KEY`. Ne pas inventer de valeur ni de quota.

## Services référencés mais non implémentés

`MESSENGERX_API_KEY`, `SPAM_HUNTER_API_KEY`, `SFW_API_KEY`, `AGENTDEALS_API_KEY`, `PYTHONIUM_API_KEY`, `PHPHUB_API_KEY`, `SOFTWIUM_API_KEY`, `SCREENSHOTBASE_API_KEY`, `TOOLBOX_500_API_KEY`, `TIMELOGIC_API_KEY`, `QR_KEPT_API_KEY` et `ABACUS_API_KEY` restent des emplacements documentaires. Aucun route handler actif ne les utilise actuellement. Ils ne doivent pas être marqués comme connectés avant validation d’un contrat API officiel et ajout d’un test réel.

## Supabase

Aucune intégration Supabase n’est présente dans le code actuel : aucun adaptateur, aucune migration et aucun appel Supabase n’ont été ajoutés. Par conséquent, aucune variable `SUPABASE_*` n’est nécessaire. Si une base Supabase est demandée, il faudra ajouter d’abord l’adaptateur serveur, les migrations, les règles d’accès et les tests avant de déclarer cette connexion opérationnelle.

## CI/CD Vercel

Ces secrets sont utilisés uniquement par GitHub Actions et ne sont pas des variables runtime de l’application :

- `VERCEL_TOKEN` — token Vercel, dans GitHub Actions Secrets.
- `VERCEL_ORG_ID` — identifiant de compte/team Vercel, dans GitHub Actions Secrets.
- `VERCEL_PROJECT_ID` — identifiant du projet Vercel, dans GitHub Actions Secrets.

Le workflow ignore le déploiement Vercel si ces trois secrets ne sont pas présents. L’authentification Vercel MCP n’ayant pas fourni de jeton exploitable dans cette session, `SEARXNG_API_URL` doit encore être ajouté manuellement au projet Vercel si le connecteur Vercel n’est pas réautorisé.
