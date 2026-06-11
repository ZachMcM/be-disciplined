import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import {
  FriendRecord,
  FriendsData,
  FriendUser,
  acceptFriendRequest,
  declineFriendRequest,
  deleteFriend,
  getFriends,
  searchUsers,
  sendFriendRequest,
} from "@/lib/endpoints";
import { getInitials } from "@/lib/utils";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { Check, MoreHorizontal, X } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function SectionHeader({ title, badge }: { title: string; badge?: number }) {
  return (
    <View className="flex-row items-center justify-between px-4 pt-5 pb-2">
      <Text className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        {title}
      </Text>
      {badge != null && badge > 0 && (
        <View className="bg-destructive h-5 min-w-5 items-center justify-center rounded-full px-1.5">
          <Text className="text-xs font-bold text-white">{badge}</Text>
        </View>
      )}
    </View>
  );
}

function RequestItem({
  item,
  onAccept,
  onDecline,
}: {
  item: FriendRecord;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <Avatar
        source={
          item.friendUser.image ? { uri: item.friendUser.image } : undefined
        }
        alt={getInitials(item.friendUser.name)}
        className="size-12"
      />
      <View className="flex-1">
        <Text className="font-semibold text-foreground">
          {item.friendUser.name}
        </Text>
        {item.mutualFriendCount > 0 && (
          <Text className="text-sm text-muted-foreground">
            {item.mutualFriendCount} mutual{" "}
            {item.mutualFriendCount === 1 ? "friend" : "friends"}
          </Text>
        )}
      </View>
      <View className="flex-row gap-2">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onPress={onAccept}
        >
          <Check className="text-foreground" size={18} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onPress={onDecline}
        >
          <X className="text-foreground" size={18} />
        </Button>
      </View>
    </View>
  );
}

function SentRequestItem({
  item,
  onCancel,
}: {
  item: FriendRecord;
  onCancel: () => void;
}) {
  const requestedAgo = formatRequestedAgo(item.createdAt);
  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <Avatar
        source={
          item.friendUser.image ? { uri: item.friendUser.image } : undefined
        }
        alt={getInitials(item.friendUser.name)}
        className="size-12"
      />
      <View className="flex-1">
        <Text className="font-semibold text-foreground">
          {item.friendUser.name}
        </Text>
        <Text className="text-sm text-muted-foreground">
          Requested · {requestedAgo}
        </Text>
      </View>
      <Button variant="outline" size="sm" onPress={onCancel}>
        <Text>Cancel</Text>
      </Button>
    </View>
  );
}

function FriendItem({
  item,
  onMenu,
}: {
  item: FriendRecord;
  onMenu: () => void;
}) {
  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <Avatar
        source={
          item.friendUser.image ? { uri: item.friendUser.image } : undefined
        }
        alt={getInitials(item.friendUser.name)}
        className="size-12"
      />
      <View className="flex-1">
        <Text className="font-semibold text-foreground">
          {item.friendUser.name}
        </Text>
        {item.weeklyRank != null && (
          <Text className="text-sm text-muted-foreground">
            #{item.weeklyRank} this week
          </Text>
        )}
      </View>
      <Button variant="ghost" size="icon" onPress={onMenu}>
        <MoreHorizontal className="text-muted-foreground" size={20} />
      </Button>
    </View>
  );
}

function SearchResultItem({
  user,
  onSendRequest,
  isPending,
}: {
  user: FriendUser;
  onSendRequest: () => void;
  isPending: boolean;
}) {
  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <Avatar
        source={user.image ? { uri: user.image } : undefined}
        alt={getInitials(user.name)}
        className="size-12"
      />
      <Text className="flex-1 font-semibold text-foreground">{user.name}</Text>
      <Button size="sm" onPress={onSendRequest} disabled={isPending}>
        <Text>{isPending ? "Sending…" : "Add"}</Text>
      </Button>
    </View>
  );
}

