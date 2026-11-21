# Intégration marimo + Google Colab

## Décision technique

Aetheris ne demande pas de clé API Colab à l’utilisateur. Le dashboard conserve l’authentification Clerk existante, puis propose une autorisation Google OAuth séparée avec le scope officiel `https://www.googleapis.com/auth/colaboratory`. Le refresh token est chiffré côté serveur et stocké dans les métadonnées privées Clerk de l’utilisateur. Il n’est jamais envoyé au navigateur.

Après autorisation, Aetheris peut lister les runtimes Colab assignés à l’utilisateur via `https://colaboratory.googleapis.com/v1beta/runtimes`. L’API officielle expose aussi `create`, `get` et `delete` pour les runtimes. Chaque runtime fournit une URL Jupyter et un proxy token à durée limitée ; ces informations ne sont pas persistées dans le dépôt et doivent rester à courte durée de vie.

L’exécution lourde reste dans Google Colab. Aetheris ne prétend pas piloter une cellule Colab gratuite comme une tâche locale. Le dépôt fournit un notebook `.ipynb` ouvrable directement dans Colab qui installe marimo et exécute le notebook Python marimo depuis GitHub. Les tests et calculs lancés par ce notebook utilisent donc le runtime Colab de l’utilisateur.

## Configuration Google Cloud requise

Créer une application OAuth 2.0 de type Web application dans Google Cloud, activer l’API Colab, puis déclarer exactement l’URL de callback :

`https://<domaine-aetheris>/api/api-hub/google-colab/callback`

Variables serveur :

- `GOOGLE_COLAB_CLIENT_ID`
- `GOOGLE_COLAB_CLIENT_SECRET`
- `GOOGLE_COLAB_REDIRECT_URI`
- `GOOGLE_COLAB_TOKEN_ENCRYPTION_KEY` — clé AES-256 encodée en base64, générée avec `openssl rand -base64 32`.

En production, le scope Colab peut nécessiter la configuration de consentement et la vérification Google selon le type de comptes et la distribution de l’application.

## Limites honnêtes

La connexion Google ne donne pas à Clerk ni à Aetheris un accès implicite à Colab. Elle doit être approuvée séparément par l’utilisateur. L’API Colab gère des runtimes et leur connexion Jupyter ; elle ne doit pas être décrite comme une API universelle de soumission de cellules Colab gratuites. Le bouton Colab du dashboard ouvre le notebook marimo versionné dans le dépôt et laisse l’utilisateur exécuter les calculs dans son propre runtime.

## Sources officielles

- [1] [marimo documentation](https://docs.marimo.io/) — notebooks Python, exécution comme scripts et applications.
- [2] [marimo apps](https://docs.marimo.io/guides/apps/) — `marimo run` et déploiement d’applications.
- [3] [marimo GitHub publishing](https://docs.marimo.io/guides/publishing/github/) — previews molab et notebooks GitHub.
- [4] [Google Colab API REST](https://developers.google.com/colab/api/reference/rest) — API officielle de gestion des runtimes.
- [5] [Google Colab runtimes](https://developers.google.com/colab/api/reference/rest/v1beta/runtimes) — `connectionInfo`, URL Jupyter et proxy token temporaire.
- [6] [Google OAuth web-server flow](https://developers.google.com/identity/protocols/oauth2/web-server) — authorization code flow, state, offline access et refresh tokens.
