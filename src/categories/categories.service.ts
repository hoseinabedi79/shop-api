import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

// PostgreSQL error code for a duplicate value in a unique column
const UNIQUE_VIOLATION = '23505';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create(createCategoryDto);
    try {
      // "return await" is required here, otherwise catch never sees save errors
      return await this.categoriesRepository.save(category);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
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
    const updated = { ...category, ...updateCategoryDto };
    try {
      return await this.categoriesRepository.save(updated);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Category already exists');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoriesRepository.remove(category);
  }

  private isUniqueViolation(error: unknown): boolean {
    // Only database query errors carry a PostgreSQL error code
    if (!(error instanceof QueryFailedError)) {
      return false;
    }
    // The PostgreSQL driver puts the error code on driverError.code
    const pgError = error.driverError as { code?: string };
    return pgError.code === UNIQUE_VIOLATION;
  }
}
