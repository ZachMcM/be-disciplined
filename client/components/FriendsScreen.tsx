import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
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
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: theme.colors.mutedForeground,
  },
  badge: {
    height: 20,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.destructive,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  flex1: {
    flex: 1,
  },
  name: {
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  meta: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.mutedForeground,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  searchBar: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  loadingRow: {
    alignItems: "center",
    paddingVertical: 16,
  },
  emptyText: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: theme.colors.mutedForeground,
  },
  separatorSpacing: {
    marginTop: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 64,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: "center",
    color: theme.colors.mutedForeground,
  },
}));

function SectionHeader({ title, badge }: { title: string; badge?: number }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {badge != null && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
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
    <View style={styles.row}>
      <Avatar
        source={
          item.friendUser.image ? { uri: item.friendUser.image } : undefined
        }
        alt={getInitials(item.friendUser.name)}
        size={48}
      />
      <View style={styles.flex1}>
        <Text style={styles.name}>{item.friendUser.name}</Text>
        {item.mutualFriendCount > 0 && (
          <Text style={styles.meta}>
            {item.mutualFriendCount} mutual{" "}
            {item.mutualFriendCount === 1 ? "friend" : "friends"}
          </Text>
        )}
      </View>
      <View style={styles.actions}>
        <Button variant="outline" size="icon" onPress={onAccept}>
          <Icon as={Check} size={18} />
        </Button>
        <Button variant="outline" size="icon" onPress={onDecline}>
          <Icon as={X} size={18} />
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
    <View style={styles.row}>
      <Avatar
        source={
          item.friendUser.image ? { uri: item.friendUser.image } : undefined
        }
        alt={getInitials(item.friendUser.name)}
        size={48}
      />
      <View style={styles.flex1}>
        <Text style={styles.name}>{item.friendUser.name}</Text>
        <Text style={styles.meta}>Requested · {requestedAgo}</Text>
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
  const { theme } = useUnistyles();
  return (
    <View style={styles.row}>
      <Avatar
        source={
          item.friendUser.image ? { uri: item.friendUser.image } : undefined
        }
        alt={getInitials(item.friendUser.name)}
        size={48}
      />
      <View style={styles.flex1}>
        <Text style={styles.name}>{item.friendUser.name}</Text>
        {item.weeklyRank != null && (
          <Text style={styles.meta}>#{item.weeklyRank} this week</Text>
        )}
      </View>
      <Button variant="ghost" size="icon" onPress={onMenu}>
        <Icon as={MoreHorizontal} size={20} color={theme.colors.mutedForeground} />
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
    <View style={styles.row}>
      <Avatar
        source={user.image ? { uri: user.image } : undefined}
        alt={getInitials(user.name)}
        size={48}
      />
      <Text style={[styles.flex1, styles.name]}>{user.name}</Text>
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
      <View style={styles.centerScreen}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Search bar */}
      <View style={styles.searchBar}>
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
            <View style={styles.loadingRow}>
              <ActivityIndicator />
            </View>
          )}
          {!isSearching &&
            filteredSearchResults &&
            filteredSearchResults.length === 0 && (
              <Text style={styles.emptyText}>No users found</Text>
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
          <Separator style={styles.separatorSpacing} />
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
          <Separator style={styles.separatorSpacing} />
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
          <Separator style={styles.separatorSpacing} />
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
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No friends yet</Text>
            <Text style={styles.emptyDesc}>
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
