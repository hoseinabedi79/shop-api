import {
  Column, CreateDateColumn,
  Entity, Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column('int')
  price: number;

  @Column('int')
  stock: number;

  // Many products belong to one category
  @ManyToOne(() => Category, (category) => category.products, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  // The raw foreign key, so we can read and write the id directly
  @Index()
  @Column()
  categoryId: number;


  // Set by the database when the row is inserted, never changes after
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // Set on insert, then refreshed by TypeORM on every save
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
