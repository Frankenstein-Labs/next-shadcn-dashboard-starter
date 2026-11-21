import { queryOptions } from '@tanstack/react-query';
import { getApiProviders } from './service';

export const apiHubQueries = {
  all: () => ['api-hub'] as const,
  providers: () =>
    queryOptions({
      queryKey: [...apiHubQueries.all(), 'providers'] as const,
      queryFn: getApiProviders,
      staleTime: 60_000
    })
};
