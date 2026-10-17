import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    // Load .env once and share ConfigService with every module
    ConfigModule.forRoot({ isGlobal: true }),

    // Build the DB connection after ConfigService is available
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('DB_HOST'),
        // .env values are always strings, so convert the port explicitly
        port: Number(config.getOrThrow<string>('DB_PORT')),
        username: config.getOrThrow<string>('DB_USERNAME'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_NAME'),
        autoLoadEntities: true,
        // Schema changes now go through migrations only
        synchronize: false,
        logging: true,
      }),
    }),

    ProductsModule,

    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
