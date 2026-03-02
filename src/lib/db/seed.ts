import { db } from './index';
import { recipes, recipeIngredients, user } from './schema';
import { eq } from 'drizzle-orm';

// ─── Recipe seed data ──────────────────────────────────────────

type RecipeSeed = {
  name: string;
  description: string;
  instructions: string;
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  tags: string[];
  ingredients: {
    name: string;
    quantity: string;
    unit: string;
    sortOrder: number;
  }[];
};

const RECIPES: RecipeSeed[] = [
  {
    name: 'Chicken Burrito Bowls',
    description: 'Seasoned chicken with rice, beans, and fresh toppings. Great for portioning into containers.',
    instructions:
      '1. Cook rice according to package directions, stir in lime juice.\n2. Season chicken thighs with chili powder, cumin, garlic powder, salt, and pepper.\n3. Cook chicken in a hot skillet 6-7 min per side until done. Let rest, then slice.\n4. Warm black beans with a pinch of cumin.\n5. Divide rice, chicken, beans, corn, and salsa into containers.\n6. Add avocado and cilantro when serving.',
    servings: 6,
    prepTimeMinutes: 15,
    cookTimeMinutes: 25,
    calories: 520,
    proteinG: 38,
    carbsG: 55,
    fatG: 14,
    tags: ['chicken', 'meal-prep', 'high-protein'],
    ingredients: [
      { name: 'boneless skinless chicken thighs', quantity: '2', unit: 'lbs', sortOrder: 0 },
      { name: 'long grain rice', quantity: '2', unit: 'cups', sortOrder: 1 },
      { name: 'black beans (canned, drained)', quantity: '15', unit: 'oz', sortOrder: 2 },
      { name: 'corn kernels', quantity: '1.5', unit: 'cups', sortOrder: 3 },
      { name: 'salsa', quantity: '1', unit: 'cup', sortOrder: 4 },
      { name: 'lime', quantity: '2', unit: 'whole', sortOrder: 5 },
      { name: 'chili powder', quantity: '1', unit: 'tbsp', sortOrder: 6 },
      { name: 'cumin', quantity: '1', unit: 'tsp', sortOrder: 7 },
      { name: 'avocado', quantity: '2', unit: 'whole', sortOrder: 8 },
      { name: 'fresh cilantro', quantity: '0.25', unit: 'cup', sortOrder: 9 },
    ],
  },
  {
    name: 'Beef & Broccoli Stir Fry',
    description: 'Classic takeout-style beef and broccoli over rice. Reheats well in the microwave.',
    instructions:
      '1. Slice flank steak thinly against the grain.\n2. Marinate in soy sauce, sesame oil, and cornstarch for 15 min.\n3. Cook rice.\n4. Stir fry beef in batches over high heat, 2 min per side. Set aside.\n5. Stir fry broccoli with garlic and ginger 3-4 min.\n6. Return beef, add sauce (soy sauce, oyster sauce, brown sugar, water, cornstarch). Toss until thickened.\n7. Serve over rice.',
    servings: 5,
    prepTimeMinutes: 20,
    cookTimeMinutes: 15,
    calories: 480,
    proteinG: 35,
    carbsG: 50,
    fatG: 14,
    tags: ['beef', 'meal-prep', 'stir-fry'],
    ingredients: [
      { name: 'flank steak', quantity: '1.5', unit: 'lbs', sortOrder: 0 },
      { name: 'broccoli florets', quantity: '4', unit: 'cups', sortOrder: 1 },
      { name: 'long grain rice', quantity: '2', unit: 'cups', sortOrder: 2 },
      { name: 'soy sauce', quantity: '0.25', unit: 'cup', sortOrder: 3 },
      { name: 'oyster sauce', quantity: '2', unit: 'tbsp', sortOrder: 4 },
      { name: 'sesame oil', quantity: '1', unit: 'tbsp', sortOrder: 5 },
      { name: 'cornstarch', quantity: '2', unit: 'tbsp', sortOrder: 6 },
      { name: 'garlic cloves (minced)', quantity: '4', unit: 'whole', sortOrder: 7 },
      { name: 'fresh ginger (grated)', quantity: '1', unit: 'tbsp', sortOrder: 8 },
      { name: 'brown sugar', quantity: '1', unit: 'tbsp', sortOrder: 9 },
    ],
  },
  {
    name: 'Turkey Taco Meat with Fixings',
    description: 'Seasoned ground turkey taco filling. Prep the meat and toppings separately for easy assembly.',
    instructions:
      '1. Brown ground turkey in a large skillet over medium-high heat, breaking up with a spoon.\n2. Add diced onion and cook 3 min.\n3. Stir in taco seasoning (chili powder, cumin, paprika, garlic powder, onion powder, oregano) and 0.5 cup water. Simmer 5 min.\n4. Prep toppings: shred lettuce, dice tomatoes, grate cheese, slice jalapeños.\n5. Store meat and each topping in separate containers.\n6. Serve in tortillas, over rice, or as a salad.',
    servings: 6,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    calories: 350,
    proteinG: 30,
    carbsG: 28,
    fatG: 12,
    tags: ['turkey', 'meal-prep', 'tacos', 'high-protein'],
    ingredients: [
      { name: 'ground turkey', quantity: '2', unit: 'lbs', sortOrder: 0 },
      { name: 'yellow onion (diced)', quantity: '1', unit: 'whole', sortOrder: 1 },
      { name: 'chili powder', quantity: '2', unit: 'tbsp', sortOrder: 2 },
      { name: 'cumin', quantity: '1', unit: 'tbsp', sortOrder: 3 },
      { name: 'paprika', quantity: '1', unit: 'tsp', sortOrder: 4 },
      { name: 'flour tortillas', quantity: '12', unit: 'whole', sortOrder: 5 },
      { name: 'shredded cheddar cheese', quantity: '1', unit: 'cup', sortOrder: 6 },
      { name: 'roma tomatoes', quantity: '3', unit: 'whole', sortOrder: 7 },
      { name: 'romaine lettuce', quantity: '1', unit: 'head', sortOrder: 8 },
      { name: 'sour cream', quantity: '0.5', unit: 'cup', sortOrder: 9 },
    ],
  },
  {
    name: 'Sheet Pan Sausage & Vegetables',
    description: 'One-pan roasted sausage with peppers, onions, and potatoes. Minimal cleanup.',
    instructions:
      '1. Preheat oven to 400°F.\n2. Cut sausage into coins, dice potatoes into 1-inch cubes, slice peppers and onions.\n3. Toss everything with olive oil, Italian seasoning, salt, and pepper on a sheet pan.\n4. Spread in a single layer (use two pans if needed).\n5. Roast 25-30 min, tossing halfway, until potatoes are golden and sausage is browned.\n6. Divide into containers.',
    servings: 5,
    prepTimeMinutes: 10,
    cookTimeMinutes: 30,
    calories: 450,
    proteinG: 22,
    carbsG: 38,
    fatG: 22,
    tags: ['sausage', 'meal-prep', 'sheet-pan', 'one-pan'],
    ingredients: [
      { name: 'smoked sausage', quantity: '1.5', unit: 'lbs', sortOrder: 0 },
      { name: 'baby potatoes (halved)', quantity: '1.5', unit: 'lbs', sortOrder: 1 },
      { name: 'bell peppers (mixed colors)', quantity: '3', unit: 'whole', sortOrder: 2 },
      { name: 'red onion', quantity: '1', unit: 'whole', sortOrder: 3 },
      { name: 'olive oil', quantity: '3', unit: 'tbsp', sortOrder: 4 },
      { name: 'Italian seasoning', quantity: '1', unit: 'tbsp', sortOrder: 5 },
      { name: 'garlic powder', quantity: '1', unit: 'tsp', sortOrder: 6 },
      { name: 'salt', quantity: '1', unit: 'tsp', sortOrder: 7 },
      { name: 'black pepper', quantity: '0.5', unit: 'tsp', sortOrder: 8 },
    ],
  },
  {
    name: 'Honey Garlic Salmon & Rice',
    description: 'Glazed salmon fillets with steamed rice and green beans. Quick and nutritious.',
    instructions:
      '1. Cook rice.\n2. Mix glaze: honey, soy sauce, minced garlic, rice vinegar, and red pepper flakes.\n3. Pat salmon fillets dry, season with salt and pepper.\n4. Sear salmon skin-side up in a hot skillet 3 min. Flip, cook 2 min.\n5. Pour glaze over salmon, cook 2 min until sticky.\n6. Steam green beans 4-5 min until tender-crisp.\n7. Plate salmon over rice with green beans.',
    servings: 4,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    calories: 490,
    proteinG: 36,
    carbsG: 52,
    fatG: 14,
    tags: ['salmon', 'fish', 'meal-prep', 'high-protein'],
    ingredients: [
      { name: 'salmon fillets', quantity: '4', unit: 'whole', sortOrder: 0 },
      { name: 'jasmine rice', quantity: '2', unit: 'cups', sortOrder: 1 },
      { name: 'green beans (trimmed)', quantity: '1', unit: 'lb', sortOrder: 2 },
      { name: 'honey', quantity: '3', unit: 'tbsp', sortOrder: 3 },
      { name: 'soy sauce', quantity: '2', unit: 'tbsp', sortOrder: 4 },
      { name: 'garlic cloves (minced)', quantity: '4', unit: 'whole', sortOrder: 5 },
      { name: 'rice vinegar', quantity: '1', unit: 'tbsp', sortOrder: 6 },
      { name: 'red pepper flakes', quantity: '0.25', unit: 'tsp', sortOrder: 7 },
    ],
  },
  {
    name: 'Chicken Pasta Bake',
    description: 'Creamy baked pasta with chicken, spinach, and mozzarella. Family-size batch.',
    instructions:
      '1. Preheat oven to 375°F.\n2. Cook penne to al dente, drain.\n3. Season and cook diced chicken breast in a skillet until done, about 6-7 min. Set aside.\n4. In the same skillet, sauté garlic 30 sec, add marinara and cream cheese. Stir until smooth.\n5. Fold in spinach until wilted.\n6. Combine pasta, chicken, and sauce in a baking dish.\n7. Top with mozzarella and parmesan.\n8. Bake 20 min until bubbly and golden.',
    servings: 6,
    prepTimeMinutes: 15,
    cookTimeMinutes: 35,
    calories: 550,
    proteinG: 40,
    carbsG: 52,
    fatG: 18,
    tags: ['chicken', 'pasta', 'meal-prep', 'baked'],
    ingredients: [
      { name: 'boneless skinless chicken breast', quantity: '1.5', unit: 'lbs', sortOrder: 0 },
      { name: 'penne pasta', quantity: '1', unit: 'lb', sortOrder: 1 },
      { name: 'marinara sauce', quantity: '24', unit: 'oz', sortOrder: 2 },
      { name: 'cream cheese', quantity: '4', unit: 'oz', sortOrder: 3 },
      { name: 'fresh spinach', quantity: '4', unit: 'cups', sortOrder: 4 },
      { name: 'shredded mozzarella', quantity: '1.5', unit: 'cups', sortOrder: 5 },
      { name: 'grated parmesan', quantity: '0.5', unit: 'cup', sortOrder: 6 },
      { name: 'garlic cloves (minced)', quantity: '3', unit: 'whole', sortOrder: 7 },
      { name: 'Italian seasoning', quantity: '1', unit: 'tsp', sortOrder: 8 },
    ],
  },
  {
    name: 'Korean Beef Bowls',
    description: 'Sweet and savory ground beef over rice with quick-pickled cucumbers.',
    instructions:
      '1. Cook rice.\n2. Brown ground beef, drain fat.\n3. Add sauce: soy sauce, brown sugar, sesame oil, garlic, ginger, gochujang. Simmer 5 min.\n4. Quick pickle: toss sliced cucumber with rice vinegar, sugar, and salt. Let sit 10 min.\n5. Divide rice and beef into containers. Top with green onions, sesame seeds, and pickled cucumber when serving.',
    servings: 5,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    calories: 510,
    proteinG: 32,
    carbsG: 55,
    fatG: 16,
    tags: ['beef', 'meal-prep', 'korean', 'bowls'],
    ingredients: [
      { name: 'ground beef (90/10)', quantity: '2', unit: 'lbs', sortOrder: 0 },
      { name: 'jasmine rice', quantity: '2', unit: 'cups', sortOrder: 1 },
      { name: 'soy sauce', quantity: '0.33', unit: 'cup', sortOrder: 2 },
      { name: 'brown sugar', quantity: '3', unit: 'tbsp', sortOrder: 3 },
      { name: 'sesame oil', quantity: '1', unit: 'tbsp', sortOrder: 4 },
      { name: 'gochujang', quantity: '1', unit: 'tbsp', sortOrder: 5 },
      { name: 'garlic cloves (minced)', quantity: '4', unit: 'whole', sortOrder: 6 },
      { name: 'fresh ginger (grated)', quantity: '1', unit: 'tsp', sortOrder: 7 },
      { name: 'english cucumber', quantity: '1', unit: 'whole', sortOrder: 8 },
      { name: 'green onions', quantity: '4', unit: 'whole', sortOrder: 9 },
      { name: 'sesame seeds', quantity: '1', unit: 'tbsp', sortOrder: 10 },
      { name: 'rice vinegar', quantity: '2', unit: 'tbsp', sortOrder: 11 },
    ],
  },
  {
    name: 'Mediterranean Chicken & Quinoa',
    description: 'Herb-marinated chicken with quinoa, chickpeas, cucumbers, and feta.',
    instructions:
      '1. Marinate chicken thighs in olive oil, lemon juice, oregano, garlic, salt, and pepper for at least 15 min.\n2. Cook quinoa according to package.\n3. Grill or pan-sear chicken 6-7 min per side. Let rest, then slice.\n4. Toss quinoa with drained chickpeas, diced cucumber, cherry tomatoes, red onion, and parsley.\n5. Drizzle with olive oil and lemon.\n6. Divide quinoa salad and chicken into containers. Top with feta when serving.',
    servings: 5,
    prepTimeMinutes: 20,
    cookTimeMinutes: 15,
    calories: 470,
    proteinG: 38,
    carbsG: 40,
    fatG: 16,
    tags: ['chicken', 'meal-prep', 'mediterranean', 'high-protein'],
    ingredients: [
      { name: 'boneless skinless chicken thighs', quantity: '2', unit: 'lbs', sortOrder: 0 },
      { name: 'quinoa', quantity: '1.5', unit: 'cups', sortOrder: 1 },
      { name: 'chickpeas (canned, drained)', quantity: '15', unit: 'oz', sortOrder: 2 },
      { name: 'english cucumber (diced)', quantity: '1', unit: 'whole', sortOrder: 3 },
      { name: 'cherry tomatoes (halved)', quantity: '1', unit: 'cup', sortOrder: 4 },
      { name: 'feta cheese (crumbled)', quantity: '0.5', unit: 'cup', sortOrder: 5 },
      { name: 'lemon', quantity: '2', unit: 'whole', sortOrder: 6 },
      { name: 'olive oil', quantity: '3', unit: 'tbsp', sortOrder: 7 },
      { name: 'dried oregano', quantity: '1', unit: 'tbsp', sortOrder: 8 },
      { name: 'fresh parsley', quantity: '0.25', unit: 'cup', sortOrder: 9 },
      { name: 'red onion (diced)', quantity: '0.5', unit: 'whole', sortOrder: 10 },
    ],
  },
  {
    name: 'Pulled Pork Bowls',
    description: 'Slow-cooked pulled pork with coleslaw and sweet potatoes. Set it and forget it.',
    instructions:
      '1. Rub pork shoulder with brown sugar, smoked paprika, garlic powder, onion powder, salt, and pepper.\n2. Place in slow cooker with chicken broth. Cook on low 8 hours or high 4 hours.\n3. Shred pork with two forks, stir back into juices.\n4. Roast cubed sweet potatoes at 400°F for 25 min.\n5. Make coleslaw: toss shredded cabbage with mayo, apple cider vinegar, and a pinch of sugar.\n6. Assemble bowls with pork, sweet potatoes, and coleslaw.',
    servings: 8,
    prepTimeMinutes: 15,
    cookTimeMinutes: 240,
    calories: 460,
    proteinG: 34,
    carbsG: 38,
    fatG: 18,
    tags: ['pork', 'meal-prep', 'slow-cooker', 'bowls'],
    ingredients: [
      { name: 'pork shoulder/butt', quantity: '3', unit: 'lbs', sortOrder: 0 },
      { name: 'sweet potatoes (cubed)', quantity: '2', unit: 'lbs', sortOrder: 1 },
      { name: 'coleslaw mix (shredded cabbage)', quantity: '14', unit: 'oz', sortOrder: 2 },
      { name: 'chicken broth', quantity: '1', unit: 'cup', sortOrder: 3 },
      { name: 'brown sugar', quantity: '2', unit: 'tbsp', sortOrder: 4 },
      { name: 'smoked paprika', quantity: '1', unit: 'tbsp', sortOrder: 5 },
      { name: 'garlic powder', quantity: '1', unit: 'tsp', sortOrder: 6 },
      { name: 'mayo', quantity: '3', unit: 'tbsp', sortOrder: 7 },
      { name: 'apple cider vinegar', quantity: '1', unit: 'tbsp', sortOrder: 8 },
    ],
  },
  {
    name: 'Veggie Fried Rice',
    description: 'Quick veggie fried rice using day-old rice. Easy to scale up for the whole family.',
    instructions:
      '1. Use day-old rice (or cook rice and spread on a sheet pan to cool 20 min).\n2. Scramble eggs in a hot wok or large skillet. Set aside.\n3. Stir fry diced carrots and peas 3 min.\n4. Add rice, soy sauce, and sesame oil. Toss on high heat 3-4 min.\n5. Fold in scrambled eggs and green onions.\n6. Divide into containers.',
    servings: 5,
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    calories: 380,
    proteinG: 14,
    carbsG: 58,
    fatG: 10,
    tags: ['vegetarian', 'meal-prep', 'rice', 'quick'],
    ingredients: [
      { name: 'cooked jasmine rice (day-old)', quantity: '6', unit: 'cups', sortOrder: 0 },
      { name: 'eggs', quantity: '4', unit: 'whole', sortOrder: 1 },
      { name: 'frozen peas and carrots', quantity: '2', unit: 'cups', sortOrder: 2 },
      { name: 'soy sauce', quantity: '3', unit: 'tbsp', sortOrder: 3 },
      { name: 'sesame oil', quantity: '1', unit: 'tbsp', sortOrder: 4 },
      { name: 'green onions (sliced)', quantity: '4', unit: 'whole', sortOrder: 5 },
      { name: 'garlic cloves (minced)', quantity: '3', unit: 'whole', sortOrder: 6 },
      { name: 'vegetable oil', quantity: '2', unit: 'tbsp', sortOrder: 7 },
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

  // ─── Seed recipes ──────────────────────────────────────────
  const existingRecipes = await db.select({ id: recipes.id }).from(recipes);
  if (existingRecipes.length > 0) {
    console.log(`Skipping recipes — ${existingRecipes.length} already exist.`);
  } else {
    for (const r of RECIPES) {
      const [recipe] = await db
        .insert(recipes)
        .values({
          name: r.name,
          description: r.description,
          instructions: r.instructions,
          servings: r.servings,
          prepTimeMinutes: r.prepTimeMinutes,
          cookTimeMinutes: r.cookTimeMinutes,
          calories: r.calories,
          proteinG: r.proteinG,
          carbsG: r.carbsG,
          fatG: r.fatG,
          tags: r.tags,
          createdBy: admin.id,
        })
        .returning() as (typeof recipes.$inferSelect)[];

      await db.insert(recipeIngredients).values(
        r.ingredients.map((ing) => ({
          recipeId: recipe.id,
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          sortOrder: ing.sortOrder,
        })),
      );

      console.log(`  + ${r.name} (${r.ingredients.length} ingredients)`);
    }
    console.log(`Seeded ${RECIPES.length} recipes.`);
  }

  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
