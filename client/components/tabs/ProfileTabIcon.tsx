import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

function initialsFor(name?: string | null) {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Profile tab icon that shows the logged-in user's avatar, falling back to their
 * initials when no image is set. Gains a ring when the Profile tab is focused.
 */
export function ProfileTabIcon({ focused }: { focused: boolean }) {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  return (
    <Avatar
      alt={user?.name ? `${user.name}'s avatar` : 'Profile'}
      className={cn('size-7', focused && 'border-2 border-foreground')}>
      <AvatarImage source={{
        uri: "https://github.com/mrzachnugent.png"
      }} />
      <AvatarFallback>
        <Text className="text-xs font-semibold text-muted-foreground">
          {initialsFor(user?.name)}
        </Text>
      </AvatarFallback>
    </Avatar>
  );
}
