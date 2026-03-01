import { auth } from '../auth';
import { db } from './index';
import { households, user } from './schema';
import { eq } from 'drizzle-orm';

async function seed() {
  const adminEmail = 'kylewebdev@gmail.com';
  const adminName = 'Kyle';
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('Set ADMIN_PASSWORD environment variable before running seed.');
    process.exit(1);
  }

  // Check if admin already exists
  const [existing] = await db.select().from(user).where(eq(user.email, adminEmail));
  if (existing) {
    console.log('Admin account already exists, skipping user creation.');
    // Ensure they have admin role
    if (existing.role !== 'admin') {
      await db.update(user).set({ role: 'admin' }).where(eq(user.id, existing.id));
      console.log('Promoted existing user to admin.');
    }
    process.exit(0);
  }

  // Create a default household for the admin
  const [household] = await db
    .insert(households)
    .values({ name: 'Admin Household' })
    .returning();

  console.log(`Created household: ${household.name} (${household.id})`);

  // Create admin user via Better Auth's server API (handles password hashing)
  const ctx = await auth.api.signUpEmail({
    body: {
      email: adminEmail,
      name: adminName,
      password: adminPassword,
    },
  });

  if (!ctx.user) {
    console.error('Failed to create admin user');
    process.exit(1);
  }

  // Promote to admin and assign household
  await db
    .update(user)
    .set({ role: 'admin', householdId: household.id })
    .where(eq(user.id, ctx.user.id));

  console.log(`Created admin: ${adminName} <${adminEmail}>`);
  console.log('Seed complete. You can now log in at /login.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
