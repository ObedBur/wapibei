import { api } from '@/lib/axios';

export const MAX_PRODUCT_IMAGES = 5;
export const MAX_PRODUCT_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

interface ProductUploadSignature {
  apiKey: string;
  cloudName: string;
  folder: string;
  signature: string;
  timestamp: number;
}

interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
}

export interface UploadedProductImage {
  publicId: string;
  url: string;
}

export function validateProductImage(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Sélectionnez une image au format JPG, PNG, WEBP ou GIF.';
  }

  if (file.size > MAX_PRODUCT_IMAGE_SIZE_BYTES) {
    return 'Chaque image doit peser au maximum 5 Mo.';
  }

  return null;
}

export async function uploadProductImage(file: File): Promise<UploadedProductImage> {
  const validationError = validateProductImage(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const signatureResponse = await api.post<{
    success: boolean;
    data: ProductUploadSignature;
  }>('/media/product-upload-signature');

  if (!signatureResponse.data.success) {
    throw new Error('Impossible de préparer le téléversement de l’image.');
  }

  const { apiKey, cloudName, folder, signature, timestamp } = signatureResponse.data.data;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('folder', folder);
  formData.append('signature', signature);
  formData.append('timestamp', String(timestamp));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Le téléversement de l’image a échoué. Réessayez.');
  }

  const uploaded = await response.json() as CloudinaryUploadResponse;
  if (!uploaded.secure_url || !uploaded.public_id) {
    throw new Error('Cloudinary n’a pas retourné une image valide.');
  }

  return {
    publicId: uploaded.public_id,
    url: uploaded.secure_url,
  };
}
