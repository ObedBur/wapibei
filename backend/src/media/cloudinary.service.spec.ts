import { ServiceUnavailableException } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

describe('CloudinaryService', () => {
  const originalEnvironment = {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  };

  afterEach(() => {
    const restore = (key: string, value: string | undefined) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    };

    restore('CLOUDINARY_CLOUD_NAME', originalEnvironment.cloudName);
    restore('CLOUDINARY_API_KEY', originalEnvironment.apiKey);
    restore('CLOUDINARY_API_SECRET', originalEnvironment.apiSecret);
  });

  it('creates a signature scoped to the authenticated vendor folder', () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'demo-cloud';
    process.env.CLOUDINARY_API_KEY = 'public-api-key';
    process.env.CLOUDINARY_API_SECRET = 'test-secret';

    const signature = new CloudinaryService().createProductUploadSignature('vendor-123');

    expect(signature).toMatchObject({
      apiKey: 'public-api-key',
      cloudName: 'demo-cloud',
      folder: 'wapibei/products/vendor-123',
    });
    expect(signature.timestamp).toEqual(expect.any(Number));
    expect(signature.signature).toEqual(expect.any(String));
    expect(signature).not.toHaveProperty('apiSecret');
  });

  it('rejects signature requests when Cloudinary is not configured', () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;

    expect(() => new CloudinaryService().createProductUploadSignature('vendor-123'))
      .toThrow(ServiceUnavailableException);
  });
});
