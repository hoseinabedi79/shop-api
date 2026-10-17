import dataSource from '../data-source';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { catalog } from './catalog';

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

      for (const entry of catalog) {
        // Save the category first, so we get its id
        const category = await manager.save(Category, {
          name: entry.name,
          description: entry.description,
        });

        // Attach every product of this entry to the new category
        const products = entry.products.map((item) =>
          manager.create(Product, { ...item, categoryId: category.id }),
        );
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