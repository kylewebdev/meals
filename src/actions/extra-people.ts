'use server';

import { db } from '@/lib/db';
import { extraPeople, households } from '@/lib/db/schema';
import { requireHouseholdHead } from '@/lib/auth-utils';
import { isValidPortions } from '@/lib/validators';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function addExtraPerson(householdId: string, name: string, portions: number) {
  const auth = await requireHouseholdHead(householdId);
  if (!auth.success) return auth;

  const trimmed = name.trim();
  if (!trimmed) return { success: false as const, error: 'Name is required' };
  if (!isValidPortions(portions)) {
    return { success: false as const, error: 'Portions must be between 0 and 3' };
  }

  const result = await db
    .insert(extraPeople)
    .values({ householdId, name: trimmed, portions })
    .returning() as (typeof extraPeople.$inferSelect)[];

  revalidatePath('/co-op');
  revalidatePath('/up-next');
  return { success: true as const, data: result[0] };
}

export async function updateExtraPerson(
  id: string,
  data: { name?: string; portions?: number },
) {
  // Look up the person to find their household
  const [person] = await db
    .select({ householdId: extraPeople.householdId })
    .from(extraPeople)
    .where(eq(extraPeople.id, id))
    .limit(1);

  if (!person) return { success: false as const, error: 'Person not found' };

  const auth = await requireHouseholdHead(person.householdId);
  if (!auth.success) return auth;

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (data.name !== undefined) {
    const trimmed = data.name.trim();
    if (!trimmed) return { success: false as const, error: 'Name is required' };
    updates.name = trimmed;
  }

  if (data.portions !== undefined) {
    if (!isValidPortions(data.portions)) {
      return { success: false as const, error: 'Portions must be between 0 and 3' };
    }
    updates.portions = data.portions;
  }

  await db.update(extraPeople).set(updates).where(eq(extraPeople.id, id));

  revalidatePath('/co-op');
  revalidatePath('/up-next');
  return { success: true as const, data: null };
}

export async function removeExtraPerson(id: string) {
  const [person] = await db
    .select({ householdId: extraPeople.householdId })
    .from(extraPeople)
    .where(eq(extraPeople.id, id))
    .limit(1);

  if (!person) return { success: false as const, error: 'Person not found' };

  const auth = await requireHouseholdHead(person.householdId);
  if (!auth.success) return auth;

  await db.delete(extraPeople).where(eq(extraPeople.id, id));

  revalidatePath('/co-op');
  revalidatePath('/up-next');
  return { success: true as const, data: null };
}
