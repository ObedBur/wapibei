import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateBulkOrderDto } from './dto/create-bulk-order.dto';
import { EmailService } from '../common/email/email.service';
import { WhatsAppService } from '../common/whatsapp/whatsapp.service';
import { NotificationsService } from '../common/notifications/notifications.service';
import { SmsService } from '../common/notifications/sms/sms.service';
import { NotificationType, UserRole } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { t } from '../common/i18n/i18n';

/**
 * Service gérant le cycle de vie des commandes (Orders).
 * Responsable de la validation des stocks, de la gestion des transactions,
 * des notifications multi-canaux et du système de réputation (TrustScore).
 */
@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private whatsAppService: WhatsAppService,
    private notificationsService: NotificationsService,
    private smsService: SmsService,
  ) { }

  /**
   * Crée plusieurs commandes de manière atomique.
   * Valide les stocks avant toute opération et déclenche les alertes de réapprovisionnement.
   * 
   * @param createBulkOrderDto Détails des produits et du client
   * @param clientId ID de l'acheteur
   * @throws NotFoundException si un produit n'existe pas
   * @throws BadRequestException si le stock est insuffisant
   */
  async createBulk(createBulkOrderDto: CreateBulkOrderDto, clientId: string) {
    const { items, customerName, customerPhone, customerEmail, deliveryAddress } = createBulkOrderDto;

    if (!items.length) {
      throw new BadRequestException({
        code: 'ORDER_CART_EMPTY',
        message: 'Le panier est vide.',
      });
    }

    const groupedItems = Array.from(
      items.reduce((acc, item) => {
        acc.set(item.productId, (acc.get(item.productId) || 0) + item.quantity);
        return acc;
      }, new Map<string, number>())
    ).map(([productId, quantity]) => ({ productId, quantity }));

    const productIds = groupedItems.map(item => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { user: true },
    });

    if (products.length !== groupedItems.length) {
      throw new NotFoundException({
        code: 'ORDER_PRODUCTS_MISSING',
        message: 'Certains produits sélectionnés n\'existent plus.',
      });
    }

    // Validation préalable pour éviter les commandes impossibles ou incohérentes.
    for (const item of groupedItems) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new NotFoundException({
          code: 'ORDER_PRODUCT_MISSING',
          message: 'Un produit sélectionné n\'existe plus.',
        });
      }

      if (!product.isPublic || product.availability === 'OUT_OF_STOCK') {
        throw new BadRequestException({
          code: 'ORDER_PRODUCT_UNAVAILABLE',
          message: `"${product.name}" n'est plus disponible à la commande.`,
        });
      }

      if (!product.user?.isActive || product.user.role !== UserRole.VENDOR) {
        throw new BadRequestException({
          code: 'ORDER_VENDOR_UNAVAILABLE',
          message: `Le vendeur de "${product.name}" n'est pas disponible actuellement.`,
        });
      }

      if (product.stockQuantity !== null && product.stockQuantity !== undefined && product.stockQuantity < item.quantity) {
        throw new BadRequestException({
          code: 'ORDER_STOCK_INSUFFICIENT',
          message: `Stock insuffisant pour "${product.name}". Disponible : ${product.stockQuantity}, demandé : ${item.quantity}.`,
        });
      }
    }

    /**
     * Utilisation d'une transaction Prisma pour garantir l'atomicité :
     * 1. Création de la commande
     * 2. Décrémentation du stock
     */
    const createdOrders = await this.prisma.$transaction([
      ...groupedItems.map(item => {
        const product = products.find(p => p.id === item.productId)!;
        return this.prisma.order.create({
          data: {
            customerName,
            customerPhone,
            customerEmail,
            deliveryAddress,
            totalPrice: product.price * item.quantity,
            productId: product.id,
            clientId,
            vendorId: product.userId,
            status: 'PENDING',
          },
          include: { product: true, vendor: true },
        });
      }),
      ...groupedItems
        .filter(item => {
          const product = products.find(p => p.id === item.productId);
          return product?.stockQuantity !== null && product?.stockQuantity !== undefined;
        })
        .map(item => this.prisma.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        })),
    ]);

    const ordersOnly = createdOrders.filter((r): r is any => 'vendorId' in r);
    const totalOrderPrice = ordersOnly.reduce((acc: number, order: any) => acc + order.totalPrice, 0);

    // Gestion des alertes de stock bas (seuil critique < 5 unités)
    const updatedProducts = createdOrders.filter((r): r is any => 'stockQuantity' in r);
    for (const p of updatedProducts) {
      if (p.stockQuantity !== null && p.stockQuantity !== undefined && p.stockQuantity < 5 && p.stockQuantity >= 0) {
        await this.handleLowStockAlert(p);
      }
    }

    this.dispatchClientNotifications(clientId, customerEmail, customerName, groupedItems, products, totalOrderPrice, ordersOnly);
    this.dispatchVendorNotifications(ordersOnly, customerName, customerPhone, deliveryAddress);
    this.dispatchAdminNotifications(ordersOnly.length, totalOrderPrice, customerName, ordersOnly);

    return {
      success: true,
      orderCount: ordersOnly.length,
      orders: ordersOnly,
    };
  }

  /**
   * Déclenche les alertes multi-canaux (In-App + Push) pour le stock bas.
   */
  private async handleLowStockAlert(product: any) {
    const vendor = await this.prisma.user.findUnique({
      where: { id: product.userId },
      select: { language: true },
    });
    const lang = vendor?.language || 'fr';

    this.notificationsService.createNotification({
      userId: product.userId,
      title: t(lang, 'notif.lowStock.title'),
      message: t(lang, 'notif.lowStock.message', { count: product.stockQuantity, product: product.name }),
      type: NotificationType.SYSTEM_ALERT,
      metadata: { productId: product.id, currentStock: product.stockQuantity },
    });

    this.notificationsService.sendPushToUser(product.userId, {
      title: t(lang, 'notif.lowStock.pushTitle'),
      body: t(lang, 'notif.lowStock.pushBody', { count: product.stockQuantity, product: product.name }),
      data: { url: '/dashboard/products' }
    });
  }

  /**
   * Envoie les notifications de confirmation à l'acheteur.
   * Respecte les préférences de l'utilisateur (Email, In-App, Push).
   */
  private async dispatchClientNotifications(clientId: string, email: string, name: string, items: any[], products: any[], total: number, orders: any[]) {
    // Récupérer les préférences (null = jamais configurées → on envoie tout par défaut)
    const prefs = await this.prisma.notificationPreference.findUnique({ where: { userId: clientId } });

    const client = await this.prisma.user.findUnique({ where: { id: clientId }, select: { language: true, phone: true } });
    const lang = client?.language || 'fr';

    if (!prefs || prefs.ordersEmail) {
      this.emailService.sendBulkOrderConfirmation({
        customerEmail: email,
        customerName: name,
        items: items.map(item => {
          const p = products.find(prod => prod.id === item.productId);
          return { productName: p.name, price: p.price, quantity: item.quantity, productImage: p.image || (p.images && p.images[0]) };
        }),
        totalPrice: total,
        orderIds: orders.map((o: any) => o.id),
      }, lang).catch(err => this.logger.error('Email client non envoyé', err));
    }

    if (!prefs || prefs.ordersInApp) {
      this.notificationsService.createNotification({
        userId: clientId,
        title: t(lang, 'notif.orderCreated.client'),
        message: t(lang, 'notif.orderCreated.clientMessage', { count: items.length, total: total.toLocaleString() }),
        type: NotificationType.ORDER_CREATED,
        metadata: { url: '/settings?tab=orders', orderIds: orders.map((o: any) => o.id) },
      });
    }

    if (!prefs || prefs.ordersPush) {
      this.notificationsService.sendPushToUser(clientId, {
        title: t(lang, 'notif.orderCreated.client'),
        body: t(lang, 'notif.orderCreated.clientPush'),
        data: { url: '/settings?tab=orders' }
      });
    }

    // SMS Client (opt-in uniquement)
    if (prefs?.ordersSms) {
      if (client?.phone) {
        const smsMessage = t(lang, 'sms.orderClient', { count: items.length, total: total.toLocaleString() });
        this.smsService.sendSms(client.phone, smsMessage)
          .catch(err => this.logger.error(`SMS client failed: ${clientId}`, err));
      }
    }
  }

  /**
   * Regroupe les commandes par vendeur pour éviter le spam et envoie les alertes.
   */
  private dispatchVendorNotifications(orders: any[], customerName: string, customerPhone: string, address: string) {
    const ordersByVendor = new Map<string, any[]>();
    orders.forEach((order: any) => {
      const existing = ordersByVendor.get(order.vendorId) || [];
      existing.push(order);
      ordersByVendor.set(order.vendorId, existing);
    });

    ordersByVendor.forEach((vendorOrders: any[], vendorId: string) => {
      const vendor = vendorOrders[0].vendor;
      const lang = vendor.language || 'fr';
      const productNames = vendorOrders.map(o => o.product.name).join(', ');
      const vendorTotal = vendorOrders.reduce((sum, o) => sum + o.totalPrice, 0);
      const firstImage = vendorOrders[0].product.image || (vendorOrders[0].product.images && vendorOrders[0].product.images[0]);
      const firstProductUrl = `${(process.env.FRONTEND_URL || 'http://localhost:3000').split(',')[0].trim()}/products/${vendorOrders[0].product.id}`;

      const productDetailsList = vendorOrders.map(o => {
        const qty = o.totalPrice / o.product.price;
        return `- ${qty}x ${o.product.name}`;
      }).join('\n');

      const emailProductName = vendorOrders.length === 1 ? vendorOrders[0].product.name : `${vendorOrders.length} articles:\n${productDetailsList}`;
      const whatsappProductName = vendorOrders.length === 1 ? vendorOrders[0].product.name : `\n${productDetailsList}`;

      this.emailService.sendVendorOrderAlert({
        vendorEmail: vendor.email,
        vendorName: vendor.boutiqueName || vendor.fullName,
        customerName,
        customerPhone,
        productName: emailProductName,
        productImage: firstImage,
        totalPrice: vendorTotal,
        orderId: vendorOrders.map(o => o.id).join(', '),
      }, lang).catch(err => this.logger.error(`Email vendeur failed: ${vendor.email}`, err));

      this.whatsAppService.sendOrderAlert(vendor.phone, {
        vendorName: vendor.boutiqueName || vendor.fullName,
        customerName,
        customerPhone,
        productName: whatsappProductName,
        productImage: firstImage,
        productUrl: firstProductUrl,
        deliveryAddress: address,
        totalPrice: vendorTotal,
        language: lang,
      }).catch(err => this.logger.error(`WhatsApp vendeur failed: ${vendorId}`, err));

      this.notificationsService.createNotification({
        userId: vendorId,
        title: t(lang, 'notif.orderCreated.vendor'),
        message: t(lang, 'notif.orderCreated.vendorMessage', { customer: customerName, count: vendorOrders.length }),
        type: NotificationType.ORDER_CREATED,
        metadata: {
          url: '/dashboard/orders',
          orderIds: vendorOrders.map(o => o.id),
          productImage: firstImage,
          customerName,
        },
      });

      this.notificationsService.sendPushToUser(vendorId, {
        title: t(lang, 'notif.orderCreated.vendor'),
        body: t(lang, 'notif.orderCreated.vendorPush', { customer: customerName }),
        data: { url: '/dashboard/orders' }
      });

      // SMS Vendeur (opt-in uniquement via préférences)
      this.prisma.notificationPreference.findUnique({ where: { userId: vendorId } })
        .then(vendorPrefs => {
          if (vendorPrefs?.ordersSms && vendor.phone) {
            const smsBody = t(lang, 'sms.orderVendor', {
              customer: customerName,
              total: vendorTotal.toLocaleString(),
              products: productNames,
              phone: customerPhone,
              address,
            });
            this.smsService.sendSms(vendor.phone, smsBody)
              .catch(err => this.logger.error(`SMS vendeur failed: ${vendorId}`, err));
          }
        })
        .catch(err => this.logger.error(`Prefs lookup failed for vendor ${vendorId}`, err));
    });
  }

  /**
   * Notifie l'administration de l'activité globale de la plateforme.
   */
  private async dispatchAdminNotifications(count: number, total: number, customerName: string, orders: any[]) {
    const admins = await this.prisma.user.findMany({ where: { role: UserRole.ADMIN } });

    admins.forEach(admin => {
      const adminLang = admin.language || 'fr';

      this.emailService.sendAdminOrderAlert({
        adminEmail: admin.email,
        orderCount: count,
        totalAmount: total,
        customerName,
        items: orders.map((o: any) => ({
          productName: o.product.name,
          productImage: o.product.image || (o.product.images && o.product.images[0])
        })),
      }, adminLang).catch(err => this.logger.error(`Email admin failed: ${admin.email}`, err));

      this.notificationsService.createNotification({
        userId: admin.id,
        title: t(adminLang, 'notif.orderAdmin.title'),
        message: t(adminLang, 'notif.orderAdmin.message', { customer: customerName, count, total: total.toLocaleString() }),
        type: NotificationType.ORDER_CREATED,
        metadata: {
          url: '/admin/notifications',
          orderCount: count,
          customerName,
        },
      });

      if (admin.phone) {
        this.whatsAppService.sendWhatsAppMessage(admin.phone,
          t(adminLang, 'whatsapp.admin', { customer: customerName, total: total.toLocaleString() })
        ).catch(err => this.logger.error(`WhatsApp admin failed: ${admin.phone}`, err));
      }
    });
  }

  /**
   * Alias de commodité pour la création d'une commande unique.
   */
  async create(createOrderDto: CreateOrderDto, clientId: string) {
    return this.createBulk({
      items: [{ productId: createOrderDto.productId, quantity: 1 }],
      customerName: createOrderDto.customerName,
      customerPhone: createOrderDto.customerPhone,
      customerEmail: createOrderDto.customerEmail,
      deliveryAddress: createOrderDto.deliveryAddress,
    }, clientId);
  }

  /**
   * Récupère toutes les commandes destinées à un vendeur spécifique.
   */
  async findOrdersForVendor(vendorId: string) {
    return this.prisma.order.findMany({
      where: { vendorId },
      include: {
        product: true,
        client: { select: { id: true, fullName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Récupère l'historique des achats d'un client.
   */
  async findOrdersForClient(clientId: string) {
    return this.prisma.order.findMany({
      where: { clientId },
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Met à jour le statut d'une commande et gère la logique métier associée (Pénalités, Bonus, Notifications).
   * 
   * @param orderId ID de la commande
   * @param status Nouveau statut (CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
   * @param requesterId Utilisateur tentant de modifier le statut
   * @param requesterRole Rôle de l'utilisateur (ADMIN ou VENDOR)
   * @throws NotFoundException si la commande n'existe pas
   * @throws ForbiddenException si l'utilisateur n'a pas les droits sur cette commande
   */
  async updateStatus(orderId: string, status: 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED', requesterId: string, requesterRole: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true, client: true, vendor: true }
    });

    if (!order) throw new NotFoundException({
      code: 'ORDER_NOT_FOUND',
      message: 'Commande introuvable',
    });

    // Sécurité : Seul le propriétaire de la boutique ou l'admin peut changer le statut
    const isOwner = order.vendorId === requesterId;
    const isAdmin = requesterRole === 'ADMIN';
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException({
        code: 'ORDER_FORBIDDEN',
        message: 'Accès refusé : vous n\'êtes pas le propriétaire de cette vente.',
      });
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { product: true, vendor: true, client: true }
    });

    this.handleStatusNotifications(updatedOrder, status);
    
    // Logique de réputation (TrustScore)
    if (status === 'DELIVERED') {
      await this.handleDeliverySuccess(updatedOrder);
    } else if (status === 'CANCELLED') {
      await this.handleCancellationPenalty(updatedOrder, requesterId);
    }

    return updatedOrder;
  }

  /**
   * Augmente la réputation du vendeur lors d'une livraison réussie.
   */
  private async handleDeliverySuccess(order: any) {
    if (order.vendor.trustScore < 100) {
      await this.prisma.user.update({
        where: { id: order.vendorId },
        data: { trustScore: { increment: 1 } }
      });
      this.logger.log(`TrustScore augmenté pour le vendeur ${order.vendor.boutiqueName} (+1).`);
    }
  }

  /**
   * Applique une pénalité si le vendeur annule lui-même une vente confirmée.
   */
  private async handleCancellationPenalty(order: any, requesterId: string) {
    if (requesterId === order.vendorId && order.vendor.trustScore > 0) {
      await this.prisma.user.update({
        where: { id: order.vendorId },
        data: { trustScore: { decrement: 2 } }
      });
      this.logger.warn(`Pénalité TrustScore (-2) pour le vendeur ${order.vendor.boutiqueName} suite à annulation.`);
    }
  }

  /**
   * Matrice de notifications multi-canaux basée sur le cycle de vie de la commande.
   * Respecte les préférences de notification de l'acheteur.
   */
  private async handleStatusNotifications(order: any, status: string) {
    const { client, vendor, product } = order;
    const vendorName = vendor.boutiqueName || vendor.fullName;
    const lang = client.language || 'fr';

    const notificationMap: Record<string, { titleKey: string, msgKey: string }> = {
      CONFIRMED: { titleKey: 'notif.status.confirmed.title', msgKey: 'notif.status.confirmed.msg' },
      SHIPPED: { titleKey: 'notif.status.shipped.title', msgKey: 'notif.status.shipped.msg' },
      DELIVERED: { titleKey: 'notif.status.delivered.title', msgKey: 'notif.status.delivered.msg' },
      CANCELLED: { titleKey: 'notif.status.cancelled.title', msgKey: 'notif.status.cancelled.msg' }
    };

    const config = notificationMap[status];
    if (!config) return;

    const title = t(lang, config.titleKey);
    const msg = t(lang, config.msgKey, { vendor: vendorName, product: product.name });

    // Récupérer les préférences du client (null = jamais configurées → envoyer tout)
    const prefs = await this.prisma.notificationPreference.findUnique({ where: { userId: client.id } });

    if (!prefs || prefs.ordersInApp) {
      this.notificationsService.createNotification({
        userId: client.id,
        title,
        message: msg,
        type: NotificationType.ORDER_CONFIRMED,
        metadata: {
          url: '/settings?tab=orders',
          orderId: order.id,
        },
      });
    }

    if (!prefs || prefs.ordersPush) {
      this.notificationsService.sendPushToUser(client.id, {
        title,
        body: msg,
        data: { url: '/settings?tab=orders' }
      });
    }

    if (prefs?.ordersSms && client.phone && (status === 'SHIPPED' || status === 'DELIVERED')) {
      const smsMessage = status === 'SHIPPED'
        ? t(lang, 'sms.orderShipped', { orderId: order.id.slice(0, 8).toUpperCase() })
        : t(lang, 'sms.orderDelivered', { orderId: order.id.slice(0, 8).toUpperCase() });

      this.smsService.sendSms(client.phone, smsMessage)
        .catch(err => this.logger.error(`SMS status update failed for client ${client.id}`, err));
    }

    if (!prefs || prefs.ordersEmail) {
      if (status === 'CONFIRMED') {
        this.emailService.sendOrderConfirmed({ customerEmail: order.customerEmail, customerName: order.customerName, productName: product.name, orderId: order.id, vendorName }, lang);
      } else if (status === 'SHIPPED') {
        this.emailService.sendOrderShipped({ customerEmail: order.customerEmail, customerName: order.customerName, productName: product.name, orderId: order.id, vendorName, deliveryAddress: order.deliveryAddress }, lang);
      } else if (status === 'CANCELLED') {
        this.emailService.sendOrderCancelled({ customerEmail: order.customerEmail, customerName: order.customerName, productName: product.name, orderId: order.id, vendorName }, lang);
      }
    }
  }

  /**
   * Calcul des statistiques de performance pour le tableau de bord vendeur.
   */
  async getVendorStats(vendorId: string) {
    const orders = await this.prisma.order.findMany({
      where: { vendorId, status: { not: 'CANCELLED' } },
      include: { product: true }
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    
    const productStats = new Map<string, { name: string, count: number, revenue: number }>();
    orders.forEach(o => {
      const existing = productStats.get(o.productId) || { name: o.product.name, count: 0, revenue: 0 };
      existing.count += 1;
      existing.revenue += o.totalPrice;
      productStats.set(o.productId, existing);
    });

    const topProducts = Array.from(productStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalRevenue,
      totalOrders: orders.length,
      topProducts,
    };
  }

  /**
   * Tâche planifiée nocturne pour pénaliser l'inactivité des vendeurs.
   * Réduit le TrustScore si une commande PENDING n'est pas traitée sous 48h.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleOrderDelayPenalty() {
    this.logger.log('Lancement de la vérification quotidienne des retards...');
    
    const limitDate = new Date();
    limitDate.setHours(limitDate.getHours() - 48);

    const pendingOrders = await this.prisma.order.findMany({
      where: { status: 'PENDING', createdAt: { lt: limitDate } },
      include: { vendor: true }
    });

    for (const order of pendingOrders) {
      if (order.vendor.trustScore > 0) {
        await this.prisma.user.update({
          where: { id: order.vendorId },
          data: { trustScore: { decrement: 1 } }
        });

        this.notificationsService.createNotification({
          userId: order.vendorId,
          title: t(order.vendor.language, 'notif.penalty.title'),
          message: t(order.vendor.language, 'notif.penalty.message', { name: order.customerName }),
          type: NotificationType.SYSTEM_ALERT,
        });
      }
    }
  }
}
