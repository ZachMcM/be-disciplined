import { Avatar } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/auth-client";
import { cn, getInitials } from "@/lib/utils";

export function ProfileTabIcon({ focused }: { focused: boolean }) {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  return (
    <Avatar
      source={{
        uri: user?.image!,
      }}
      alt={getInitials(user?.name)}
      className={cn(focused && "border border-foreground")}
    />
  );
}
