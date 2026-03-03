import { db } from './index';
import { recipes, recipeIngredients, user } from './schema';
import { eq, inArray } from 'drizzle-orm';

// ─── Recipe seed data ──────────────────────────────────────────

type RecipeSeed = {
  name: string;
  description: string;
  instructions: string;
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  tags: string[];
  imageUrl: string | null;
  ingredients: {
    name: string;
    quantity: string;
    unit: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    sortOrder: number;
  }[];
};

// ── All nutritional values are PER ONE SERVING of the recipe ──

const RECIPES: RecipeSeed[] = [
  {
    name: 'Chicken Alfredo Pasta',
    description: 'Fettuccine, grilled chicken, butter-parm cream sauce. Reheats great with a splash of water.',
    imageUrl: '/meals/Chicken Alfredo Pasta.png',
    instructions:
      '1. Cook fettuccine to al dente, reserve 1 cup pasta water, drain.\n2. Season chicken breasts with salt, pepper, and garlic powder. Grill or pan-sear 6-7 min per side until done. Let rest, then slice.\n3. Melt butter in a large skillet over medium heat. Add minced garlic, cook 30 sec.\n4. Pour in heavy cream, bring to a gentle simmer.\n5. Stir in parmesan until melted and smooth. Season with salt and pepper.\n6. Toss fettuccine in the sauce, adding pasta water as needed for consistency.\n7. Top with sliced chicken and extra parmesan.',
    servings: 6,
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    tags: ['chicken', 'pasta', 'meal-prep'],
    ingredients: [
      { name: 'fettuccine', quantity: '1', unit: 'lb', calories: 280, proteinG: 9, carbsG: 56, fatG: 1, sortOrder: 0 },
      { name: 'boneless skinless chicken breasts', quantity: '2', unit: 'lbs', calories: 160, proteinG: 33, carbsG: 0, fatG: 4, sortOrder: 1 },
      { name: 'butter', quantity: '4', unit: 'tbsp', calories: 67, proteinG: 0, carbsG: 0, fatG: 7, sortOrder: 2 },
      { name: 'heavy cream', quantity: '2', unit: 'cups', calories: 273, proteinG: 2, carbsG: 2, fatG: 29, sortOrder: 3 },
      { name: 'grated parmesan', quantity: '1.5', unit: 'cups', calories: 107, proteinG: 9, carbsG: 1, fatG: 7, sortOrder: 4 },
      { name: 'garlic cloves (minced)', quantity: '4', unit: 'whole', calories: 3, proteinG: 0, carbsG: 1, fatG: 0, sortOrder: 5 },
      { name: 'salt', quantity: '1', unit: 'tsp', calories: 0, proteinG: 0, carbsG: 0, fatG: 0, sortOrder: 6 },
      { name: 'black pepper', quantity: '0.5', unit: 'tsp', calories: 0, proteinG: 0, carbsG: 0, fatG: 0, sortOrder: 7 },
    ],
  },
  {
    name: 'BBQ Chicken Rice Bowls',
    description: 'Shredded chicken in BBQ sauce over rice with cheddar and corn.',
    imageUrl: '/meals/BBQ Chicken Rice Bowls.png',
    instructions:
      '1. Cook rice according to package directions.\n2. Place chicken breasts in a pot, cover with water, bring to a boil, reduce heat and simmer 15 min until cooked through.\n3. Shred chicken with two forks.\n4. Toss shredded chicken with BBQ sauce.\n5. Warm corn in the microwave or a skillet.\n6. Divide rice into containers, top with BBQ chicken, corn, and shredded cheddar.',
    servings: 6,
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    tags: ['chicken', 'meal-prep', 'bowls'],
    ingredients: [
      { name: 'boneless skinless chicken breasts', quantity: '2.5', unit: 'lbs', calories: 200, proteinG: 42, carbsG: 0, fatG: 5, sortOrder: 0 },
      { name: 'long grain rice', quantity: '3', unit: 'cups', calories: 300, proteinG: 6, carbsG: 66, fatG: 1, sortOrder: 1 },
      { name: 'BBQ sauce', quantity: '1.5', unit: 'cups', calories: 70, proteinG: 0, carbsG: 16, fatG: 0, sortOrder: 2 },
      { name: 'shredded cheddar cheese', quantity: '1.5', unit: 'cups', calories: 113, proteinG: 7, carbsG: 0, fatG: 9, sortOrder: 3 },
      { name: 'corn kernels', quantity: '2', unit: 'cups', calories: 43, proteinG: 1, carbsG: 10, fatG: 1, sortOrder: 4 },
    ],
  },
  {
    name: 'Chicken Teriyaki Rice Bowls',
    description: 'Chicken thighs in a soy-brown sugar glaze with rice and steamed broccoli.',
    imageUrl: '/meals/Chicken Teriyaki Rice Bowls.png',
    instructions:
      '1. Cook rice.\n2. Mix teriyaki sauce: soy sauce, brown sugar, rice vinegar, minced garlic, grated ginger, and cornstarch slurry (1 tbsp cornstarch + 2 tbsp water).\n3. Season chicken thighs with salt and pepper. Pan-sear in a hot skillet 6-7 min per side until cooked through.\n4. Pour teriyaki sauce over chicken in the pan, simmer 2 min until thickened and glossy.\n5. Steam broccoli florets 4-5 min until tender-crisp.\n6. Slice chicken and divide into containers with rice and broccoli.',
    servings: 6,
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    tags: ['chicken', 'meal-prep', 'bowls', 'teriyaki'],
    ingredients: [
      { name: 'boneless skinless chicken thighs', quantity: '2.5', unit: 'lbs', calories: 200, proteinG: 30, carbsG: 0, fatG: 9, sortOrder: 0 },
      { name: 'long grain rice', quantity: '3', unit: 'cups', calories: 300, proteinG: 6, carbsG: 66, fatG: 1, sortOrder: 1 },
      { name: 'broccoli florets', quantity: '6', unit: 'cups', calories: 34, proteinG: 3, carbsG: 7, fatG: 0, sortOrder: 2 },
      { name: 'soy sauce', quantity: '0.33', unit: 'cup', calories: 5, proteinG: 1, carbsG: 1, fatG: 0, sortOrder: 3 },
      { name: 'brown sugar', quantity: '0.25', unit: 'cup', calories: 35, proteinG: 0, carbsG: 9, fatG: 0, sortOrder: 4 },
      { name: 'rice vinegar', quantity: '2', unit: 'tbsp', calories: 1, proteinG: 0, carbsG: 0, fatG: 0, sortOrder: 5 },
      { name: 'garlic cloves (minced)', quantity: '3', unit: 'whole', calories: 2, proteinG: 0, carbsG: 1, fatG: 0, sortOrder: 6 },
      { name: 'fresh ginger (grated)', quantity: '1', unit: 'tbsp', calories: 1, proteinG: 0, carbsG: 0, fatG: 0, sortOrder: 7 },
      { name: 'cornstarch', quantity: '1', unit: 'tbsp', calories: 5, proteinG: 0, carbsG: 1, fatG: 0, sortOrder: 8 },
    ],
  },
  {
    name: 'Beef & Broccoli with Rice',
    description: 'Sliced steak in a simple soy-garlic sauce over white rice.',
    imageUrl: '/meals/Beef & Broccoli with Rice.png',
    instructions:
      '1. Cook rice.\n2. Slice steak thinly against the grain.\n3. Toss steak slices with soy sauce, sesame oil, and cornstarch. Let sit 10 min.\n4. Heat oil in a wok or large skillet over high heat. Sear beef in batches, 1-2 min per side. Set aside.\n5. Stir fry broccoli with garlic 3-4 min until tender-crisp.\n6. Return beef, add sauce (soy sauce, oyster sauce, brown sugar, water). Toss until thickened.\n7. Serve over rice.',
    servings: 6,
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    tags: ['beef', 'meal-prep', 'stir-fry'],
    ingredients: [
      { name: 'flank steak', quantity: '2', unit: 'lbs', calories: 240, proteinG: 32, carbsG: 0, fatG: 11, sortOrder: 0 },
      { name: 'broccoli florets', quantity: '6', unit: 'cups', calories: 34, proteinG: 3, carbsG: 7, fatG: 0, sortOrder: 1 },
      { name: 'long grain rice', quantity: '3', unit: 'cups', calories: 300, proteinG: 6, carbsG: 66, fatG: 1, sortOrder: 2 },
      { name: 'soy sauce', quantity: '0.33', unit: 'cup', calories: 5, proteinG: 1, carbsG: 1, fatG: 0, sortOrder: 3 },
      { name: 'oyster sauce', quantity: '2', unit: 'tbsp', calories: 3, proteinG: 0, carbsG: 1, fatG: 0, sortOrder: 4 },
      { name: 'sesame oil', quantity: '1', unit: 'tbsp', calories: 20, proteinG: 0, carbsG: 0, fatG: 2, sortOrder: 5 },
      { name: 'cornstarch', quantity: '2', unit: 'tbsp', calories: 10, proteinG: 0, carbsG: 2, fatG: 0, sortOrder: 6 },
      { name: 'garlic cloves (minced)', quantity: '4', unit: 'whole', calories: 3, proteinG: 0, carbsG: 1, fatG: 0, sortOrder: 7 },
      { name: 'brown sugar', quantity: '1', unit: 'tbsp', calories: 9, proteinG: 0, carbsG: 2, fatG: 0, sortOrder: 8 },
      { name: 'vegetable oil', quantity: '2', unit: 'tbsp', calories: 40, proteinG: 0, carbsG: 0, fatG: 5, sortOrder: 9 },
    ],
  },
  {
    name: 'Spaghetti & Meatballs',
    description: 'Classic marinara, beef meatballs, spaghetti. A meal prep staple.',
    imageUrl: '/meals/Spaghetti & Meatballs.png',
    instructions:
      '1. Preheat oven to 400°F.\n2. Mix ground beef with breadcrumbs, egg, parmesan, garlic, Italian seasoning, salt, and pepper. Roll into golf-ball sized meatballs.\n3. Place on a lined sheet pan. Bake 18-20 min until cooked through.\n4. Cook spaghetti to al dente.\n5. Warm marinara sauce in a large pot, add baked meatballs, simmer together 5 min.\n6. Toss spaghetti with sauce and meatballs. Top with extra parmesan.',
    servings: 6,
    prepTimeMinutes: 15,
    cookTimeMinutes: 25,
    tags: ['beef', 'pasta', 'meal-prep'],
    ingredients: [
      { name: 'ground beef (80/20)', quantity: '2', unit: 'lbs', calories: 347, proteinG: 27, carbsG: 0, fatG: 27, sortOrder: 0 },
      { name: 'spaghetti', quantity: '1', unit: 'lb', calories: 280, proteinG: 9, carbsG: 56, fatG: 1, sortOrder: 1 },
      { name: 'marinara sauce', quantity: '32', unit: 'oz', calories: 47, proteinG: 1, carbsG: 7, fatG: 1, sortOrder: 2 },
      { name: 'breadcrumbs', quantity: '0.5', unit: 'cup', calories: 37, proteinG: 1, carbsG: 7, fatG: 1, sortOrder: 3 },
      { name: 'egg', quantity: '1', unit: 'whole', calories: 12, proteinG: 1, carbsG: 0, fatG: 1, sortOrder: 4 },
      { name: 'grated parmesan', quantity: '0.5', unit: 'cup', calories: 36, proteinG: 3, carbsG: 0, fatG: 2, sortOrder: 5 },
      { name: 'garlic cloves (minced)', quantity: '3', unit: 'whole', calories: 2, proteinG: 0, carbsG: 1, fatG: 0, sortOrder: 6 },
      { name: 'Italian seasoning', quantity: '1', unit: 'tbsp', calories: 1, proteinG: 0, carbsG: 0, fatG: 0, sortOrder: 7 },
      { name: 'salt', quantity: '1', unit: 'tsp', calories: 0, proteinG: 0, carbsG: 0, fatG: 0, sortOrder: 8 },
    ],
  },
  {
    name: 'Pulled Pork Rice Bowls',
    description: 'Slow cooker BBQ pulled pork over rice with cheese and baked beans on the side.',
    imageUrl: '/meals/Pulled Pork Rice Bowls.png',
    instructions:
      '1. Rub pork shoulder with salt, pepper, garlic powder, onion powder, and smoked paprika.\n2. Place in slow cooker, pour half the BBQ sauce over top. Cook on low 8 hours or high 4 hours.\n3. Shred pork with two forks, stir in remaining BBQ sauce.\n4. Cook rice.\n5. Warm baked beans.\n6. Divide rice into containers, top with pulled pork and cheddar. Serve beans on the side.',
    servings: 8,
    prepTimeMinutes: 10,
    cookTimeMinutes: 480,
    tags: ['pork', 'meal-prep', 'slow-cooker', 'bowls'],
    ingredients: [
      { name: 'pork shoulder/butt', quantity: '4', unit: 'lbs', calories: 350, proteinG: 32, carbsG: 0, fatG: 24, sortOrder: 0 },
      { name: 'BBQ sauce', quantity: '2', unit: 'cups', calories: 70, proteinG: 0, carbsG: 16, fatG: 0, sortOrder: 1 },
      { name: 'long grain rice', quantity: '4', unit: 'cups', calories: 300, proteinG: 6, carbsG: 66, fatG: 1, sortOrder: 2 },
      { name: 'shredded cheddar cheese', quantity: '2', unit: 'cups', calories: 114, proteinG: 7, carbsG: 1, fatG: 9, sortOrder: 3 },
      { name: 'baked beans', quantity: '28', unit: 'oz', calories: 105, proteinG: 5, carbsG: 19, fatG: 1, sortOrder: 4 },
      { name: 'smoked paprika', quantity: '1', unit: 'tbsp', calories: 3, proteinG: 0, carbsG: 1, fatG: 0, sortOrder: 5 },
      { name: 'garlic powder', quantity: '1', unit: 'tsp', calories: 1, proteinG: 0, carbsG: 0, fatG: 0, sortOrder: 6 },
      { name: 'onion powder', quantity: '1', unit: 'tsp', calories: 1, proteinG: 0, carbsG: 0, fatG: 0, sortOrder: 7 },
    ],
  },
  {
    name: 'Chicken Fried Rice',
    description: 'Chicken, egg, rice, soy sauce, butter, optional peas and carrots.',
    imageUrl: '/meals/Chicken Fried Rice.png',
    instructions:
      '1. Use day-old rice (or cook rice and spread on a sheet pan to cool 20 min).\n2. Season diced chicken with salt, pepper, and garlic powder. Cook in butter in a hot skillet until done, about 5-6 min. Set aside.\n3. Scramble eggs in the same skillet. Set aside.\n4. Add more butter to the skillet, stir fry peas and carrots 2 min.\n5. Add rice, soy sauce, and sesame oil. Toss on high heat 3-4 min.\n6. Fold in chicken and scrambled eggs.\n7. Top with green onions.',
    servings: 6,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    tags: ['chicken', 'meal-prep', 'rice'],
    ingredients: [
      { name: 'boneless skinless chicken breasts', quantity: '1.5', unit: 'lbs', calories: 120, proteinG: 25, carbsG: 0, fatG: 3, sortOrder: 0 },
      { name: 'cooked rice (day-old)', quantity: '8', unit: 'cups', calories: 267, proteinG: 5, carbsG: 59, fatG: 1, sortOrder: 1 },
      { name: 'eggs', quantity: '4', unit: 'whole', calories: 47, proteinG: 4, carbsG: 0, fatG: 3, sortOrder: 2 },
      { name: 'butter', quantity: '4', unit: 'tbsp', calories: 67, proteinG: 0, carbsG: 0, fatG: 7, sortOrder: 3 },
      { name: 'soy sauce', quantity: '0.25', unit: 'cup', calories: 4, proteinG: 1, carbsG: 0, fatG: 0, sortOrder: 4 },
      { name: 'sesame oil', quantity: '1', unit: 'tbsp', calories: 20, proteinG: 0, carbsG: 0, fatG: 2, sortOrder: 5 },
      { name: 'frozen peas and carrots', quantity: '2', unit: 'cups', calories: 27, proteinG: 1, carbsG: 5, fatG: 0, sortOrder: 6 },
      { name: 'green onions (sliced)', quantity: '4', unit: 'whole', calories: 3, proteinG: 0, carbsG: 1, fatG: 0, sortOrder: 7 },
      { name: 'garlic powder', quantity: '1', unit: 'tsp', calories: 2, proteinG: 0, carbsG: 0, fatG: 0, sortOrder: 8 },
    ],
  },
  {
    name: 'Baked Mac & Cheese with Bacon or Chicken',
    description: 'Creamy from-scratch mac with your choice of protein mixed in.',
    imageUrl: '/meals/Baked Mac & Cheese with Bacon.png',
    instructions:
      '1. Preheat oven to 375°F.\n2. Cook elbow macaroni to al dente, drain.\n3. Cook bacon until crispy (or dice and cook chicken breast). Chop or crumble.\n4. Melt butter in a large pot, whisk in flour to make a roux. Cook 1 min.\n5. Gradually whisk in milk. Cook until thickened, about 5 min.\n6. Remove from heat, stir in shredded cheddar and half the mozzarella until smooth. Season with salt, pepper, mustard powder.\n7. Fold in pasta and protein.\n8. Pour into a baking dish, top with remaining mozzarella and breadcrumbs.\n9. Bake 20-25 min until golden and bubbly.',
    servings: 6,
    prepTimeMinutes: 15,
    cookTimeMinutes: 35,
    tags: ['pasta', 'meal-prep', 'baked', 'comfort-food'],
    ingredients: [
      { name: 'elbow macaroni', quantity: '1', unit: 'lb', calories: 210, proteinG: 7, carbsG: 42, fatG: 1, sortOrder: 0 },
      { name: 'bacon or chicken breast', quantity: '1', unit: 'lb', calories: 100, proteinG: 10, carbsG: 0, fatG: 7, sortOrder: 1 },
      { name: 'shredded cheddar cheese', quantity: '3', unit: 'cups', calories: 170, proteinG: 11, carbsG: 1, fatG: 14, sortOrder: 2 },
      { name: 'shredded mozzarella', quantity: '1', unit: 'cup', calories: 40, proteinG: 3, carbsG: 1, fatG: 3, sortOrder: 3 },
      { name: 'whole milk', quantity: '3', unit: 'cups', calories: 56, proteinG: 3, carbsG: 5, fatG: 3, sortOrder: 4 },
      { name: 'butter', quantity: '4', unit: 'tbsp', calories: 50, proteinG: 0, carbsG: 0, fatG: 6, sortOrder: 5 },
      { name: 'all-purpose flour', quantity: '0.25', unit: 'cup', calories: 14, proteinG: 1, carbsG: 3, fatG: 0, sortOrder: 6 },
      { name: 'breadcrumbs', quantity: '0.5', unit: 'cup', calories: 28, proteinG: 1, carbsG: 5, fatG: 1, sortOrder: 7 },
      { name: 'mustard powder', quantity: '1', unit: 'tsp', calories: 1, proteinG: 0, carbsG: 0, fatG: 0, sortOrder: 8 },
    ],
  },
];

