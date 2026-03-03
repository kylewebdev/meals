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
export const swapModeEnum = pgEnum('swap_mode', ['single', 'dual']);
export const recipeStatusEnum = pgEnum('recipe_status', ['pending', 'approved', 'rejected']);
export const householdOrderModeEnum = pgEnum('household_order_mode', ['fixed', 'random']);
export const recipeRatingValueEnum = pgEnum('recipe_rating_value', ['love', 'fine', 'dislike']);

// ─── Auth tables (Better Auth managed) ──────────────────────────

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  householdId: text('household_id').references(() => households.id),
  role: userRoleEnum('role').notNull().default('member'),
  portionsPerMeal: integer('portions_per_meal').notNull().default(1),
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
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const extraPeople = pgTable(
  'extra_people',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    householdId: text('household_id')
      .notNull()
      .references(() => households.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    portions: integer('portions').notNull().default(1),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('extra_people_household_id_idx').on(table.householdId)],
);

export const weeks = pgTable(
  'weeks',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    startDate: timestamp('start_date', { mode: 'date' }).notNull().unique(),
    status: weekStatusEnum('status').notNull().default('upcoming'),
    swapMode: swapModeEnum('swap_mode').notNull().default('single'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
);

export const swapDays = pgTable(
  'swap_days',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    weekId: text('week_id')
      .notNull()
      .references(() => weeks.id, { onDelete: 'cascade' }),
    dayOfWeek: integer('day_of_week').notNull(),
    label: varchar('label', { length: 50 }).notNull(),
    coversFrom: integer('covers_from').notNull(),
    coversTo: integer('covers_to').notNull(),
    location: text('location'),
    time: text('time'),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    unique('swap_days_week_day_uniq').on(table.weekId, table.dayOfWeek),
    index('swap_days_week_id_idx').on(table.weekId),
  ],
);

export const contributions = pgTable(
  'contributions',
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
    swapDayId: text('swap_day_id')
      .notNull()
      .references(() => swapDays.id, { onDelete: 'cascade' }),
    recipeId: text('recipe_id').references(() => recipes.id),
    dishName: varchar('dish_name', { length: 255 }),
    notes: text('notes'),
    servings: integer('servings'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    unique('contributions_week_household_swap_uniq').on(
      table.weekId,
      table.householdId,
      table.swapDayId,
    ),
    index('contributions_week_id_idx').on(table.weekId),
    index('contributions_household_id_idx').on(table.householdId),
  ],
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
    tags: text('tags').array(),
    imageUrl: text('image_url'),
    status: recipeStatusEnum('status').notNull().default('pending'),
    createdBy: text('created_by')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('recipes_created_by_idx').on(table.createdBy),
    index('recipes_status_idx').on(table.status),
  ],
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

export const recipeRatings = pgTable(
  'recipe_ratings',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    recipeId: text('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    householdId: text('household_id')
      .notNull()
      .references(() => households.id, { onDelete: 'cascade' }),
    rating: recipeRatingValueEnum('rating').notNull(),
    comment: text('comment'),
    ratedBy: text('rated_by')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    unique('recipe_ratings_recipe_household_uniq').on(table.recipeId, table.householdId),
    index('recipe_ratings_recipe_id_idx').on(table.recipeId),
    index('recipe_ratings_household_id_idx').on(table.householdId),
  ],
);

