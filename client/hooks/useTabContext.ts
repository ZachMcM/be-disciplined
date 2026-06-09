import { useSegments } from 'expo-router';

export type TabContext = 'activity' | 'leaderboard' | 'home' | 'profile';

/**
 * Returns the current tab context based on the route segments.
 * Useful for navigating to shared routes while staying in the same tab.
 */
export function useTabContext(): TabContext {
  const segments = useSegments() as string[];
  for (const segment of segments) {
    if (segment === '(activity)') return 'activity';
    if (segment === '(leaderboard)') return 'leaderboard';
    if (segment === '(home)') return 'home';
    if (segment === '(profile)') return 'profile';
  }
  return 'home';
}
