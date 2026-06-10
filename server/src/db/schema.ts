import { json, jsonb } from "drizzle-orm/pg-core";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { Tag } from "../config.ts/tags";

/**
 * Better Auth core tables (user / session / account / verification).
 *
 * Keep these columns in sync with Better Auth's requirements. Add your own
 * application tables to this file and run `npm run db:generate` + `db:migrate`.
 */

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),

    // Expo push notification token (registered from the client after sign-in).
    expoPushToken: text("expo_push_token"),

    onboardingStep: text("onboarding_step")
      .default("name")
      .notNull()
      .$type<"name" | "complete">(),
  },
  (table) => [index("user_email_idx").on(table.email)],
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const friendStatusEnum = pgEnum("friend_status", [
  "pending",
  "accepted",
  "rejected",
  "blocked",
]);

export const postChallengeStatusEnum = pgEnum("post_challenge_status", [
  "pending",
  "upheld",
  "overturned",
]);

export const groupUserRoleEnum = pgEnum("group_user_role", ["admin", "member"]);

export const recurrenceTypeEnum = pgEnum("recurrence_type", [
  "daily",
  "weekly",
  "monthly",
]);

export type TagMetadata = {
  category: string;
  scoring_bucket: string;
  base_points: number;
};

export const friend = pgTable(
  "friend",
  {
    id: serial("id").primaryKey().notNull(),
    requesterId: text("requester_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    addresseeId: text("addressee_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: friendStatusEnum("status").default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    unique("friend_requester_addressee_unique").on(
      table.requesterId,
      table.addresseeId,
    ),
    index("friend_requesterId_idx").on(table.requesterId),
    index("friend_addresseeId_idx").on(table.addresseeId),
  ],
);

export const post = pgTable(
  "post",
  {
    id: serial("id").primaryKey().notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    caption: text("caption"),
    tag: jsonb("tag").$type<Tag>(),
    points: integer("points").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("post_userId_idx").on(table.userId)],
);

export const like = pgTable(
  "like",
  {
    id: serial("id").primaryKey().notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    postId: integer("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("like_user_post_unique").on(table.userId, table.postId),
    index("like_postId_idx").on(table.postId),
  ],
);

export const comment = pgTable(
  "comment",
  {
    id: serial("id").primaryKey().notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    postId: integer("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("comment_postId_idx").on(table.postId)],
);

export const postChallenge = pgTable(
  "post_challenge",
  {
    id: serial("id").primaryKey().notNull(),
    postId: integer("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    challengerId: text("challenger_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: postChallengeStatusEnum("status").default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    unique("post_challenge_post_challenger_unique").on(
      table.postId,
      table.challengerId,
    ),
    index("post_challenge_postId_idx").on(table.postId),
    index("post_challenge_challengerId_idx").on(table.challengerId),
  ],
);

export const userGoal = pgTable(
  "user_goal",
  {
    id: serial("id").primaryKey().notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    tag: jsonb("tag").$type<Tag>(),
    frequency: integer("frequency").notNull(),
    recurrenceType: recurrenceTypeEnum("recurrence_type").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("user_goal_userId_idx").on(table.userId)],
);

export const group = pgTable("group", {
  id: serial("id").primaryKey().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  endDate: timestamp("end_date").notNull(),
  winnerId: text("winner_id").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const groupUser = pgTable(
  "group_user",
  {
    id: serial("id").primaryKey().notNull(),
    groupId: integer("group_id")
      .notNull()
      .references(() => group.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: groupUserRoleEnum("role").default("member").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    unique("group_user_group_user_unique").on(table.groupId, table.userId),
    index("group_user_groupId_idx").on(table.groupId),
    index("group_user_userId_idx").on(table.userId),
  ],
);
