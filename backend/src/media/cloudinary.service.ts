import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

export interface ProductUploadSignature {
  apiKey: string;
  cloudName: string;
  folder: string;
  signature: string;
  timestamp: number;
}

@Injectable()
export class CloudinaryService {
  private get configuration() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new ServiceUnavailableException({
        code: 'CLOUDINARY_NOT_CONFIGURED',
        message: 'Le service de stockage des images n’est pas encore configuré.',
      });
    }

    return { apiKey, apiSecret, cloudName };
  }

  createProductUploadSignature(userId: string): ProductUploadSignature {
    const { apiKey, apiSecret, cloudName } = this.configuration;
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `wapibei/products/${userId}`;

    const signature = cloudinary.utils.api_sign_request(
      { folder, timestamp },
      apiSecret,
    );

    return { apiKey, cloudName, folder, signature, timestamp };
  }
}