export function FriendsScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingSendIds, setPendingSendIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery<FriendsData>({
    queryKey: ["friends"],
    queryFn: getFriends,
  });

  const { data: searchResults, isFetching: isSearching } = useQuery<
    FriendUser[]
  >({
    queryKey: ["user-search", searchQuery],
    queryFn: () => searchUsers(searchQuery),
    enabled: searchQuery.length >= 2,
    staleTime: 30_000,
  });

  const acceptMutation = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: (newFriend) => {
      queryClient.cancelQueries({ queryKey: ["friends"] });
      queryClient.setQueryData<FriendsData>(["friends"], (old) => {
        if (!old) return old;
        return {
          ...old,
          friends: [...old.friends, newFriend],
          requestsReceived: old.requestsReceived.filter(
            (r) => r.id !== newFriend.id,
          ),
        };
      });
    },
  });

  const declineMutation = useMutation({
    mutationFn: declineFriendRequest,
    onSuccess: (_, friendId) => {
      queryClient.cancelQueries({ queryKey: ["friends"] });
      queryClient.setQueryData<FriendsData>(["friends"], (old) => {
        if (!old) return old;
        return {
          ...old,
          requestsReceived: old.requestsReceived.filter(
            (r) => r.id !== friendId,
          ),
        };
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: deleteFriend,
    onSuccess: (_, friendId) => {
      queryClient.cancelQueries({ queryKey: ["friends"] });
      queryClient.setQueryData<FriendsData>(["friends"], (old) => {
        if (!old) return old;
        return {
          ...old,
          requestsSent: old.requestsSent.filter((r) => r.id !== friendId),
        };
      });
    },
  });

  const sendRequestMutation = useMutation({
    mutationFn: sendFriendRequest,
    onMutate: (addresseeId) => {
      setPendingSendIds((prev) => new Set([...prev, addresseeId]));
    },
    onSuccess: (newRequest) => {
      queryClient.cancelQueries({ queryKey: ["friends"] });
      queryClient.setQueryData<FriendsData>(["friends"], (old) => {
        if (!old) return old;
        return {
          ...old,
          requestsSent: [...old.requestsSent, newRequest],
        };
      });
      setPendingSendIds((prev) => {
        const next = new Set(prev);
        next.delete(newRequest.addresseeId);
        return next;
      });
      setSearchQuery("");
    },
    onError: (_, addresseeId) => {
      setPendingSendIds((prev) => {
        const next = new Set(prev);
        next.delete(addresseeId);
        return next;
      });
    },
  });

  const alreadySentIds = useCallback(() => {
    const ids = new Set<string>();
    data?.requestsSent.forEach((r) => ids.add(r.addresseeId));
    data?.friends.forEach((f) => ids.add(f.friendUser.id));
    data?.requestsReceived.forEach((r) => ids.add(r.requesterId));
    return ids;
  }, [data]);

  const filteredSearchResults = searchResults?.filter(
    (u) => !alreadySentIds().has(u.id),
  );

  const isSearchMode = searchQuery.length >= 2;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="pb-8"
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Search bar */}
      <View className="px-4 pt-4 pb-2">
        <Input
          placeholder="Add by username..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Search results */}
      {isSearchMode && (
        <>
          {isSearching && (
            <View className="items-center py-4">
              <ActivityIndicator />
            </View>
          )}
          {!isSearching &&
            filteredSearchResults &&
            filteredSearchResults.length === 0 && (
              <Text className="px-4 py-3 text-sm text-muted-foreground">
                No users found
              </Text>
            )}
          {!isSearching &&
            filteredSearchResults?.map((u) => (
              <SearchResultItem
                key={u.id}
                user={u}
                isPending={pendingSendIds.has(u.id)}
                onSendRequest={() => sendRequestMutation.mutate(u.id)}
              />
            ))}
          <Separator className="mt-2" />
        </>
      )}

      {/* Incoming requests */}
      {(data?.requestsReceived.length ?? 0) > 0 && (
        <>
          <SectionHeader
            title="Requests"
            badge={data?.requestsReceived.length}
          />
          {data?.requestsReceived.map((item) => (
            <RequestItem
              key={item.id}
              item={item}
              onAccept={() => acceptMutation.mutate(item.id)}
              onDecline={() => declineMutation.mutate(item.id)}
            />
          ))}
          <Separator className="mt-2" />
        </>
      )}

      {/* Pending sent */}
      {(data?.requestsSent.length ?? 0) > 0 && (
        <>
          <SectionHeader title="Pending Sent" />
          {data?.requestsSent.map((item) => (
            <SentRequestItem
              key={item.id}
              item={item}
              onCancel={() => cancelMutation.mutate(item.id)}
            />
          ))}
          <Separator className="mt-2" />
        </>
      )}

      {/* Friends list */}
      {(data?.friends.length ?? 0) > 0 && (
        <>
          <SectionHeader title={`Your Friends · ${data!.friends.length}`} />
          {data?.friends.map((item) => (
            <FriendItem
              key={item.id}
              item={item}
              onMenu={() => {
                /* TODO: show remove friend sheet */
              }}
            />
          ))}
        </>
      )}

      {/* Empty state */}
      {!isSearchMode &&
        (data?.friends.length ?? 0) === 0 &&
        (data?.requestsReceived.length ?? 0) === 0 &&
        (data?.requestsSent.length ?? 0) === 0 && (
          <View className="items-center px-8 pt-16 gap-2">
            <Text className="text-base font-semibold text-foreground">
              No friends yet
            </Text>
            <Text className="text-sm text-center text-muted-foreground">
              Search for friends by name to get started.
            </Text>
          </View>
        )}
    </ScrollView>
  );
}


function formatRequestedAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