// ─── Seed function ─────────────────────────────────────────────

async function seed() {
  // Find admin user to use as recipe creator
  const adminEmail = 'kylewebdev@gmail.com';
  const [admin] = await db.select().from(user).where(eq(user.email, adminEmail));

  if (!admin) {
    console.error('Admin user not found. Create your account first, then run this seed.');
    process.exit(1);
  }

  // ─── Upsert recipes ─────────────────────────────────────────
  const seedNames = RECIPES.map((r) => r.name);
  const existingRecipes = await db
    .select({ id: recipes.id, name: recipes.name })
    .from(recipes)
    .where(inArray(recipes.name, seedNames));
  const existingByName = new Map(existingRecipes.map((r) => [r.name, r.id]));

  let created = 0;
  let updated = 0;

  for (const r of RECIPES) {
    const existingId = existingByName.get(r.name);
    let recipeId: string;

    if (existingId) {
      // Update existing recipe
      await db
        .update(recipes)
        .set({
          description: r.description,
          instructions: r.instructions,
          servings: r.servings,
          prepTimeMinutes: r.prepTimeMinutes,
          cookTimeMinutes: r.cookTimeMinutes,
          tags: r.tags,
          imageUrl: r.imageUrl,
          updatedAt: new Date(),
        })
        .where(eq(recipes.id, existingId));
      recipeId = existingId;

      // Delete old ingredients, then re-insert
      await db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, recipeId));
      updated++;
      console.log(`  ~ ${r.name} (updated)`);
    } else {
      // Insert new recipe
      const [recipe] = await db
        .insert(recipes)
        .values({
          name: r.name,
          description: r.description,
          instructions: r.instructions,
          servings: r.servings,
          prepTimeMinutes: r.prepTimeMinutes,
          cookTimeMinutes: r.cookTimeMinutes,
          tags: r.tags,
          imageUrl: r.imageUrl,
          createdBy: admin.id,
        })
        .returning() as (typeof recipes.$inferSelect)[];
      recipeId = recipe.id;
      created++;
      console.log(`  + ${r.name} (created)`);
    }

    // Insert ingredients
    await db.insert(recipeIngredients).values(
      r.ingredients.map((ing) => ({
        recipeId,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        calories: ing.calories,
        proteinG: ing.proteinG,
        carbsG: ing.carbsG,
        fatG: ing.fatG,
        sortOrder: ing.sortOrder,
      })),
    );
  }

  console.log(`Seed recipes: ${created} created, ${updated} updated.`);

  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
