'use server';

import { db } from '@/lib/db';
import { households, user } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth-utils';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createHousehold(data: { name: string }) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  const name = data.name.trim();
  if (!name) return { success: false as const, error: 'Name is required' };

  const result = await db.insert(households).values({ name }).returning() as (typeof households.$inferSelect)[];
  const household = result[0];

  revalidatePath('/admin/households');
  return { success: true as const, data: household };
}

export async function setHouseholdHead(householdId: string, userId: string | null) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  if (userId) {
    // Verify user belongs to this household
    const [member] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!member) {
      return { success: false as const, error: 'User not found' };
    }
  }

  await db
    .update(households)
    .set({ headId: userId, updatedAt: new Date() })
    .where(eq(households.id, householdId));

  revalidatePath('/admin/households');
  revalidatePath(`/admin/households/${householdId}`);
  revalidatePath('/household');
  return { success: true as const, data: null };
}

export async function renameHousehold(householdId: string, name: string) {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  const trimmed = name.trim();
  if (!trimmed) return { success: false as const, error: 'Name is required' };

  await db
    .update(households)
    .set({ name: trimmed, updatedAt: new Date() })
    .where(eq(households.id, householdId));

  revalidatePath('/admin/households');
  revalidatePath(`/admin/households/${householdId}`);
  revalidatePath('/household');
  revalidatePath('/schedule');
  return { success: true as const, data: null };
}

export interface HouseholdListItem {
  id: string;
  name: string;
  members: { id: string; name: string }[];
}

export async function getHouseholds(): Promise<HouseholdListItem[]> {
  return db.query.households.findMany({
    with: { members: { columns: { id: true, name: true } } },
    orderBy: (h, { asc }) => [asc(h.name)],
  }) as unknown as Promise<HouseholdListItem[]>;
}

export interface ExtraPersonItem {
  id: string;
  name: string;
  portions: number;
}

export interface HouseholdDetail {
  id: string;
  name: string;
  headId: string | null;
  head: { id: string; name: string; email: string } | null;
  members: { id: string; name: string; email: string; role: string; portionsPerMeal: number }[];
  extraPeople: ExtraPersonItem[];
  invites: { id: string; email: string; role: string; token: string; expiresAt: Date; usedAt: Date | null; createdAt: Date }[];
}

export async function getHousehold(id: string): Promise<HouseholdDetail | undefined> {
  return db.query.households.findFirst({
    where: eq(households.id, id),
    with: {
      head: { columns: { id: true, name: true, email: true } },
      members: { columns: { id: true, name: true, email: true, role: true, portionsPerMeal: true } },
      extraPeople: { columns: { id: true, name: true, portions: true } },
      invites: {
        columns: { id: true, email: true, role: true, token: true, expiresAt: true, usedAt: true, createdAt: true },
      },
    },
  }) as unknown as Promise<HouseholdDetail | undefined>;
}

