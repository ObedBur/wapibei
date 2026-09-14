import { Controller, Get, Param, Query, Post, Body, Req, UseGuards, Patch, Delete, UseInterceptors, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

/**
 * Contrôleur gérant les opérations sur les produits.
 * Intègre la mise en cache pour les routes de lecture intensive.
 */
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Crée un nouveau produit pour le vendeur authentifié.
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createProductDto: CreateProductDto, @Req() req: any) {
    const userId = req.user.id;
    const product = await this.productsService.create({ ...createProductDto }, userId);

    return {
      success: true,
      message: 'Produit créé avec succès',
      data: product,
    };
  }

  /**
   * Récupère les produits appartenant au vendeur authentifié.
   * Retourne TOUS les produits : publics ET brouillons.
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-products')
  async findMyProducts(
    @Req() req: any,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('lang') lang?: string,
  ) {
    const userId = req.user.id;
    const result = await this.productsService.getVendorProducts(userId, {
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      search,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      lang,
    });

    return {
      success: true,
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages,
      },
    };
  }

  /**
   * Récupère les offres promotionnelles.
   * Cache géré au niveau service via AppCacheService.
   */
  @Get('deals')
  async getDeals(@Query('limit') limit?: string, @Query('lang') lang?: string) {
    const data = await this.productsService.getDeals(limit ? parseInt(limit) : 6, lang);
    return { success: true, data };
  }

  /**
   * Récupère les nouveautés.
   * Cache géré au niveau service via AppCacheService (pas de CacheInterceptor pour éviter le double-cache).
   */
  @Get('new-arrivals')
  async getNewArrivals(@Query('limit') limit?: string, @Query('lang') lang?: string) {
    const data = await this.productsService.getNewArrivals(limit ? parseInt(limit) : 6, lang);
    return { success: true, data };
  }

  /**
   * Récupère les recommandations personnalisées.
   * Pas de cache global ici car les recommandations peuvent être spécifiques à l'utilisateur.
   */
  @Get('recommendations')
  async getRecommendations(@Query('userId') userId?: string, @Query('limit') limit?: string, @Query('lang') lang?: string) {
    const data = await this.productsService.getRecommendations(userId, limit ? parseInt(limit) : 6, lang);
    return { success: true, data };
  }

  /**
   * Récupère les meilleures ventes.
   * Cache géré au niveau service via AppCacheService.
   */
  @Get('best-sellers')
  async getBestSellers(@Query('limit') limit?: string, @Query('lang') lang?: string) {
    const data = await this.productsService.getBestSellers(limit ? parseInt(limit) : 6, lang);
    return { success: true, data };
  }

  /**
   * Fournit des suggestions de recherche en temps réel.
   * Cache de 60 secondes.
   */
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60)
  @Get('suggestions')
  async getSuggestions(@Query('q') query: string, @Query('lang') lang?: string) {
    if (!query || query.length < 2) return { success: true, data: [] };
    const suggestions = await this.productsService.getSuggestions(query, lang);
    return { success: true, data: suggestions };
  }

  /**
   * Compare les prix des produits sur différents vendeurs.
   * Cache de 60 secondes.
   */
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60)
  @Get('compare')
  async compare(@Query('search') search: string, @Query('lang') lang?: string) {
    const data = await this.productsService.compareProducts(search || '', lang);
    return { success: true, ...data };
  }

  /**
   * Liste publique des produits avec filtres.
   * Cache de 60 secondes pour éviter de surcharger la base sur la page catalogue.
   */
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60)
  @Get()
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('market') market?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('lang') lang?: string,
  ) {
    const result = await this.productsService.findAll({
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      search,
      market,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      lang,
    });

    return {
      success: true,
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages,
      },
    };
  }

  /**
   * Récupère les détails d'un produit spécifique.
   */
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60)
  @Get(':id')
  async findOne(@Param('id') id: string, @Query('lang') lang?: string) {
    const product = await this.productsService.findOne(id, lang);
    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Produit non trouvé',
      });
    }
    return { success: true, data: product };
  }

  /**
   * Met à jour un produit. Seul le propriétaire peut effectuer cette action.
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: any, @Req() req: any) {
    const userId = req.user.id;
    const product = await this.productsService.update(id, updateProductDto, userId);
    return {
      success: true,
      message: 'Produit mis à jour avec succès',
      data: product,
    };
  }

  /**
   * Publication en masse de plusieurs produits.
   */
  @UseGuards(JwtAuthGuard)
  @Patch('bulk-publish')
  async bulkPublish(@Body('ids') ids: string[], @Req() req: any) {
    const userId = req.user.id;
    await this.productsService.bulkPublish(ids, userId);
    return {
      success: true,
      message: `${ids.length} produits publiés avec succès`,
    };
  }

  /**
   * Supprime un produit du catalogue.
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    await this.productsService.remove(id, userId);
    return {
      success: true,
      message: 'Produit supprimé avec succès',
    };
  }
}
