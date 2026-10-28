import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import {
  getPgErrorCode,
  PG_FOREIGN_KEY_VIOLATION,
} from '../common/database-errors';
import { makeUniqueSlug, slugify } from '../common/slug';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginatedResult } from '../common/paginated-result';
import { ListProductsQueryDto } from './dto/list-products-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Use the custom slug if the client sent one, otherwise build it from the name
    const slug = await this.buildSlug(
      createProductDto.slug ?? createProductDto.name,
    );
    const product = this.productsRepository.create({
      ...createProductDto,
      slug,
    });
    try {
      return await this.productsRepository.save(product);
    } catch (error) {
      if (getPgErrorCode(error) === PG_FOREIGN_KEY_VIOLATION) {
        throw new BadRequestException('Category does not exist');
      }
      throw error;
    }
  }

  async findAll(
    query: ListProductsQueryDto,
  ): Promise<PaginatedResult<Product>> {
    const { page, limit, categoryId, search, sort, order, minPrice, maxPrice, categorySlug } =
      query;

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      throw new BadRequestException('minPrice cannot be greater than maxPrice');
    }
    // Add a condition only when the client sent that filter
    const where: FindOptionsWhere<Product> = {};
    if (categoryId !== undefined) {
      where.categoryId = categoryId;
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      where.price = Between(minPrice, maxPrice);
    } else if (minPrice !== undefined) {
      where.price = MoreThanOrEqual(minPrice);
    } else if (maxPrice !== undefined) {
      where.price = LessThanOrEqual(maxPrice);
    }

    // Sort by the requested field, then by id in the same direction,
    // so equal values keep a stable order that matches what was asked
    const orderBy: FindOptionsOrder<Product> = { [sort]: order };
    if (sort !== 'id') {
      orderBy.id = order;
    }

    const [data, total] = await this.productsRepository.findAndCount({
      where,
      relations: { category: true },
      order: orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { slug },
      relations: { category: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const changes = { ...updateProductDto };
    // The slug changes only when the client asks for it, never because the name changed
    if (updateProductDto.slug !== undefined) {
      changes.slug = await this.buildSlug(updateProductDto.slug, id);
    }

    // Load the row by id and apply the new values on top, without loading relations
    const product = await this.productsRepository.preload({ id, ...changes });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    try {
      await this.productsRepository.save(product);
    } catch (error) {
      if (getPgErrorCode(error) === PG_FOREIGN_KEY_VIOLATION) {
        throw new BadRequestException('Category does not exist');
      }
      throw error;
    }
    // Read it again so the response has the fresh category
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }

  // Turns the source text into a slug that no other product uses
  private async buildSlug(source: string, excludeId?: number): Promise<string> {
    const base = slugify(source);
    if (!base) {
      throw new BadRequestException(
        'Slug must contain at least one letter or digit',
      );
    }
    return makeUniqueSlug(base, (candidate) =>
      this.productsRepository.exists({
        // When updating, the product's own current slug does not count as taken
        where: excludeId
          ? { slug: candidate, id: Not(excludeId) }
          : { slug: candidate },
      }),
    );
  }
}
