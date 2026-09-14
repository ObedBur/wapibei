import { Controller, Get, Query } from '@nestjs/common';
import { CategoriesService } from '../categories/categories.service';
import { SellersService } from '../sellers/sellers.service';
import { ContentService } from '../content/content.service';
import { ProductsService } from '../products/products.service';

@Controller('home')
export class HomeController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly sellersService: SellersService,
    private readonly contentService: ContentService,
    private readonly productsService: ProductsService,
  ) {}

  /**
   * Récupère toutes les sections de la page d'accueil en une seule requête.
   * Cache géré au niveau service via AppCacheService (pas de CacheInterceptor).
   */
  @Get('sections')
  async getHomeSections(
    @Query('limit') limit?: string,
    @Query('lang') lang?: string,
  ) {
    const lim = limit ? parseInt(limit, 10) : 12;

    const [
      categories,
      sellers,
      content,
      deals,
      newArrivals,
      bestSellers,
    ] = await Promise.all([
      this.categoriesService.findAll(),
      this.sellersService.findActiveVendors(),
      this.contentService.getHomepageContent(),
      this.productsService.getDeals(12, lang),
      this.productsService.getNewArrivals(12, lang),
      this.productsService.getBestSellers(12, lang),
    ]);

    return {
      success: true,
      data: {
        categories,
        sellers,
        content,
        deals,
        newArrivals,
        bestSellers,
      },
    };
  }
}