import dataSource from '../data-source';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { catalog } from './catalog';
import { makeUniqueSlug, slugify } from '../common/slug';


// Builds a slug that is not in the given set yet, then remembers it
async function uniqueSlug(name: string, used: Set<string>): Promise<string> {
  const slug = await makeUniqueSlug(slugify(name), async (candidate) => used.has(candidate));
  used.add(slug);
  return slug;
}

async function seed(): Promise<void> {
  // Never wipe a real database by accident
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seeding is disabled in production');
  }

  await dataSource.initialize();

  try {
    // One transaction: either every row is inserted, or none of them
    await dataSource.transaction(async (manager) => {
      // Empty both tables and restart ids from 1, so the seed can run again safely
      await manager.query('TRUNCATE TABLE "products", "categories" RESTART IDENTITY');
      // The tables are empty now, so we track the slugs we hand out in memory
      const usedCategorySlugs = new Set<string>();
      const usedProductSlugs = new Set<string>();

      for (const entry of catalog) {
        // Save the category first, so we get its id
        const category = await manager.save(Category, {
          name: entry.name,
          slug: await uniqueSlug(entry.name, usedCategorySlugs),
          description: entry.description,
        });

        // One by one, so a duplicate name sees the slug of the one before it
        const products: Product[] = [];
        for (const item of entry.products) {
          const slug = await uniqueSlug(item.name, usedProductSlugs);
          products.push(manager.create(Product, { ...item, slug, categoryId: category.id }));
        }
        await manager.save(Product, products);
      }
    });

    const productCount = catalog.reduce((sum, entry) => sum + entry.products.length, 0);
    console.log(`Seeded ${catalog.length} categories and ${productCount} products`);
  } finally {
    // Always close the connection, even if something failed
    await dataSource.destroy();
  }
}

seed().catch((error: unknown) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});