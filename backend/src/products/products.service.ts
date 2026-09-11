import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModerationService } from '../common/services/moderation.service';
import { AppCacheService } from '../common/services/app-cache.service';
import { NotificationsService } from '../common/notifications/notifications.service';

/**
 * Configuration des inclusions par défaut pour les requêtes de produits.
 */
const productInclude = {
  category: true,
  user: {
    select: {
      id: true,
      fullName: true,
      boutiqueName: true,
      isVerified: true,
      trustScore: true,
      phone: true,
      avatarUrl: true,
    },
  },
};

const HOME_PRODUCTS_TTL_MS = 3 * 60 * 1000;

/**
 * Langues supportées par la localisation des produits.
 */
const SUPPORTED_LANGS = ['fr', 'en', 'sw'] as const;
type ProductLang = (typeof SUPPORTED_LANGS)[number];

/**
 * Résout la langue demandée vers une langue supportée (fallback 'fr').
 */
function resolveLang(lang?: string): ProductLang {
  const normalized = (lang || 'fr').toLowerCase();
  return (SUPPORTED_LANGS as readonly string[]).includes(normalized)
    ? (normalized as ProductLang)
    : 'fr';
}

/**
 * Renvoie le produit avec `name`/`description` localisés selon la langue.
 * Fallback : traduction si absente → nom/description de base.
 */
function localizeProduct<T extends { name: string; description?: string | null; nameFr?: string | null; nameEn?: string | null; nameSw?: string | null; descriptionFr?: string | null; descriptionEn?: string | null; descriptionSw?: string | null }>(product: T, lang: ProductLang): T {
  const nameKey = `name${lang === 'fr' ? 'Fr' : lang === 'en' ? 'En' : 'Sw'}` as const;
  const descKey = `description${lang === 'fr' ? 'Fr' : lang === 'en' ? 'En' : 'Sw'}` as const;
  const localizedName = product[nameKey];
  const localizedDesc = product[descKey];
  return {
    ...product,
    name: localizedName || product.name,
    description: localizedDesc || product.description,
  };
}

