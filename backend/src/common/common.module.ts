import { Module, Global } from '@nestjs/common';
import { LocationService } from './services/location.service';
import { ModerationService } from './services/moderation.service';
import { AppCacheService } from './services/app-cache.service';

@Global()
@Module({
  providers: [
    LocationService,
    ModerationService,
    AppCacheService,
  ],
  exports: [
    LocationService,
    ModerationService,
    AppCacheService,
  ],
})
export class CommonModule {}
