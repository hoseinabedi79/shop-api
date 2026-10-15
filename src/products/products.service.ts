import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  getPgErrorCode,
  PG_FOREIGN_KEY_VIOLATION,
} from '../common/database-errors';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    try {
      return await this.productsRepository.save(product);
    } catch (error) {
      // categoryId points to a category that does not exist
      if (getPgErrorCode(error) === PG_FOREIGN_KEY_VIOLATION) {
        throw new BadRequestException('Category does not exist');
      }
      throw error;
    }
  }

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find({ relations: { category: true } });
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

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    // Load the row by id and apply the new values on top, without loading relations
    const product = await this.productsRepository.preload({
      id,
      ...updateProductDto,
    });
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
}
