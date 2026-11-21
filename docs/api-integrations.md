# API Hub — contrats connectés

Les route handlers serveur utilisent uniquement les endpoints vérifiés dans les sources officielles suivantes. Les clés restent côté serveur et aucune clé n'est renvoyée au navigateur.

- Voxell Forge : `POST https://api.voxell.ai/v1/embed`, `Authorization: Bearer`, variable `FORGE_API_KEY`.
  Sources : https://voxell.ai/forge/ ; https://voxell.ai/forge/recipes/ ; https://github.com/VoxellInc/forge-ai-provider
- UnoRouter : `GET https://api.unorouter.com/v1/models`, `Authorization: Bearer`, variable `UNOROUTER_API_KEY`.
  Source : https://unorouter.com/en/docs/platform/quickstart
- Neuronto : `POST https://neuronto.com/search` et `GET /health`, accès public documenté.
  Sources : https://neuronto.com/ ; https://neuronto.com/openapi.json
- Agent Nexus : `GET https://agentnexus.app/api/public/registry` et `/api/public/capabilities`, clé optionnelle `x-api-key`.
  Sources : https://agentnexus.app/openapi.json ; https://agentnexus.app/llms.txt
- Wandbox : `GET https://wandbox.org/api/list.json`, `POST https://wandbox.org/api/compile.json`.
  Source : https://github.com/melpon/wandbox
- npm Registry : `GET https://registry.npmjs.org/-/v1/search` et `GET https://registry.npmjs.org/{package}`.
  Source : https://github.com/npm/registry/blob/main/docs/REGISTRY-API.md
- CDNJS : `GET https://api.cdnjs.com/libraries` et `/libraries/{library}/{version}`.
  Sources : https://cdnjs.com/api ; https://github.com/cdnjs/api-server
- APIs.guru : `GET https://api.apis.guru/v2/list.json`, `/providers.json` et `/specs/...`.
  Source : https://apis.guru/api-doc/
- Prismix : `GET https://prismix.dev/api/v1/statuses`, accès public documenté.
  Source : https://prismix.dev/api-docs
- SearXNG : `GET /search?q=...&format=json` sur l'instance privée Render configurée par `SEARXNG_API_URL`.
  Sources : https://docs.searxng.org/dev/search_api.html ; https://docs.searxng.org/admin/installation-docker.html

Les tests directs effectués depuis l'environnement de travail ont reçu HTTP 200 pour npm, CDNJS, APIs.guru, Wandbox, Neuronto, Agent Nexus et Prismix. Les services nécessitant une clé ou une instance privée restent inactifs jusqu'à l'ajout de leurs secrets côté déploiement.
