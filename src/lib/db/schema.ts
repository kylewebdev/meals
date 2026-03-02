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

// ─── Auth tables (Better Auth managed) ──────────────────────────

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  householdId: text('household_id').references(() => households.id),
  role: userRoleEnum('role').notNull().default('member'),
  allergies: text('allergies').array(),
  dietaryPreferences: text('dietary_preferences').array(),
  dietaryNotes: text('dietary_notes'),
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
  headId: text('head_id'), // FK to user.id — circular ref handled via relations
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
    name: varchar('name', { length: 255 }),
    description: text('description'),
    recipeId: text('recipe_id').references(() => recipes.id),
    isModified: boolean('is_modified').notNull().default(false),
    modificationNotes: text('modification_notes'),
    modifiedCalories: integer('modified_calories'),
    modifiedProteinG: integer('modified_protein_g'),
    modifiedCarbsG: integer('modified_carbs_g'),
    modifiedFatG: integer('modified_fat_g'),
  },
  (table) => [index('meal_plan_entries_week_id_idx').on(table.weekId)],
);

export const recipes = pgTable(
  'recipes',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    instructions: text('instructions'),
    servings: integer('servings'),
    prepTimeMinutes: integer('prep_time_minutes'),
    cookTimeMinutes: integer('cook_time_minutes'),
    calories: integer('calories'),
    proteinG: integer('protein_g'),
    carbsG: integer('carbs_g'),
    fatG: integer('fat_g'),
    tags: text('tags').array(),
    createdBy: text('created_by')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('recipes_created_by_idx').on(table.createdBy)],
);

export const recipeIngredients = pgTable(
  'recipe_ingredients',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    recipeId: text('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    quantity: varchar('quantity', { length: 50 }),
    unit: varchar('unit', { length: 50 }),
    calories: integer('calories'),
    proteinG: integer('protein_g'),
    carbsG: integer('carbs_g'),
    fatG: integer('fat_g'),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [index('recipe_ingredients_recipe_id_idx').on(table.recipeId)],
);

export const notificationTypeEnum = pgEnum('notification_type', [
  'cooking_reminder',
  'meal_plan_posted',
  'new_recipe',
]);

export const notifications = pgTable(
  'notifications',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: notificationTypeEnum('type').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    body: text('body'),
    linkUrl: text('link_url'),
    readAt: timestamp('read_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('notifications_user_id_idx').on(table.userId),
    index('notifications_user_unread_idx').on(table.userId, table.readAt),
  ],
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
  invitedBy: text('invited_by').references(() => user.id),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Relations ──────────────────────────────────────────────────

export const userRelations = relations(user, ({ one, many }) => ({
  household: one(households, { fields: [user.householdId], references: [households.id] }),
  sessions: many(session),
  accounts: many(account),
  recipes: many(recipes),
  notifications: many(notifications),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const householdRelations = relations(households, ({ one, many }) => ({
  head: one(user, { fields: [households.headId], references: [user.id] }),
  members: many(user),
  weeks: many(weeks),
  invites: many(invites),
}));

export const weekRelations = relations(weeks, ({ one, many }) => ({
  household: one(households, { fields: [weeks.householdId], references: [households.id] }),
  mealPlanEntries: many(mealPlanEntries),
}));

export const mealPlanEntryRelations = relations(mealPlanEntries, ({ one }) => ({
  week: one(weeks, { fields: [mealPlanEntries.weekId], references: [weeks.id] }),
  recipe: one(recipes, { fields: [mealPlanEntries.recipeId], references: [recipes.id] }),
}));

export const recipeRelations = relations(recipes, ({ one, many }) => ({
  creator: one(user, { fields: [recipes.createdBy], references: [user.id] }),
  ingredients: many(recipeIngredients),
  mealPlanEntries: many(mealPlanEntries),
}));

export const recipeIngredientRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, { fields: [recipeIngredients.recipeId], references: [recipes.id] }),
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(user, { fields: [notifications.userId], references: [user.id] }),
}));

export const inviteRelations = relations(invites, ({ one }) => ({
  household: one(households, { fields: [invites.householdId], references: [households.id] }),
  inviter: one(user, { fields: [invites.invitedBy], references: [user.id] }),
}));
