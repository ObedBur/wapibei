import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { CategoriesModule } from '../categories/categories.module';
import { SellersModule } from '../sellers/sellers.module';
import { ContentModule } from '../content/content.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [CategoriesModule, SellersModule, ContentModule, ProductsModule],
  controllers: [HomeController],
})
export class HomeModule {}