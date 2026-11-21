export type ProviderCategory =
  | 'AI Hub'
  | 'Agent Hub'
  | 'Developer Hub'
  | 'API & Integration Hub'
  | 'Infrastructure & Monitoring';

export type ProviderStatus = 'configured' | 'not_configured';

export interface ApiProvider {
  id: string;
  name: string;
  category: ProviderCategory;
  description: string;
  documentationUrl: string;
  apiUrl: string;
  auth: string;
  envKey: string;
  limits: string;
  status: ProviderStatus;
  enabled: boolean;
}

export interface ProviderTestResult {
  providerId: string;
  status: 'ok' | 'not_configured' | 'error';
  message: string;
  checkedAt: string;
}
