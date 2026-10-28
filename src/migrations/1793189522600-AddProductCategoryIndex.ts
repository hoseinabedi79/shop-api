import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductCategoryIndex1793189522600 implements MigrationInterface {
    name = 'AddProductCategoryIndex1793189522600'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_ff56834e735fa78a15d0cf2192" ON "products"  ("categoryId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_ff56834e735fa78a15d0cf2192"`);
    }

}
