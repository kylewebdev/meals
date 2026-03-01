import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';

// ─── Enums ──────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['admin', 'member']);
export const weekStatusEnum = pgEnum('week_status', ['upcoming', 'active', 'complete']);
export const mealTypeEnum = pgEnum('meal_type', ['lunch', 'dinner']);
export const suggestionStatusEnum = pgEnum('suggestion_status', ['open', 'fulfilled']);

// ─── Auth tables (Better Auth managed) ──────────────────────────

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  householdId: text('household_id').references(() => households.id),
  role: userRoleEnum('role').notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_user_id_idx').on(table.userId)],
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('account_user_id_idx').on(table.userId)],
);

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
);

// ─── Application tables ─────────────────────────────────────────

export const households = pgTable('households', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  rotationPosition: integer('rotation_position').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const weeks = pgTable(
  'weeks',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    startDate: timestamp('start_date', { mode: 'date' }).notNull(),
    householdId: text('household_id')
      .notNull()
      .references(() => households.id),
    status: weekStatusEnum('status').notNull().default('upcoming'),
    pickupLocation: text('pickup_location'),
    pickupTimes: text('pickup_times'),
    pickupNotes: text('pickup_notes'),
    expenseAmount: integer('expense_amount'),
    expenseNotes: text('expense_notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('weeks_household_id_idx').on(table.householdId)],
);

export const mealPlanEntries = pgTable(
  'meal_plan_entries',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    weekId: text('week_id')
      .notNull()
      .references(() => weeks.id, { onDelete: 'cascade' }),
    dayOfWeek: integer('day_of_week').notNull(),
    mealType: mealTypeEnum('meal_type').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
  },
  (table) => [index('meal_plan_entries_week_id_idx').on(table.weekId)],
);

export const suggestions = pgTable('suggestions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  authorId: text('author_id')
    .notNull()
    .references(() => user.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: suggestionStatusEnum('status').notNull().default('open'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const votes = pgTable(
  'votes',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    suggestionId: text('suggestion_id')
      .notNull()
      .references(() => suggestions.id, { onDelete: 'cascade' }),
    memberId: text('member_id')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [unique('votes_suggestion_member_unique').on(table.suggestionId, table.memberId)],
);

export const rsvps = pgTable(
  'rsvps',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    weekId: text('week_id')
      .notNull()
      .references(() => weeks.id, { onDelete: 'cascade' }),
    householdId: text('household_id')
      .notNull()
      .references(() => households.id),
    headcount: integer('headcount').notNull(),
    notes: text('notes'),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [unique('rsvps_week_household_unique').on(table.weekId, table.householdId)],
);

export const invites = pgTable('invites', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 255 }).notNull(),
  householdId: text('household_id')
    .notNull()
    .references(() => households.id),
  role: userRoleEnum('role').notNull().default('member'),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Relations ──────────────────────────────────────────────────

export const userRelations = relations(user, ({ one, many }) => ({
  household: one(households, { fields: [user.householdId], references: [households.id] }),
  sessions: many(session),
  accounts: many(account),
  suggestions: many(suggestions),
  votes: many(votes),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const householdRelations = relations(households, ({ many }) => ({
  members: many(user),
  weeks: many(weeks),
  rsvps: many(rsvps),
  invites: many(invites),
}));

export const weekRelations = relations(weeks, ({ one, many }) => ({
  household: one(households, { fields: [weeks.householdId], references: [households.id] }),
  mealPlanEntries: many(mealPlanEntries),
  rsvps: many(rsvps),
}));

export const mealPlanEntryRelations = relations(mealPlanEntries, ({ one }) => ({
  week: one(weeks, { fields: [mealPlanEntries.weekId], references: [weeks.id] }),
}));

export const suggestionRelations = relations(suggestions, ({ one, many }) => ({
  author: one(user, { fields: [suggestions.authorId], references: [user.id] }),
  votes: many(votes),
}));

export const voteRelations = relations(votes, ({ one }) => ({
  suggestion: one(suggestions, { fields: [votes.suggestionId], references: [suggestions.id] }),
  member: one(user, { fields: [votes.memberId], references: [user.id] }),
}));

export const rsvpRelations = relations(rsvps, ({ one }) => ({
  week: one(weeks, { fields: [rsvps.weekId], references: [weeks.id] }),
  household: one(households, { fields: [rsvps.householdId], references: [households.id] }),
}));

export const inviteRelations = relations(invites, ({ one }) => ({
  household: one(households, { fields: [invites.householdId], references: [households.id] }),
}));
