import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not ,Repository } from 'typeorm';
import {
  getPgErrorCode,
  PG_FOREIGN_KEY_VIOLATION,
  PG_RESTRICT_VIOLATION,
  PG_UNIQUE_VIOLATION,
} from '../common/database-errors';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { makeUniqueSlug ,slugify } from '../common/slug';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const slug = await this.buildSlug(createCategoryDto.slug ?? createCategoryDto.name);
    const category = this.categoriesRepository.create({ ...createCategoryDto, slug });
    try {
      // "return await" is required here, otherwise catch never sees save errors
      return await this.categoriesRepository.save(category);
    } catch (error) {
      if (getPgErrorCode(error) === PG_UNIQUE_VIOLATION) {
        throw new ConflictException('Category name already exists');
      }
      // Any other error is a real server problem, so let it become a 500
      throw error;
    }
  }

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find();
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);
    const changes = { ...updateCategoryDto };
    if (updateCategoryDto.slug !== undefined) {
      changes.slug = await this.buildSlug(updateCategoryDto.slug, id);
    }
    const updated = { ...category, ...changes };
    try {
      return await this.categoriesRepository.save(updated);
    } catch (error) {
      if (getPgErrorCode(error) === PG_UNIQUE_VIOLATION) {
        throw new ConflictException('Category name already exists');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    try {
      await this.categoriesRepository.remove(category);
    } catch (error) {
      const code = getPgErrorCode(error);
      // RESTRICT keys raise 23001, NO ACTION keys raise 23503
      if (code === PG_RESTRICT_VIOLATION || code === PG_FOREIGN_KEY_VIOLATION) {
        throw new ConflictException('Category still has products');
      }
      throw error;
    }
  }

  async findProducts(id: number): Promise<Product[]> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: { products: true },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category.products;
  }

  private async buildSlug(source: string, excludeId?: number): Promise<string> {
    const base = slugify(source);
    if (!base) {
      throw new BadRequestException('Slug must contain at least one letter or digit');
    }
    return makeUniqueSlug(base, (candidate) =>
      this.categoriesRepository.exists({
        // When updating, the category's own current slug does not count as taken
        where: excludeId ? { slug: candidate, id: Not(excludeId) } : { slug: candidate },
      }),
    );
  }
}
