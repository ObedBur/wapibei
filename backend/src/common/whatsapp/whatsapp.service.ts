import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { t } from '../i18n/i18n';

export interface WhatsAppOrderPayload {
  vendorName: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  productImage?: string;
  productUrl?: string;
  deliveryAddress: string;
  totalPrice: number;
  language?: string;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  // 
  private sanitizePhone(phone: string): string {
    return phone.replace(/[\s\-\(\)\+]/g, '');
  }

  // Remplace les data URI base64 (images) par un aperçu court, uniquement
  // pour l'affichage dans les logs. Le message original envoyé à l'API
  // WhatsApp n'est jamais modifié.
  private sanitizeForLog(message: string): string {
    return message.replace(
      /data:[^;]+;base64,[A-Za-z0-9+/=\-_\s]+/g,
      (match) => `[image base64 tronquée, ${match.length} chars]`,
    );
  }

  
  // Formate le message WhatsApp pour le vendeur, dans sa langue.
  private formatOrderMessage(data: WhatsAppOrderPayload): string {
    const lang = data.language;
    const photoLine = data.productImage ? ` ${t(lang, 'whatsapp.order.photo', { url: data.productImage })}` : '';
    const productLine = data.productUrl ? ` ${t(lang, 'whatsapp.order.link', { url: data.productUrl })}` : '';

    return [
      ` ${t(lang, 'whatsapp.order.header')}`,
      ``,
      ` ${t(lang, 'whatsapp.order.client', { name: data.customerName })}`,
      ` ${t(lang, 'whatsapp.order.tel', { phone: data.customerPhone })}`,
      ` ${t(lang, 'whatsapp.order.address', { address: data.deliveryAddress })}`,
      ``,
      ` ${t(lang, 'whatsapp.order.product', { product: data.productName })}`,
      ` ${t(lang, 'whatsapp.order.total', { total: data.totalPrice.toLocaleString() })}`,
      photoLine,
      productLine,
      ``,
      `_${t(lang, 'whatsapp.order.cta')}_`,
    ].filter(line => line !== '').join('\n');
  }

  
  //  Envoie un message WhatsApp via l'API configurée.
  
  async sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
    const apiUrl = process.env.WHATSAPP_API_URL;
    const apiToken = process.env.WHATSAPP_API_TOKEN;

    const sanitizedPhone = this.sanitizePhone(to);

    // Mode simulation si l'API n'est pas configurée
    if (!apiUrl || !apiToken) {
      this.logger.warn(
        `[WHATSAPP - SIMULATION] API non configurée. Message pour ${sanitizedPhone}:\n${this.sanitizeForLog(message)}`,
      );
      return true;
    }

    try {
      await axios.post(
        apiUrl,
        {
          phone: sanitizedPhone,
          message,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiToken}`,
          },
          timeout: 10000, 
        },
      );

      this.logger.log(`WhatsApp envoyé à ${sanitizedPhone}`);
      return true;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Échec envoi WhatsApp à ${sanitizedPhone}: ${errMsg}`,
      );
      return false;
    }
  }

  /**
   * Raccourci pour envoyer une alerte de nouvelle commande au vendeur.
   */
  async sendOrderAlert(
    vendorPhone: string,
    data: WhatsAppOrderPayload,
  ): Promise<boolean> {
    const message = this.formatOrderMessage(data);
    return this.sendWhatsAppMessage(vendorPhone, message);
  }
}
