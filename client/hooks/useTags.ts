import { useQuery } from '@tanstack/react-query';
import { getTags } from '../lib/endpoints';

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
    staleTime: Infinity,
  });
}
