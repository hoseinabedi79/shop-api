// import { Injectable, NotFoundException } from '@nestjs/common';
// import { CreateProductDto } from './dto/create-product.dto';
// import { UpdateProductDto } from './dto/update-product.dto';
// import { Product } from './entities/product.entity';
//
// @Injectable()
// export class ProductsService {
//   private products : Product[] = [
//     { id: 1, name: 'Dress A', price: 300, stock: 5 },
//     { id: 2, name: 'Dress B', price: 250, stock: 0 },
//     { id: 3, name: 'Dress C', price: 1200, stock: 2 },
//   ]
//   private nextId = 4;
//
//   create(createProductDto: CreateProductDto) {
//     const newProduct: Product = {
//       id : this.nextId,
//       name : "dress D",
//       price: 400,
//       stock: 1,
//     };
//     this.nextId++;
//     this.products.push(newProduct);
//     return newProduct;
//   }
//
//   findAll(): Product[] {
//     return [...this.products];
//   }
//
//   findOne(id: number): Product {
//     const product = this.products.find(product => product.id === id);
//     if (!product){
//       throw new NotFoundException('Product not found');
//     }
//
//     return product;
//   }
//
//   update(id: number, updateProductDto: UpdateProductDto) {
//     return `This action updates a #${id} product`;
//   }
//
//   remove(id: number) {
//     return `This action removes a #${id} product`;
//   }
// }

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    return this.productsRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    const updated = { ...product, ...updateProductDto };
    return this.productsRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }
  // update and remove stay as they are for now
}
