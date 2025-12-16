import { Module, forwardRef } from '@nestjs/common';
import { GalleriesService } from './galleries.service';
import { GalleriesController } from './galleries.controller';
import { ImagesModule } from 'src/images/images.module';

@Module({
  imports: [forwardRef(() => ImagesModule)],
  controllers: [GalleriesController],
  providers: [GalleriesService],
})
export class GalleriesModule {}
