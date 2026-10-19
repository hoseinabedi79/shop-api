import { MigrationInterface, QueryRunner } from 'typeorm';
import { makeUniqueSlug, slugify } from '../common/slug';

export class AddSlugs1792230408306 implements MigrationInterface {
    name = 'AddSlugs1792230408306';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Step 1: add the columns as nullable, so the existing rows stay valid
        await queryRunner.query(`ALTER TABLE "categories" ADD "slug" character varying`);
        await queryRunner.query(`ALTER TABLE "products" ADD "slug" character varying`);

        // Step 2: give every existing row a unique slug built from its name
        await this.fillSlugs(queryRunner, 'categories');
        await this.fillSlugs(queryRunner, 'products');

        // Step 3: no row is empty anymore, so make the columns required and unique
        await queryRunner.query(`ALTER TABLE "categories" ALTER COLUMN "slug" SET NOT NULL`);
        await queryRunner.query(
          `ALTER TABLE "categories" ADD CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("slug")`,
        );
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "slug" SET NOT NULL`);
        await queryRunner.query(
          `ALTER TABLE "products" ADD CONSTRAINT "UQ_464f927ae360106b783ed0b4106" UNIQUE ("slug")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "UQ_464f927ae360106b783ed0b4106"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "slug"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "slug"`);
    }

    // Reads every row of the table and saves a unique slug for it
    private async fillSlugs(
      queryRunner: QueryRunner,
      table: 'products' | 'categories',
    ): Promise<void> {
        const rows: { id: number; name: string }[] = await queryRunner.query(
          `SELECT "id", "name" FROM "${table}" ORDER BY "id"`,
        );
        const used = new Set<string>();

        for (const row of rows) {
            // Fall back to item-<id> if the name has no letters or digits at all
            const base = slugify(row.name) || `item-${row.id}`;
            const slug = await makeUniqueSlug(base, async (candidate) => used.has(candidate));
            used.add(slug);
            await queryRunner.query(`UPDATE "${table}" SET "slug" = $1 WHERE "id" = $2`, [slug, row.id]);
        }
    }
}