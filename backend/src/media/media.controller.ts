import { Controller, ForbiddenException, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CloudinaryService } from './cloudinary.service';

@Controller('media')
export class MediaController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @UseGuards(JwtAuthGuard)
  @Post('product-upload-signature')
  createProductUploadSignature(@Req() req: any) {
    if (req.user.role !== 'VENDOR') {
      throw new ForbiddenException('Seuls les vendeurs peuvent téléverser des images produit.');
    }

    return {
      success: true,
      data: this.cloudinaryService.createProductUploadSignature(req.user.id),
    };
  }
}
