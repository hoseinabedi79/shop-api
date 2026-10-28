import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  // One category has many products (no column is created for this side)
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  // Set by the database when the row is inserted, never changes after
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // Set on insert, then refreshed by TypeORM on every save
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
