import { relations } from "drizzle-orm";
import {
  account,
  comment,
  friend,
  group,
  groupUser,
  like,
  post,
  postChallenge,
  session,
  user,
  userGoal,
} from "./schema";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  posts: many(post),
  likes: many(like),
  comments: many(comment),
  sentFriendRequests: many(friend, { relationName: "requester" }),
  receivedFriendRequests: many(friend, { relationName: "addressee" }),
  postChallenges: many(postChallenge),
  goals: many(userGoal),
  groupUsers: many(groupUser),
  wonGroups: many(group),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const friendRelations = relations(friend, ({ one }) => ({
  requester: one(user, {
    fields: [friend.requesterId],
    references: [user.id],
    relationName: "requester",
  }),
  addressee: one(user, {
    fields: [friend.addresseeId],
    references: [user.id],
    relationName: "addressee",
  }),
}));

export const postRelations = relations(post, ({ one, many }) => ({
  user: one(user, {
    fields: [post.userId],
    references: [user.id],
  }),
  likes: many(like),
  comments: many(comment),
  challenges: many(postChallenge),
}));

export const likeRelations = relations(like, ({ one }) => ({
  user: one(user, {
    fields: [like.userId],
    references: [user.id],
  }),
  post: one(post, {
    fields: [like.postId],
    references: [post.id],
  }),
}));

export const commentRelations = relations(comment, ({ one }) => ({
  user: one(user, {
    fields: [comment.userId],
    references: [user.id],
  }),
  post: one(post, {
    fields: [comment.postId],
    references: [post.id],
  }),
}));

export const postChallengeRelations = relations(postChallenge, ({ one }) => ({
  post: one(post, {
    fields: [postChallenge.postId],
    references: [post.id],
  }),
  challenger: one(user, {
    fields: [postChallenge.challengerId],
    references: [user.id],
  }),
}));

export const userGoalRelations = relations(userGoal, ({ one }) => ({
  user: one(user, {
    fields: [userGoal.userId],
    references: [user.id],
  }),
}));

export const groupRelations = relations(group, ({ one, many }) => ({
  winner: one(user, {
    fields: [group.winnerId],
    references: [user.id],
  }),
  groupUsers: many(groupUser),
}));

export const groupUserRelations = relations(groupUser, ({ one }) => ({
  group: one(group, {
    fields: [groupUser.groupId],
    references: [group.id],
  }),
  user: one(user, {
    fields: [groupUser.userId],
    references: [user.id],
  }),
}));