export const notificationTypeEnum = pgEnum('notification_type', [
  'new_recipe',
  'opt_out_reset',
  'recipe_reviewed',
  'member_joined',
  'swap_reminder',
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

export const swapSettings = pgTable('swap_settings', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  startDate: timestamp('start_date', { mode: 'date' }).notNull(),
  swapMode: swapModeEnum('swap_mode').notNull().default('single'),
  recipeOrder: text('recipe_order').array().notNull().default(sql`'{}'::text[]`),
  householdOrder: text('household_order').array().notNull().default(sql`'{}'::text[]`),
  householdOrderMode: householdOrderModeEnum('household_order_mode').notNull().default('fixed'),
  defaultLocation: text('default_location'),
  defaultTime: text('default_time'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const groceryLists = pgTable(
  'grocery_lists',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    contributionId: text('contribution_id')
      .notNull()
      .references(() => contributions.id, { onDelete: 'cascade' })
      .unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [index('grocery_lists_contribution_id_idx').on(table.contributionId)],
);

export const groceryItems = pgTable(
  'grocery_items',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    listId: text('list_id')
      .notNull()
      .references(() => groceryLists.id, { onDelete: 'cascade' }),
    ingredientName: varchar('ingredient_name', { length: 255 }).notNull(),
    quantity: varchar('quantity', { length: 50 }),
    unit: varchar('unit', { length: 50 }),
    checked: boolean('checked').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [index('grocery_items_list_id_idx').on(table.listId)],
);

// ─── Relations ──────────────────────────────────────────────────

export const userRelations = relations(user, ({ one, many }) => ({
  household: one(households, { fields: [user.householdId], references: [households.id] }),
  sessions: many(session),
  accounts: many(account),
  recipes: many(recipes),
  ratings: many(recipeRatings),
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
  extraPeople: many(extraPeople),
  contributions: many(contributions),
  ratings: many(recipeRatings),
  invites: many(invites),
}));

export const extraPeopleRelations = relations(extraPeople, ({ one }) => ({
  household: one(households, { fields: [extraPeople.householdId], references: [households.id] }),
}));

export const weekRelations = relations(weeks, ({ many }) => ({
  swapDays: many(swapDays),
  contributions: many(contributions),
}));

export const swapDayRelations = relations(swapDays, ({ one, many }) => ({
  week: one(weeks, { fields: [swapDays.weekId], references: [weeks.id] }),
  contributions: many(contributions),
}));

export const contributionRelations = relations(contributions, ({ one }) => ({
  week: one(weeks, { fields: [contributions.weekId], references: [weeks.id] }),
  household: one(households, {
    fields: [contributions.householdId],
    references: [households.id],
  }),
  swapDay: one(swapDays, { fields: [contributions.swapDayId], references: [swapDays.id] }),
  recipe: one(recipes, { fields: [contributions.recipeId], references: [recipes.id] }),
  groceryList: one(groceryLists, { fields: [contributions.id], references: [groceryLists.contributionId] }),
}));

export const recipeRelations = relations(recipes, ({ one, many }) => ({
  creator: one(user, { fields: [recipes.createdBy], references: [user.id] }),
  ingredients: many(recipeIngredients),
  contributions: many(contributions),
  ratings: many(recipeRatings),
}));

export const recipeIngredientRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, { fields: [recipeIngredients.recipeId], references: [recipes.id] }),
}));

export const recipeRatingRelations = relations(recipeRatings, ({ one }) => ({
  recipe: one(recipes, { fields: [recipeRatings.recipeId], references: [recipes.id] }),
  household: one(households, { fields: [recipeRatings.householdId], references: [households.id] }),
  rater: one(user, { fields: [recipeRatings.ratedBy], references: [user.id] }),
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(user, { fields: [notifications.userId], references: [user.id] }),
}));

export const inviteRelations = relations(invites, ({ one }) => ({
  household: one(households, { fields: [invites.householdId], references: [households.id] }),
  inviter: one(user, { fields: [invites.invitedBy], references: [user.id] }),
}));

export const groceryListRelations = relations(groceryLists, ({ one, many }) => ({
  contribution: one(contributions, {
    fields: [groceryLists.contributionId],
    references: [contributions.id],
  }),
  items: many(groceryItems),
}));

export const groceryItemRelations = relations(groceryItems, ({ one }) => ({
  list: one(groceryLists, { fields: [groceryItems.listId], references: [groceryLists.id] }),
}));

