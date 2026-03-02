'use server';

import { db } from '@/lib/db';
import { user, weekOptOuts } from '@/lib/db/schema';
import { requireSession } from '@/lib/auth-utils';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updateDietaryProfile(data: {
  allergies: string[];
  dietaryPreferences: string[];
  dietaryNotes: string;
}) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  await db
    .update(user)
    .set({
      allergies: data.allergies.length > 0 ? data.allergies : null,
      dietaryPreferences: data.dietaryPreferences.length > 0 ? data.dietaryPreferences : null,
      dietaryNotes: data.dietaryNotes.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(user.id, auth.data.user.id));

  revalidatePath('/profile');
  return { success: true as const, data: null };
}

export async function optOutOfWeek(weekId: string) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  await db
    .insert(weekOptOuts)
    .values({ userId: auth.data.user.id, weekId })
    .onConflictDoNothing();

  revalidatePath('/');
  return { success: true as const, data: null };
}

export async function optBackIn(weekId: string) {
  const auth = await requireSession();
  if (!auth.success) return auth;

  await db
    .delete(weekOptOuts)
    .where(
      and(
        eq(weekOptOuts.userId, auth.data.user.id),
        eq(weekOptOuts.weekId, weekId),
      ),
    );

  revalidatePath('/');
  return { success: true as const, data: null };
}

export async function getDietarySummary() {
  const users = await db
    .select({
      name: user.name,
      allergies: user.allergies,
      dietaryPreferences: user.dietaryPreferences,
      dietaryNotes: user.dietaryNotes,
    })
    .from(user);

  const allAllergies = new Map<string, string[]>();
  const allPreferences = new Map<string, string[]>();
  const notes: { name: string; notes: string }[] = [];

  for (const u of users) {
    if (u.allergies) {
      for (const allergy of u.allergies) {
        const names = allAllergies.get(allergy) ?? [];
        names.push(u.name);
        allAllergies.set(allergy, names);
      }
    }
    if (u.dietaryPreferences) {
      for (const pref of u.dietaryPreferences) {
        const names = allPreferences.get(pref) ?? [];
        names.push(u.name);
        allPreferences.set(pref, names);
      }
    }
    if (u.dietaryNotes) {
      notes.push({ name: u.name, notes: u.dietaryNotes });
    }
  }

  return {
    allergies: Object.fromEntries(allAllergies),
    preferences: Object.fromEntries(allPreferences),
    notes,
  };
}
