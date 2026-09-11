import { Controller, Get, UseInterceptors, Query } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
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
   * Cache 5 minutes (300s) — correspond au TTL le plus court parmi les sections (deals/new-arrivals/best-sellers).
   */
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
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