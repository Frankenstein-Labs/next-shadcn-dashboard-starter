import type { ApiProvider, ProviderCategory } from './types';

interface ProviderDefinition extends Omit<ApiProvider, 'status' | 'enabled'> {
  envKey: string;
}

const definitions: ProviderDefinition[] = [
  {
    id: 'voxell-forge',
    name: 'Voxell Forge',
    category: 'AI Hub',
    description: 'Plateforme Forge de Voxell pour les outils et workflows IA.',
    documentationUrl: 'https://voxell.ai/forge',
    apiUrl: 'https://api.voxell.ai/v1',
    auth: 'Bearer API key dans Authorization.',
    envKey: 'FORGE_API_KEY',
    limits: 'Non publiées dans ce registre tant que le plan officiel n’est pas confirmé.'
  },
  {
    id: 'unorouter',
    name: 'UnoRouter',
    category: 'AI Hub',
    description: 'Routage de modèles IA via une interface de fournisseur unifiée.',
    documentationUrl: 'https://unorouter.com',
    apiUrl: 'https://api.unorouter.com/v1',
    auth: 'Bearer API key dans Authorization.',
    envKey: 'UNOROUTER_API_KEY',
    limits: 'Dépendent du compte et du fournisseur sélectionné.'
  },
  {
    id: 'neuronto',
    name: 'Neuronto',
    category: 'Agent Hub',
    description: 'Service d’agents et d’automatisation orienté développeurs.',
    documentationUrl: 'https://neuronto.com',
    apiUrl: 'https://neuronto.com',
    auth: 'API publique sans clé pour la découverte.',
    envKey: 'NEURONTO_API_KEY',
    limits: 'Non publiées dans ce registre tant que le plan officiel n’est pas confirmé.'
  },
  {
    id: 'agent-nexus',
    name: 'Agent Nexus',
    category: 'Agent Hub',
    description: 'Hub externe pour connecter des agents et des capacités spécialisées.',
    documentationUrl: 'https://agentnexus.app',
    apiUrl: 'https://agentnexus.app',
    auth: 'Lecture publique ; clé optionnelle x-api-key côté serveur.',
    envKey: 'AGENT_NEXUS_API_KEY',
    limits: 'Dépendent du compte fournisseur.'
  },
  {
    id: 'wandbox',
    name: 'Wandbox',
    category: 'Developer Hub',
    description: 'Exécution distante de code via l’API officielle Wandbox.',
    documentationUrl: 'https://github.com/melpon/wandbox/blob/master/kennel/API.md',
    apiUrl: 'https://wandbox.org',
    auth: 'API publique ; exécution limitée côté serveur.',
    envKey: 'WANDBOX_API_KEY',
    limits: 'Contraintes d’exécution et de ressources définies par Wandbox.'
  },
  {
    id: 'npm-registry',
    name: 'npm Registry',
    category: 'Developer Hub',
    description: 'Métadonnées publiques des paquets npm et informations de registre.',
    documentationUrl: 'https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md',
    apiUrl: 'https://registry.npmjs.org',
    auth: 'Lecture publique ; jeton serveur uniquement pour les opérations privées.',
    envKey: 'NPM_REGISTRY_TOKEN',
    limits: 'Quotas et règles du registre npm.'
  },
  {
    id: 'cdnjs',
    name: 'CDNJS',
    category: 'Developer Hub',
    description: 'Recherche de bibliothèques et de versions hébergées sur CDNJS.',
    documentationUrl: 'https://api.cdnjs.com/',
    apiUrl: 'https://api.cdnjs.com',
    auth: 'Lecture publique.',
    envKey: 'CDNJS_API_KEY',
    limits: 'Selon la disponibilité et les règles du service CDNJS.'
  },
  {
    id: 'prismix',
    name: 'Prismix Status API',
    category: 'Infrastructure & Monitoring',
    description: 'Source externe de statut et de disponibilité des services Prismix.',
    documentationUrl: 'https://prismix.dev/api-docs',
    apiUrl: 'https://prismix.dev/api/v1/statuses',
    auth: 'API publique sans clé.',
    envKey: 'PRISMIX_API_KEY',
    limits: 'Non publiées dans ce registre tant que le plan officiel n’est pas confirmé.'
  },
  {
    id: 'searxng',
    name: 'SearXNG',
    category: 'Infrastructure & Monitoring',
    description: 'Moteur de métarecherche à déployer sur une instance Render contrôlée.',
    documentationUrl: 'https://docs.searxng.org/dev/search_api.html',
    apiUrl: 'À fournir après déploiement de l’instance Render.',
    auth: 'URL et secret d’instance Render côté serveur.',
    envKey: 'SEARXNG_API_URL',
    limits: 'Dépendent de l’instance Render et des moteurs activés.'
  },
  {
    id: 'messengerx',
    name: 'MessengerX',
    category: 'AI Hub',
    description: 'Service MessengerX référencé pour une future intégration serveur.',
    documentationUrl: 'https://messengerx.rtfd.io',
    apiUrl: 'https://messengerx.rtfd.io',
    auth: 'À confirmer dans la documentation officielle.',
    envKey: 'MESSENGERX_API_KEY',
    limits: 'À confirmer.'
  },
  {
    id: 'spam-hunter',
    name: 'Spam Hunter',
    category: 'AI Hub',
    description: 'Service de détection de spam référencé par la mission.',
    documentationUrl: 'https://spam-hunter.ru/',
    apiUrl: 'https://spam-hunter.ru/',
    auth: 'À confirmer dans la documentation officielle.',
    envKey: 'SPAM_HUNTER_API_KEY',
    limits: 'À confirmer.'
  },
  {
    id: 'sfw-api',
    name: 'SFW API',
    category: 'AI Hub',
    description: 'API de classification SFW référencée pour la modération.',
    documentationUrl: 'https://sfwapi.dev',
    apiUrl: 'https://sfwapi.dev',
    auth: 'À confirmer dans la documentation officielle.',
    envKey: 'SFW_API_KEY',
    limits: 'À confirmer.'
  },
  {
    id: 'agent-deals',
    name: 'AgentDeals',
    category: 'Agent Hub',
    description: 'Catalogue AgentDeals référencé pour une intégration API ultérieure.',
    documentationUrl: 'https://agentdeals.dev/api',
    apiUrl: 'https://agentdeals.dev/api',
    auth: 'À confirmer dans la documentation officielle.',
    envKey: 'AGENTDEALS_API_KEY',
    limits: 'À confirmer.'
  },
  {
    id: 'pythonium',
    name: 'Pythonium',
    category: 'Developer Hub',
    description: 'Linter Python externe référencé pour le Developer Hub.',
    documentationUrl: 'https://pythonium.net/linter',
    apiUrl: 'https://pythonium.net/linter',
    auth: 'À confirmer dans la documentation officielle.',
    envKey: 'PYTHONIUM_API_KEY',
    limits: 'À confirmer.'
  },
  {
    id: 'php-hub',
    name: 'PHPhub',
    category: 'Developer Hub',
    description: 'Linter PHP externe référencé pour le Developer Hub.',
    documentationUrl: 'https://phphub.net/linter/',
    apiUrl: 'https://phphub.net/linter/',
    auth: 'À confirmer dans la documentation officielle.',
    envKey: 'PHPHUB_API_KEY',
    limits: 'À confirmer.'
  },
  {
    id: 'softwium',
    name: 'Softwium',
    category: 'Developer Hub',
    description: 'Validateur SQL externe référencé pour le Developer Hub.',
    documentationUrl: 'https://softwium.com/sql-validator/',
    apiUrl: 'https://softwium.com/sql-validator/',
    auth: 'À confirmer dans la documentation officielle.',
    envKey: 'SOFTWIUM_API_KEY',
    limits: 'À confirmer.'
  },
  {
    id: 'apis-guru',
    name: 'APIs.guru',
    category: 'API & Integration Hub',
    description: 'Catalogue public de descriptions OpenAPI.',
    documentationUrl: 'https://apis.guru/api-doc/',
    apiUrl: 'https://api.apis.guru/v2',
    auth: 'Lecture publique.',
    envKey: 'APIS_GURU_API_KEY',
    limits: 'Selon le catalogue public.'
  },
  {
    id: 'screenshotbase',
    name: 'Screenshotbase',
    category: 'API & Integration Hub',
    description: 'Service de capture référencé pour une future intégration serveur.',
    documentationUrl: 'https://screenshotbase.com/',
    apiUrl: 'https://screenshotbase.com/',
    auth: 'À confirmer dans la documentation officielle.',
    envKey: 'SCREENSHOTBASE_API_KEY',
    limits: 'À confirmer.'
  },
  {
    id: '500toolbox',
    name: '500Toolbox',
    category: 'API & Integration Hub',
    description: 'Boîte à outils API référencée par la mission.',
    documentationUrl: 'https://www.500toolbox.com/',
    apiUrl: 'https://www.500toolbox.com/',
    auth: 'À confirmer dans la documentation officielle.',
    envKey: 'TOOLBOX_500_API_KEY',
    limits: 'À confirmer.'
  },
  {
    id: 'timelogic',
    name: 'TimeLogic',
    category: 'API & Integration Hub',
    description: 'Service de temps référencé pour les intégrations utilitaires.',
    documentationUrl: 'https://timelogicapi.com',
    apiUrl: 'https://timelogicapi.com',
    auth: 'À confirmer dans la documentation officielle.',
    envKey: 'TIMELOGIC_API_KEY',
    limits: 'À confirmer.'
  },
  {
    id: 'qr-kept',
    name: 'QR Kept',
    category: 'API & Integration Hub',
    description: 'Service QR référencé pour une future intégration.',
    documentationUrl: 'https://qrkept.com',
    apiUrl: 'https://qrkept.com',
    auth: 'À confirmer dans la documentation officielle.',
    envKey: 'QR_KEPT_API_KEY',
    limits: 'À confirmer.'
  },
  {
    id: 'abacus',
    name: 'Abacus',
    category: 'API & Integration Hub',
    description: 'Outil Abacus référencé par la mission.',
    documentationUrl: 'https://abacus.jasoncameron.dev/',
    apiUrl: 'https://abacus.jasoncameron.dev/',
    auth: 'À confirmer dans la documentation officielle.',
    envKey: 'ABACUS_API_KEY',
    limits: 'À confirmer.'
  }
];

const publicProviderIds = new Set([
  'neuronto',
  'agent-nexus',
  'wandbox',
  'npm-registry',
  'cdnjs',
  'apis-guru',
  'prismix'
]);

export function getProviders(): ApiProvider[] {
  return definitions.map((provider) => ({
    ...provider,
    status:
      publicProviderIds.has(provider.id) || process.env[provider.envKey]
        ? 'configured'
        : 'not_configured',
    enabled: publicProviderIds.has(provider.id) || Boolean(process.env[provider.envKey])
  }));
}

export function getProvider(id: string): ApiProvider | undefined {
  return getProviders().find((provider) => provider.id === id);
}

export function getCategories(): ProviderCategory[] {
  return [
    'AI Hub',
    'Agent Hub',
    'Developer Hub',
    'API & Integration Hub',
    'Infrastructure & Monitoring'
  ];
}
