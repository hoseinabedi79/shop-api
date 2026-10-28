import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTimestamps1793194677886 implements MigrationInterface {
    name = 'AddTimestamps1793194677886'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "products" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "createdAt"`);
    }

}
