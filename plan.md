# Intégration Aetheris Cloud — API Hub et outils développeur

## Approche d'implémentation

Le projet existant reste la base : Next.js 16 App Router, Clerk pour la protection des routes, React Query pour les lectures client, Tailwind/shadcn pour l'interface et une organisation par fonctionnalités. La première tranche ajoute un registre serveur centralisé des fournisseurs et une interface API Hub qui réutilise `PageContainer`, la navigation et les composants UI existants. Aucun style global, thème, landing page, authentification ou page existante n'est remplacé.

Le registre contient les fournisseurs demandés avec leur catégorie, documentation officielle, URL de service, mode d'authentification, limites connues et nom de variable d'environnement serveur. La route `/api/api-hub/providers` ne renvoie jamais de secret : elle expose uniquement l'état `configured`, déduit côté serveur. La route de test vérifie uniquement les fournisseurs configurés et applique un timeout côté serveur ; sans configuration, elle retourne un état explicite `not_configured` au lieu de simuler une réussite.

Les pages `API Hub`, `AI Hub`, `Agent Hub`, `Developer Hub`, `Infrastructure & Monitoring`, `API Keys & Providers` et `Usage & Statistics` partagent le même composant filtrable. Cette tranche fournit une base fonctionnelle et extensible. Les clés utilisateur stockées de façon chiffrée, les tables RLS Supabase, les quotas persistés, les journaux d'appels et les intégrations propres à chaque API seront ajoutés après choix et configuration du backend de données ; aucune fausse persistance n'est introduite.

## Structure du projet

- `src/features/api-hub/api/` : types, registre central et accès aux route handlers.
- `src/features/api-hub/components/` : vue de registre, filtres, cartes et états de configuration.
- `src/app/api/api-hub/` : endpoints protégés Clerk pour le catalogue et les tests serveur.
- `src/app/dashboard/api-hub/` : page principale et pages de catégories.
- `src/config/nav-config.ts` : entrées de navigation ajoutées sans changer les groupes existants.
- `public/manus-routes.json` : manifeste des pages applicatives, hors endpoints API.

## Design conservé

Trois styles envisagés : extension native du dashboard existant (0,94), tableau de contrôle néon autonome (0,03), portail éditorial dense (0,03). Style choisi : extension native du dashboard existant.

**Design Movement :** continuité directe avec le dashboard shadcn actuel.

**Core Principles :** densité utile, états explicites, hiérarchie par catégories et composants réutilisables.

**Color Philosophy :** reprendre les tokens du thème actif ; la couleur primaire signale l'action et les tons muted signalent les fournisseurs non configurés, sans introduire de nouvelle palette.

**Layout Paradigm :** en-tête `PageContainer`, barre de recherche et grille de cartes qui s'adapte aux breakpoints déjà utilisés par le dashboard.

**Signature Elements :** badges de statut, icônes centralisées et liens de documentation visibles.

**Interaction Philosophy :** aucune action ne prétend réussir sans configuration ; les états d'attente, d'erreur et de succès sont séparés.

**Animation :** conserver les transitions et animations existantes ; aucune animation décorative ajoutée.

**Typography System :** reprendre la typographie et les tailles des composants shadcn existants.

**Brand Essence :** Aetheris Cloud devient une console de connexion lisible pour développeurs, sans rompre l'expérience actuelle. Personnalité : fiable, claire, extensible.

**Brand Voice :** messages directs et opérationnels, par exemple « Configurez la clé côté serveur pour activer ce fournisseur » et « Aucun appel n'est simulé ».

**Wordmark & Logo :** ne pas modifier le logo ni le wordmark existants.

**Signature Brand Color :** conserver la couleur primaire du thème actif.

## Contraintes d'infrastructure

Vercel reste la cible du frontend et des route handlers légers. Aucun secret n'est préfixé `NEXT_PUBLIC_`. Les traitements persistants ou les futurs services autonomes comme SearXNG restent hors de cette tranche et seront préparés pour Render. Aucun endpoint externe non documenté n'est inventé.