function localizeList<T extends { name: string; description?: string | null; nameFr?: string | null; nameEn?: string | null; nameSw?: string | null; descriptionFr?: string | null; descriptionEn?: string | null; descriptionSw?: string | null }>(products: T[], lang: ProductLang): T[] {
  return products.map((p) => localizeProduct(p, lang));
}
@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private prisma: PrismaService,
    private moderationService: ModerationService,
    private cache: AppCacheService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Helper pour récupérer les IDs de produits correspondants à une recherche textuelle avancée (ILIKE)
   * Évite les limitations de mode: 'insensitive' avec Prisma Accelerate.
   */
  private async getSearchProductIds(search: string, limit: number = 100): Promise<string[] | undefined> {
    try {
      if (!search) return undefined;
      const terms = search.trim().split(/\s+/).filter(t => t.length > 0);
      if (terms.length === 0) return undefined;

      const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const conditions = terms.map((_, i) => `("name" ~* $${(i * 2) + 1} OR "description" ~* $${(i * 2) + 2})`);
      const joinedConditions = conditions.join(' AND ');
      
      const nameConditions = terms.map((_, i) => `"name" ~* $${(i * 2) + 1}`);
      const joinedNameConditions = nameConditions.join(' AND ');
      
      const params: string[] = [];
      terms.forEach(term => {
        const escaped = `\\m${escapeRegex(term)}`;
        params.push(escaped);
        params.push(escaped);
      });

      const escapedSearch = `\\m${escapeRegex(search.trim())}`;
      params.push(escapedSearch);
      const exactMatchParam = params.length;

      const queryString = `
        SELECT id FROM "Product"
        WHERE "isPublic" = true
        AND ${joinedConditions}
        ORDER BY 
          CASE 
            WHEN "name" ~* $${exactMatchParam} THEN 2
            WHEN ${joinedNameConditions} THEN 1 
            ELSE 0 
          END DESC,
          "createdAt" DESC
        LIMIT ${limit}
      `;

      const results = await this.prisma.$queryRawUnsafe<{id: string}[]>(queryString, ...params);
      
      return results.map(r => r.id);
    } catch (e: any) {
      require('fs').writeFileSync('search-error.txt', (e.message || e.toString()) + '\n' + (e.stack || ''));
      // Fallback
      return undefined;
    }
  }

  /**
   * Variante ciblée : recherche PRÉCISE basée UNIQUEMENT sur les champs de nom du produit
   * (name, nameFr, nameEn, nameSw) — jamais la description.
   * Utilisée par les suggestions et la comparaison ("Voir tous les résultats")
   * pour que les deux aient exactement la même logique.
   */
  private async getSearchProductIdsByName(search: string, limit: number = 100): Promise<string[] | undefined> {
    try {
      if (!search) return undefined;
      const terms = search.trim().split(/\s+/).filter(t => t.length > 0);
      if (terms.length === 0) return undefined;

      const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const nameFields = ['name', 'nameFr', 'nameEn', 'nameSw'];
      
      const params: string[] = [];
      
      const conditions = terms.map(term => {
        const escaped = `\\m${escapeRegex(term)}`;
        const fieldConds = nameFields.map(f => {
          params.push(escaped);
          return `COALESCE("${f}", '') ~* $${params.length}`;
        });
        return `(${fieldConds.join(' OR ')})`;
      });
      const joinedConditions = conditions.join(' AND ');

      const nameOnlyConditions = terms.map(term => {
        params.push(`\\m${escapeRegex(term)}`);
        return `COALESCE("name", '') ~* $${params.length}`;
      });
      const joinedNameConditions = nameOnlyConditions.join(' AND ');

      params.push(`\\m${escapeRegex(search.trim())}`);
      const exactMatchParam = params.length;

      const queryString = `
        SELECT id FROM "Product"
        WHERE "isPublic" = true
        AND ${joinedConditions}
        ORDER BY
          CASE
            WHEN "name" ~* $${exactMatchParam} THEN 2
            WHEN ${joinedNameConditions} THEN 1
            ELSE 0
          END DESC,
          "createdAt" DESC
        LIMIT ${limit}
      `;

      const results = await this.prisma.$queryRawUnsafe<{ id: string }[]>(queryString, ...params);
      return results.map(r => r.id);
    } catch (e: any) {
      this.logger.error(`Search-by-name failed: ${e?.message || e}`);
      return undefined;
    }
  }

  /**
   * Récupère les offres promotionnelles du moment.
   * Filtre les produits marqués explicitement comme étant en solde.
   */
  async getDeals(limit = 6, lang?: string) {
    const resolved = resolveLang(lang);
    return this.cache.getOrSet(`products:deals:${limit}:${resolved}`, HOME_PRODUCTS_TTL_MS, () => {
      return this.prisma.product
        .findMany({
          where: {
            isOnSale: true,
            originalPrice: { not: null },
            isPublic: true,
          } as any,
          orderBy: { createdAt: 'desc' },
          take: limit,
          include: productInclude,
        })
        .then((items) => localizeList(items, resolved));
    });
  }

  /**
   * Récupère les nouveautés publiées au cours des 7 derniers jours.
   */
  async getNewArrivals(limit = 6, lang?: string) {
    const resolved = resolveLang(lang);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return this.cache.getOrSet(`products:new-arrivals:${limit}:${resolved}`, HOME_PRODUCTS_TTL_MS, () => {
      return this.prisma.product
        .findMany({
          where: {
            createdAt: { gte: sevenDaysAgo },
            isPublic: true,
          } as any,
          orderBy: { createdAt: 'desc' },
          take: limit,
          include: productInclude,
        })
        .then((items) => localizeList(items, resolved));
    });
  }

  /**
   * Algorithme de recommandation personnalisé.
   * 1. Analyse les catégories les plus achetées par l'utilisateur.
   * 2. Si l'historique est vide, propose les produits des vendeurs les mieux notés (TrustScore).
   */
  async getRecommendations(userId?: string, limit = 6, lang?: string) {
    const resolved = resolveLang(lang);
    const cacheKey = `products:recommendations:${userId ?? 'guest'}:${limit}:${resolved}`;

    return this.cache.getOrSet(cacheKey, HOME_PRODUCTS_TTL_MS, async () => {
      if (userId) {
        // Trouver les catégories les plus achetées par l'utilisateur
        const userOrders = await this.prisma.order.findMany({
          where: { clientId: userId },
          include: { product: { select: { categoryId: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        });

        const categoryIds = [...new Set(userOrders.map((o) => o.product.categoryId))];

        if (categoryIds.length > 0) {
          const items = await this.prisma.product.findMany({
            where: {
              categoryId: { in: categoryIds },
              isPublic: true,
            } as any,
            orderBy: { totalSales: 'desc' },
            take: limit,
            include: productInclude,
          });
          return localizeList(items, resolved);
        }
      }

      // Fallback : produits de vendeurs les mieux notés
      const items = await this.prisma.product.findMany({
        where: { isPublic: true } as any,
        orderBy: { user: { trustScore: 'desc' } },
        take: limit,
        include: productInclude,
      });
      return localizeList(items, resolved);
    });
  }

  /**
   * Récupère les produits les plus vendus sur la plateforme.
   */
  async getBestSellers(limit = 6, lang?: string) {
    const resolved = resolveLang(lang);
    return this.cache.getOrSet(`products:best-sellers:${limit}:${resolved}`, HOME_PRODUCTS_TTL_MS, () => {
      return this.prisma.product
        .findMany({
          where: { 
            totalSales: { gt: 0 },
            isPublic: true,
          } as any,
          orderBy: { totalSales: 'desc' },
          take: limit,
          include: productInclude,
        })
        .then((items) => localizeList(items, resolved));
    });
  }

  /**
   * Recherche multicritère avec pagination et filtres géographiques (marché).
   */
  async findAll(query: {
    userId?: string;
    categoryId?: number;
    search?: string;
    market?: string;
    page?: number;
    limit?: number;
    onlyPublic?: boolean;
    lang?: string;
  }) {
    const { userId, categoryId, search, market, page = 1, limit = 50, onlyPublic, lang } = query;
    const resolved = resolveLang(lang);
    const skip = (page - 1) * limit;

    const searchIds = await this.getSearchProductIds(search, 1000);
    if (searchIds && searchIds.length === 0) {
      return { items: [], total: 0, page, limit, pages: 0 };
    }

    const where: any = {
      ...(userId && { userId }),
      ...(categoryId && { categoryId }),
      ...(market && { market: market as any }),
      ...(onlyPublic !== undefined ? { isPublic: onlyPublic } : !userId && { isPublic: true }),
      ...(searchIds && { id: { in: searchIds } }),
    };

    try {
      let items = await this.prisma.product.findMany({
        where,
        ...(searchIds ? {} : { skip, take: limit, orderBy: { createdAt: 'desc' } }),
        include: productInclude,
      });

      if (searchIds) {
        items.sort((a, b) => searchIds.indexOf(a.id) - searchIds.indexOf(b.id));
        items = items.slice(skip, skip + limit);
      }

      const total = await this.prisma.product.count({ where });

      return {
        items: localizeList(items, resolved),
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      this.logger.error(`Error in findAll: ${error?.message || error}`, error?.stack);
      throw error;
    }
  }

  /**
   * Récupère TOUS les produits (publics ET brouillons) d'un vendeur spécifique.
   * Utilisé exclusivement par le tableau de bord vendeur.
   */
  async getVendorProducts(
    userId: string,
    opts?: { search?: string; categoryId?: number; page?: number; limit?: number; lang?: string },
  ) {
    const { search, categoryId, page = 1, limit = 50, lang } = opts || {};
    const resolved = resolveLang(lang);
    const skip = (page - 1) * limit;

    const searchIds = await this.getSearchProductIds(search, 1000);
    if (searchIds && searchIds.length === 0) {
      return { items: [], total: 0, page, limit, pages: 0 };
    }

    const where: any = {
      userId,
      ...(categoryId && { categoryId }),
      ...(searchIds && { id: { in: searchIds } }),
    };

    const total = await this.prisma.product.count({ where });
    
    let items = await this.prisma.product.findMany({
      where,
      ...(searchIds ? {} : { skip, take: limit, orderBy: { createdAt: 'desc' } }),
      include: { category: true },
    });

    if (searchIds) {
      items.sort((a, b) => searchIds.indexOf(a.id) - searchIds.indexOf(b.id));
      items = items.slice(skip, skip + limit);
    }

    return { items: localizeList(items, resolved), total, page, limit, pages: Math.ceil(total / limit) };
  }

  /**
   * Crée un nouveau produit après validation complète par les services de modération (IA).
   * Déclenche une notification broadcast aux abonnés si le produit est public.
   */
  async create(data: any, userId: string) {
    const imageUrl = data.image || null;

    await this.moderationService.fullValidation(
      data.name, 
      data.description || '', 
      Number(data.price),
      imageUrl || undefined,
    );

    for (const extraImage of data.images || []) {
      await this.moderationService.validateImage(extraImage);
    }

    const product = await this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        nameFr: data.nameFr || null,
        nameEn: data.nameEn || null,
        nameSw: data.nameSw || null,
        descriptionFr: data.descriptionFr || null,
        descriptionEn: data.descriptionEn || null,
        descriptionSw: data.descriptionSw || null,
        price: Number(data.price),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
        categoryId: Number(data.categoryId),
        image: imageUrl,
        images: data.images || [],
        userId: userId,
        isPublic: data.isPublic !== undefined ? data.isPublic : true,
        stockQuantity: data.stockQuantity !== undefined ? Number(data.stockQuantity) : 0,
        unit: data.unit || 'Pièce',
      } as any,
      include: { category: true }
    });

    if (product.isPublic) {
      // Exécution asynchrone pour ne pas ralentir la création
      this.notificationsService.broadcastNewProduct(product.id);
    }

    return product;
  }

  /**
   * Récupère un produit unique par son identifiant.
   */
  async findOne(id: string, lang?: string) {
    const resolved = resolveLang(lang);
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
    return product ? localizeProduct(product as any, resolved) : null;
  }

  /**
   * Met à jour les informations d'un produit existant.
   * Une nouvelle validation de modération est déclenchée si l'image est modifiée.
   */
  async update(id: string, data: any, userId: string) {
    const product = await this.findOne(id);
    if (!product || product.userId !== userId) {
      throw new BadRequestException({
        code: 'PRODUCT_UPDATE_FORBIDDEN',
        message: 'Produit introuvable ou vous n\'êtes pas autorisé à le modifier.',
      });
    }

    if (data.image) {
      await this.moderationService.fullValidation(
        data.name || product.name,
        data.description || product.description,
        Number(data.price || product.price),
        data.image
      );
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.nameFr !== undefined && { nameFr: data.nameFr }),
        ...(data.nameEn !== undefined && { nameEn: data.nameEn }),
        ...(data.nameSw !== undefined && { nameSw: data.nameSw }),
        ...(data.descriptionFr !== undefined && { descriptionFr: data.descriptionFr }),
        ...(data.descriptionEn !== undefined && { descriptionEn: data.descriptionEn }),
        ...(data.descriptionSw !== undefined && { descriptionSw: data.descriptionSw }),
        ...(data.price && { price: Number(data.price) }),
        ...(data.originalPrice !== undefined && { originalPrice: data.originalPrice ? Number(data.originalPrice) : null }),
        ...(data.categoryId && { categoryId: Number(data.categoryId) }),
        ...(data.image && { image: data.image }),
        ...(data.images !== undefined && { images: data.images }),
        ...(data.stockQuantity !== undefined && { stockQuantity: Number(data.stockQuantity) }),
        ...(data.unit && { unit: data.unit }),
        ...(data.availability && { availability: data.availability }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
      } as any,
      include: { category: true }
    });

    if (!product.isPublic && updatedProduct.isPublic) {
      this.notificationsService.broadcastNewProduct(updatedProduct.id);
    }

    return updatedProduct;
  }

  /**
   * Publie un ensemble de produits en une seule opération.
   */
  async bulkPublish(ids: string[], userId: string) {
    const productsToNotify = await this.prisma.product.findMany({
      where: { id: { in: ids }, userId, isPublic: false },
      select: { id: true },
    });

    const result = await this.prisma.product.updateMany({
      where: { id: { in: ids }, userId },
      data: { isPublic: true } as any,
    });

    for (const product of productsToNotify) {
      this.notificationsService.broadcastNewProduct(product.id);
    }

    return result;
  }

  /**
   * Supprime un produit du catalogue.
   */
  async remove(id: string, userId: string) {
    const product = await this.findOne(id);
    if (!product || product.userId !== userId) {
      throw new BadRequestException({
        code: 'PRODUCT_DELETE_FORBIDDEN',
        message: 'Produit introuvable ou accès non autorisé.',
      });
    }

    return this.prisma.product.delete({ where: { id } });
  }

  /**
   * Fournit des suggestions de recherche basées sur les noms de produits publics.
   */
  async getSuggestions(query: string, lang?: string) {
    const resolved = resolveLang(lang);
    const searchIds = await this.getSearchProductIdsByName(query, 20);

    const products = await this.prisma.product.findMany({
      where: {
        isPublic: true,
        ...(searchIds && { id: { in: searchIds } }),
      } as any,
      select: { name: true, nameFr: true, nameEn: true, nameSw: true, category: { select: { name: true } } },
      take: 20,
    });

    // Déduplication côté JS (distinct non supporté par Prisma Accelerate)
    const seen = new Set<string>();
    return products
      .filter(p => {
        const localizedName = localizeProduct(p, resolved).name;
        if (seen.has(localizedName)) return false;
        seen.add(localizedName);
        return true;
      })
      .slice(0, 8)
      .map(p => {
        const localized = localizeProduct(p, resolved);
        return {
          text: localized.name,
          category: p.category.name,
          type: 'product'
        };
      });
  }

  /**
   * Algorithme de comparaison de prix.
   * Analyse les produits similaires pour fournir des statistiques de marché (moyenne, min, max).
   */
  async compareProducts(search: string, lang?: string) {
    if (!search || search.trim().length < 2) {
      return { query: search, products: [] };
    }
    const resolved = resolveLang(lang);

    const searchIds = await this.getSearchProductIdsByName(search, 100);
    
    if (searchIds && searchIds.length === 0) {
      return { query: search, products: [] };
    }

    const products = await this.prisma.product.findMany({
      where: {
        isPublic: true,
        ...(searchIds && { id: { in: searchIds } }),
      } as any,
      orderBy: { price: 'asc' },
      take: 100,
      include: {
        category: true,
        user: {
          select: {
            id: true,
            fullName: true,
            boutiqueName: true,
            isVerified: true,
            trustScore: true,
            phone: true,
            city: true,
            province: true,
            avatarUrl: true,
          },
        },
      },
    });

    const localizedProducts = localizeList(products, resolved);
    const prices = products.map((p) => p.price);
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

    return {
      query: search,
      stats: {
        count: products.length,
        avgPrice: Math.round(avgPrice * 100) / 100,
        minPrice: prices.length > 0 ? Math.min(...prices) : 0,
        maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
      },
      products: localizedProducts,
    };
  }
}
